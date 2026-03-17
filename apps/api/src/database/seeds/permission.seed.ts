import { DataSource } from 'typeorm';
import { Permission } from '../../modules/access-control/roles/entities/role.entity';

interface SeedPermission {
  action: string;
  subject: string;
  description: string;
}

export default class PermissionSeed {
  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('🌱 Starting permission seeding...');

      const permissions: SeedPermission[] = [
        // Dashboard permissions
        { action: 'read', subject: 'Dashboard', description: 'Can view dashboard' },
        
        // Map permissions
        { action: 'read', subject: 'Map', description: 'Can view map' },
        
        // Funds permissions
        { action: 'read', subject: 'Funds', description: 'Can view funds information' },
        
        // Menu permissions
        { action: 'read', subject: 'Menu', description: 'Can view menu planning' },
        
        // LiveExecution permissions
        { action: 'read', subject: 'LiveExecution', description: 'Can view live monitoring' },
        
        // Logistics permissions
        { action: 'read', subject: 'Logistics', description: 'Can view logistics information' },
        
        // Checkpoints permissions
        { action: 'read', subject: 'Checkpoints', description: 'Can view checkpoints' },
        
        // Audit permissions
        { action: 'read', subject: 'Audit', description: 'Can view audit logs' },
        
        // Reports permissions
        { action: 'read', subject: 'Reports', description: 'Can view reports' },
        
        // Marketplace permissions
        { action: 'read', subject: 'Marketplace', description: 'Can view marketplace' },
        
        // Settings permissions
        { action: 'read', subject: 'Settings', description: 'Can view and modify settings' },

        // Admin - Role Management
        { action: 'read', subject: 'Role', description: 'Can view roles' },
        { action: 'create', subject: 'Role', description: 'Can create roles' },
        { action: 'update', subject: 'Role', description: 'Can update roles' },
        { action: 'delete', subject: 'Role', description: 'Can delete roles' },
        { action: 'manage', subject: 'Role', description: 'Full access to role management' },
        
        // Admin - Permission Management
        { action: 'read', subject: 'Permission', description: 'Can view permissions' },
        { action: 'create', subject: 'Permission', description: 'Can create permissions' },
        { action: 'update', subject: 'Permission', description: 'Can update permissions' },
        { action: 'delete', subject: 'Permission', description: 'Can delete permissions' },
        { action: 'manage', subject: 'Permission', description: 'Full access to permission management' },
        
        // Admin - Menu Management
        { action: 'read', subject: 'MenuAdmin', description: 'Can view admin menus' },
        { action: 'create', subject: 'MenuAdmin', description: 'Can create admin menus' },
        { action: 'update', subject: 'MenuAdmin', description: 'Can update admin menus' },
        { action: 'delete', subject: 'MenuAdmin', description: 'Can delete admin menus' },
        { action: 'manage', subject: 'MenuAdmin', description: 'Full access to menu management' },

        // Additional granular permissions
        { action: 'create', subject: 'Dashboard', description: 'Can create dashboard content' },
        { action: 'update', subject: 'Dashboard', description: 'Can update dashboard content' },
        { action: 'delete', subject: 'Dashboard', description: 'Can delete dashboard content' },
        
        { action: 'create', subject: 'Map', description: 'Can create map markers' },
        { action: 'update', subject: 'Map', description: 'Can update map markers' },
        
        { action: 'create', subject: 'Funds', description: 'Can create fund records' },
        { action: 'update', subject: 'Funds', description: 'Can update fund records' },
        { action: 'delete', subject: 'Funds', description: 'Can delete fund records' },
        
        { action: 'create', subject: 'Menu', description: 'Can create menu items' },
        { action: 'update', subject: 'Menu', description: 'Can update menu items' },
        { action: 'delete', subject: 'Menu', description: 'Can delete menu items' },
        
        { action: 'create', subject: 'LiveExecution', description: 'Can create execution records' },
        { action: 'update', subject: 'LiveExecution', description: 'Can update execution records' },
        
        { action: 'create', subject: 'Logistics', description: 'Can create logistics records' },
        { action: 'update', subject: 'Logistics', description: 'Can update logistics records' },
        { action: 'delete', subject: 'Logistics', description: 'Can delete logistics records' },
        
        { action: 'create', subject: 'Checkpoints', description: 'Can create checkpoint records' },
        { action: 'update', subject: 'Checkpoints', description: 'Can update checkpoint records' },
        
        { action: 'create', subject: 'Audit', description: 'Can create audit entries' },
        { action: 'update', subject: 'Audit', description: 'Can update audit entries' },
        
        { action: 'create', subject: 'Reports', description: 'Can create reports' },
        { action: 'update', subject: 'Reports', description: 'Can update reports' },
        { action: 'delete', subject: 'Reports', description: 'Can delete reports' },
        
        { action: 'create', subject: 'Marketplace', description: 'Can create marketplace listings' },
        { action: 'update', subject: 'Marketplace', description: 'Can update marketplace listings' },
        { action: 'delete', subject: 'Marketplace', description: 'Can delete marketplace listings' },
        
        { action: 'create', subject: 'Settings', description: 'Can create settings' },
        { action: 'update', subject: 'Settings', description: 'Can update settings' },
        { action: 'delete', subject: 'Settings', description: 'Can delete settings' },
        
        // Management level permissions
        { action: 'manage', subject: 'all', description: 'Full access to all resources' },
      ];

      let created = 0;
      let skipped = 0;

      for (const permissionData of permissions) {
        // Check if permission already exists
        const existingPermission = await queryRunner.manager.findOneBy('permissions', {
          action: permissionData.action,
          subject: permissionData.subject,
        });

        if (existingPermission) {
          console.warn(`⚠️  Permission already exists: ${permissionData.action}:${permissionData.subject}`);
          skipped++;
          continue;
        }

        // Insert permission
        await queryRunner.manager.save('permissions', {
          action: permissionData.action,
          subject: permissionData.subject,
          description: permissionData.description,
        });

        console.log(`✅ Created permission: ${permissionData.action}:${permissionData.subject}`);
        created++;
      }

      console.log(`🎉 Permission seeding completed! Created: ${created}, Skipped: ${skipped}`);
    } finally {
      await queryRunner.release();
    }
  }
}
