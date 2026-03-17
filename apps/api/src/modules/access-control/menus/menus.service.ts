import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { Menu, RoleMenu } from '../roles/entities/menu.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepository: Repository<RoleMenu>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Get full menu tree structure
   */
  async findAllTree() {
    const menus = await this.menuRepository.find({
      order: { order: 'ASC' },
    });

    return this.buildMenuTree(menus, null);
  }

  /**
   * Get menu tree for a specific user based on their role
   */
  async findUserMenu(roleId: string) {
    // Get all menu IDs assigned to this role
    const roleMenus = await this.roleMenuRepository.find({
      where: { roleId },
      relations: ['menu'],
    });

    const menuIds = roleMenus.map((rm) => rm.menu.id);

    if (menuIds.length === 0) {
      return [];
    }

    // Get all menus (we need to build the tree properly)
    const menus = await this.menuRepository.findByIds(menuIds);
    menus.sort((a, b) => a.order - b.order);

    return this.buildMenuTree(menus, null);
  }

  /**
   * Build hierarchical menu tree from flat list
   */
  private buildMenuTree(menus: Menu[], parentId: string | null): any[] {
    return menus
      .filter((menu) => menu.parentId === parentId)
      .map((menu) => ({
        ...menu,
        children: this.buildMenuTree(menus, menu.id),
      }));
  }

  /**
   * Find a single menu by ID
   */
  async findOne(id: string) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    // Get assigned roles
    const roleMenus = await this.roleMenuRepository.find({
      where: { menuId: id },
      relations: ['role'],
    });

    return {
      ...menu,
      assignedRoles: roleMenus.map((rm) => rm.role),
    };
  }

  /**
   * Create a new menu item
   */
  async create(
    name: string,
    path: string,
    icon: string,
    order: number,
    parentId?: string | null,
    requiredPermission?: string | null,
    metadata?: Record<string, unknown> | null,
  ) {
    // Validate path format
    if (!path.startsWith('/')) {
      throw new BadRequestException('Menu path must start with /');
    }

    // Check for duplicate path
    const existingMenu = await this.menuRepository.findOne({ where: { path } });
    if (existingMenu) {
      throw new ConflictException(`Menu with path "${path}" already exists`);
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await this.menuRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent menu with ID "${parentId}" not found`);
      }

      // Check for circular reference
      if (await this.wouldCreateCircularReference(parentId, parentId)) {
        throw new BadRequestException('Cannot create circular menu hierarchy');
      }
    }

    const menu = this.menuRepository.create({
      name,
      path,
      icon,
      order,
      parentId: parentId || null,
      requiredPermission,
      metadata,
    });

    return this.menuRepository.save(menu);
  }

  /**
   * Update an existing menu item
   */
  async update(
    id: string,
    name?: string,
    path?: string,
    icon?: string,
    order?: number,
    parentId?: string | null,
    requiredPermission?: string | null,
    metadata?: Record<string, unknown> | null,
  ) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    // Validate path if provided
    if (path) {
      if (!path.startsWith('/')) {
        throw new BadRequestException('Menu path must start with /');
      }

      // Check for duplicate path (excluding current menu)
      const existingMenu = await this.menuRepository.findOne({ where: { path } });
      if (existingMenu && existingMenu.id !== id) {
        throw new ConflictException(`Menu with path "${path}" already exists`);
      }

      menu.path = path;
    }

    if (name !== undefined) menu.name = name;
    if (icon !== undefined) menu.icon = icon;
    if (order !== undefined) menu.order = order;
    if (requiredPermission !== undefined) menu.requiredPermission = requiredPermission;
    if (metadata !== undefined) menu.metadata = metadata;

    // Validate parent change
    if (parentId !== undefined) {
      if (parentId && parentId !== menu.parentId) {
        // Check for circular reference
        if (await this.wouldCreateCircularReference(id, parentId)) {
          throw new BadRequestException('Cannot create circular menu hierarchy');
        }
      }
      menu.parentId = parentId || null;
    }

    return this.menuRepository.save(menu);
  }

  /**
   * Check if setting a parent would create a circular reference
   */
  private async wouldCreateCircularReference(menuId: string, newParentId: string): Promise<boolean> {
    // If trying to set parent to itself
    if (menuId === newParentId) {
      return true;
    }

    // Check if newParentId is a descendant of menuId
    const descendants = await this.getDescendants(menuId);
    return descendants.includes(newParentId);
  }

  /**
   * Get all descendants of a menu
   */
  private async getDescendants(menuId: string): Promise<string[]> {
    const children = await this.menuRepository.find({ where: { parentId: menuId } });
    const descendantIds = children.map((c) => c.id);

    for (const child of children) {
      const childDescendants = await this.getDescendants(child.id);
      descendantIds.push(...childDescendants);
    }

    return descendantIds;
  }

  /**
   * Delete a menu item (only if it has no children)
   */
  async remove(id: string) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    // Check for children
    const children = await this.menuRepository.find({ where: { parentId: id } });
    if (children.length > 0) {
      throw new BadRequestException(
        `Cannot delete menu "${menu.name}" because it has ${children.length} child menu(s). Please reassign or delete child menus first.`,
      );
    }

    // Delete role associations
    await this.roleMenuRepository.delete({ menuId: id });

    // Delete the menu
    await this.menuRepository.remove(menu);

    return { success: true, message: 'Menu deleted successfully' };
  }

  /**
   * Reorder menu items
   */
  async reorder(id: string, newOrder: number) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    menu.order = newOrder;
    return this.menuRepository.save(menu);
  }

  /**
   * Assign roles to a menu
   */
  async assignRoles(menuId: string, roleIds: string[]) {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${menuId}" not found`);
    }

    // Validate roles exist
    for (const roleId of roleIds) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException(`Role with ID "${roleId}" not found`);
      }
    }

    const assignments = roleIds.map((roleId) => ({
      menuId,
      roleId,
    }));

    await this.roleMenuRepository.save(assignments);

    return this.findOne(menuId);
  }

  /**
   * Remove roles from a menu
   */
  async removeRoles(menuId: string, roleIds: string[]) {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID "${menuId}" not found`);
    }

    await this.roleMenuRepository.delete({
      menuId,
      roleId: In(roleIds),
    });

    return this.findOne(menuId);
  }
}
