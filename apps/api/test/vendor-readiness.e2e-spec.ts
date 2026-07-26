import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import request from "supertest";
import { AppModule } from "../src/app.module";

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/Nutrio_e2e";
const runId = `readiness-${Date.now()}`;

describe("Vendor readiness lifecycle (e2e)", () => {
  let app: INestApplication;
  let db: DataSource;
  let vendorToken: string;
  let adminToken: string;
  let vendorId: string;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  const login = async (email: string) =>
    (
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email, password: "Readiness123!" })
        .expect(201)
    ).body.accessToken as string;

  beforeAll(async () => {
    db = new DataSource({ type: "postgres", url: databaseUrl });
    await db.initialize();
    const hash = await bcrypt.hash("Readiness123!", 10);
    const [vendorRole] = await db.query(
      `SELECT id FROM roles WHERE name='vendor'`,
    );
    const [adminRole] = await db.query(
      `SELECT id FROM roles WHERE name='admin_bgn'`,
    );
    const [vendorUser] = await db.query(
      `INSERT INTO users (email,password_hash,role_id,role_legacy,full_name,is_active,is_email_verified) VALUES ($1,$2,$3,'vendor',$4,true,true) RETURNING id`,
      [`${runId}-vendor@test.local`, hash, vendorRole.id, runId],
    );
    const [adminUser] = await db.query(
      `INSERT INTO users (email,password_hash,role_id,role_legacy,full_name,is_active,is_email_verified) VALUES ($1,$2,$3,'admin_bgn',$4,true,true) RETURNING id`,
      [`${runId}-admin@test.local`, hash, adminRole.id, runId],
    );
    const [vendor] = await db.query(
      `INSERT INTO vendors (user_id,business_name,owner_name,phone,address_street,address_city,address_province,lifecycle_status,status) VALUES ($1,$2,$3,'0812','Jl E2E','Jakarta','DKI Jakarta','REGISTERED','verified') RETURNING id`,
      [vendorUser.id, `${runId} Vendor`, runId],
    );
    vendorId = vendor.id;
    const [sppg] = await db.query(
      `INSERT INTO sppg_locations (vendor_id,name,address_street,address_city,address_province,coordinates,is_active,target_porsi) VALUES ($1,'SPPG readiness','Jl E2E','Jakarta','DKI Jakarta',ST_GeomFromText('POINT(106.8 -6.2)',4326),true,10) RETURNING id`,
      [vendorId],
    );
    const [supplierUser] = await db.query(
      `INSERT INTO users (email,password_hash,role_id,role_legacy,full_name,is_active,is_email_verified) VALUES ($1,$2,$3,'supplier',$4,true,true) RETURNING id`,
      [
        `${runId}-supplier@test.local`,
        hash,
        (await db.query(`SELECT id FROM roles WHERE name='supplier'`))[0].id,
        runId,
      ],
    );
    const [supplier] = await db.query(
      `INSERT INTO suppliers (user_id,business_name,owner_name,supplier_type,phone,address_street,address_city,address_province,status) VALUES ($1,$2,$3,'petani','0813','Jl Supplier','Jakarta','DKI Jakarta','verified') RETURNING id`,
      [supplierUser.id, `${runId} Supplier`, runId],
    );
    await db.query(
      `INSERT INTO onboarding_progress (vendor_id,step1_done,step2_done,step3_done,step4_done) VALUES ($1,true,true,true,true)`,
      [vendorId],
    );
    await db.query(
      `INSERT INTO vendor_team_members (vendor_id,role,invite_email,status,accepted_at) VALUES ($1,'kepala_dapur',$2,'accepted',NOW())`,
      [vendorId, `${runId}-chef@test.local`],
    );
    await db.query(
      `INSERT INTO vendor_supplier_connections (vendor_id,supplier_id,connected_by) VALUES ($1,$2,$3)`,
      [vendorId, supplier.id, vendorUser.id],
    );
    const [template] = await db.query(
      `INSERT INTO sop_templates (name,description) VALUES ($1,'readiness template') RETURNING id`,
      [runId],
    );
    await db.query(
      `INSERT INTO inspections (sppg_location_id,vendor_id,template_id,inspector_id,status,scheduled_for,critical_fails,inspection_score) VALUES ($1,$2,$3,$4,'completed',CURRENT_DATE,0,90)`,
      [sppg.id, vendorId, template.id, adminUser.id],
    );
    app = (
      await Test.createTestingModule({ imports: [AppModule] }).compile()
    ).createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    vendorToken = await login(`${runId}-vendor@test.local`);
    adminToken = await login(`${runId}-admin@test.local`);
  });

  afterAll(async () => {
    await app.close();
    await db.destroy();
  });

  it("blocks activation until evidence is complete, then auto-activates and allows admin suspension", async () => {
    await request(app.getHttpServer())
      .get("/onboarding/readiness")
      .set(auth(vendorToken))
      .expect(200)
      .expect((res) =>
        expect(res.body).toMatchObject({
          ready: false,
          missingRequirements: expect.arrayContaining([
            expect.objectContaining({ code: "DOCUMENT" }),
          ]),
        }),
      );
    await db.query(
      `INSERT INTO documents (vendor_id,doc_type,file_url,file_key,file_hash,status) VALUES ($1,'nib','documents/nib.pdf','documents/nib.pdf','hash','verified')`,
      [vendorId],
    );
    await request(app.getHttpServer())
      .get("/onboarding/readiness")
      .set(auth(vendorToken))
      .expect(200)
      .expect((res) =>
        expect(res.body).toMatchObject({
          ready: true,
          lifecycleStatus: "ACTIVE",
        }),
      );
    await request(app.getHttpServer())
      .get(`/admin/vendors/${vendorId}`)
      .set(auth(vendorToken))
      .expect(403);
    await request(app.getHttpServer())
      .post(`/admin/vendors/${vendorId}/suspend`)
      .set(auth(adminToken))
      .send({ reason: "Demo suspend" })
      .expect(201)
      .expect((res) => expect(res.body.to).toBe("SUSPENDED"));
    await request(app.getHttpServer())
      .post(`/admin/vendors/${vendorId}/resume`)
      .set(auth(adminToken))
      .send({ reason: "Demo resume" })
      .expect(201)
      .expect((res) => expect(res.body.to).toBe("ACTIVE"));
  }, 30000);
});
