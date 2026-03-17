"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { createContext, useContext, useState, useEffect } from "react"
import { createContextualCan } from "@casl/react"
import { defineAbilitiesFor, AppAbility } from "@/lib/casl"
import { UserRole } from "@workspace/common"
import { authService, LoginRequest } from "@/lib/services/auth.service"
import { TokenStorage } from "@/lib/api-client"

export type Role = UserRole

interface User {
  id: string
  email: string
  role: Role
  fullName: string
}

interface AuthContextType {
  user: User | null
  ability: AppAbility
  login: (credentials: LoginRequest) => Promise<void>
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
    const token = TokenStorage.getAccessToken()

    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setAbility(defineAbilitiesFor(parsedUser.role))
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      // Call backend login API
      const response = await authService.login(credentials)
      
      // Store tokens in cookies
      TokenStorage.setTokens(response.accessToken, response.refreshToken)
      
      // Store user data
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role as Role,
        fullName: response.user.fullName,
      }
      
      setUser(userData)
      const newAbility = defineAbilitiesFor(userData.role)
      setAbility(newAbility)
      localStorage.setItem("vendorTrack_user", JSON.stringify(userData))
      
      router.push("/portal")
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setAbility(defineAbilitiesFor(UserRole.PUBLIC))
    localStorage.removeItem("vendorTrack_user")
    TokenStorage.clearTokens()
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
