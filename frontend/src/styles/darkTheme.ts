// Dark theme configuration for Quantum Email Client
export const darkTheme = {
  colors: {
    primary: {
      main: '#6366f1',
      dark: '#4f46e5',
      light: '#818cf8',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#10b981',
      dark: '#059669',
      light: '#34d399',
      contrastText: '#ffffff'
    },
    background: {
      default: '#111827',
      paper: '#1f2937',
      elevated: '#374151'
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#d1d5db',
      disabled: '#9ca3af'
    },
    error: {
      main: '#ef4444',
      dark: '#b91c1c',
      light: '#f87171',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
      contrastText: '#ffffff'
    },
    info: {
      main: '#3b82f6',
      dark: '#2563eb',
      light: '#60a5fa',
      contrastText: '#ffffff'
    },
    success: {
      main: '#10b981',
      dark: '#059669',
      light: '#34d399',
      contrastText: '#ffffff'
    },
    divider: 'rgba(255, 255, 255, 0.12)'
  },
  shadows: {
    small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 8
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195
    }
  }
};

export default darkTheme;
