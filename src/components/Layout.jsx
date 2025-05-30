
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
  Tooltip
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
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'benchmarks', name: 'Benchmarks', icon: TargetIcon },
    { id: 'strength', name: 'Strength', icon: FitnessCenterIcon },
    { id: 'body', name: 'Body Metrics', icon: PersonIcon },
    { id: 'stats', name: 'Statistics', icon: BarChartIcon },
  ]

  const handleSignOut = async () => {
    await signOut()
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
          
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleSignOut}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

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
                    fontWeight: activeTab === item.id ? 600 : 400,
                    color: activeTab === item.id ? colors.primary.main : 'rgba(255, 255, 255, 0.8)',
                  }}
                />
              </ListItemButton>
            ))}
          </List>
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