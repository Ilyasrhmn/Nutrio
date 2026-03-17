import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { Menu, RoleMenu } from '../roles/entities/menu.entity';
import { Role } from '../roles/entities/role.entity';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepository: Repository<RoleMenu>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly cacheService: CacheService,
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
    // Try to get from cache first
    const cacheKey = this.cacheService.getUserMenuKey(roleId);
    const cachedMenu = await this.cacheService.get<any[]>(cacheKey);
    if (cachedMenu) {
      return cachedMenu;
    }

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

    const menuTree = this.buildMenuTree(menus, null);
    
    // Save to cache
    await this.cacheService.set(cacheKey, menuTree);
    
    return menuTree;
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
      throw new NotFoundException(`Menu with ID \"${id}\" not found`);
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
      throw new ConflictException(`Menu with path \"${path}\" already exists`);
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await this.menuRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent menu with ID \"${parentId}\" not found`);
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

    const savedMenu = await this.menuRepository.save(menu);
    
    // Invalidate all menu caches because a new item might affect anyone (though usually admin creates it)
    await this.invalidateAllMenuCaches();
    
    return savedMenu;
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
      throw new NotFoundException(`Menu with ID \"${id}\" not found`);
    }

    // Validate path if provided
    if (path) {
      if (!path.startsWith('/')) {
        throw new BadRequestException('Menu path must start with /');
      }

      // Check for duplicate path (excluding current menu)
      const existingMenu = await this.menuRepository.findOne({ where: { path } });
      if (existingMenu && existingMenu.id !== id) {
        throw new ConflictException(`Menu with path \"${path}\" already exists`);
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

    const updatedMenu = await this.menuRepository.save(menu);
    
    // Invalidate all menu caches
    await this.invalidateAllMenuCaches();
    
    return updatedMenu;
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
      throw new NotFoundException(`Menu with ID \"${id}\" not found`);
    }

    // Check for children
    const children = await this.menuRepository.find({ where: { parentId: id } });
    if (children.length > 0) {
      throw new BadRequestException(
        `Cannot delete menu \"${menu.name}\" because it has ${children.length} child menu(s). Please reassign or delete child menus first.`,
      );
    }

    // Delete role associations
    await this.roleMenuRepository.delete({ menuId: id });

    // Delete the menu
    await this.menuRepository.remove(menu);

    // Invalidate all menu caches
    await this.invalidateAllMenuCaches();

    return { success: true, message: 'Menu deleted successfully' };
  }

  /**
   * Reorder menu items
   */
  async reorder(id: string, newOrder: number) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID \"${id}\" not found`);
    }

    menu.order = newOrder;
    const saved = await this.menuRepository.save(menu);
    
    // Invalidate all menu caches
    await this.invalidateAllMenuCaches();
    
    return saved;
  }

  /**
   * Assign roles to a menu
   */
  async assignRoles(menuId: string, roleIds: string[]) {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID \"${menuId}\" not found`);
    }

    // Validate roles exist
    for (const roleId of roleIds) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException(`Role with ID \"${roleId}\" not found`);
      }
    }

    const assignments = roleIds.map((roleId) => ({
      menuId,
      roleId,
    }));

    await this.roleMenuRepository.save(assignments);

    // Invalidate cache for each role assigned
    for (const roleId of roleIds) {
      await this.cacheService.invalidateUserMenu(roleId);
    }

    return this.findOne(menuId);
  }

  /**
   * Remove roles from a menu
   */
  async removeRoles(menuId: string, roleIds: string[]) {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID \"${menuId}\" not found`);
    }

    await this.roleMenuRepository.delete({
      menuId,
      roleId: In(roleIds),
    });

    // Invalidate cache for each role removed
    for (const roleId of roleIds) {
      await this.cacheService.invalidateUserMenu(roleId);
    }

    return this.findOne(menuId);
  }

  /**
   * Helper to invalidate all user menu caches
   * Since we don't have pattern deletion in cache-manager v5,
   * we'll have to invalidate role by role if needed, or just let it TTL.
   * But usually we can get all role IDs.
   */
  private async invalidateAllMenuCaches() {
    try {
      const roles = await this.roleRepository.find();
      for (const role of roles) {
        await this.cacheService.invalidateUserMenu(role.id);
      }
    } catch (e) {
      // Ignore if fails
    }
  }
}