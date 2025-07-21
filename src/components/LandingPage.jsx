// components/LandingPage.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import Navbar from './Navbar';
import './LandingPage.css';

const LandingPage = () => {
  const { characters, selectedCharacter, setSelectedCharacter } = useCharacter();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Dashboard | BrainQuests';
  }, []);

  return (
    <>
      {/* Removed duplicate Navbar as it's already rendered in App.jsx */}
      <div className="landing-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="gradient-text">BrainQuests</span>
            </h1>
            <p className="hero-subtitle">
              <span>Belajar Coding Dengan Matematika yang Menyenangkan!</span>
            </p>
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">🎮</span>
                <span>Interactive Games</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🧠</span>
                <span>Logic Building</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏆</span>
                <span>Achievement System</span>
              </div>
            </div>
          </div>
        </div>
      
      <div className="game-options">
        <Link 
          to={selectedCharacter ? "/iteration" : "#"}
          className="game-card game1-card"
          onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
        >
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 4l1.41 1.41L11.83 7H16c2.76 0 5 2.24 5 5s-2.24 5-5 5h-4v-2h4c1.65 0 3-1.35 3-3s-1.35-3-3-3h-4.17l1.58 1.59L12 12l-4-4 4-4z" fill="#fff"/>
              <circle cx="7" cy="17" r="1.5" fill="#fff"/>
              <circle cx="12" cy="17" r="1.5" fill="#fff"/>
              <circle cx="17" cy="17" r="1.5" fill="#fff"/>
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

        <Link 
          to={selectedCharacter ? "/kubo" : "#"}
          className="game-card kubo-card"
          onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
        >
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <rect x="6" y="8" width="12" height="8" rx="3" fill="#4CAF50"/>
              <circle cx="12" cy="6" r="3" fill="#66BB6A"/>
              <circle cx="10" cy="5" r="0.8" fill="#1B5E20"/>
              <circle cx="14" cy="5" r="0.8" fill="#1B5E20"/>
              <path d="M10 7 Q12 8 14 7" stroke="#1B5E20" strokeWidth="0.5" fill="none"/>
            </svg>
          </div>
          <h3>🤖 KUBO Math Adventure</h3>
          <p>Program KUBO robot dengan tile digital untuk menyelesaikan tantangan matematika!</p>
          <div className="card-footer">
            {selectedCharacter ? "Start KUBO Adventure →" : "Select Character First"}
          </div>
        </Link>

        {/* Open World Game Card */}
        <Link 
          to={selectedCharacter ? "/open-world" : "#"}
          className="game-card open-world-card"
          onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
        >
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" fill="#ff9800"/>
              <path d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 6h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="#fff"/>
            </svg>
          </div>
          <h3>Adventure World</h3>
          <p>Jelajahi Dunia Terbuka Dan Selesaikan Tantangan!</p>
          <div className="card-footer">
            {selectedCharacter ? "Start Adventure →" : "Select Character First"}
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
     </>
   );
};

export default LandingPage;
