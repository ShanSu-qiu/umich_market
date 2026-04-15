"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
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

function toAuthUser(supabaseUser: User): AuthUser {
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
    email: supabaseUser.email || "",
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Initial check — get current user
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        setUser(toAuthUser(supabaseUser))
      }
      setIsLoading(false)
    })

    // Listen for auth changes — keep it synchronous and lightweight
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(toAuthUser(session.user))
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOutFn = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut: signOutFn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
