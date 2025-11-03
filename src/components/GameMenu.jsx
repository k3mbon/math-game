import React from 'react';
import './GameMenu.css';
import { soundEffects } from '../utils/soundEffects';

const GameMenu = ({ 
  isVisible, 
  gameState, 
  onResume, 
  onRestart, 
  onQuit, 
  onClose 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonStates, setButtonStates] = useState({
    resume: 'normal',
    restart: 'normal', 
    quit: 'normal'
  });

  // Handle menu visibility animations
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Play menu open sound
      soundEffects.playMenuOpen?.();
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Handle ESC key to close menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        e.preventDefault();
        handleResume();
      }
    };

    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible]);

  const handleButtonInteraction = (buttonName, state) => {
    setButtonStates(prev => ({
      ...prev,
      [buttonName]: state
    }));
    
    if (state === 'hover') {
      soundEffects.playMenuHover?.();
    } else if (state === 'pressed') {
      soundEffects.playMenuClick?.();
    }
  };

  const handleResume = () => {
    handleButtonInteraction('resume', 'pressed');
    setTimeout(() => {
      onResume();
      onClose();
    }, 150);
  };

  const handleRestart = () => {
    handleButtonInteraction('restart', 'pressed');
    setTimeout(() => {
      onRestart();
      onClose();
    }, 150);
  };

  const handleQuit = () => {
    handleButtonInteraction('quit', 'pressed');
    setTimeout(() => {
      onQuit();
    }, 150);
  };

  // Don't render if not visible and not animating
  if (!isVisible && !isAnimating) {
    return null;
  }

  return (
    <div className={`game-menu-overlay ${isVisible ? 'visible' : 'hidden'}`}>
      <div className={`game-menu-container ${isVisible ? 'slide-in' : 'slide-out'}`}>
        <div className="menu-header">
          <h1 className="menu-title">⏸️ Game Paused</h1>
          <p className="menu-subtitle">Choose an option to continue</p>
        </div>
        
        <div className="menu-content">
          <div className="game-status">
            <div className="status-item">
              <span className="status-icon">🏆</span>
              <span className="status-label">Score:</span>
              <span className="status-value">{gameState?.score || 0}</span>
            </div>
            <div className="status-item">
              <span className="status-icon">💎</span>
              <span className="status-label">Crystals:</span>
              <span className="status-value">{gameState?.crystalsCollected || 0}</span>
            </div>
            <div className="status-item">
              <span className="status-icon">❤️</span>
              <span className="status-label">Health:</span>
              <span className="status-value">{gameState?.player?.health || 100}/{gameState?.player?.maxHealth || 100}</span>
            </div>
          </div>
          
          <div className="menu-buttons">
            <button 
              className={`menu-button resume-button ${buttonStates.resume}`}
              onClick={handleResume}
              onMouseEnter={() => handleButtonInteraction('resume', 'hover')}
              onMouseLeave={() => handleButtonInteraction('resume', 'normal')}
              onMouseDown={() => handleButtonInteraction('resume', 'pressed')}
              onMouseUp={() => handleButtonInteraction('resume', 'hover')}
            >
              <span className="button-icon">▶️</span>
              <span className="button-text">Resume Game</span>
            </button>
            
            <button 
              className={`menu-button restart-button ${buttonStates.restart}`}
              onClick={handleRestart}
              onMouseEnter={() => handleButtonInteraction('restart', 'hover')}
              onMouseLeave={() => handleButtonInteraction('restart', 'normal')}
              onMouseDown={() => handleButtonInteraction('restart', 'pressed')}
              onMouseUp={() => handleButtonInteraction('restart', 'hover')}
            >
              <span className="button-icon">🔄</span>
              <span className="button-text">Restart Game</span>
            </button>
            
            <button 
              className={`menu-button quit-button ${buttonStates.quit}`}
              onClick={handleQuit}
              onMouseEnter={() => handleButtonInteraction('quit', 'hover')}
              onMouseLeave={() => handleButtonInteraction('quit', 'normal')}
              onMouseDown={() => handleButtonInteraction('quit', 'pressed')}
              onMouseUp={() => handleButtonInteraction('quit', 'hover')}
            >
              <span className="button-icon">🚪</span>
              <span className="button-text">Quit to Menu</span>
            </button>
          </div>
        </div>
        
        <div className="menu-footer">
          <div className="controls-reminder">
            <p className="control-hint">
              <span className="key-badge">ESC</span> to resume • 
              <span className="key-badge">WASD</span> to move • 
              <span className="key-badge">Click</span> to attack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;