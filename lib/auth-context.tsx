"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User } from "@supabase/supabase-js"

export type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
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
  const clientRef = useRef<SupabaseClient | null>(null)

  const getSupabase = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = createClient()
    }
    return clientRef.current
  }, [])

  const fetchDisplayName = useCallback(async (supabaseUser: User): Promise<string | null> => {
    try {
      const supabase = getSupabase()
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", supabaseUser.id)
        .single()
      return data?.display_name || null
    } catch {
      return null
    }
  }, [getSupabase])

  useEffect(() => {
    const supabase = getSupabase()

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
  }, [getSupabase, fetchDisplayName])

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      if (data.user) {
        const displayName = await fetchDisplayName(data.user)
        setUser(toAuthUser(data.user, displayName))
      }
      return {}
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Sign in failed" }
    }
  }, [getSupabase, fetchDisplayName])

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) return { error: error.message }
      // If email confirmation is enabled, user won't have a session yet
      if (data.user && data.session) {
        const displayName = await fetchDisplayName(data.user)
        setUser(toAuthUser(data.user, displayName))
      }
      return {}
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Sign up failed" }
    }
  }, [getSupabase, fetchDisplayName])

  const signOutFn = useCallback(async () => {
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
    } catch {}
    setUser(null)
  }, [getSupabase])

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut: signOutFn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
