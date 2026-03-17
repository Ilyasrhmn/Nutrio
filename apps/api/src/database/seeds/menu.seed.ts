import { DataSource } from 'typeorm';

interface SeedMenu {
  name: string;
  path: string;
  icon: string;
  order: number;
  parentPath?: string | null;
  requiredPermission?: string | null;
  metadata?: Record<string, unknown> | null;
}

export default class MenuSeed {
  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('🌱 Starting menu seeding...');

      const menus: SeedMenu[] = [
        {
          name: 'Dashboard',
          path: '/portal',
          icon: 'LayoutDashboard',
          order: 1,
          requiredPermission: 'read:Dashboard',
          metadata: { i18n: { en: 'Dashboard', id: 'Dasbor' } },
        },
        {
          name: 'Map',
          path: '/portal/map',
          icon: 'Map',
          order: 2,
          requiredPermission: 'read:Map',
          metadata: { i18n: { en: 'Map', id: 'Peta' } },
        },
        {
          name: 'Funds',
          path: '/portal/funds',
          icon: 'Wallet',
          order: 3,
          requiredPermission: 'read:Funds',
          metadata: { i18n: { en: 'Funds', id: 'Dana' } },
        },
        {
          name: 'Incidents',
          path: '/portal/incidents',
          icon: 'AlertTriangle',
          order: 4,
          requiredPermission: 'read:Incidents',
          metadata: { i18n: { en: 'Incidents', id: 'Insiden' } },
        },
        {
          name: 'Menu Planning',
          path: '/portal/menu',
          icon: 'Utensils',
          order: 5,
          requiredPermission: 'read:Menu',
          metadata: { i18n: { en: 'Menu Planning', id: 'Perencanaan Menu' } },
        },
        {
          name: 'Marketplace',
          path: '/portal/marketplace',
          icon: 'Store',
          order: 6,
          requiredPermission: 'read:Marketplace',
          metadata: { i18n: { en: 'Marketplace', id: 'E-Katalog' } },
        },
        {
          name: 'Live Monitoring',
          path: '/portal/live',
          icon: 'Camera',
          order: 7,
          requiredPermission: 'read:Live',
          metadata: { i18n: { en: 'Live Monitoring', id: 'Monitoring Langsung' } },
        },
        {
          name: 'Logistics',
          path: '/portal/logistics',
          icon: 'Truck',
          order: 8,
          requiredPermission: 'read:Logistics',
          metadata: { i18n: { en: 'Logistics', id: 'Logistik' } },
        },
        {
          name: 'Checkpoints',
          path: '/portal/checkpoints',
          icon: 'ClipboardCheck',
          order: 9,
          requiredPermission: 'read:Checkpoints',
          metadata: { i18n: { en: 'Checkpoints', id: 'Pos Pemeriksaan' } },
        },
        
        // Operasional Parent
        {
          name: 'Operations',
          path: '/portal/operasional',
          icon: 'Settings',
          order: 10,
          parentPath: null,
          requiredPermission: 'read:Operasional',
          metadata: { i18n: { en: 'Operations', id: 'Operasional' } },
        },
        {
          name: 'Schedules',
          path: '/portal/operasional/jadwal',
          icon: 'CalendarDays',
          order: 11,
          parentPath: '/portal/operasional',
          requiredPermission: 'read:OperasionalJadwal',
          metadata: { i18n: { en: 'Schedules', id: 'Jadwal' } },
        },
        {
          name: 'Material Calc.',
          path: '/portal/operasional/kalkulasi-bahan',
          icon: 'Calculator',
          order: 12,
          parentPath: '/portal/operasional',
          requiredPermission: 'read:OperasionalKalkulasi',
          metadata: { i18n: { en: 'Material Calculation', id: 'Kalkulasi Bahan' } },
        },
        {
          name: 'Kitchen SOP',
          path: '/portal/operasional/kitchen-sop',
          icon: 'ChefHat',
          order: 13,
          parentPath: '/portal/operasional',
          requiredPermission: 'read:OperasionalKitchen',
          metadata: { i18n: { en: 'Kitchen SOP', id: 'SOP Dapur' } },
        },
        {
          name: 'Stock Opname',
          path: '/portal/operasional/stock-opname',
          icon: 'Boxes',
          order: 14,
          parentPath: '/portal/operasional',
          requiredPermission: 'read:OperasionalStock',
          metadata: { i18n: { en: 'Stock Opname', id: 'Stock Opname' } },
        },

        // SOP
        {
          name: 'SOP',
          path: '/portal/sop',
          icon: 'BookOpen',
          order: 15,
          requiredPermission: 'read:SOP',
          metadata: { i18n: { en: 'SOP', id: 'SOP' } },
        },

        // Reports
        {
          name: 'Reports',
          path: '/portal/reports',
          icon: 'FileBarChart',
          order: 16,
          requiredPermission: 'read:Reports',
          metadata: { i18n: { en: 'Reports', id: 'Laporan' } },
        },
        
        // Audit
        {
          name: 'Audit Trail',
          path: '/portal/audit',
          icon: 'History',
          order: 17,
          requiredPermission: 'read:Audit',
          metadata: { i18n: { en: 'Audit Trail', id: 'Jejak Audit' } },
        },
        
        // Settings
        {
          name: 'Settings',
          path: '/portal/settings',
          icon: 'Sliders',
          order: 18,
          requiredPermission: 'read:Settings',
          metadata: { i18n: { en: 'Settings', id: 'Pengaturan' } },
        },

        // Admin section
        {
          name: 'Admin',
          path: '/portal/admin',
          icon: 'ShieldCheck',
          order: 100,
          parentPath: null,
          requiredPermission: 'manage:all',
          metadata: { i18n: { en: 'Admin', id: 'Administrasi' } },
        },
        {
          name: 'Roles',
          path: '/portal/admin/roles',
          icon: 'Users',
          order: 101,
          parentPath: '/portal/admin',
          requiredPermission: 'manage:Role',
          metadata: { i18n: { en: 'Roles', id: 'Peran' } },
        },
        {
          name: 'Permissions',
          path: '/portal/admin/permissions',
          icon: 'Key',
          order: 102,
          parentPath: '/portal/admin',
          requiredPermission: 'manage:Permission',
          metadata: { i18n: { en: 'Permissions', id: 'Izin Akses' } },
        },
        {
          name: 'Menus',
          path: '/portal/admin/menus',
          icon: 'Menu',
          order: 103,
          parentPath: '/portal/admin',
          requiredPermission: 'manage:MenuAdmin',
          metadata: { i18n: { en: 'Menus', id: 'Kelola Menu' } },
        },
      ];

      let created = 0;
      let skipped = 0;

      for (const menuData of menus) {
        // Check if menu already exists
        const existingMenu = await queryRunner.manager.findOneBy('menus', {
          path: menuData.path,
        });

        if (existingMenu) {
          console.warn(`⚠️  Menu already exists: ${menuData.path}`);
          skipped++;
          continue;
        }

        // Find parent menu if parentPath is provided
        let parentId: string | null = null;
        if (menuData.parentPath) {
          const parentMenu: any = await queryRunner.manager.findOne('menus', {
            where: { path: menuData.parentPath },
          });
          if (parentMenu) {
            parentId = parentMenu.id;
          }
        }

        // Insert menu
        await queryRunner.manager.save('menus', {
          name: menuData.name,
          path: menuData.path,
          icon: menuData.icon,
          order: menuData.order,
          parentId: parentId,
          requiredPermission: menuData.requiredPermission,
          metadata: menuData.metadata,
        });

        console.log(`✅ Created menu: ${menuData.name} (${menuData.path})`);
        created++;
      }

      console.log(`🎉 Menu seeding completed! Created: ${created}, Skipped: ${skipped}`);
    } finally {
      await queryRunner.release();
    }
  }
}
