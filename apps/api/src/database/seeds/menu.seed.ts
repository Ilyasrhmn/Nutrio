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
        // Main Dashboard
        {
          name: 'Dashboard',
          path: '/portal',
          icon: 'LayoutDashboard',
          order: 1,
          requiredPermission: 'read:Dashboard',
          metadata: { i18n: { en: 'Dashboard', id: 'Dasbor' } },
        },
        
        // Map
        {
          name: 'Map',
          path: '/portal/map',
          icon: 'Map',
          order: 2,
          requiredPermission: 'read:Map',
          metadata: { i18n: { en: 'Map', id: 'Peta' } },
        },
        
        // Funds
        {
          name: 'Funds',
          path: '/portal/funds',
          icon: 'Wallet',
          order: 3,
          requiredPermission: 'read:Funds',
          metadata: { i18n: { en: 'Funds', id: 'Dana' } },
        },
        
        // Menu Planning
        {
          name: 'Menu Planning',
          path: '/portal/menu',
          icon: 'Utensils',
          order: 4,
          requiredPermission: 'read:Menu',
          metadata: { i18n: { en: 'Menu Planning', id: 'Perencanaan Menu' } },
        },
        
        // Marketplace
        {
          name: 'Marketplace',
          path: '/portal/marketplace',
          icon: 'Store',
          order: 5,
          requiredPermission: 'read:Marketplace',
          metadata: { i18n: { en: 'Marketplace', id: 'E-Katalog' } },
        },
        
        // Live Monitoring
        {
          name: 'Live Monitoring',
          path: '/portal/live',
          icon: 'Camera',
          order: 6,
          requiredPermission: 'read:LiveExecution',
          metadata: { i18n: { en: 'Live Monitoring', id: 'Monitoring Langsung' } },
        },
        
        // Logistics
        {
          name: 'Logistics',
          path: '/portal/logistics',
          icon: 'Truck',
          order: 7,
          requiredPermission: 'read:Logistics',
          metadata: { i18n: { en: 'Logistics', id: 'Logistik' } },
        },
        
        // Checkpoints
        {
          name: 'Checkpoints',
          path: '/portal/checkpoints',
          icon: 'ClipboardCheck',
          order: 8,
          requiredPermission: 'read:Checkpoints',
          metadata: { i18n: { en: 'Checkpoints', id: 'Pos Pemeriksaan' } },
        },
        
        // Audit
        {
          name: 'Audit',
          path: '/portal/audit',
          icon: 'History',
          order: 9,
          requiredPermission: 'read:Audit',
          metadata: { i18n: { en: 'Audit', id: 'Audit Trail' } },
        },
        
        // Reports
        {
          name: 'Reports',
          path: '/portal/reports',
          icon: 'FileBarChart',
          order: 10,
          requiredPermission: 'read:Reports',
          metadata: { i18n: { en: 'Reports', id: 'Laporan' } },
        },
        
        // Admin section (parent menu)
        {
          name: 'Admin',
          path: '/portal/admin',
          icon: 'ShieldCheck',
          order: 100,
          parentPath: null,
          requiredPermission: 'manage:all',
          metadata: { i18n: { en: 'Admin', id: 'Administrasi' } },
        },
        
        // Admin - Roles
        {
          name: 'Roles',
          path: '/portal/admin/roles',
          icon: 'Users',
          order: 101,
          parentPath: '/portal/admin',
          requiredPermission: 'manage:Role',
          metadata: { i18n: { en: 'Roles', id: 'Peran' } },
        },
        
        // Admin - Permissions
        {
          name: 'Permissions',
          path: '/portal/admin/permissions',
          icon: 'Key',
          order: 102,
          parentPath: '/portal/admin',
          requiredPermission: 'manage:Permission',
          metadata: { i18n: { en: 'Permissions', id: 'Izin Akses' } },
        },
        
        // Admin - Menus
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
