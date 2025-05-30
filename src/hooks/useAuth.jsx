
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed:', event, session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }
  


  const signUp = async (email, password, name) => {
    try {
      // Registrazione utente con metadati
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
            full_name: name || '',
          },
          emailRedirectTo: window.location.origin,
        }
      })
      
      if (error) {
        logger.error('Errore durante la registrazione:', error)
        return { data, error }
      }
      
      return { data, error: null }
    } catch (e) {
      logger.error('Errore non gestito durante la registrazione:', e)
      return { data: null, error: e }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      logger.info('Avviando processo di logout...')
      
      // Clear all local storage data first
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sb-')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      localStorage.removeItem('supabase.auth.token')
      
      // Force user state reset immediately
      setUser(null)
      
      // Try to sign out from Supabase, but don't fail if session is missing
      try {
        const { error } = await supabase.auth.signOut({ scope: 'local' })
        if (error && error.message !== 'Auth session missing!') {
          logger.warn('Warning durante il logout Supabase:', error.message)
        }
      } catch (authError) {
        // Ignore auth session errors - user is already logged out locally
        if (!authError.message?.includes('Auth session missing')) {
          logger.warn('Warning durante il logout Supabase:', authError.message)
        }
      }
      
      logger.info('Logout completato con successo')
      return { error: null }
      
    } catch (e) {
      logger.error('Errore non gestito durante il logout:', e)
      // Force logout even if there's an error
      setUser(null)
      
      // Clear storage as fallback
      try {
        localStorage.clear()
      } catch (storageError) {
        logger.warn('Impossibile pulire localStorage:', storageError)
      }
      
      return { error: null } // Always return success for user experience
    } finally {
      setLoading(false)
      
      // Optional: force page reload as ultimate fallback
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
      }, 100)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
