"use client"

import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/common"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { VendorDashboard } from "@/components/dashboard/vendor-dashboard"
import { SupplierDashboard } from "@/components/dashboard/supplier-dashboard"

export default function DashboardPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Role-based routing for Dashboard UI
  switch (user?.role) {
    case UserRole.ADMIN_BGN:
      return <AdminDashboard />
    
    case UserRole.VENDOR:
      return <VendorDashboard />
    
    case UserRole.SUPPLIER:
      return <SupplierDashboard />
    
    case UserRole.INSPECTOR:
      // Placeholder for Inspector role if needed later
      return <AdminDashboard /> 

    default:
      return <AdminDashboard />
  }
}
