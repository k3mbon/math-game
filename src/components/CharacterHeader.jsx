// components/CharacterHeader.jsx
import React from 'react';
import { useCharacter } from '../contexts/CharacterContext';
import { useGameProgress } from '../contexts/GameProgressContext';
import './CharacterHeader.css';

const CharacterHeader = ({ gameType }) => {
  const { selectedCharacter } = useCharacter();
  const { progress } = useGameProgress();

  if (!selectedCharacter) return null;

  const gameProgress = progress[gameType] || { level: 1, completed: 0 };

  return (
    <div className="character-header">
      <div className="character-display">
        <span className="character-emoji">{selectedCharacter.emoji}</span>
        <span className="character-name">{selectedCharacter.name}</span>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${gameProgress.completed}%` }}
          ></div>
          <span className="progress-text">
            Level {gameProgress.level} - {gameProgress.completed}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default CharacterHeader;