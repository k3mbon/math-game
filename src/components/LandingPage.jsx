// components/LandingPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import Navbar from './Navbar';
import './LandingPage.css';

const LandingPage = () => {
  const { characters, selectedCharacter, setSelectedCharacter } = useCharacter();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    document.title = 'Dashboard | BrainQuests';
    setIsLoaded(true);
    
    // Add class to body to prevent index.css background conflicts
    document.body.classList.add('landing-page-body');
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('landing-page-body');
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Removed duplicate Navbar as it's already rendered in App.jsx */}
      <div className="landing-container">
        {/* Interactive Background Particles */}
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                '--delay': `${i * 0.5}s`,
                '--duration': `${8 + (i % 4)}s`,
                '--x': `${Math.random() * 100}%`,
                '--y': `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        {/* Mouse Follower */}
        <div 
          className="mouse-follower"
          style={{
            left: mousePosition.x,
            top: mousePosition.y
          }}
        />

        <div className="hero-section" ref={heroRef}>
          <div className={`hero-content ${isLoaded ? 'loaded' : ''}`}>
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span>New Interactive Experience</span>
            </div>
            
            <h1 className="hero-title">
              Welcome to <span className="gradient-text">BrainQuests</span>
            </h1>
            
            <p className="hero-subtitle">
              <span>Belajar Coding Dengan Matematika yang Menyenangkan!</span>
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Students</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Levels</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4</div>
                <div className="stat-label">Game Modes</div>
              </div>
            </div>
            
            <div className="hero-features">
              <div className="feature-item" data-feature="games">
                <div className="feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <span className="feature-title">Interactive Games</span>
                  <span className="feature-desc">Engaging gameplay mechanics</span>
                </div>
              </div>
              
              <div className="feature-item" data-feature="logic">
                <div className="feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <span className="feature-title">Logic Building</span>
                  <span className="feature-desc">Develop critical thinking</span>
                </div>
              </div>
              
              <div className="feature-item" data-feature="achievements">
                <div className="feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="feature-content">
                  <span className="feature-title">Achievement System</span>
                  <span className="feature-desc">Track your progress</span>
                </div>
              </div>
            </div>
            
            <div className="hero-cta">
              <button className="cta-primary" onClick={() => document.querySelector('.game-options').scrollIntoView({ behavior: 'smooth' })}>
                <span>Start Learning</span>
                <svg viewBox="0 0 24 24" className="cta-icon">
                  <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
              </button>
              
              <button className="cta-secondary" onClick={() => document.querySelector('.character-selection').scrollIntoView({ behavior: 'smooth' })}>
                <span>Choose Character</span>
                <svg viewBox="0 0 24 24" className="cta-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      
        <div className="section-header">
          <h2 className="section-title">Choose Your Adventure</h2>
          <p className="section-subtitle">Select a game mode to start your coding journey</p>
        </div>

        <div className="game-options">
          <div className="game-card-wrapper">
            <Link 
              to={selectedCharacter ? "/iteration" : "#"}
              className="game-card game1-card"
              onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
            >
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 4l1.41 1.41L11.83 7H16c2.76 0 5 2.24 5 5s-2.24 5-5 5h-4v-2h4c1.65 0 3-1.35 3-3s-1.35-3-3-3h-4.17l1.58 1.59L12 12l-4-4 4-4z" fill="#fff"/>
                      <circle cx="7" cy="17" r="1.5" fill="#fff"/>
                      <circle cx="12" cy="17" r="1.5" fill="#fff"/>
                      <circle cx="17" cy="17" r="1.5" fill="#fff"/>
                    </svg>
                  </div>
                  <div className="card-badge">Popular</div>
                </div>
                <div className="card-body">
                  <h3>Loop Land</h3>
                  <p>Kuasai Pola Yang Ada Dengan <i>Looping</i></p>
                  <div className="card-stats">
                    <span className="stat">🎯 15 Levels</span>
                    <span className="stat">⭐ Beginner</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="footer-text">{selectedCharacter ? "Start Playing" : "Select Character First"}</span>
                  <svg className="footer-arrow" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          <div className="game-card-wrapper">
            <Link 
              to={selectedCharacter ? "/numeration" : "#"}
              className="game-card numeration-card"
              onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
            >
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M9 7h2v4h2v2H9V7zm4 6h2v4h-2v-4zm-8 2h2v2H5v-2zm8-6h2v2h-2V9z"/>
                      <path d="M3 5h18v2H3zm0 14h18v2H3z" fill="#fff"/>
                    </svg>
                  </div>
                  <div className="card-badge">New</div>
                </div>
                <div className="card-body">
                  <h3>Number World</h3>
                  <p>Jelajahi Misteri Angka Dengan Logika Pemrograman</p>
                  <div className="card-stats">
                    <span className="stat">🔢 20 Levels</span>
                    <span className="stat">⭐ Intermediate</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="footer-text">{selectedCharacter ? "Start Playing" : "Select Character First"}</span>
                  <svg className="footer-arrow" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          <div className="game-card-wrapper">
            <Link 
              to={selectedCharacter ? "/kubo" : "#"}
              className="game-card kubo-card"
              onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
            >
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24">
                      <rect x="6" y="8" width="12" height="8" rx="3" fill="#4CAF50"/>
                      <circle cx="12" cy="6" r="3" fill="#66BB6A"/>
                      <circle cx="10" cy="5" r="0.8" fill="#1B5E20"/>
                      <circle cx="14" cy="5" r="0.8" fill="#1B5E20"/>
                      <path d="M10 7 Q12 8 14 7" stroke="#1B5E20" strokeWidth="0.5" fill="none"/>
                    </svg>
                  </div>
                  <div className="card-badge">Featured</div>
                </div>
                <div className="card-body">
                  <h3>🤖 KUBO Math Adventure</h3>
                  <p>Program KUBO robot dengan tile digital untuk menyelesaikan tantangan matematika!</p>
                  <div className="card-stats">
                    <span className="stat">🤖 Robot Programming</span>
                    <span className="stat">⭐ Advanced</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="footer-text">{selectedCharacter ? "Start KUBO Adventure" : "Select Character First"}</span>
                  <svg className="footer-arrow" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          <div className="game-card-wrapper">
            <Link 
              to={selectedCharacter ? "/open-world" : "#"}
              className="game-card open-world-card"
              onClick={(e) => !selectedCharacter && (e.preventDefault(), alert("Please select a character first!"))}
            >
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" fill="#ff9800"/>
                      <path d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 6h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="#fff"/>
                    </svg>
                  </div>
                  <div className="card-badge">Coming Soon</div>
                </div>
                <div className="card-body">
                  <h3>Adventure World</h3>
                  <p>Jelajahi Dunia Terbuka Dan Selesaikan Tantangan!</p>
                  <div className="card-stats">
                    <span className="stat">🌍 Open World</span>
                    <span className="stat">⭐ All Levels</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="footer-text">{selectedCharacter ? "Start Adventure" : "Select Character First"}</span>
                  <svg className="footer-arrow" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>



        <div className="character-selection">
          <div className="section-header">
            <h2 className="section-title">Choose Your Coding Companion</h2>
            <p className="section-subtitle">Select your AI companion to guide you through your learning journey</p>
          </div>
          
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Character Collection Progress</span>
              <span className="progress-count">{characters.filter(c => c.unlocked).length}/{characters.length}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(characters.filter(c => c.unlocked).length / characters.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="character-grid">
            {characters.map((character, index) => (
              <div
                key={character.id}
                className={`character-card ${
                  selectedCharacter?.id === character.id ? 'selected' : ''
                } ${character.unlocked ? 'unlocked' : 'locked'}`}
                onClick={() => character.unlocked && setSelectedCharacter(character)}
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <div className="character-avatar">
                  {character.unlocked ? (
                    <div 
                      className="character-svg animated" 
                      dangerouslySetInnerHTML={{ __html: character.svg }}
                      style={{ minHeight: '100px', minWidth: '100px' }}
                    />
                  ) : (
                    <div className="locked-character">
                      <svg viewBox="0 0 24 24" className="lock-icon">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="character-info">
                  <h4 className="character-name">{character.unlocked ? character.name : '???'}</h4>
                  <p className="character-description">{character.unlocked ? character.description : 'Complete more levels to unlock'}</p>
                  {character.unlocked && character.abilities && (
                    <div className="character-abilities">
                      {character.abilities.map((ability, i) => (
                        <span key={i} className="ability-tag">{ability}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedCharacter?.id === character.id && (
                  <div className="selected-indicator">
                    <svg viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                    </svg>
                  </div>
                )}
                
                {!character.unlocked && (
                  <div className="unlock-requirement">
                    <span>Level {character.unlockLevel} required</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {selectedCharacter && (
            <div className="selected-character-info">
              <div className="selected-avatar">
                <div 
                  className="character-svg animated" 
                  dangerouslySetInnerHTML={{ __html: selectedCharacter.svg }}
                  style={{ minHeight: '120px', minWidth: '120px' }}
                />
              </div>
              <div className="selected-details">
                <h3>{selectedCharacter.name}</h3>
                <p>{selectedCharacter.description}</p>
                <button className="start-journey-btn" onClick={() => document.querySelector('.game-options').scrollIntoView({ behavior: 'smooth' })}>
                  <span>Start Your Journey</span>
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>


       </div>
     </>
   );
};

export default LandingPage;
