import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { StorageService } from "../src/modules/storage/storage.service";
import { VisionService } from "../src/modules/ai/vision.service";
import { RealtimeService } from "../src/modules/realtime/realtime.service";
import { DebriefService } from "../src/modules/debrief/debrief.service";

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/Nutrio_e2e";
const runId = `e2e-${Date.now()}`;

describe("Operation-day workflow (e2e)", () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let vendorToken: string;
  let supplierToken: string;
  let otherVendorToken: string;
  let vendorUserId: string;
  let supplierId: string;
  let productId: string;
  let operationDayId: string;
  let deliveryToken: string;

  const storageMock = {
    upload: jest.fn(async (_buffer: Buffer, key: string) => ({
      fileKey: key,
      fileUrl: `https://e2e.invalid/${key}`,
      fileHash: "e2e-file-hash",
    })),
  };
  const visionMock = {
    validatePhoto: jest.fn(async () => ({
      pass: true,
      reason: "validated by e2e mock",
      confidence: 0.99,
    })),
  };
  const realtimeMock = {
    broadcastToVendor: jest.fn(),
    broadcastToAllVendors: jest.fn(),
    broadcastToBGN: jest.fn(),
    registerOpsServer: jest.fn(),
    registerBgnServer: jest.fn(),
  };
  const debriefMock = { generate: jest.fn(async () => ({})) };

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function login(email: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password: "Workflow123!" })
      .expect(201);
    return response.body.accessToken as string;
  }

  beforeAll(async () => {
    dataSource = new DataSource({ type: "postgres", url: databaseUrl });
    await dataSource.initialize();

    const passwordHash = await bcrypt.hash("Workflow123!", 10);
    const [vendorRole] = await dataSource.query(
      `SELECT id FROM roles WHERE name = 'vendor'`,
    );
    const [supplierRole] = await dataSource.query(
      `SELECT id FROM roles WHERE name = 'supplier'`,
    );
    const makeUser = async (
      kind: string,
      roleId: string,
      roleLegacy: string,
    ) => {
      const [user] = await dataSource.query(
        `INSERT INTO users (email, password_hash, role_id, role_legacy, full_name, is_active, is_email_verified)
         VALUES ($1, $2, $3, $4, $5, TRUE, TRUE) RETURNING id`,
        [
          `${runId}-${kind}@example.test`,
          passwordHash,
          roleId,
          roleLegacy,
          `${kind} ${runId}`,
        ],
      );
      return user.id as string;
    };

    vendorUserId = await makeUser("vendor", vendorRole.id, "vendor");
    const supplierUserId = await makeUser(
      "supplier",
      supplierRole.id,
      "supplier",
    );
    const otherVendorUserId = await makeUser(
      "other-vendor",
      vendorRole.id,
      "vendor",
    );
    const [vendor] = await dataSource.query(
      `INSERT INTO vendors
         (user_id, business_name, owner_name, phone, address_street, address_city, address_province, lifecycle_status, status)
       VALUES ($1, $2, 'Owner E2E', '+62001', 'Jl. E2E', 'Jakarta', 'DKI Jakarta', 'ACTIVE', 'verified')
       RETURNING id`,
      [vendorUserId, `${runId} vendor`],
    );
    const [otherVendor] = await dataSource.query(
      `INSERT INTO vendors
         (user_id, business_name, owner_name, phone, address_street, address_city, address_province, lifecycle_status, status)
       VALUES ($1, $2, 'Owner E2E', '+62002', 'Jl. E2E', 'Bandung', 'Jawa Barat', 'ACTIVE', 'verified')
       RETURNING id`,
      [otherVendorUserId, `${runId} other vendor`],
    );
    await dataSource.query(
      `INSERT INTO sppg_locations
         (vendor_id, name, address_street, address_city, address_province, coordinates, assigned_schools, is_active, target_porsi)
       VALUES ($1, 'SPPG E2E', 'Jl. E2E', 'Jakarta', 'DKI Jakarta',
               ST_GeomFromText('POINT(106.8456 -6.2088)', 4326), ARRAY['Sekolah E2E'], TRUE, 10)`,
      [vendor.id],
    );
    const [supplier] = await dataSource.query(
      `INSERT INTO suppliers
         (user_id, business_name, owner_name, supplier_type, phone, address_street, address_city, address_province, status)
       VALUES ($1, $2, 'Owner E2E', 'petani', '+62003', 'Jl. E2E', 'Tangerang', 'Banten', 'verified')
       RETURNING id`,
      [supplierUserId, `${runId} supplier`],
    );
    supplierId = supplier.id;
    const [product] = await dataSource.query(
      `INSERT INTO supplier_products
         (supplier_id, name, category, unit, price_per_unit, min_order_qty, stock_available, status)
       VALUES ($1, 'Beras E2E', 'Bahan Pokok', 'kg', 15000, 1, 100, 'active')
       RETURNING id`,
      [supplierId],
    );
    productId = product.id;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StorageService)
      .useValue(storageMock)
      .overrideProvider(VisionService)
      .useValue(visionMock)
      .overrideProvider(RealtimeService)
      .useValue(realtimeMock)
      .overrideProvider(DebriefService)
      .useValue(debriefMock)
      .compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    vendorToken = await login(`${runId}-vendor@example.test`);
    supplierToken = await login(`${runId}-supplier@example.test`);
    otherVendorToken = await login(`${runId}-other-vendor@example.test`);
    expect(otherVendor.id).toBeTruthy();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
    if (dataSource?.isInitialized) await dataSource.destroy();
  }, 30000);

  it("covers PO, inventory, operation-day, checkpoint, delivery, school confirmation, score/funds/audit", async () => {
    await request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect((response) => expect(response.body.checks.database).toBe(true));
    await request(app.getHttpServer())
      .get("/auth/me")
      .set(auth(vendorToken))
      .expect(200)
      .expect((response) => {
        expect(response.body.id).toBe(vendorUserId);
      });

    const orderPayload = {
      supplierId,
      items: [{ productId, quantity: 11 }],
      requestedDeliveryDate: new Date().toISOString().slice(0, 10),
    };
    const createdOrder = await request(app.getHttpServer())
      .post("/orders")
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-order`)
      .send(orderPayload)
      .expect(201);
    const orderId = createdOrder.body.body.id as string;
    expect(createdOrder.body.body.status).toBe("submitted");
    await request(app.getHttpServer())
      .post("/orders")
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-order`)
      .send(orderPayload)
      .expect(201)
      .expect((response) => expect(response.body.replayed).toBe(true));
    await request(app.getHttpServer())
      .post(`/orders/${orderId}/accept`)
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-wrong-owner`)
      .expect(403);
    await request(app.getHttpServer())
      .post(`/orders/${orderId}/accept`)
      .set(auth(supplierToken))
      .set("Idempotency-Key", `${runId}-accept`)
      .expect(201);
    await request(app.getHttpServer())
      .post(`/orders/${orderId}/dispatch`)
      .set(auth(supplierToken))
      .set("Idempotency-Key", `${runId}-dispatch`)
      .expect(201);
    await request(app.getHttpServer())
      .post(`/orders/${orderId}/receive`)
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-receive`)
      .expect(201);
    await request(app.getHttpServer())
      .get("/orders/my")
      .set(auth(vendorToken))
      .expect(200)
      .expect((response) =>
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: orderId, status: "received" }),
          ]),
        ),
      );
    await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set(auth(vendorToken))
      .expect(200)
      .expect((response) => {
        expect(response.body.invoiceNumber).toMatch(/^INV-/);
        expect(response.body.history).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ to_status: "delivered" }),
          ]),
        );
      });

    const cancellable = await request(app.getHttpServer())
      .post("/orders")
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-order-cancel`)
      .send(orderPayload)
      .expect(201);
    const cancellableId = cancellable.body.body.id as string;
    await request(app.getHttpServer())
      .post(`/orders/${cancellableId}/cancel`)
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-cancel`)
      .send({ reason: "Kebutuhan dapur berubah" })
      .expect(201);
    await request(app.getHttpServer())
      .get(`/orders/${cancellableId}`)
      .set(auth(vendorToken))
      .expect(200)
      .expect((response) => expect(response.body.status).toBe("cancelled"));
    await request(app.getHttpServer())
      .post(`/orders/${cancellableId}/cancel`)
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-cancel`)
      .send({ reason: "Kebutuhan dapur berubah" })
      .expect(201)
      .expect((response) => expect(response.body.replayed).toBe(true));
    await request(app.getHttpServer())
      .get("/inventory/current")
      .set(auth(vendorToken))
      .expect(200)
      .expect((response) =>
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ productId, quantity: 11 }),
          ]),
        ),
      );
    await request(app.getHttpServer())
      .post("/inventory/waste")
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-waste`)
      .send({
        productId,
        unit: "kg",
        quantity: 1,
        reason: "Kemasan rusak saat penerimaan",
      })
      .expect(201);

    const date = new Date().toISOString().slice(0, 10);
    const menu = await request(app.getHttpServer())
      .post("/menu-plans")
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-menu`)
      .send({
        operationDate: date,
        targetPax: 10,
        items: [{ productId, unit: "kg", quantityPerPax: 1 }],
      })
      .expect(201);
    const menuPlanId = menu.body.body.id as string;
    await request(app.getHttpServer())
      .post("/operation-days")
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-day`)
      .send({ menuPlanId })
      .expect(201)
      .expect((response) => {
        operationDayId = response.body.body.id as string;
      });

    const photo = Buffer.from("e2e-photo");
    await request(app.getHttpServer())
      .post("/checkpoints/CP2/submit")
      .set(auth(vendorToken))
      .attach("photo", photo, "cp2.jpg")
      .field("gpsLat", "-6.2")
      .field("gpsLng", "106.8")
      .expect(400);
    await request(app.getHttpServer())
      .post("/checkpoints/CP1/submit")
      .set(auth(vendorToken))
      .attach("photo", photo, "cp1.jpg")
      .field("gpsLat", "-6.2")
      .field("gpsLng", "106.8")
      .expect(201);
    await request(app.getHttpServer())
      .post("/checkpoints/CP1/submit")
      .set(auth(vendorToken))
      .attach("photo", photo, "cp1-retry.jpg")
      .field("gpsLat", "-6.2")
      .field("gpsLng", "106.8")
      .expect(201);
    await request(app.getHttpServer())
      .post("/checkpoints/CP2/submit")
      .set(auth(vendorToken))
      .attach("photo", photo, "cp2.jpg")
      .field("gpsLat", "-6.2")
      .field("gpsLng", "106.8")
      .expect(201);
    await request(app.getHttpServer())
      .post("/checkpoints/CP3/submit")
      .set(auth(vendorToken))
      .attach("photo", photo, "cp3.jpg")
      .field("gpsLat", "-6.2")
      .field("gpsLng", "106.8")
      .expect(201);
    await request(app.getHttpServer())
      .post("/checkpoints/CP4/submit")
      .set(auth(vendorToken))
      .attach("photo", photo, "cp4.jpg")
      .field("gpsLat", "-6.2")
      .field("gpsLng", "106.8")
      .expect(201);

    const [delivery] = await dataSource.query(
      `SELECT token FROM delivery_tokens WHERE operation_day_id = $1`,
      [operationDayId],
    );
    deliveryToken = delivery.token as string;
    await request(app.getHttpServer())
      .post(`/delivery/${deliveryToken}/arrived`)
      .send({})
      .expect(401);
    await request(app.getHttpServer())
      .post(`/delivery/${deliveryToken}/arrived`)
      .set(auth(otherVendorToken))
      .send({})
      .expect(404);
    await request(app.getHttpServer())
      .post(`/sekolah/confirm/${deliveryToken}`)
      .send({ jumlahDiterima: 10, kondisi: "baik" })
      .expect(409);
    await request(app.getHttpServer())
      .post(`/delivery/${deliveryToken}/arrived`)
      .set(auth(vendorToken))
      .send({ gpsLat: -6.2, gpsLng: 106.8 })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/delivery/${deliveryToken}/photo`)
      .set(auth(vendorToken))
      .attach("file", photo, "delivery.jpg")
      .expect(201);
    await request(app.getHttpServer())
      .post(`/delivery/${deliveryToken}/complete`)
      .set(auth(vendorToken))
      .expect(200);
    await request(app.getHttpServer())
      .post(`/sekolah/confirm/${deliveryToken}`)
      .send({ jumlahDiterima: 10, kondisi: "baik" })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/sekolah/confirm/${deliveryToken}`)
      .send({ jumlahDiterima: 10, kondisi: "baik" })
      .expect(409);

    const [expired] = await dataSource.query(
      `INSERT INTO delivery_tokens
         (vendor_id, sppg_location_id, school_id, porsi_count, expired_at)
       SELECT vendor_id, sppg_location_id, 'Sekolah E2E Kedaluwarsa', 1, NOW() - INTERVAL '1 minute'
       FROM delivery_tokens WHERE token = $1::uuid RETURNING token`,
      [deliveryToken],
    );
    await request(app.getHttpServer())
      .get(`/delivery/${expired.token}`)
      .expect(410);

    await request(app.getHttpServer())
      .post(`/operation-days/${operationDayId}/close`)
      .set(auth(vendorToken))
      .set("Idempotency-Key", `${runId}-close`)
      .expect(201)
      .expect((response) => expect(response.body.body.status).toBe("closed"));
    await request(app.getHttpServer())
      .get(
        `/command-center/operation-days?vendorId=${encodeURIComponent((await dataSource.query("SELECT vendor_id FROM operation_days WHERE id = $1", [operationDayId]))[0].vendor_id)}`,
      )
      .set(auth(vendorToken))
      .expect(200)
      .expect((response) =>
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: operationDayId,
              status: "closed",
              checkpointsDone: 4,
              deliveriesConfirmed: 1,
            }),
          ]),
        ),
      );
    await request(app.getHttpServer())
      .get("/public/overview")
      .expect(200)
      .expect((response) =>
        expect(response.body.totalPorsiToday).toBeGreaterThan(0),
      );
    const [facts] = await dataSource.query(
      `SELECT
         (SELECT COUNT(*)::int FROM checkpoint_events WHERE operation_day_id = $1 AND cp_status = 'done') AS checkpoint_count,
         (SELECT COUNT(*)::int FROM checkpoint_events WHERE operation_day_id = $1 AND ai_validation IS NOT NULL) AS validated_checkpoint_count,
         (SELECT COUNT(*)::int FROM inventory_ledger WHERE source_id = $1 AND entry_type = 'consumption') AS consumption_count,
         (SELECT COUNT(*)::int FROM fund_projections WHERE operation_day_id = $1) AS projection_count,
         (SELECT COUNT(*)::int FROM audit_events WHERE aggregate_id = $1) AS audit_count,
         (SELECT COUNT(*)::int FROM notifications n
          JOIN users u ON u.id = n.user_id
          WHERE u.email LIKE $2) AS notification_count`,
      [operationDayId, `${runId}%`],
    );
    expect(facts).toMatchObject({
      checkpoint_count: 4,
      validated_checkpoint_count: 4,
      consumption_count: 1,
      projection_count: 1,
    });
    expect(Number(facts.audit_count)).toBeGreaterThanOrEqual(1);
    expect(Number(facts.notification_count)).toBe(6);
    expect(storageMock.upload).toHaveBeenCalledTimes(6);
    expect(visionMock.validatePhoto).toHaveBeenCalledTimes(5);
  }, 60000);
});
