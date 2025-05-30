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
  // Glass effect for cards
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 215, 0, 0.3)',
    },
  },

  // Action button style
  actionButton: {
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  },

  // Icon container
  iconContainer: {
    backgroundColor: colors.primary.main,
    color: '#000',
    width: 56,
    height: 56,
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
  },

  // Form styling
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },

  // Modal styling
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 2,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    p: 4,
    maxHeight: '90vh',
    overflow: 'auto',
  },

  // Status badge
  statusBadge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    color: '#B8860B',
    border: '1px solid rgba(255, 215, 0, 0.3)',
  },
};
