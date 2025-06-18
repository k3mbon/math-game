// components/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import './LandingPage.css';

const LandingPage = () => {
  const { characters, selectedCharacter, setSelectedCharacter } = useCharacter();

  

  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>Math Adventure 🚀</h1>
        <p className="subtitle">Learn coding through fun math challenges!</p>
      </div>
      
      <div className="game-options">
        <Link 
          to="/iteration" 
          className="game-card iteration-card"
          onClick={() => !selectedCharacter && alert("Please select a character first!")}
        >
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M4 19V5h2v14H4zm4 0V5h2v14H8zm4 0V5h2v14h-2zm4 0V5h2v14h-2z"/>
              <path d="M4 7h2v2H4zm4 3h2v2H8zm4-3h2v2h-2zm4 3h2v2h-2z" fill="#fff"/>
            </svg>
          </div>
          <h3>Loop Land</h3>
          <p>Master repeating patterns with loops</p>
          <div className="card-footer">
            {selectedCharacter ? "Start Playing →" : "Select Character First"}
          </div>
        </Link>

        <Link 
          to="/numeration" 
          className="game-card numeration-card"
          onClick={() => !selectedCharacter && alert("Please select a character first!")}
        >
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M9 7h2v4h2v2H9V7zm4 6h2v4h-2v-4zm-8 2h2v2H5v-2zm8-6h2v2h-2V9z"/>
              <path d="M3 5h18v2H3zm0 14h18v2H3z" fill="#fff"/>
            </svg>
          </div>
          <h3>Number World</h3>
          <p>Explore the magic of numbers</p>
          <div className="card-footer">
            {selectedCharacter ? "Start Playing →" : "Select Character First"}
          </div>
        </Link>
      </div>

      <div className="character-selection">
        <h3>Choose Your Coding Companion:</h3>
        <div className="character-options">
          {characters.map(character => (
            <div
              key={character.id}
              className={`character ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
              onClick={() => setSelectedCharacter(character)}
            >
              <span className="character-emoji">{character.emoji}</span>
              <span className="character-name">{character.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;