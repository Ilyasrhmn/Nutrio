"use client";
import { menusService } from "@/lib/services/menus.service";
import { rolesService } from "@/lib/services/roles.service";
import {
  MenuTree,
  RoleWithPermissions,
  AppAction,
  AppSubject,
} from "@workspace/common";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Checkbox } from "@workspace/ui/components/checkbox";
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
  Folder,
  Search,
  CalendarDays,
  Scale,
  ClipboardList,
  CookingPot,
  UtensilsCrossed,
  AlertCircle,
  BookOpen,
  Bell,
  User,
  LogOut,
  Users,
  Briefcase,
  Building,
  CreditCard,
  Package,
  ShoppingCart,
  Zap,
  Star,
  Home,
  Info,
  LifeBuoy,
  MessageSquare,
  BarChart3,
  Calendar,
  Lock,
  Globe,
  Database,
  Layers,
  Link as LinkIcon,
  Mail,
  MoreHorizontal,
  Share2,
  Trash,
  UserPlus,
  Video,
  Eye,
  Activity,
  Award,
  KeyRound,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useToast } from "@workspace/ui/hooks/use-toast";
import { useUserMenu } from "@/hooks/use-user-menu";
import { Badge } from "@workspace/ui/components/badge";
import { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Icon mapping for preview
const ICON_MAP: Record<string, LucideIcon> = {
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
  Folder,
  CalendarDays,
  Scale,
  ClipboardList,
  CookingPot,
  UtensilsCrossed,
  AlertCircle,
  BookOpen,
  Bell,
  User,
  LogOut,
  Users,
  Briefcase,
  Building,
  CreditCard,
  Package,
  ShoppingCart,
  Zap,
  Star,
  Home,
  Info,
  LifeBuoy,
  MessageSquare,
  BarChart3,
  Calendar,
  Lock,
  Globe,
  Database,
  Layers,
  Link: LinkIcon,
  Mail,
  MoreHorizontal,
  Share2,
  Trash,
  UserPlus,
  Video,
  Eye,
  Activity,
  Award,
};

const COMMON_ACTIONS: AppAction[] = [
  "manage",
  "read",
  "create",
  "update",
  "delete",
  "view",
];
const COMMON_SUBJECTS: AppSubject[] = [
  "all",
  "Dashboard",
  "Map",
  "Funds",
  "Menu",
  "LiveExecution",
  "Logistics",
  "Checkpoints",
  "Audit",
  "Reports",
  "Marketplace",
  "Settings",
  "Role",
  "Permission",
  "User",
  "Monitoring",
];

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuTree | null>(null);
  const [roleMenuToManage, setRoleMenuToManage] = useState<MenuTree | null>(
    null,
  );
  const { toast } = useToast();
  const { refresh: refreshSidebar } = useUserMenu();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const menusData = await menusService.getTree();
      setMenus(menusData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSuccess = () => {
    loadData();
    refreshSidebar(); // Mutate sidebar state
  };

  async function handleMove(menuId: string, targetId: string) {
    let sourceMenu: MenuTree | undefined;
    let targetMenu: MenuTree | undefined;

    const findMenus = (items: MenuTree[]) => {
      for (const item of items) {
        if (item.id === menuId) sourceMenu = item;
        if (item.id === targetId) targetMenu = item;
        if (sourceMenu && targetMenu) return true;
        if (item.children && findMenus(item.children)) return true;
      }
      return false;
    };
    findMenus(menus);

    if (!sourceMenu || !targetMenu) return;

    const oldSourceOrder = sourceMenu.order;
    const oldTargetOrder = targetMenu.order;

    // Determine new orders (swapping)
    // If orders were same, force them to be different
    const newSourceOrder = oldTargetOrder;
    const newTargetOrder = oldSourceOrder === oldTargetOrder ? oldTargetOrder + 1 : oldSourceOrder;

    // Optimistically update local state
    const updateLocalState = (items: MenuTree[]): MenuTree[] => {
      return items
        .map((item) => {
          if (item.id === menuId) return { ...item, order: newSourceOrder };
          if (item.id === targetId) return { ...item, order: newTargetOrder };
          if (item.children)
            return { ...item, children: updateLocalState(item.children) };
          return item;
        })
        .sort((a, b) => a.order - b.order);
    };

    const previousMenus = [...menus];
    setMenus(updateLocalState(menus));

    try {
      await menusService.reorder(menuId, targetId);

      toast({
        title: "Order Updated",
        description: "Menu sequence has been updated.",
        variant: "success",
      });
      
      const freshData = await menusService.getTree();
      setMenus(freshData);
      refreshSidebar();
    } catch (error: unknown) {
      setMenus(previousMenus);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Reorder Failed",
        description: message,
        variant: "destructive",
      });
    }
  }

  async function handleDelete(menu: MenuTree) {
    if (menu.children && menu.children.length > 0) {
      toast({
        title: "Action Restricted",
        description: `Cannot delete menu "${menu.name}" because it has children. Delete children first.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Delete menu item "${menu.name}"?`)) {
      return;
    }

    try {
      await menusService.delete(menu.id);
      handleSuccess();
      toast({
        title: "Success",
        description: "Menu deleted successfully",
        variant: "success",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Delete Failed",
        description: message,
        variant: "destructive",
      });
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
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Menus Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure sidebar navigation, role-based visibility, and detailed
            permissions
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2 w-full sm:w-auto"
        >
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
              <div className="hidden md:grid grid-cols-[1fr_auto_150px] gap-4 px-4 py-2 border-b text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                <div>Menu Item</div>
                <div className="w-[300px]">Active Roles / Permissions</div>
                <div className="text-right">Actions</div>
              </div>
              <MenuTreeList
                menus={menus}
                onEdit={setSelectedMenu}
                onDelete={handleDelete}
                onManageRoles={setRoleMenuToManage}
                onMove={handleMove}
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
          onSuccess={handleSuccess}
        />
      )}

      {/* Edit Modal */}
      {selectedMenu && (
        <EditMenuModal
          menu={selectedMenu}
          menus={menus}
          onClose={() => setSelectedMenu(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Manage Roles & Permissions Modal */}
      {roleMenuToManage && (
        <ManageRolesModal
          menu={roleMenuToManage}
          onClose={() => setRoleMenuToManage(null)}
          onSuccess={handleSuccess}
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
  onManageRoles,
  onMove,
  level = 0,
}: {
  menus: MenuTree[];
  onEdit: (menu: MenuTree) => void;
  onDelete: (menu: MenuTree) => void;
  onManageRoles: (menu: MenuTree) => void;
  onMove: (menuId: string, targetId: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(menus.map((m) => [m.id, true])),
  );

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-1">
      {menus.map((menu, index) => {
        const Icon = (ICON_MAP[menu.icon] || Folder) as LucideIcon;
        const hasChildren = menu.children && menu.children.length > 0;
        const isActive = menu.assignedRoles && menu.assignedRoles.length > 0;

        const indentClass =
          level === 0
            ? ""
            : level === 1
              ? "ml-3 md:ml-6"
              : level === 2
                ? "ml-6 md:ml-12"
                : "ml-9 md:ml-18";

        return (
          <div key={menu.id} className="space-y-1">
            <div
              className={`group flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-all ${indentClass} ${!isActive ? "opacity-75 grayscale-[0.3]" : ""}`}
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
                  <div
                    className={cn(
                      "size-9 rounded-xl flex items-center justify-center shadow-sm border",
                      isActive
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold flex items-center gap-2 text-sm md:text-base">
                    {menu.name}
                    {!isActive ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 font-bold border-orange-200 bg-orange-50 text-orange-600 uppercase"
                      >
                        Inactive
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 font-bold border-emerald-200 bg-emerald-50 text-emerald-600 uppercase"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground/80 font-mono truncate">
                    {menu.path}
                  </div>
                </div>
              </div>

              {/* Roles & Permissions Column */}
              <div className="mt-3 md:mt-0 flex flex-col gap-2 md:w-[300px] px-2 py-1 bg-background/40 rounded-md border border-transparent group-hover:border-border/50">
                <div className="flex flex-wrap items-center gap-1.5 min-h-[20px]">
                  <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-tighter w-10">
                    Roles:
                  </span>
                  {menu.assignedRoles && menu.assignedRoles.length > 0 ? (
                    menu.assignedRoles.slice(0, 3).map((role) => (
                      <Badge
                        key={role.id}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground font-semibold"
                      >
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40 italic font-medium">
                      unassigned
                    </span>
                  )}
                  {menu.assignedRoles && menu.assignedRoles.length > 3 && (
                    <span className="text-[10px] text-primary font-bold">
                      +{menu.assignedRoles.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 min-h-[20px]">
                  <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-tighter w-10">
                    Perm:
                  </span>
                  {menu.requiredPermission ? (
                    <div className="flex items-center gap-1 px-1.5 py-0 h-4 bg-indigo-100 text-indigo-700 rounded-md border border-indigo-200">
                      <KeyRound className="size-2.5" />
                      <span className="text-[10px] font-black">
                        {menu.requiredPermission}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40 italic font-medium">
                      none (default)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 mt-3 md:mt-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {/* Manual Sort Buttons */}
                <div className="flex items-center border-r pr-1 mr-1 border-border/50">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary disabled:opacity-30"
                    disabled={index === 0}
                    onClick={() => {
                      const prevMenu = menus[index - 1];
                      if (prevMenu) {
                        onMove(menu.id, prevMenu.id);
                      }
                    }}
                    title="Move Up"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary disabled:opacity-30"
                    disabled={index === menus.length - 1}
                    onClick={() => {
                      const nextMenu = menus[index + 1];
                      if (nextMenu) {
                        onMove(menu.id, nextMenu.id);
                      }
                    }}
                    title="Move Down"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 shadow-none"
                  title="Assign Roles & Permissions"
                  onClick={() => onManageRoles(menu)}
                >
                  <ShieldCheck className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full"
                  title="Edit Detail"
                  onClick={() => onEdit(menu)}
                >
                  <Edit className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete"
                  onClick={() => onDelete(menu)}
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            </div>
            {hasChildren && expanded[menu.id] && (
              <MenuTreeList
                menus={menu.children}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageRoles={onManageRoles}
                onMove={onMove}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Icon Picker Component
function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredIcons = Object.keys(ICON_MAP).filter((key) =>
    key.toLowerCase().includes(search.toLowerCase()),
  );

  const SelectedIcon = (ICON_MAP[value] || Folder) as LucideIcon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-10 px-3"
          type="button"
        >
          <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <SelectedIcon className="size-4" />
          </div>
          <span className="flex-1 text-left truncate">{value}</span>
          <ChevronDown className="size-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-4 p-2 gap-1">
            {filteredIcons.length === 0 ? (
              <div className="col-span-4 py-8 text-center text-xs text-muted-foreground">
                No icons found.
              </div>
            ) : (
              filteredIcons.map((key) => {
                const Icon = ICON_MAP[key] as LucideIcon;
                const isSelected = value === key;
                return (
                  <Button
                    key={key}
                    type="button"
                    variant={isSelected ? "default" : "ghost"}
                    className={cn(
                      "size-12 p-0 flex flex-col items-center justify-center group",
                      isSelected && "bg-primary text-primary-foreground",
                    )}
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                      setSearch("");
                    }}
                    title={key}
                  >
                    <Icon
                      className={cn(
                        "size-6",
                        !isSelected &&
                          "text-muted-foreground group-hover:text-primary",
                      )}
                    />
                  </Button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
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
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [icon, setIcon] = useState("Folder");
  const [order, setOrder] = useState(0);
  const [parentId, setParentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await menusService.create({ name, path, icon, order, parentId });
      toast({
        title: "Success",
        description: "Menu created successfully",
        variant: "success",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Create Failed",
        description: err.response?.data?.message || "Failed to create menu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // Flatten menus for parent selector
  const flatMenus: { id: string; name: string }[] = [];
  function flatten(items: MenuTree[], prefix = "") {
    items.forEach((item) => {
      flatMenus.push({ id: item.id, name: prefix + item.name });
      if (item.children) flatten(item.children, prefix + "— ");
    });
  }
  flatten(menus);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <CardHeader>
          <CardTitle>Create Menu Item</CardTitle>
          <CardDescription>
            Add basic details. Visibility & Roles are configured after creation.
          </CardDescription>
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
                <IconPicker value={icon} onChange={setIcon} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu-order">Order</Label>
                <Input
                  id="menu-order"
                  type="text"
                  value={order.toString()}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOrder(val === "" ? 0 : parseInt(val, 10));
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-parent">Parent Menu (optional)</Label>
              <Select
                value={parentId || "none"}
                onValueChange={(val: string) =>
                  setParentId(val === "none" ? null : val)
                }
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Item"}
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
  onClose,
  onSuccess,
}: {
  menu: MenuTree;
  menus: MenuTree[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(menu.name);
  const [path, setPath] = useState(menu.path);
  const [icon, setIcon] = useState(menu.icon);
  const [order, setOrder] = useState(menu.order);
  const [parentId, setParentId] = useState<string | null>(
    menu.parentId || null,
  );
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await menusService.update(menu.id, { name, path, icon, order, parentId });
      toast({
        title: "Success",
        description: "Menu updated successfully",
        variant: "success",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || "Failed to update menu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // Flatten menus for parent selector
  const flatMenus: { id: string; name: string }[] = [];
  function flatten(items: MenuTree[], prefix = "") {
    items.forEach((item) => {
      if (item.id !== menu.id) {
        flatMenus.push({ id: item.id, name: prefix + item.name });
        if (item.children) flatten(item.children, prefix + "— ");
      }
    });
  }
  flatten(menus);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>Edit Menu Details: {menu.name}</CardTitle>
          <CardDescription>Update basic navigation info.</CardDescription>
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
                <IconPicker value={icon} onChange={setIcon} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-menu-order">Order</Label>
                <Input
                  id="edit-menu-order"
                  type="text"
                  value={order.toString()}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOrder(val === "" ? 0 : parseInt(val, 10));
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-menu-parent">Parent Menu (optional)</Label>
              <Select
                value={parentId || "none"}
                onValueChange={(val: string) =>
                  setParentId(val === "none" ? null : val)
                }
              >
                <SelectTrigger id="edit-menu-parent">
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Manage Roles Modal
function ManageRolesModal({
  menu,
  onClose,
  onSuccess,
}: {
  menu: MenuTree;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [assignedRoleIds, setAssignedRoleIds] = useState<string[]>([]);

  // Detailed Permission State
  const [action, setAction] = useState<AppAction>("read");
  const [subject, setSubject] = useState<AppSubject | "none">("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadRolesAndAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const [allRolesData, menuDetail] = await Promise.all([
        rolesService.getAll(1, 100),
        menusService.getById(menu.id),
      ]);

      setRoles(allRolesData.items);
      setAssignedRoleIds(menuDetail.assignedRoles?.map((r) => r.id) || []);
    } catch (error) {
      console.error("Failed to load roles:", error);
      toast({
        title: "Error",
        description: "Failed to load roles data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [menu.id, toast]);

  useEffect(() => {
    loadRolesAndAssignments();

    // Parse current requiredPermission (format: "action:subject")
    if (menu.requiredPermission) {
      const parts = menu.requiredPermission.split(":");
      if (parts.length === 2) {
        setAction(parts[0] as AppAction);
        setSubject(parts[1] as AppSubject);
      } else if (menu.requiredPermission !== "none") {
        // Fallback for old simple format
        setSubject(menu.requiredPermission as AppSubject);
      }
    } else {
      setSubject("none");
    }
  }, [menu.id, menu.requiredPermission, loadRolesAndAssignments]);

  const toggleRole = (roleId: string) => {
    setAssignedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  async function handleSave() {
    setSaving(true);
    try {
      const permissionString =
        subject === "none" ? null : `${action}:${subject}`;

      // Update both roles and requiredPermission
      await Promise.all([
        menusService.assignRoles(menu.id, assignedRoleIds),
        menusService.update(menu.id, { requiredPermission: permissionString }),
      ]);

      toast({
        title: "Success",
        description: "Access rules updated successfully",
        variant: "success",
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Save Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl shadow-2xl overflow-hidden border-primary/20">
        <div className="bg-primary/5 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Access Control: {menu.name}
              </CardTitle>
              <CardDescription>
                Define who can see this navigation item.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <LogOut className="size-4 rotate-180" />
          </Button>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
              {/* Left Column: Roles */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="size-4 text-primary" />
                  <h3 className="font-bold text-sm">Target Roles</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Select roles that should include this menu in their sidebar.
                </p>
                <div className="border rounded-xl overflow-hidden bg-muted/20">
                  <ScrollArea className="h-72">
                    <div className="p-1">
                      {roles.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No roles found.
                        </div>
                      ) : (
                        roles.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center gap-3 p-3 hover:bg-background transition-all border-b last:border-0 group"
                          >
                            <Checkbox
                              id={`role-${role.id}`}
                              checked={assignedRoleIds.includes(role.id)}
                              onCheckedChange={() => toggleRole(role.id)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <div
                              className="grid gap-0.5 cursor-pointer flex-1"
                              onClick={() => toggleRole(role.id)}
                            >
                              <Label className="font-semibold text-xs cursor-pointer group-hover:text-primary transition-colors">
                                {role.name}
                              </Label>
                              {role.description && (
                                <p className="text-[10px] text-muted-foreground line-clamp-1">
                                  {role.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Right Column: Visibility Rules (Permissions) */}
              <div className="p-6 bg-muted/5">
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="size-4 text-primary" />
                  <h3 className="font-bold text-sm">Visibility Conditions</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  Fine-tune visibility based on specific user capabilities.
                </p>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Required Action
                    </Label>
                    <Select
                      value={action}
                      onValueChange={(val: AppAction) => setAction(val)}
                    >
                      <SelectTrigger className="bg-background border-primary/10 h-10 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_ACTIONS.map((act) => (
                          <SelectItem key={act} value={act}>
                            {act}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Target Subject
                    </Label>
                    <Select
                      value={subject}
                      onValueChange={(val: AppSubject | "none") => setSubject(val)}
                    >
                      <SelectTrigger className="bg-background border-primary/10 h-10 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          None (Always visible if role assigned)
                        </SelectItem>
                        {COMMON_SUBJECTS.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
                    <ShieldAlert className="size-5 text-primary shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-primary">
                        Preview Rule
                      </p>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        User must have <strong>{action}</strong> permission on{" "}
                        <strong>
                          {subject === "none" ? "anything" : subject}
                        </strong>{" "}
                        to see this menu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl px-8 shadow-lg shadow-primary/20"
          >
            {saving ? "Applying Rules..." : "Save Access Rules"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
