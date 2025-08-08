import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (updates: any) => Promise<any>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Session refresh function
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Session refresh failed:', error)
        setUser(null)
      } else {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      setUser(null)
    }
  }, [])

  // Load user on mount and set up session management
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout

    async function initializeAuth() {
      setLoading(true)
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Initial session error:', error)
          setUser(null)
        } else {
          setUser(session?.user || null)
        }

        // Set up periodic session refresh for long-running sessions
        if (session?.user) {
          sessionCheckInterval = setInterval(() => {
            refreshSession()
          }, 10 * 60 * 1000) // Check every 10 minutes
        }
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        // Clear interval on sign out
        if (event === 'SIGNED_OUT' && sessionCheckInterval) {
          clearInterval(sessionCheckInterval)
        }
        
        // Set up interval on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          sessionCheckInterval = setInterval(() => {
            refreshSession()
          }, 10 * 60 * 1000)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
      }
    }
  }, [refreshSession])

  // Auth methods with enhanced security
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      })
      
      if (result.error) {
        throw result.error
      }
      
      return result
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      const result = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`,
          data: metadata
        }
      })
      
      if (result.error) {
        throw result.error
      }
      
      return result
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const result = await supabase.auth.signOut()
      setUser(null) // Immediately clear user state
      return result
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }, [])

  async function updateProfile(updates: any) {
    // Verify current user identity
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !currentUser) {
      throw new Error('User authentication failed, please log in again')
    }

    // Update user profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Database update error:', error)
      throw error
    }

    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}