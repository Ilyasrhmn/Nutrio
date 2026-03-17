'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Users, 
  Key, 
  Menu as MenuIcon, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldAlert,
  Search,
  CheckCircle2,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { rolesService } from '@/lib/services/roles.service';
import { permissionsService } from '@/lib/services/permissions.service';
import { menusService } from '@/lib/services/menus.service';
import { MenuTree, RoleWithPermissions } from '@workspace/common';

// Dynamic import for ApexCharts to handle SSR properly
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AdminDashboard() {
  const [data, setData] = useState<{
    roles: RoleWithPermissions[];
    permissionsCount: number;
    menusCount: number;
    unassignedMenus: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const [rolesRes, permsRes, menusRes] = await Promise.all([
          rolesService.getAll(1, 10),
          permissionsService.getAll(),
          menusService.getTree()
        ]);

        const allPerms = Object.values(permsRes).flat();
        const flattenMenus = (items: MenuTree[]): MenuTree[] => {
          return items.reduce((acc, item) => {
            acc.push(item);
            if (item.children) acc.push(...flattenMenus(item.children));
            return acc;
          }, [] as MenuTree[]);
        };
        const flatMenus = flattenMenus(menusRes);

        setData({
          roles: rolesRes.items,
          permissionsCount: allPerms.length,
          menusCount: flatMenus.length,
          unassignedMenus: flatMenus.filter(m => !m.assignedRoles?.length).length
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = [
    {
      title: 'Total Roles',
      value: data?.roles.length.toString() || '0',
      description: 'Defined user groups',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/portal/admin/roles'
    },
    {
      title: 'Permissions',
      value: data?.permissionsCount.toString() || '0',
      description: 'Active access rules',
      icon: Key,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/portal/admin/permissions'
    },
    {
      title: 'Menu Items',
      value: data?.menusCount.toString() || '0',
      description: 'Navigation nodes',
      icon: MenuIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: '/portal/admin/menus'
    }
  ];

  const chartOptions: any = {
    chart: {
      type: 'radialBar',
      sparkline: { enabled: true }
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '60%' },
        track: { background: 'rgba(var(--primary), 0.1)' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 8,
            fontSize: '1.25rem',
            fontWeight: '900',
            color: 'hsl(var(--foreground))',
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    colors: ['hsl(var(--primary))'],
    stroke: { lineCap: 'round' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Analyzing Access System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-primary/5 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
              <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="size-24" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color} shadow-sm border border-black/5`}>
                  <stat.icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="size-3 text-emerald-500" />
                  {stat.description}
                </p>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* System Health & Insights */}
        <Card className="lg:col-span-4 bg-gradient-to-br from-background via-background to-primary/5 border-primary/10 shadow-lg relative overflow-hidden">
          <div className="absolute -top-12 -right-12 size-64 bg-primary/5 rounded-full blur-3xl" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Access Insight Dashboard</CardTitle>
                  <CardDescription>Live telemetry of your security configuration.</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 font-bold text-[10px] tracking-widest uppercase">
                System Healthy
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative size-40 shrink-0">
                <ReactApexChart options={chartOptions} series={[85]} type="radialBar" width={200} />
                <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Coverage</span>
                </div>
              </div>
              
              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em]">
                    <span>Role to Menu Mapping</span>
                    <span className="text-primary font-black">GOOD</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-1000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-black/5 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Admin Roles</span>
                    <span className="text-xl font-black text-foreground tracking-tighter">01</span>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-500/10 w-fit px-1.5 rounded">Active</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-black/5 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Avg. Perms / Role</span>
                    <span className="text-xl font-black text-foreground tracking-tighter">
                      {Math.round(data!.permissionsCount / (data!.roles.length || 1))}
                    </span>
                    <span className="text-[9px] text-blue-600 font-bold bg-blue-500/10 w-fit px-1.5 rounded">Balanced</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-4 group hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                  <Activity className="size-3" />
                  Privileged Nodes
                </div>
                <div className="space-y-3">
                  {data?.roles.slice(0, 3).map((role) => (
                    <div key={role.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground/80 font-bold">{role.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-[9px] h-4 bg-primary/5 text-primary border-none">
                          {role.permissions.length} keys
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-4 group hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500">
                  <ShieldAlert className="size-3" />
                  Security Alerts
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <div className="size-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] text-amber-700 font-bold">
                      {data?.unassignedMenus} menus without explicit roles
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-emerald-700 font-bold">
                      All basic permissions encrypted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Search */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-primary/5 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden group">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black tracking-tight">Quick Terminal</CardTitle>
              <CardDescription>Instant access to management modules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary opacity-50" />
                <Input 
                  placeholder="Jump to setting..." 
                  className="pl-11 h-12 bg-primary/[0.03] border-none shadow-inner rounded-xl font-medium focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="grid gap-3">
                <Link href="/portal/admin/roles">
                  <Button variant="outline" className="w-full justify-between group h-14 px-5 rounded-2xl border-primary/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <Plus className="size-5" />
                      </div>
                      <div className="flex flex-col items-start ">
                        <span className="font-black text-[10px] uppercase tracking-widest">Identify</span>
                        <span className="text-sm font-bold tracking-tight">Create New Role</span>
                      </div>
                    </div>
                    <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                </Link>
                <Link href="/portal/admin/menus">
                  <Button variant="outline" className="w-full justify-between group h-14 px-5 rounded-2xl border-primary/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <MenuIcon className="size-5" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-black text-[10px] uppercase tracking-widest">Navigation</span>
                        <span className="text-sm font-bold tracking-tight">Configure Menus</span>
                      </div>
                    </div>
                    <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/5 bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/20 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none">
              <ShieldCheck className="size-48" />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] opacity-70">Security Protocol</h3>
              <p className="text-lg font-black leading-tight tracking-tight pr-4">
                Remember to audit roles every 30 days for maximum integrity.
              </p>
              <Button className="bg-white text-primary hover:bg-white/90 rounded-full font-black text-[10px] uppercase tracking-widest py-1.5 h-auto px-6 shadow-lg">
                View Policy
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Access Control Guide */}
      <Card className="bg-card border-dashed border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-all">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10 shadow-sm">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight">System Deployment Blueprint</CardTitle>
              <CardDescription className="font-medium">Strategic sequence for implementing granular control.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-12 md:grid-cols-3 py-4">
            {[
              { 
                step: '01', 
                title: 'Define Roles', 
                text: 'Draft high-level personas and map them to real system users.',
                icon: Users
              },
              { 
                step: '02', 
                title: 'Set Granularity', 
                text: 'Attach specific actions to subjects to create a restricted permission matrix.',
                icon: Key
              },
              { 
                step: '03', 
                title: 'Map Navigation', 
                text: 'Tie menu nodes to roles to ensure a clean, tailored user experience.',
                icon: MenuIcon
              }
            ].map((item) => (
              <div key={item.step} className="relative space-y-3 group/item">
                <span className="text-6xl font-black text-primary/[0.04] absolute -top-8 -left-4 group-hover/item:text-primary/[0.08] transition-colors pointer-events-none">
                  {item.step}
                </span>
                <div className="flex items-center gap-3 relative">
                  <div className="size-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  <h4 className="font-black text-xs uppercase tracking-widest text-foreground/80">{item.title}</h4>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed pr-6">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
