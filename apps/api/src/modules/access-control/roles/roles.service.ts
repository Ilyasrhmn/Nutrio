import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { Role, Permission } from '../roles/entities/role.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private cacheService: CacheService,
  ) {}

  /**
   * Find all roles with pagination and optional search
   */
  async findAll(page: number = 1, limit: number = 20, search?: string) {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    if (search) {
      queryBuilder.where('role.name LIKE :search OR role.description LIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy('role.createdAt', 'DESC');

    const [roles, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Get permissions for each role
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const rolePermissions = await this.rolePermissionRepository.find({
          where: { roleId: role.id },
          relations: ['permission'],
        });
        
        const permissions = rolePermissions.map(rp => rp.permission);
        
        return {
          ...role,
          permissionCount: permissions.length,
          permissions,
        };
      }),
    );

    return {
      items: rolesWithPermissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Find a single role by ID with permissions loaded
   */
  async findOne(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    // Load permissions
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId: id },
      relations: ['permission'],
    });

    const permissions = rolePermissions.map((rp) => rp.permission);

    return {
      ...role,
      permissions,
    };
  }

  /**
   * Find a role by name (without throwing if not found)
   */
  async findByName(name: string) {
    const role = await this.roleRepository.findOne({ where: { name } });
    return role;
  }

  /**
   * Create a new role
   */
  async create(name: string, description?: string) {
    // Validate role name format
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
      throw new BadRequestException(
        'Role name must contain only lowercase letters, numbers, and underscores, and must start with a letter',
      );
    }

    // Check for reserved names
    const reservedNames = ['admin', 'superuser', 'root', 'system'];
    if (reservedNames.includes(name.toLowerCase())) {
      throw new BadRequestException(`Role name "${name}" is reserved and cannot be used`);
    }

    // Check for duplicates
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new ConflictException(`Role with name "${name}" already exists`);
    }

    const role = this.roleRepository.create({
      name,
      description,
    });

    return this.roleRepository.save(role);
  }

  /**
   * Update an existing role
   */
  async update(id: string, name?: string, description?: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    // Validate role name if provided
    if (name) {
      if (!/^[a-z][a-z0-9_]*$/.test(name)) {
        throw new BadRequestException(
          'Role name must contain only lowercase letters, numbers, and underscores, and must start with a letter',
        );
      }

      // Check for reserved names
      const reservedNames = ['admin', 'superuser', 'root', 'system'];
      if (reservedNames.includes(name.toLowerCase())) {
        throw new BadRequestException(`Role name "${name}" is reserved and cannot be used`);
      }

      // Check for duplicates (excluding current role)
      const existingRole = await this.roleRepository.findOne({
        where: { name },
      });
      if (existingRole && existingRole.id !== id) {
        throw new ConflictException(`Role with name "${name}" already exists`);
      }

      role.name = name;
    }

    if (description !== undefined) {
      role.description = description;
    }

    return this.roleRepository.save(role);
  }

  /**
   * Delete a role (only if no users have this role)
   */
  async remove(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    // Check if any users have this role (would need UsersService or direct query)
    // For now, we'll skip this check and implement it when UsersService is available

    // Delete role permissions first
    await this.rolePermissionRepository.delete({ roleId: id });

    // Delete the role
    await this.roleRepository.remove(role);

    return { success: true, message: `Role "${role.name}" deleted successfully` };
  }

  /**
   * Add permissions to a role
   */
  async addPermissions(roleId: string, permissionIds: string[]) {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    const assignments = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    await this.rolePermissionRepository.save(assignments);

    // Invalidate cache
    await this.cacheService.invalidateRolePermissions(role.name);

    return this.findOne(roleId);
  }

  /**
   * Remove permissions from a role
   */
  async removePermissions(roleId: string, permissionIds: string[]) {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    await this.rolePermissionRepository.delete({
      roleId,
      permissionId: In(permissionIds),
    });

    // Invalidate cache
    await this.cacheService.invalidateRolePermissions(role.name);

    return this.findOne(roleId);
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(roleId: string) {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    return rolePermissions.map((rp) => rp.permission);
  }
}
