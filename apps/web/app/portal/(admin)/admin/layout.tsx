'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { PermissionProvider } from '@/lib/hooks/use-permission';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ShieldCheck, Users, Key, Menu as MenuIcon, ArrowLeft, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const checkAdminAccess = async () => {
      // Use the same key as use-auth hook
      const userData = localStorage.getItem('vendorTrack_user');
      if (!userData) {
        console.warn('No user data in localStorage');
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      
      // Check for admin_bgn role
      const isAdmin = user.role === 'admin_bgn';
      if (!isAdmin) {
        console.warn('User is not admin:', user.role);
        router.push('/portal');
        return;
      }

      setUserRole(user.role);
      setPermissions(user.permissions || []);
      setIsLoading(false);
    };

    checkAdminAccess();
  }, [router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const activeTab = pathname.split('/').pop() || 'admin';

  const navItems = [
    { href: '/portal/admin', value: 'admin', label: 'Overview', icon: null },
    { href: '/portal/admin/roles', value: 'roles', label: 'Roles', icon: Users },
    { href: '/portal/admin/permissions', value: 'permissions', label: 'Permissions', icon: Key },
    { href: '/portal/admin/menus', value: 'menus', label: 'Menus', icon: MenuIcon },
  ];

  return (
    <PermissionProvider permissions={permissions} role={userRole}>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Admin Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4 md:pb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">Access Control</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Manage roles, permissions, and menu access.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden gap-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <MenuIcon className="size-4" />
              )}
              <span className="text-xs">Menu</span>
            </Button>

            <Link href="/portal" className="hidden md:block">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Navigation (Tabs) */}
        <div className="hidden md:block">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              {navItems.map((item) => (
                <TabsTrigger 
                  key={item.value} 
                  value={item.value} 
                  className="p-0"
                  asChild
                >
                  <Link href={item.href} className="flex items-center justify-center gap-2 w-full h-full py-1.5 px-3">
                    {item.icon && <item.icon className="size-4" />}
                    <span className="hidden lg:inline">{item.label}</span>
                    <span className="lg:hidden">{item.value === 'permissions' ? 'Perms' : item.label}</span>
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Navigation (Dropdown Menu) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card border rounded-lg shadow-lg overflow-hidden">
            <nav className="divide-y">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                return (
                  <Link
                    key={item.value}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors',
                      isActive && 'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    {Icon && <Icon className="size-5 shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/portal"
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-muted-foreground"
              >
                <ArrowLeft className="size-5 shrink-0" />
                <span>Back to Portal</span>
              </Link>
            </nav>
          </div>
        )}

        {/* Content area */}
        <div className="min-h-[500px]">
          {children}
        </div>
      </div>
    </PermissionProvider>
  );
}
