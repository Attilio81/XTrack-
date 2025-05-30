
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

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
        console.log('Auth state changed:', event, session)
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
        console.error('Errore durante la registrazione:', error)
        return { data, error }
      }
      
      return { data, error: null }
    } catch (e) {
      console.error('Errore non gestito durante la registrazione:', e)
      return { data: null, error: e }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log('Iniziando logout...')
      
      // Clear local storage data
      localStorage.removeItem('supabase.auth.token')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Errore durante il logout:', error)
        return { error }
      }
      
      // Force user state reset
      setUser(null)
      console.log('Logout completato con successo')
      
      return { error: null }
    } catch (e) {
      console.error('Errore non gestito durante il logout:', e)
      // Force logout even if there's an error
      setUser(null)
      return { error: e }
    } finally {
      setLoading(false)
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
