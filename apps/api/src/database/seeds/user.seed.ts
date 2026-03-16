import { DataSource } from 'typeorm';
import { UserRole } from '@workspace/common';
import * as bcrypt from 'bcrypt';

interface SeedUser {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
}

export default class UserSeed {
  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('🌱 Starting user seeding...');

      const users: SeedUser[] = [
        // Admin BGN - Superuser
        {
          email: 'admin@bgn.go.id',
          password: 'Admin123!',
          fullName: 'Administrator BGN Pusat',
          role: UserRole.ADMIN_BGN,
          phone: '+62-21-12345678',
          isActive: true,
        },

        // Vendor - Mitra SPPG
        {
          email: 'vendor@sppg.go.id',
          password: 'Vendor123!',
          fullName: 'Mitra SPPG Jakarta',
          role: UserRole.VENDOR,
          phone: '+62-812-3456-7890',
          isActive: true,
        },
        {
          email: 'vendor2@sppg.go.id',
          password: 'Vendor123!',
          fullName: 'Mitra SPPG Bandung',
          role: UserRole.VENDOR,
          phone: '+62-812-3456-7891',
          isActive: true,
        },

        // Inspector - Pengawas
        {
          email: 'inspector@bgn.go.id',
          password: 'Inspector123!',
          fullName: 'Pengawas BGN Wilayah 1',
          role: UserRole.INSPECTOR,
          phone: '+62-813-4567-8901',
          isActive: true,
        },
        {
          email: 'inspector2@bgn.go.id',
          password: 'Inspector123!',
          fullName: 'Pengawas BGN Wilayah 2',
          role: UserRole.INSPECTOR,
          phone: '+62-813-4567-8902',
          isActive: true,
        },

        // Coordinator SPPG
        {
          email: 'coordinator@sppg.go.id',
          password: 'Coordinator123!',
          fullName: 'Koordinator SPPG Nasional',
          role: UserRole.COORDINATOR_SPPG,
          phone: '+62-21-23456789',
          isActive: true,
        },
        {
          email: 'coordinator2@sppg.go.id',
          password: 'Coordinator123!',
          fullName: 'Koordinator SPPG Provinsi',
          role: UserRole.COORDINATOR_SPPG,
          phone: '+62-22-34567890',
          isActive: true,
        },

        // Dinkes - Dinas Kesehatan
        {
          email: 'dinkes@kesehatan.go.id',
          password: 'Dinkes123!',
          fullName: 'Dinas Kesehatan Kota Jakarta',
          role: UserRole.DINKES,
          phone: '+62-21-34567890',
          isActive: true,
        },
        {
          email: 'dinkes2@kesehatan.go.id',
          password: 'Dinkes123!',
          fullName: 'Dinas Kesehatan Kota Bandung',
          role: UserRole.DINKES,
          phone: '+62-22-45678901',
          isActive: true,
        },

        // Public - Sekolah / Umum
        {
          email: 'school@sdn01.sch.id',
          password: 'School123!',
          fullName: 'SDN 01 Jakarta Pusat',
          role: UserRole.PUBLIC,
          phone: '+62-21-45678901',
          isActive: true,
        },
        {
          email: 'school2@sdn02.sch.id',
          password: 'School123!',
          fullName: 'SDN 02 Bandung',
          role: UserRole.PUBLIC,
          phone: '+62-22-56789012',
          isActive: true,
        },
        {
          email: 'parent@family.com',
          password: 'Parent123!',
          fullName: 'Wali Murid Ahmad',
          role: UserRole.PUBLIC,
          phone: '+62-814-5678-9012',
          isActive: true,
        },
      ];

      let created = 0;
      let skipped = 0;

      for (const userData of users) {
        // Check if user already exists
        const existingUser = await queryRunner.manager.findOneBy('users', {
          email: userData.email,
        });

        if (existingUser) {
          console.warn(`⚠️  User already exists: ${userData.email}`);
          skipped++;
          continue;
        }

        // Get role_id from roles table
        const roleRecord = await queryRunner.manager.findOne('roles', {
          where: { name: userData.role.toLowerCase() },
        }) as { id: string; name: string } | null;

        if (!roleRecord) {
          console.error(`❌ Role not found in database: ${userData.role}`);
          console.error('   Please run role seeder first!');
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt);

        // Insert user using queryRunner with TypeORM
        await queryRunner.manager.save('users', {
          email: userData.email,
          passwordHash: passwordHash,
          fullName: userData.fullName,
          roleId: roleRecord.id, // Use roleId instead of role enum
          roleLegacy: userData.role, // Keep legacy for backward compat
          phone: userData.phone,
          isActive: userData.isActive,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        });

        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
        created++;
      }

      console.log(`🎉 Seeding completed! Created: ${created}, Skipped: ${skipped}`);
    } finally {
      await queryRunner.release();
    }
  }
}
