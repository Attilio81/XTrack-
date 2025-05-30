
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase, testSupabaseConnection } from '../lib/supabase'
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Avatar, 
  Alert, 
  InputAdornment,
  Link,
  CircularProgress
} from '@mui/material'
import { 
  FitnessCenter as FitnessCenterIcon,
  Person as PersonIcon, 
  Lock as LockIcon, 
  Email as EmailIcon 
} from '@mui/icons-material'
import { colors, commonStyles } from '../theme'

const AuthForm = () => {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  
  // Funzione per testare la connessione a Supabase
  const checkConnection = async () => {
    setTestingConnection(true)
    setError('')
    try {
      const result = await testSupabaseConnection()
      setConnectionStatus(result)
      if (result.error) {
        setError(`Problema di connessione: ${result.error}`)
      }
    } catch (e) {
      setError(`Errore durante il test: ${e.message}`)
      setConnectionStatus({ error: e.message })
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Login
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
      } else {
        // Registrazione
        const response = await signUp(formData.email, formData.password, formData.name)
        
        if (response.error) {
          throw response.error
        }
      }
    } catch (err) {
      console.error('Errore durante l\'autenticazione:', err)
      setError(err.message || 'Si è verificato un errore durante l\'operazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background.default,
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            ...commonStyles.glassCard,
            padding: 4,
            backgroundColor: colors.background.card,
            border: `1px solid ${colors.primary.main}`,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                backgroundColor: 'white',
                width: 70,
                height: 70,
                margin: '0 auto',
                mb: 2,
              }}
            >
              <FitnessCenterIcon sx={{ color: colors.primary.main, fontSize: 35 }} />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              XTrack
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              CrossFit Progress Tracker
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ ...commonStyles.form }}>
            {!isLogin && (
              <TextField
                fullWidth
                label="Nome"
                variant="outlined"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required={!isLogin}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover fieldset': {
                      borderColor: colors.primary.main,
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: colors.primary.main }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: colors.primary.main,
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: colors.primary.main }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: colors.primary.main,
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: colors.primary.main }} />
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
                {error.includes('500') && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Possibili soluzioni:
                    <ul>
                      <li>Verifica che Email Auth sia abilitato nella console Supabase (Authentication {'->'} Providers)</li>
                      <li>Controlla la configurazione SMTP se stai usando email di conferma</li>
                      <li>Verifica che la password rispetti i requisiti minimi (min. 6 caratteri)</li>
                      <li>Prova con un indirizzo email diverso</li>
                    </ul>
                  </Typography>
                )}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 1,
                backgroundColor: 'white',
                color: colors.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
            </Button>
            
            {/* Pulsante di diagnostica per verificare la connessione a Supabase */}
            <Button
              variant="outlined"
              fullWidth
              onClick={checkConnection}
              disabled={testingConnection}
              sx={{ 
                mt: 2,
                borderColor: colors.primary.main,
                color: colors.text.primary,
                '&:hover': {
                  borderColor: colors.primary.main,
                  backgroundColor: 'rgba(255, 215, 0, 0.05)',
                }
              }}
            >
              {testingConnection ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: colors.primary.main }} />
                  Verifica in corso...
                </>
              ) : 'Verifica Connessione'}
            </Button>
            
            {/* Mostra risultati del test di connessione */}
            {connectionStatus && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Risultati diagnostica:
                </Typography>
                <Typography variant="body2">
                  Connessione: {connectionStatus.connection ? '✅ OK' : '❌ Fallita'}
                </Typography>
                <Typography variant="body2">
                  Auth: {connectionStatus.authEnabled ? '✅ OK' : '❌ Problemi'}
                </Typography>
                {connectionStatus.error && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Errore: {connectionStatus.error}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => setIsLogin(!isLogin)}
              sx={{ 
                color: colors.text.secondary,
                '&:hover': { color: colors.primary.main }
              }}
              underline="hover"
            >
              {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default AuthForm