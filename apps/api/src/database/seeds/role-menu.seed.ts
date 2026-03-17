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

      // Define menu access for each role
      const assignments: RoleMenuAssignment[] = [
        {
          roleName: 'admin_bgn',
          menuPaths: [
            '/portal',
            '/portal/map',
            '/portal/funds',
            '/portal/incidents',
            '/portal/menu',
            '/portal/marketplace',
            '/portal/live',
            '/portal/logistics',
            '/portal/checkpoints',
            '/portal/operasional',
            '/portal/operasional/jadwal',
            '/portal/operasional/kalkulasi-bahan',
            '/portal/operasional/kitchen-sop',
            '/portal/operasional/stock-opname',
            '/portal/sop',
            '/portal/audit',
            '/portal/reports',
            '/portal/settings',
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
            '/portal/map',
            '/portal/funds',
            '/portal/menu',
            '/portal/live',
            '/portal/logistics',
            '/portal/checkpoints',
            '/portal/marketplace',
            '/portal/settings',
            '/portal/sop',
            '/portal/incidents',
          ],
        },
        {
          roleName: 'inspector',
          menuPaths: [
            '/portal',
            '/portal/map',
            '/portal/live',
            '/portal/logistics',
            '/portal/checkpoints',
            '/portal/audit',
            '/portal/reports',
            '/portal/incidents',
            '/portal/operasional',
            '/portal/operasional/jadwal',
            '/portal/operasional/kalkulasi-bahan',
            '/portal/operasional/kitchen-sop',
            '/portal/operasional/stock-opname',
          ],
        },
        {
          roleName: 'coordinator_sppg',
          menuPaths: [
            '/portal',
            '/portal/map',
            '/portal/live',
            '/portal/logistics',
            '/portal/checkpoints',
            '/portal/audit',
            '/portal/reports',
            '/portal/settings',
            '/portal/incidents',
            '/portal/operasional',
            '/portal/operasional/jadwal',
            '/portal/operasional/kalkulasi-bahan',
            '/portal/operasional/kitchen-sop',
            '/portal/operasional/stock-opname',
          ],
        },
        {
          roleName: 'dinkes',
          menuPaths: [
            '/portal',
            '/portal/map',
            '/portal/live',
            '/portal/audit',
            '/portal/reports',
            '/portal/incidents',
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
          console.warn(`⚠️  Role not found: ${assignment.roleName}, skipping...`);
          continue;
        }

        for (const menuPath of assignment.menuPaths) {
          // Find menu
          const menu: any = await queryRunner.manager.findOne('menus', {
            where: { path: menuPath },
          });

          if (!menu) {
            console.warn(`⚠️  Menu not found: ${menuPath}, skipping...`);
            continue;
          }

          // Check if assignment already exists using raw query
          const existingAssignment = await queryRunner.manager.query(
            `SELECT * FROM role_menus WHERE role_id = $1 AND menu_id = $2 LIMIT 1`,
            [role.id, menu.id]
          );

          if (existingAssignment && existingAssignment.length > 0) {
            continue;
          }

          // Create assignment using raw query
          await queryRunner.manager.query(
            `INSERT INTO role_menus (role_id, menu_id, created_at) 
             VALUES ($1, $2, NOW())
             ON CONFLICT (role_id, menu_id) DO NOTHING`,
            [role.id, menu.id]
          );

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
