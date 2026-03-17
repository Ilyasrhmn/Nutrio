import { DataSource } from 'typeorm';

interface RoleMenuAssignment {
  roleName: string;
  menuPaths: string[];
}

export default class RoleMenuSeed {
  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('🌱 Starting role-menu assignment seeding...');

      // Clear existing assignments to avoid duplicates and ensure strict role separation
      await queryRunner.manager.query('DELETE FROM "role_menus"');

      const assignments: RoleMenuAssignment[] = [
        {
          roleName: 'admin_bgn',
          menuPaths: [
            '/portal',
            '/portal/map',
            '/portal/funds',
            '/portal/marketplace',
            '/portal/logistics',
            '/portal/reports',
            '/portal/admin',
            '/portal/admin/roles',
            '/portal/admin/permissions',
            '/portal/admin/menus',
          ],
        },
        {
          roleName: 'vendor',
          menuPaths: [
            '/portal',
            '/portal/funds',
            '/portal/marketplace',
            '/portal/logistics',
            '/portal/reports',
            '/portal/monitoring',
            '/portal/live',
            '/portal/checkpoints',
            '/portal/sop',
            '/portal/incidents',
            '/portal/audit',
            '/portal/operasional',
            '/portal/menu',
            '/portal/operasional/jadwal',
            '/portal/operasional/kalkulasi-bahan',
            '/portal/operasional/kitchen-sop',
            '/portal/operasional/stock-opname',
          ],
        },
        {
          roleName: 'supplier',
          menuPaths: [
            '/portal',
            '/portal/marketplace',
            '/portal/supplier/shop',
            '/portal/supplier/products',
            '/portal/supplier/chat',
            '/portal/reports',
          ],
        },
        {
          roleName: 'public',
          menuPaths: [
            '/portal',
            '/portal/map',
            '/portal/live',
          ],
        },
      ];

      let created = 0;

      for (const assignment of assignments) {
        // Find role
        const role: any = await queryRunner.manager.findOne('roles', {
          where: { name: assignment.roleName },
        });

        if (!role) {
          console.warn(`⚠️  Role not found: ${assignment.roleName}`);
          continue;
        }

        for (const path of assignment.menuPaths) {
          // Find menu
          const menu: any = await queryRunner.manager.findOne('menus', {
            where: { path },
          });

          if (!menu) {
            console.warn(`⚠️  Menu not found: ${path}`);
            continue;
          }

          // Assign menu to role
          await queryRunner.manager.save('role_menus', {
            roleId: role.id,
            menuId: menu.id,
          });
          created++;
        }

        console.log(`✅ Assigned ${assignment.menuPaths.length} menus to role: ${assignment.roleName}`);
      }

      console.log(`🎉 Role-menu assignment completed! Created: ${created} assignments`);
    } finally {
      await queryRunner.release();
    }
  }
}
