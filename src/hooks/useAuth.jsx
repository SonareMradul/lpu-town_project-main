// src/hooks/useAuth.js
// ─────────────────────────────────────────────
// Drop-in auth hook. Wrap your app in <AuthProvider> then
// call useAuth() anywhere to get { user, login, register, logout }.

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()
    setProfile(data)
  }

  // ── Register ────────────────────────────────
  async function register({ fullName, regNumber, email, password }) {
    // Client-side domain check — DB trigger is the hard wall
    if (!email.endsWith("@lpu.in")) {
      return { error: { message: "Only @lpu.in email addresses are allowed." } }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:  fullName,
          username:   email.split("@")[0].toLowerCase(),
          reg_number: regNumber,
        },
      },
    })

    return { data, error }
  }

  // ── Login ────────────────────────────────────
  async function login({ email, password }) {
    if (!email.endsWith("@lpu.in")) {
      return { error: { message: "Only @lpu.in email addresses are allowed." } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  // ── Logout ───────────────────────────────────
  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}