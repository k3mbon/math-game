import { createContext, useState, useContext } from 'react';

export const CharacterContext = createContext();

export const CharacterProvider = ({ children }) => {
  const characters = [
    { id: 1, emoji: '🐱', },
    { id: 2, emoji: '🦊', },
    { id: 3, emoji: '🐼', },
    { id: 4, emoji: '🐶', },
    { id: 5, emoji: '🐰', },
    { id: 6, emoji: '🦁', },
    { id: 7, emoji: '🐻', },
    { id: 8, emoji: '🐨', },
    { id: 9, emoji: '🦄', },
    { id: 10, emoji: '🐷', }
  ];
  
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  return (
    <CharacterContext.Provider value={{ characters, selectedCharacter, setSelectedCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};