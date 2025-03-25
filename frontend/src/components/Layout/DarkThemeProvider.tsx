import React, { createContext, useContext, useState, ReactNode } from 'react';
import darkTheme from '../../styles/darkTheme';

// Theme context type
interface ThemeContextType {
  theme: typeof darkTheme;
  toggleTheme: () => void;
}

// Create the theme context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  toggleTheme: () => {},
});

// Hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface DarkThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const DarkThemeProvider: React.FC<DarkThemeProviderProps> = ({ children }) => {
  // For future implementation of light theme toggle
  const [theme, setTheme] = useState(darkTheme);

  // Toggle between dark and light theme (for future implementation)
  const toggleTheme = () => {
    // This is a placeholder for future light theme implementation
    setTheme(darkTheme);
  };

  // Apply CSS variables for the theme
  React.useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS variables based on the theme
    root.style.setProperty('--primary-color', theme.colors.primary.main);
    root.style.setProperty('--primary-dark', theme.colors.primary.dark);
    root.style.setProperty('--primary-light', theme.colors.primary.light);
    root.style.setProperty('--secondary-color', theme.colors.secondary.main);
    root.style.setProperty('--secondary-dark', theme.colors.secondary.dark);
    root.style.setProperty('--secondary-light', theme.colors.secondary.light);
    root.style.setProperty('--background-dark', theme.colors.background.default);
    root.style.setProperty('--background-medium', theme.colors.background.paper);
    root.style.setProperty('--background-light', theme.colors.background.elevated);
    root.style.setProperty('--text-light', theme.colors.text.primary);
    root.style.setProperty('--text-medium', theme.colors.text.secondary);
    root.style.setProperty('--text-dark', theme.colors.text.disabled);
    root.style.setProperty('--danger', theme.colors.error.main);
    root.style.setProperty('--warning', theme.colors.warning.main);
    root.style.setProperty('--info', theme.colors.info.main);
    
    // Set the body background and text color
    document.body.style.backgroundColor = theme.colors.background.default;
    document.body.style.color = theme.colors.text.primary;
    document.body.style.fontFamily = theme.typography.fontFamily;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default DarkThemeProvider;
