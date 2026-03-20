"use client";

import { useAuth, mockUsers } from "@/components/providers/auth-provider";
import { UserRole } from "@workspace/common/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { 
  User, Shield, LogOut, ChevronRight, 
  HelpCircle, Bell, Moon, CreditCard, RefreshCw 
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout, login } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Pengaturan" showNotifications={false} showProfile={false} />
      
      <div className="p-4 space-y-6">
        <section className="flex flex-col items-center py-6 space-y-3">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-3xl font-black border-4 border-white shadow-xl">
            {user.avatar || user.name.charAt(0)}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{user.role}</p>
            {user.organization && (
              <p className="text-sm font-medium text-slate-400 mt-1">{user.organization}</p>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Akun & Keamanan</h3>
          <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <SettingsItem icon={User} label="Edit Profil" />
              <SettingsItem icon={Shield} label="Keamanan Akun" />
              <SettingsItem icon={Bell} label="Notifikasi" />
              <SettingsItem icon={Moon} label="Mode Gelap" toggle />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">App Demo Settings</h3>
          <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="p-4 border-b border-slate-50">
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase">Ganti Role (Demo)</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(UserRole).filter(r => mockUsers[r as UserRole]).map((role) => (
                    <Button 
                      key={role}
                      variant={user.role === role ? "default" : "outline"}
                      className={`h-10 text-[10px] font-black uppercase tracking-wider ${user.role === role ? 'bg-green-600' : 'border-slate-100'}`}
                      onClick={() => login(role as UserRole)}
                    >
                      {role.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
              <SettingsItem icon={RefreshCw} label="Reset App Data" danger />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3 pb-12">
           <Button 
            variant="ghost" 
            className="w-full h-14 text-red-600 font-black flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" /> Keluar Aplikasi
          </Button>
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            v0.0.1-hackathon-demo
          </p>
        </section>
      </div>
    </div>
  );
}

function SettingsItem({ 
  icon: Icon, 
  label, 
  toggle = false, 
  danger = false 
}: { 
  icon: any, 
  label: string, 
  toggle?: boolean,
  danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-sm font-bold ${danger ? 'text-red-600' : 'text-slate-700'}`}>{label}</span>
      </div>
      {toggle ? (
        <div className="h-6 w-11 bg-slate-200 rounded-full relative">
          <div className="h-5 w-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
        </div>
      ) : (
        <ChevronRight className="h-5 w-5 text-slate-300" />
      )}
    </div>
  );
}
