import React, { useEffect, useRef, useState } from 'react';
import './GameStartMenu.css';

const GameStartMenu = ({ onPlay, onBack, onClose, isVisible = true }) => {
  const [focusedButton, setFocusedButton] = useState(0);
  const playButtonRef = useRef(null);
  const backButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  
  const buttons = [
    { ref: playButtonRef, action: onPlay, label: 'Play Game' },
    { ref: backButtonRef, action: onBack, label: 'Back to Home' },
    { ref: closeButtonRef, action: onClose, label: 'Close Menu' }
  ];

  useEffect(() => {
    if (!isVisible) return;

    // Focus the first button when menu becomes visible
    const timer = setTimeout(() => {
      playButtonRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setFocusedButton(prev => {
            const next = (prev + 1) % buttons.length;
            buttons[next].ref.current?.focus();
            return next;
          });
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedButton(prev => {
            const next = prev === 0 ? buttons.length - 1 : prev - 1;
            buttons[next].ref.current?.focus();
            return next;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          buttons[focusedButton].action?.();
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, focusedButton, buttons, onClose]);

  const handleButtonFocus = (index) => {
    setFocusedButton(index);
  };

  const handleButtonClick = (action, index) => {
    setFocusedButton(index);
    action?.();
  };

  if (!isVisible) return null;

  return (
    <div className="game-start-menu-overlay">
      <div className="game-start-menu">
        <div className="menu-container">
          <button
            ref={closeButtonRef}
            className="menu-close-button"
            onClick={() => handleButtonClick(onClose, 2)}
            onFocus={() => handleButtonFocus(2)}
            aria-label="Close menu"
          >
            ✕
          </button>
          
          <div className="menu-header">
            <h1 className="game-title">🏰 Math Adventure</h1>
            <p className="game-subtitle">Explore, Fight Monsters & Solve Puzzles!</p>
          </div>
          
          <div className="menu-content">
            <div className="game-features">
              <div className="feature-item">
                <span className="feature-icon">⚔️</span>
                <span className="feature-text">Battle Monsters</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏆</span>
                <span className="feature-text">Solve Math Puzzles</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🗺️</span>
                <span className="feature-text">Explore Open World</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💎</span>
                <span className="feature-text">Collect Treasures</span>
              </div>
            </div>
            
            <div className="menu-buttons">
              <button 
                ref={playButtonRef}
                className="menu-button play-button"
                onClick={() => handleButtonClick(onPlay, 0)}
                onFocus={() => handleButtonFocus(0)}
                aria-label="Start playing the game"
              >
                <span className="button-icon">🎮</span>
                Play Game
              </button>
              
              <button 
                ref={backButtonRef}
                className="menu-button back-button"
                onClick={() => handleButtonClick(onBack, 1)}
                onFocus={() => handleButtonFocus(1)}
                aria-label="Return to home page"
              >
                <span className="button-icon">🏠</span>
                Back to Home
              </button>
            </div>
          </div>
          
          <div className="menu-footer">
            <div className="controls-info">
              <h3>🎮 Controls</h3>
              <div className="control-item">
                <span className="control-key">WASD / Arrow Keys</span>
                <span className="control-desc">Move Player</span>
              </div>
              <div className="control-item">
                <span className="control-key">Mouse Click</span>
                <span className="control-desc">Attack Monsters</span>
              </div>
              <div className="control-item">
                <span className="control-key">Walk into Treasures</span>
                <span className="control-desc">Open Treasure Boxes</span>
              </div>
              <div className="control-item">
                <span className="control-key">ESC</span>
                <span className="control-desc">Toggle Menu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStartMenu;