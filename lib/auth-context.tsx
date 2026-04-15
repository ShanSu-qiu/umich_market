"use client"

import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

function toAuthUser(u: User): AuthUser {
  return {
    id: u.id,
    name: u.user_metadata?.name || u.email?.split("@")[0] || "User",
    email: u.email || "",
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Get initial session once
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ? toAuthUser(u) : null)
      setIsLoading(false)
    })

    // Listen for changes — no async calls inside callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? toAuthUser(session.user) : null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
