"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { AuthProvider } from "@/hooks/use-auth"
import { MenuProvider } from "@/hooks/use-menu-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      enableColorScheme={false}
    >
      <AuthProvider>
        <MenuProvider>
          {children}
        </MenuProvider>
      </AuthProvider>
    </NextThemesProvider>
  )
}
