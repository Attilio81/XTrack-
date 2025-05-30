import { createTheme } from '@mui/material/styles';

// Definizione dei colori principali dell'app
const colors = {
  primary: {
    main: '#FFD700', // Giallo oro per icone e elementi principali
    light: '#FFF176',
    dark: '#FBC02D',
    contrastText: '#000000',
  },
  secondary: {
    main: '#000000', // Nero per scritte principali
    light: '#333333',
    dark: '#000000',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FFFFFF', // Sfondo bianco
    paper: '#F5F5F5', // Bianco leggermente più scuro per cards
    card: '#FFFFFF', // Card bianche
    cardHover: '#F9F9F9', // Hover leggermente più scuro
  },
  text: {
    primary: '#000000', // Scritte nere
    secondary: '#333333', // Scritte grigio scuro
    disabled: '#999999', // Scritte disabilitate grigie
  },
  action: {
    active: '#FFD700', // Giallo oro
    hover: 'rgba(255, 215, 0, 0.08)',
    selected: 'rgba(255, 215, 0, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },    success: {
      main: '#4CAF50', // Green for success
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FF9800', // Orange for warning  
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#F44336', // Red for error
      light: '#E57373',
      dark: '#D32F2F',
    },
    info: {
      main: '#2196F3', // Blue for info
    light: '#FFFFFF',
    dark: '#CCCCCC',
  },
};

// Creazione del tema Material UI
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text,
    action: colors.action,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.1)',
          color: colors.text.primary,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px -1px rgba(0,0,0,0.2)',
          },
        },
        containedPrimary: {
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary.main,
          color: colors.secondary.contrastText,
          '&:hover': {
            backgroundColor: colors.secondary.light,
          },
        },
        outlined: {
          borderColor: colors.primary.main,
          color: colors.primary.main,
        },
        text: {
          color: colors.text.primary,
        },
      },
      variants: [
        {
          props: { variant: 'glass' },
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            color: colors.text.primary,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.card,
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: colors.background.cardHover,
            borderColor: 'rgba(255, 215, 0, 0.5)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
            },
          },
          '& .MuiInputLabel-root': {
            color: colors.text.secondary,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: colors.primary.main,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          color: colors.text.primary,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: colors.text.secondary,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          color: colors.primary.main, // Icone gialle
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: colors.primary.main, // Icone SVG gialle
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            color: colors.text.primary,
            borderLeft: `3px solid ${colors.primary.main}`,
            '&:hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.15)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

export default theme;

// Esportiamo anche i colori per usarli direttamente
export { colors };

// Componenti comuni riutilizzabili
export const commonStyles = {
  // Stile per le card con sfondo bianco
  glassCard: {
    backgroundColor: colors.background.card,
    borderRadius: theme.shape.borderRadius,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: colors.background.cardHover,
      borderColor: 'rgba(255, 215, 0, 0.5)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transform: 'translateY(-2px)',
    },
  },

  // Stile per card con gradiente
  gradientCard: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
    borderRadius: theme.shape.borderRadius,
    border: 'none',
    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
    color: '#000',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      boxShadow: '0 8px 30px rgba(255, 215, 0, 0.4)',
      transform: 'translateY(-4px)',
    },
  },

  // Stile per card statistiche con animazioni
  statCard: {
    backgroundColor: colors.background.card,
    borderRadius: theme.shape.borderRadius,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: colors.background.cardHover,
      borderColor: 'rgba(255, 215, 0, 0.5)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #FFD700, #FFC107)',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover::before': {
      opacity: 1,
    },
  },

  // Stile per progress circles
  progressCircle: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stile per icon containers con hover effect
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.2)',
      transform: 'scale(1.1)',
    },
  },
  
  // Stile per i layout di pagina
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
  },
  
  // Stile per le intestazioni delle pagine
  pageHeader: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2, 0),
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  },
  
  // Stile per le griglie di card
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing(3),
  },
  
  // Stile per le metriche principali
  metricCard: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.02) 100%)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
      border: '1px solid rgba(255, 215, 0, 0.4)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)',
    },
  },

  // Stile per charts container
  chartContainer: {
    backgroundColor: colors.background.card,
    borderRadius: theme.shape.borderRadius,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(3),
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      borderColor: 'rgba(255, 215, 0, 0.3)',
    },
  },

  // Progress visualization card
  progressCard: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 215, 0, 0.1)',
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(3),
    textAlign: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 30px rgba(255, 215, 0, 0.15)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
    },
  },

  // Enhanced metric visualization
  metricVisualization: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.03) 0%, transparent 100%)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.02) 100%)',
    },
  },
  
  // Stile per i form
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  
  // Stile per i pulsanti d'azione principali
  actionButton: {
    borderRadius: theme.shape.borderRadius,
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
      transform: 'translateY(-1px)',
    },
  },

  // Stile per floating action buttons
  fab: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
    color: '#000',
    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
    '&:hover': {
      background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
      boxShadow: '0 6px 25px rgba(255, 215, 0, 0.5)',
      transform: 'scale(1.05)',
    },
  },
  
  // Stile per i modali
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: colors.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: theme.spacing(4),
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid rgba(255, 215, 0, 0.2)',
  },

  // Stile per le animazioni di loading
  pulse: {
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': {
      '0%': {
        opacity: 1,
      },
      '50%': {
        opacity: 0.5,
      },
      '100%': {
        opacity: 1,
      },
    },
  },

  // Stile per badge di stato
  statusBadge: {
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.spacing(3),
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    color: '#B8860B',
    border: '1px solid rgba(255, 215, 0, 0.3)',
  },
};
