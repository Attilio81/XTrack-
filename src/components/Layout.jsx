
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material'
import {
  Home as HomeIcon,
  FitnessCenter as FitnessCenterIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  TrackChanges as TargetIcon
} from '@mui/icons-material'
import { colors, commonStyles } from '../theme'

const Layout = ({ children, activeTab, setActiveTab }) => {
  const { user, signOut, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [logoutSuccess, setLogoutSuccess] = useState(false)

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'benchmarks', name: 'Benchmarks', icon: TargetIcon },
    { id: 'strength', name: 'Strength', icon: FitnessCenterIcon },
    { id: 'body', name: 'Body Metrics', icon: PersonIcon },
    { id: 'stats', name: 'Statistics', icon: BarChartIcon },
  ]

  const handleSignOut = async () => {
    try {
      setLogoutLoading(true)
      setLogoutError('')
      
      console.log('Avviando processo di logout...')
      
      const { error } = await signOut()
      
      if (error) {
        console.error('Errore durante il logout:', error)
        setLogoutError(`Errore durante il logout: ${error.message}`)
      } else {
        console.log('Logout completato con successo')
        setLogoutSuccess(true)
        // Force page reload as fallback
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (e) {
      console.error('Errore non gestito durante il logout:', e)
      setLogoutError('Errore durante il logout. Ricaricamento pagina...')
      // Force page reload as last resort
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } finally {
      setLogoutLoading(false)
    }
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const drawerWidth = 240

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar (Header) */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: colors.primary.main, 
                width: 36, 
                height: 36,
                mr: 1.5,
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              X
            </Avatar>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              XTrack
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {!isMobile && (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {user?.email}
            </Typography>
          )}
          
          <Tooltip title={logoutLoading ? "Logout in corso..." : "Logout"}>
            <IconButton 
              color="inherit" 
              onClick={handleSignOut}
              disabled={logoutLoading}
              sx={{
                position: 'relative',
                '&:disabled': {
                  color: 'rgba(255, 255, 255, 0.5)',
                }
              }}
            >
              {logoutLoading ? (
                <CircularProgress size={24} sx={{ color: 'inherit' }} />
              ) : (
                <LogoutIcon />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Snackbars for feedback */}
      <Snackbar
        open={!!logoutError}
        autoHideDuration={6000}
        onClose={() => setLogoutError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setLogoutError('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {logoutError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={logoutSuccess}
        autoHideDuration={3000}
        onClose={() => setLogoutSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setLogoutSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Logout completato con successo!
        </Alert>
      </Snackbar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Toolbar /> {/* Spacer for appbar */}
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <List>
            {navigation.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  if (isMobile) setSidebarOpen(false)
                }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(239, 68, 68, 0.16)',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: activeTab === item.id ? colors.primary.main : 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.name} 
                  primaryTypographyProps={{
                    component: 'span',
                    fontWeight: activeTab === item.id ? 600 : 400,
                    color: activeTab === item.id ? colors.primary.main : 'rgba(255, 255, 255, 0.8)',
                  }}
                />
              </ListItemButton>
            ))}
          </List>
          
          {/* User info and logout in sidebar (mobile) */}
          {isMobile && (
            <>
              <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  {user?.email}
                </Typography>
                <ListItemButton
                  onClick={handleSignOut}
                  disabled={logoutLoading}
                  sx={{
                    borderRadius: 1,
                    color: logoutLoading ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: logoutLoading ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {logoutLoading ? (
                      <CircularProgress size={20} sx={{ color: 'inherit' }} />
                    ) : (
                      <LogoutIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={logoutLoading ? "Logout..." : "Logout"}
                    primaryTypographyProps={{
                      component: 'span',
                      fontWeight: 400,
                      color: logoutLoading ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                    }}
                  />
                </ListItemButton>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 },
          backgroundColor: colors.background.default,
          maxWidth: '100%',
        }}
      >
        <Toolbar /> {/* Spacer for appbar */}
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout