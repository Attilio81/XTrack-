
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
  CircularProgress,
  Divider,
  IconButton,
  Card,
  CardContent,
  Fade,
  Slide,
  Backdrop
} from '@mui/material'
import { 
  FitnessCenter as FitnessCenterIcon,
  Person as PersonIcon, 
  Lock as LockIcon, 
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  TrendingUp,
  Timeline,
  EmojiEvents,
  Close as CloseIcon
} from '@mui/icons-material'
import { colors, commonStyles } from '../theme'
import { logger } from '../utils/logger'

const AuthForm = () => {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])
  
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
      logger.error('Errore durante l\'autenticazione:', err)
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
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, 
          ${colors.background.default} 0%, 
          rgba(255, 215, 0, 0.02) 25%, 
          ${colors.background.default} 50%, 
          rgba(255, 215, 0, 0.03) 75%, 
          ${colors.background.default} 100%)`,
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)`,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-15%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)`,
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', py: 4 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 6, 
          width: '100%',
          alignItems: 'center'
        }}>
          
          {/* Left Side - Welcome Section */}
          <Fade in={mounted} timeout={1000}>
            <Box sx={{ 
              display: { xs: 'none', md: 'block' },
              textAlign: 'center',
              p: 4
            }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 3,
                  background: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.primary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Benvenuto in XTrack
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: colors.text.secondary,
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Il tuo compagno definitivo per il CrossFit
              </Typography>

              {/* Feature Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
                {[
                  { icon: <TrendingUp />, title: 'Traccia i Progressi', desc: 'Monitora ogni PR e miglioramento' },
                  { icon: <Timeline />, title: 'Analizza le Performance', desc: 'Statistiche avanzate e insights' },
                  { icon: <EmojiEvents />, title: 'Raggiungi i Tuoi Obiettivi', desc: 'Benchmark e sfide personalizzate' }
                ].map((feature, index) => (
                  <Slide 
                    key={index}
                    direction="right" 
                    in={mounted} 
                    timeout={1000 + (index * 200)}
                  >
                    <Card sx={{ 
                      ...commonStyles.glassCard,
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                    }}>
                      <Avatar sx={{ 
                        ...commonStyles.iconContainer,
                        width: 48,
                        height: 48,
                        bgcolor: `rgba(255, 215, 0, 0.1)`,
                      }}>
                        {feature.icon}
                      </Avatar>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.desc}
                        </Typography>
                      </Box>
                    </Card>
                  </Slide>
                ))}
              </Box>
            </Box>
          </Fade>

          {/* Right Side - Auth Form */}
          <Slide direction="left" in={mounted} timeout={800}>
            <Paper
              elevation={0}
              sx={{
                ...commonStyles.glassCard,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: 3,
                p: { xs: 3, sm: 4 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.primary.light})`,
                },
              }}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    ...commonStyles.iconContainer,
                    width: 80,
                    height: 80,
                    margin: '0 auto',
                    mb: 2,
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
                    boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  <FitnessCenterIcon sx={{ color: '#000', fontSize: 40 }} />
                </Avatar>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    color: colors.text.primary
                  }}
                >
                  {isLogin ? 'Bentornato!' : 'Inizia oggi!'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {isLogin 
                    ? 'Accedi per continuare il tuo journey nel CrossFit' 
                    : 'Crea il tuo account e inizia a tracciare i progressi'
                  }
                </Typography>
              </Box>

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ ...commonStyles.form }}>
                {!isLogin && (
                  <TextField
                    fullWidth
                    label="Nome completo"
                    variant="outlined"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required={!isLogin}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: colors.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colors.primary.main,
                          borderWidth: 2,
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
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: colors.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colors.primary.main,
                        borderWidth: 2,
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
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: colors.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colors.primary.main,
                        borderWidth: 2,
                      },
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: colors.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: colors.text.secondary }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: 2,
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      backgroundColor: 'rgba(244, 67, 54, 0.05)',
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    ...commonStyles.actionButton,
                    py: 1.8,
                    mt: 2,
                    fontSize: '1.1rem',
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
                    color: '#000',
                    fontWeight: 700,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 215, 0, 0.3)',
                      color: 'rgba(0, 0, 0, 0.5)',
                    }
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} sx={{ color: '#000' }} />
                      Caricamento...
                    </Box>
                  ) : (
                    isLogin ? 'Accedi' : 'Crea Account'
                  )}
                </Button>

                <Divider sx={{ my: 3, color: colors.text.secondary }}>
                  oppure
                </Divider>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowDiagnostics(true)}
                  disabled={testingConnection}
                  sx={{ 
                    borderColor: colors.primary.main,
                    color: colors.text.primary,
                    borderRadius: 2,
                    py: 1.2,
                    '&:hover': {
                      borderColor: colors.primary.main,
                      backgroundColor: 'rgba(255, 215, 0, 0.05)',
                    }
                  }}
                >
                  🔧 Verifica Connessione
                </Button>
              </Box>

              {/* Switch Auth Mode */}
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {isLogin ? 'Non hai ancora un account?' : 'Hai già un account?'}
                </Typography>
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => setIsLogin(!isLogin)}
                  sx={{ 
                    color: colors.primary.main,
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { 
                      textDecoration: 'underline',
                      color: colors.primary.dark
                    }
                  }}
                >
                  {isLogin ? 'Registrati gratis' : 'Accedi'}
                </Link>
              </Box>
            </Paper>
          </Slide>
        </Box>
      </Container>

      {/* Diagnostics Modal */}
      <Backdrop
        open={showDiagnostics}
        onClick={() => setShowDiagnostics(false)}
        sx={{ zIndex: 1300 }}
      >
        <Card 
          sx={{ 
            ...commonStyles.modal,
            maxWidth: 500,
            width: '90%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                🔧 Diagnostica Connessione
              </Typography>
              <IconButton onClick={() => setShowDiagnostics(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={checkConnection}
              disabled={testingConnection}
              sx={{ 
                mb: 3,
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
                color: '#000',
              }}
            >
              {testingConnection ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: '#000' }} />
                  Verifica in corso...
                </>
              ) : 'Avvia Test'}
            </Button>
            
            {connectionStatus && (
              <Box sx={{ 
                p: 3, 
                bgcolor: 'rgba(0, 0, 0, 0.02)', 
                borderRadius: 2,
                border: '1px solid rgba(255, 215, 0, 0.2)' 
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  📊 Risultati:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1">
                    🌐 Connessione: {connectionStatus.connection ? '✅ OK' : '❌ Fallita'}
                  </Typography>
                  <Typography variant="body1">
                    🔐 Autenticazione: {connectionStatus.authEnabled ? '✅ OK' : '❌ Problemi'}
                  </Typography>
                  {connectionStatus.error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Errore:</strong> {connectionStatus.error}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Backdrop>
    </Box>
  )
}

export default AuthForm