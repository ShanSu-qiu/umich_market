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

function mapUser(supabaseUser: User, displayName?: string): AuthUser {
  return {
    id: supabaseUser.id,
    name: displayName || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
    email: supabaseUser.email || "",
  }
}

function getClient(): SupabaseClient {
  return createClient()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const clientRef = useRef<SupabaseClient | null>(null)

  // Lazily get the Supabase client (only on client side)
  const getSupabase = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = getClient()
    }
    return clientRef.current
  }, [])

  const fetchProfile = useCallback(async (supabaseUser: User): Promise<AuthUser> => {
    const supabase = getSupabase()
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", supabaseUser.id)
      .single()
    return mapUser(supabaseUser, data?.display_name)
  }, [getSupabase])

  useEffect(() => {
    const supabase = getSupabase()

    // Initial session check
    const init = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser) {
        const authUser = await fetchProfile(supabaseUser)
        setUser(authUser)
      }
      setIsLoading(false)
    }
    init()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const authUser = await fetchProfile(session.user)
          setUser(authUser)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [getSupabase, fetchProfile])

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }, [getSupabase])

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) return { error: error.message }
    return {}
  }, [getSupabase])

  const signOutFn = useCallback(async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
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
