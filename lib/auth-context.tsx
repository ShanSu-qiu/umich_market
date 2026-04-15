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

function toAuthUser(supabaseUser: User, displayName?: string | null): AuthUser {
  return {
    id: supabaseUser.id,
    name: displayName || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
    email: supabaseUser.email || "",
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchDisplayName = useCallback(async (supabaseUser: User): Promise<string | null> => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", supabaseUser.id)
        .single()
      return data?.display_name || null
    } catch {
      return null
    }
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        if (supabaseUser) {
          const displayName = await fetchDisplayName(supabaseUser)
          setUser(toAuthUser(supabaseUser, displayName))
        }
      } catch (err) {
        console.error("Auth init failed:", err)
      }
      setIsLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const displayName = await fetchDisplayName(session.user)
          setUser(toAuthUser(session.user, displayName))
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchDisplayName])

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
