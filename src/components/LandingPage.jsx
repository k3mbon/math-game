// components/LandingPage.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import './LandingPage.css';

const LandingPage = () => {
  const { characters, selectedCharacter, setSelectedCharacter } = useCharacter();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Dashboard | BrainQuests';
  }, []);

  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>BrainQuests 🚀</h1>
        <p className="subtitle">Belajar Coding Dengan Matematika!</p>
      </div>
      
      <div className="game-options">
        <Link 
          to={selectedCharacter ? "/iteration" : "#"}
          className="game-card iteration-card"
          onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
        >
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M4 19V5h2v14H4zm4 0V5h2v14H8zm4 0V5h2v14h-2zm4 0V5h2v14h-2z"/>
              <path d="M4 7h2v2H4zm4 3h2v2H8zm4-3h2v2h-2zm4 3h2v2h-2z" fill="#fff"/>
            </svg>
          </div>
          <h3>Loop Land</h3>
          <p>Kuasai Pola Yang Ada Dengan <i>Looping</i></p>
          <div className="card-footer">
            {selectedCharacter ? "Start Playing →" : "Select Character First"}
          </div>
        </Link>

        <Link 
          to={selectedCharacter ? "/numeration" : "#"}
          className="game-card numeration-card"
          onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
        >
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M9 7h2v4h2v2H9V7zm4 6h2v4h-2v-4zm-8 2h2v2H5v-2zm8-6h2v2h-2V9z"/>
              <path d="M3 5h18v2H3zm0 14h18v2H3z" fill="#fff"/>
            </svg>
          </div>
          <h3>Number World</h3>
          <p>Jelajahi Misteri Angka Dengan Logika Pemrograman</p>
          <div className="card-footer">
            {selectedCharacter ? "Start Playing →" : "Select Character First"}
          </div>
        </Link>

        {/* Game 1 Card using Game1 component */}
        <div className="game-card game1-card">
          {/* Import and use your Game1 component here */}
          {/* Example: <Game1 selectedCharacter={selectedCharacter} /> */}
          {/* If you want to link to a route: */}
          <Link
            to={selectedCharacter ? "/game1" : "#"}
            onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
            className="game1-link"
          >
            <div className="card-icon">
              {/* You can use a custom icon for Game 1 */}
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#4caf50"/>
                <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">G1</text>
              </svg>
            </div>
            <h3>Game 1</h3>
            <p>Mainkan Game 1 dengan karakter pilihanmu!</p>
            <div className="card-footer">
              {selectedCharacter ? "Start Playing →" : "Select Character First"}
            </div>
          </Link>
        </div>
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

      <div className="login-options">
        <h3>Login As:</h3>
        <div className="login-buttons">
          <button className="login-btn teacher" onClick={() => navigate('/login?role=teacher')}>
            👩‍🏫 Teacher
          </button>
          <button className="login-btn student" onClick={() => navigate('/login?role=student')}>
            👩‍🎓 Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
