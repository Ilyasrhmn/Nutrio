"use client"

import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import AdminReportsPage from "./components/admin-reports"
import VendorReportsPage from "./components/vendor-reports"
import SupplierReportsPage from "./components/supplier-reports"

export default function ReportsRouter() {
  const { user } = useAuth()
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Ambil nama role, default 'admin' jika tidak ada
  const roleName = (user?.role || "Admin").toLowerCase()

  if (!mounted) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Memuat laporan...</div>
  }

  // Routing render komponen berdasarkan Role
  if (roleName.includes("supplier")) {
    return <SupplierReportsPage />
  }
  
  if (roleName.includes("vendor") || roleName.includes("mitra") || roleName.includes("dapur")) {
    return <VendorReportsPage />
  }

  // Jika admin / bgn / superuser / role tidak dikenali
  return <AdminReportsPage />
}
