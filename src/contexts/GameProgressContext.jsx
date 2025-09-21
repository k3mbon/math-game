import React, { createContext, useState, useContext } from 'react';

export const GameProgressContext = createContext();

export const GameProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({
    iteration: { level: 1, completed: 0 },
    numeration: { level: 1, completed: 0 }
  });

  const updateProgress = (gameType, level, completed) => {
    setProgress(prev => ({
      ...prev,
      [gameType]: { level, completed }
    }));
  };

  return (
    <GameProgressContext.Provider value={{ progress, updateProgress }}>
      {children}
    </GameProgressContext.Provider>
  );
};

export const useGameProgress = () => {
  const context = useContext(GameProgressContext);
  if (!context) {
    throw new Error('useGameProgress must be used within a GameProgressProvider');
  }
  return context;
};