import React, { createContext, useContext, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Apply green nature theme styles
    document.documentElement.style.setProperty('--bg-main', '#16A34A');
    document.documentElement.style.setProperty('--text-light', '#FFFFFF');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'green-nature' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);