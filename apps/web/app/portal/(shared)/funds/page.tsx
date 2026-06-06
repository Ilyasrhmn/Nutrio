"use client"

import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/common"
import { AdminFundsDashboard } from "@/components/funds/admin-funds"
import { VendorFundsDashboard } from "@/components/funds/vendor-funds"

export default function FundTrackingPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Switch UI based on user role
  if (user?.role === UserRole.VENDOR || user?.role === UserRole.SUPPLIER) {
    return <VendorFundsDashboard />
  }

  // Default fallback (Admins, Inspectors, etc.)
  return <AdminFundsDashboard />
}
