import { DataSource } from 'typeorm';

interface RolePermissionAssignment {
  roleName: string;
  permissions: string[]; // Array of action:subject strings
}

export default class RolePermissionSeed {
  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('🌱 Starting role-permission assignment seeding...');

      // Define permissions for each role based on existing CaslAbilityFactory
      const assignments: RolePermissionAssignment[] = [
        {
          roleName: 'admin_bgn',
          permissions: ['manage:all'],
        },
        {
          roleName: 'vendor',
          permissions: [
            'read:Dashboard',
            'read:Map',
            'read:Funds',
            'read:Menu',
            'read:Live',
            'read:Logistics',
            'read:Checkpoints',
            'read:Marketplace',
            'read:Settings',
            'read:SOP',
            'read:Incidents',
          ],
        },
        {
          roleName: 'inspector',
          permissions: [
            'read:Dashboard',
            'read:Map',
            'read:Live',
            'read:Logistics',
            'read:Checkpoints',
            'read:Audit',
            'read:Reports',
            'read:Incidents',
            'read:Operasional',
            'read:OperasionalJadwal',
            'read:OperasionalKalkulasi',
            'read:OperasionalKitchen',
            'read:OperasionalStock',
          ],
        },
        {
          roleName: 'coordinator_sppg',
          permissions: [
            'read:Dashboard',
            'read:Map',
            'read:Live',
            'read:Logistics',
            'read:Checkpoints',
            'read:Audit',
            'read:Reports',
            'read:Settings',
            'read:Incidents',
            'read:Operasional',
            'read:OperasionalJadwal',
            'read:OperasionalKalkulasi',
            'read:OperasionalKitchen',
            'read:OperasionalStock',
          ],
        },
        {
          roleName: 'dinkes',
          permissions: [
            'read:Dashboard',
            'read:Map',
            'read:Live',
            'read:Audit',
            'read:Reports',
            'read:Incidents',
          ],
        },
        {
          roleName: 'public',
          permissions: [
            'read:Dashboard',
            'read:Map',
            'read:Live',
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

        for (const permString of assignment.permissions) {
          const [action, subject] = permString.split(':');

          // Find permission
          const permission: any = await queryRunner.manager.findOne('permissions', {
            where: { action, subject },
          });

          if (!permission) {
            console.warn(`⚠️  Permission not found: ${permString}, skipping...`);
            continue;
          }

          // Check if assignment already exists using query
          const existingAssignment = await queryRunner.manager.query(
            `SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2 LIMIT 1`,
            [role.id, permission.id]
          );

          if (existingAssignment && existingAssignment.length > 0) {
            continue;
          }

          // Create assignment
          await queryRunner.manager.query(
            `INSERT INTO role_permissions (role_id, permission_id, created_at) 
             VALUES ($1, $2, NOW())
             ON CONFLICT (role_id, permission_id) DO NOTHING`,
            [role.id, permission.id]
          );

          created++;
        }

        console.log(`✅ Assigned ${assignment.permissions.length} permissions to role: ${assignment.roleName}`);
      }

      console.log(`🎉 Role-permission assignment completed! Created: ${created} assignments`);
    } finally {
      await queryRunner.release();
    }
  }
}
