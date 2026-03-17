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

      // Clear existing menus first to avoid conflicts during reorganization
      await queryRunner.manager.query('DELETE FROM "menus"');

      const menus: SeedMenu[] = [
        // --- LEVEL 1: MAIN NAVIGATION ---
        {
          name: 'Dashboard',
          path: '/portal',
          icon: 'LayoutDashboard',
          order: 1,
          requiredPermission: 'read:Dashboard',
          metadata: { i18n: { en: 'Dashboard', id: 'Dasbor' } },
        },
        {
          name: 'Peta Sebaran',
          path: '/portal/map',
          icon: 'Map',
          order: 2,
          requiredPermission: 'read:Map',
          metadata: { i18n: { en: 'Map', id: 'Peta' } },
        },
        {
          name: 'Kelola Dana',
          path: '/portal/funds',
          icon: 'Wallet',
          order: 3,
          requiredPermission: 'read:Funds',
          metadata: { i18n: { en: 'Funds', id: 'Dana' } },
        },
        {
          name: 'E-Katalog',
          path: '/portal/marketplace',
          icon: 'Store',
          order: 10,
          requiredPermission: 'read:Marketplace',
          metadata: { i18n: { en: 'Marketplace', id: 'E-Katalog' } },
        },
        {
          name: 'Logistik',
          path: '/portal/logistics',
          icon: 'Truck',
          order: 20,
          requiredPermission: 'read:Logistics',
          metadata: { i18n: { en: 'Logistics', id: 'Logistik' } },
        },
        {
          name: 'Laporan',
          path: '/portal/reports',
          icon: 'FileBarChart',
          order: 30,
          requiredPermission: 'read:Reports',
          metadata: { i18n: { en: 'Reports', id: 'Laporan' } },
        },

        // --- LEVEL 1: SUPPLIER PORTAL (Only for Supplier) ---
        {
          name: 'Toko Saya',
          path: '/portal/supplier/shop',
          icon: 'Store',
          order: 31,
          requiredPermission: 'read:SupplierShop',
          metadata: { i18n: { en: 'My Shop', id: 'Toko Saya' } },
        },
        {
          name: 'Katalog Produk',
          path: '/portal/supplier/products',
          icon: 'Package',
          order: 32,
          requiredPermission: 'read:SupplierProducts',
          metadata: { i18n: { en: 'Product Catalog', id: 'Katalog Produk' } },
        },
        {
          name: 'Chat & Nego',
          path: '/portal/supplier/chat',
          icon: 'MessageSquare',
          order: 33,
          requiredPermission: 'read:SupplierChat',
          metadata: { i18n: { en: 'Chat & Nego', id: 'Chat & Nego' } },
        },

        // --- GROUP 1: MONITORING & KEPATUHAN (Vendor Only) ---
        {
          name: 'Monitoring & Kepatuhan',
          path: '/portal/monitoring',
          icon: 'ShieldCheck',
          order: 40,
          parentPath: null,
          requiredPermission: 'read:MonitoringKepatuhan',
          metadata: { i18n: { en: 'Monitoring & Compliance', id: 'Monitoring & Kepatuhan' } },
        },
        {
          name: 'Monitoring Langsung',
          path: '/portal/live',
          icon: 'Camera',
          order: 41,
          parentPath: '/portal/monitoring',
          requiredPermission: 'read:Live',
          metadata: { i18n: { en: 'Live Monitoring', id: 'Monitoring Langsung' } },
        },
        {
          name: 'Pos Pemeriksaan',
          path: '/portal/checkpoints',
          icon: 'ClipboardCheck',
          order: 42,
          parentPath: '/portal/monitoring',
          requiredPermission: 'read:Checkpoints',
          metadata: { i18n: { en: 'Checkpoints', id: 'Pos Pemeriksaan' } },
        },
        {
          name: 'Panduan SOP',
          path: '/portal/sop',
          icon: 'BookOpen',
          order: 43,
          parentPath: '/portal/monitoring',
          requiredPermission: 'read:SOP',
          metadata: { i18n: { en: 'SOP', id: 'SOP' } },
        },
        {
          name: 'Laporan Insiden',
          path: '/portal/incidents',
          icon: 'AlertTriangle',
          order: 44,
          parentPath: '/portal/monitoring',
          requiredPermission: 'read:Incidents',
          metadata: { i18n: { en: 'Incidents', id: 'Insiden' } },
        },
        {
          name: 'Jejak Audit',
          path: '/portal/audit',
          icon: 'History',
          order: 45,
          parentPath: '/portal/monitoring',
          requiredPermission: 'read:Audit',
          metadata: { i18n: { en: 'Audit Trail', id: 'Jejak Audit' } },
        },

        // --- GROUP 2: MANAJEMEN PRODUKSI (Vendor Only) ---
        {
          name: 'Manajemen Produksi',
          path: '/portal/operasional',
          icon: 'CookingPot',
          order: 50,
          parentPath: null,
          requiredPermission: 'read:Operasional',
          metadata: { i18n: { en: 'Production Management', id: 'Manajemen Produksi' } },
        },
        {
          name: 'Perencanaan Menu',
          path: '/portal/menu',
          icon: 'Utensils',
          order: 51,
          parentPath: '/portal/operasional',
          requiredPermission: 'read:Menu',
          metadata: { i18n: { en: 'Menu Planning', id: 'Perencanaan Menu' } },
        },
        {
          name: 'Jadwal Masak',
          path: '/portal/operasional/jadwal',
          icon: 'CalendarDays',
          order: 52,
          parentPath: '/portal/operasional',
          requiredPermission: 'read:OperasionalJadwal',
          metadata: { i18n: { en: 'Schedules', id: 'Jadwal' } },
        },
        {
          name: 'Kalkulasi Bahan',
          path: '/portal/operasional/kalkulasi-bahan',
          icon: 'Scale',
          order: 53,
          parentPath: '/portal/operasional',
          requiredPermission: 'read:OperasionalKalkulasi',
          metadata: { i18n: { en: 'Material Calculation', id: 'Kalkulasi Bahan' } },
        },
        {
          name: 'Standar Dapur',
          path: '/portal/operasional/kitchen-sop',
          icon: 'ClipboardList',
          order: 54,
          parentPath: '/portal/operasional',
          requiredPermission: 'read:OperasionalKitchen',
          metadata: { i18n: { en: 'Kitchen SOP', id: 'SOP Dapur' } },
        },
        {
          name: 'Stok Opname',
          path: '/portal/operasional/stock-opname',
          icon: 'Boxes',
          order: 55,
          parentPath: '/portal/operasional',
          requiredPermission: 'read:OperasionalStock',
          metadata: { i18n: { en: 'Stock Opname', id: 'Stock Opname' } },
        },

        // --- ADMIN SECTION ---
        {
          name: 'Administrasi',
          path: '/portal/admin',
          icon: 'ShieldCheck',
          order: 100,
          parentPath: null,
          requiredPermission: 'manage:all',
          metadata: { i18n: { en: 'Admin', id: 'Administrasi' } },
        },
        {
          name: 'Peran',
          path: '/portal/admin/roles',
          icon: 'Users',
          order: 101,
          parentPath: '/portal/admin',
          requiredPermission: 'manage:Role',
          metadata: { i18n: { en: 'Roles', id: 'Peran' } },
        },
        {
          name: 'Izin Akses',
          path: '/portal/admin/permissions',
          icon: 'Key',
          order: 102,
          parentPath: '/portal/admin',
          requiredPermission: 'manage:Permission',
          metadata: { i18n: { en: 'Permissions', id: 'Izin Akses' } },
        },
        {
          name: 'Kelola Menu',
          path: '/portal/admin/menus',
          icon: 'Menu',
          order: 103,
          parentPath: '/portal/admin',
          requiredPermission: 'manage:MenuAdmin',
          metadata: { i18n: { en: 'Menus', id: 'Kelola Menu' } },
        },
      ];

      for (const menuData of menus) {
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
      }

      console.log(`🎉 Menu seeding completed!`);
    } finally {
      await queryRunner.release();
    }
  }
}
