"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Fetch profile display_name from profiles table
  const fetchProfile = useCallback(async (supabaseUser: User): Promise<AuthUser> => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", supabaseUser.id)
      .single()
    return mapUser(supabaseUser, data?.display_name)
  }, [supabase])

  useEffect(() => {
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
  }, [supabase, fetchProfile])

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    if (!email.endsWith("@umich.edu")) {
      return { error: "Please use your @umich.edu email address" }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }, [supabase])

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    if (!email.endsWith("@umich.edu")) {
      return { error: "Please use your @umich.edu email address" }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) return { error: error.message }
    return {}
  }, [supabase])

  const signOutFn = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut: signOutFn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
