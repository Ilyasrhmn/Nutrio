'use client';

import { useEffect, useState } from 'react';
import { menusService } from '@/lib/services/menus.service';
import { rolesService } from '@/lib/services/roles.service';
import { MenuTree, RoleWithPermissions } from '@workspace/common';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Menu as MenuIcon, 
  ChevronRight, 
  ChevronDown,
  LayoutDashboard,
  Map as MapIcon,
  Wallet,
  Utensils,
  Store,
  Camera,
  Truck,
  ClipboardCheck,
  History,
  FileBarChart,
  ShieldCheck,
  Settings,
  Folder
} from 'lucide-react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Badge } from '@workspace/ui/components/badge';

// Icon mapping for preview
const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Map: MapIcon,
  Wallet,
  Utensils,
  Store,
  Camera,
  Truck,
  ClipboardCheck,
  History,
  FileBarChart,
  ShieldCheck,
  Settings,
  Folder
};

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuTree[]>([]);
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuTree | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [menusData, rolesData] = await Promise.all([
        menusService.getTree(),
        rolesService.getAll(1, 100),
      ]);
      setMenus(menusData);
      setRoles(rolesData.items);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(menu: MenuTree) {
    if (menu.children && menu.children.length > 0) {
      alert(`Cannot delete menu "${menu.name}" because it has children. Delete children first.`);
      return;
    }

    if (!confirm(`Delete menu item "${menu.name}"?`)) {
      return;
    }

    try {
      await menusService.delete(menu.id);
      await loadData();
    } catch (error: any) {
      alert(`Failed to delete: ${error.response?.data?.message || error.message}`);
    }
  }

  if (loading && menus.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Menus</h2>
          <p className="text-sm text-muted-foreground">Configure sidebar navigation and role-based visibility</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="size-4" />
          New Menu Item
        </Button>
      </div>

      {/* Menu Tree */}
      <Card>
        <CardContent className="p-6">
          {menus.length === 0 ? (
            <div className="text-muted-foreground text-center py-12 flex flex-col items-center gap-3">
              <MenuIcon className="size-12 opacity-20" />
              <p>No menu items configured yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <MenuTreeList
                menus={menus}
                onEdit={setSelectedMenu}
                onDelete={handleDelete}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateMenuModal
          menus={menus}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadData}
        />
      )}

      {/* Edit Modal */}
      {selectedMenu && (
        <EditMenuModal
          menu={selectedMenu}
          menus={menus}
          roles={roles}
          onClose={() => setSelectedMenu(null)}
          onSuccess={() => {
            setSelectedMenu(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Recursive Menu Tree Component
function MenuTreeList({
  menus,
  onEdit,
  onDelete,
  level = 0,
}: {
  menus: MenuTree[];
  onEdit: (menu: MenuTree) => void;
  onDelete: (menu: MenuTree) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(menus.map(m => [m.id, true]))
  );

  function toggleExpand(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-1">
      {menus.map((menu) => {
        const Icon = ICON_MAP[menu.icon] || Folder;
        const hasChildren = menu.children && menu.children.length > 0;
        const indentClass = level === 0 ? '' : level === 1 ? 'ml-3 md:ml-6' : level === 2 ? 'ml-6 md:ml-12' : 'ml-9 md:ml-18';
        
        return (
          <div key={menu.id} className="space-y-1">
            <div
              className={`group flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-all ${indentClass}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  {hasChildren ? (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-6 p-0" 
                      onClick={() => toggleExpand(menu.id)}
                    >
                      {expanded[menu.id] ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </Button>
                  ) : (
                    <div className="size-6" />
                  )}
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="size-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium flex items-center gap-2">
                    {menu.name}
                    {menu.requiredPermission && (
                      <Badge variant="outline" className="text-[10px] py-0 h-4 font-normal">
                        {menu.requiredPermission}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{menu.path}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => onEdit(menu)}
                >
                  <Edit className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(menu)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            {hasChildren && expanded[menu.id] && (
              <MenuTreeList
                menus={menu.children}
                onEdit={onEdit}
                onDelete={onDelete}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Create Menu Modal
function CreateMenuModal({
  menus,
  onClose,
  onSuccess,
}: {
  menus: MenuTree[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [order, setOrder] = useState(0);
  const [parentId, setParentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await menusService.create({ name, path, icon, order, parentId });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Failed to create menu');
    } finally {
      setSaving(false);
    }
  }

  // Flatten menus for parent selector
  const flatMenus: { id: string, name: string }[] = [];
  function flatten(items: MenuTree[], prefix = '') {
    items.forEach(item => {
      flatMenus.push({ id: item.id, name: prefix + item.name });
      if (item.children) flatten(item.children, prefix + '— ');
    });
  }
  flatten(menus);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>Create Menu Item</CardTitle>
          <CardDescription>Add a new item to the sidebar navigation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menu-name">Name</Label>
              <Input
                id="menu-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Dashboard"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-path">Path</Label>
              <Input
                id="menu-path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/portal/dashboard"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="menu-icon">Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger id="menu-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ICON_MAP).map(key => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu-order">Order</Label>
                <Input
                  id="menu-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-parent">Parent Menu (optional)</Label>
              <Select 
                value={parentId || 'none'} 
                onValueChange={(val) => setParentId(val === 'none' ? null : val)}
              >
                <SelectTrigger id="menu-parent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (top level)</SelectItem>
                  {flatMenus.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Edit Menu Modal
function EditMenuModal({
  menu,
  menus,
  roles,
  onClose,
  onSuccess,
}: {
  menu: MenuTree;
  menus: MenuTree[];
  roles: RoleWithPermissions[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(menu.name);
  const [path, setPath] = useState(menu.path);
  const [icon, setIcon] = useState(menu.icon);
  const [order, setOrder] = useState(menu.order);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await menusService.update(menu.id, { name, path, icon, order });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Failed to update menu');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>Edit Menu Item: {menu.name}</CardTitle>
          <CardDescription>Update navigation details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-menu-name">Name</Label>
              <Input
                id="edit-menu-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-menu-path">Path</Label>
              <Input
                id="edit-menu-path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-menu-icon">Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger id="edit-menu-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ICON_MAP).map(key => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-menu-order">Order</Label>
                <Input
                  id="edit-menu-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
