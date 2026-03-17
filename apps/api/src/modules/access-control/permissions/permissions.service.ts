import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../roles/entities/role.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  /**
   * Find all permissions grouped by subject
   */
  async findAll() {
    const permissions = await this.permissionRepository.find({
      order: { subject: 'ASC', action: 'ASC' },
    });

    // Group by subject
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.subject]) {
        acc[permission.subject] = [];
      }
      acc[permission.subject]?.push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    return grouped;
  }

  /**
   * Find a single permission by ID with role usage count
   */
  async findOne(id: string) {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }

    // Count roles using this permission
    const roleCount = await this.rolePermissionRepository.count({
      where: { permissionId: id },
    });

    return {
      ...permission,
      roleCount,
    };
  }

  /**
   * Create a new permission
   */
  async create(action: string, subject: string, description?: string) {
    // Validate action
    const validActions = ['create', 'read', 'update', 'delete', 'view', 'manage'];
    if (!validActions.includes(action)) {
      throw new BadRequestException(
        `Invalid action "${action}". Must be one of: ${validActions.join(', ')}`,
      );
    }

    // Validate subject format (PascalCase)
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(subject)) {
      throw new BadRequestException(
        'Subject must be in PascalCase (e.g., Dashboard, UserProfile)',
      );
    }

    // Check for duplicates
    const existingPermission = await this.permissionRepository.findOne({
      where: { action, subject },
    });
    if (existingPermission) {
      throw new ConflictException(
        `Permission "${action}:${subject}" already exists`,
      );
    }

    const permission = this.permissionRepository.create({
      action,
      subject,
      description,
    });

    return this.permissionRepository.save(permission);
  }

  /**
   * Update permission description only
   */
  async update(id: string, description: string) {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }

    permission.description = description;
    return this.permissionRepository.save(permission);
  }

  /**
   * Delete a permission (only if not assigned to any role)
   */
  async remove(id: string) {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }

    // Check if assigned to any roles
    const roleCount = await this.rolePermissionRepository.count({
      where: { permissionId: id },
    });

    if (roleCount > 0) {
      // Get roles using this permission
      const rolePermissions = await this.rolePermissionRepository.find({
        where: { permissionId: id },
        relations: ['role'],
      });

      const roleNames = rolePermissions.map((rp) => rp.role.name);

      throw new ConflictException(
        `Cannot delete permission "${permission.action}:${permission.subject}" because it is assigned to ${roleCount} role(s): ${roleNames.join(', ')}`,
      );
    }

    await this.permissionRepository.remove(permission);

    return { success: true, message: 'Permission deleted successfully' };
  }

  /**
   * Get roles using a specific permission
   */
  async getRolesUsingPermission(permissionId: string) {
    const permission = await this.permissionRepository.findOne({ where: { id: permissionId } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID "${permissionId}" not found`);
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { permissionId },
      relations: ['role'],
    });

    return rolePermissions.map((rp) => rp.role);
  }
}
