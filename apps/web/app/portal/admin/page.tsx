import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Users, Key, Menu as MenuIcon, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export default function AdminDashboard() {
  const adminSections = [
    {
      title: 'Roles',
      description: 'Manage user roles and assign permissions.',
      href: '/portal/admin/roles',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Permissions',
      description: 'Define granular access control rules.',
      href: '/portal/admin/permissions',
      icon: Key,
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: 'Menus',
      description: 'Configure sidebar navigation and visibility.',
      href: '/portal/admin/menus',
      icon: MenuIcon,
      color: 'bg-green-500/10 text-green-500',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-3">
        {adminSections.map((section) => (
          <Link key={section.title} href={section.href}>
            <Card className="group h-full hover:shadow-lg transition-all hover:border-primary/50 overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-xl ${section.color}`}>
                  <section.icon className="size-6" />
                </div>
                <div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {section.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base min-h-[48px]">
                  {section.description}
                </CardDescription>
                <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Manage {section.title.toLowerCase()}
                  <ArrowRight className="ml-2 size-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Start Guide */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <CardTitle className="text-lg">Access Control Guide</CardTitle>
          </div>
          <CardDescription>Follow these steps to set up your access control system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {[
                { step: 1, text: 'Create or modify Roles to define user types' },
                { step: 2, text: 'Define Permissions for granular access control' },
                { step: 3, text: 'Assign permissions to roles in Role Edit' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <p className="text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                { step: 4, text: 'Configure Menus for sidebar navigation' },
                { step: 5, text: 'Assign menu items to roles for visibility' },
                { step: 6, text: 'Test with different user roles' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <p className="text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
