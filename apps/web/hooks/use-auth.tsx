"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { createContext, useContext, useState, useEffect } from "react"
import { createContextualCan } from "@casl/react"
import { defineAbilitiesFor, AppAbility } from "@/lib/casl"
import { UserRole } from "@workspace/common"

export type Role = UserRole

interface User {
  email: string
  role: Role
  fullName: string
}

interface AuthContextType {
  user: User | null
  ability: AppAbility
  login: (email: string, role: Role, fullName: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AbilityContext = createContext<AppAbility>(undefined!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize with guest abilities
  const [ability, setAbility] = useState<AppAbility>(defineAbilitiesFor(UserRole.PUBLIC))

  useEffect(() => {
    const savedUser = localStorage.getItem("vendorTrack_user")
    const token = Cookies.get("accessToken")

    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setAbility(defineAbilitiesFor(parsedUser.role))
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, role: Role, fullName: string) => {
    const userData = { email, role, fullName }
    setUser(userData)
    const newAbility = defineAbilitiesFor(role)
    setAbility(newAbility)
    localStorage.setItem("vendorTrack_user", JSON.stringify(userData))
    Cookies.set("accessToken", "mock-token", { expires: 1 })
    router.push("/portal")
  }

  const logout = () => {
    setUser(null)
    setAbility(defineAbilitiesFor(UserRole.PUBLIC))
    localStorage.removeItem("vendorTrack_user")
    Cookies.remove("accessToken")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, ability, login, logout, isLoading }}>
      <AbilityContext.Provider value={ability}>
        {children}
      </AbilityContext.Provider>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const Can = createContextualCan(AbilityContext.Consumer);
