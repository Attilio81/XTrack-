
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funzione per testare la connessione a Supabase e verificare configurazioni
export const testSupabaseConnection = async () => {
  const results = {
    connection: false,
    authEnabled: false,
    error: null,
    details: {}
  }

  try {
    // Test 1: Verifica che l'URL e la chiave siano definiti
    if (!supabaseUrl || !supabaseAnonKey) {
      results.error = 'Mancano URL o chiave Supabase nelle variabili di ambiente'
      return results
    }
    
    results.details.config = {
      url: supabaseUrl ? 'Definito' : 'Mancante',
      anonKey: supabaseAnonKey ? 'Definito' : 'Mancante'
    }

    // Test 2: Verifica che la connessione a Supabase funzioni
    // Utilizziamo una chiamata più sicura che non richiede tabelle specifiche
    try {
      // Utilizziamo rpc per verificare se possiamo comunicare con Supabase
      const { error } = await supabase.auth.getSession()
      
      if (error) {
        results.error = `Errore di connessione: ${error.message}`
        results.details.connectionError = error
        return results
      }
      
      results.connection = true
    } catch (connError) {
      results.error = `Errore di connessione: ${connError.message}`
      results.details.connectionError = connError
      return results
    }
    
    // Test 3: Verifica che l'autenticazione sia configurata correttamente
    const authSettings = await supabase.auth.getSession()
    results.authEnabled = !authSettings.error
    results.details.authSettings = authSettings.error ? 
      { error: authSettings.error.message } : 
      { success: true }
    
    return results
  } catch (e) {
    results.error = `Errore non gestito: ${e.message}`
    results.details.exception = e
    return results
  }
}
