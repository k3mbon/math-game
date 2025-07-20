import { createContext, useContext, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Apply vibrant theme styles
    document.documentElement.style.setProperty('--bg-main', '#6C63FF');
    document.documentElement.style.setProperty('--text-light', '#FFFFFF');
    
    // Apply background gradient effect
    document.body.style.backgroundImage = `
      radial-gradient(circle at 20% 30%, rgba(94, 114, 235, 0.8) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(123, 92, 250, 0.8) 0%, transparent 40%)
    `;
    document.body.style.backgroundAttachment = 'fixed';
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'vibrant' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);