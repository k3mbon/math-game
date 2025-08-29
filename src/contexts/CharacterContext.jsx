import { createContext, useState, useContext, useEffect } from 'react';

export const CharacterContext = createContext();

export const CharacterProvider = ({ children }) => {
  // Animated SVG Characters with unlock progression
  const characters = [
    {
      id: 1,
      name: 'Codey',
      description: 'A friendly robot companion who loves solving puzzles and teaching programming basics.',
      unlocked: true,
      unlockLevel: 0,
      abilities: ['Beginner Guide', 'Hint Master'],
      svg: `
        <svg viewBox="0 0 100 100" className="character-svg animated">
          <defs>
            <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#66BB6A;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="45" r="25" fill="url(#robotGrad)" className="head bounce"/>
          <rect x="35" y="65" width="30" height="25" rx="5" fill="url(#robotGrad)" className="body"/>
          <circle cx="42" cy="38" r="3" fill="#1B5E20" className="eye blink"/>
          <circle cx="58" cy="38" r="3" fill="#1B5E20" className="eye blink"/>
          <path d="M42 50 Q50 55 58 50" stroke="#1B5E20" strokeWidth="2" fill="none" className="smile"/>
          <rect x="30" y="70" width="8" height="15" rx="4" fill="#388E3C" className="arm-left wave"/>
          <rect x="62" y="70" width="8" height="15" rx="4" fill="#388E3C" className="arm-right"/>
        </svg>
      `
    },
    {
      id: 2,
      name: 'Luna',
      description: 'A wise owl who specializes in logic puzzles and mathematical reasoning.',
      unlocked: true,
      unlockLevel: 0,
      abilities: ['Logic Expert', 'Math Tutor'],
      svg: `
        <svg viewBox="0 0 100 100" className="character-svg animated">
          <defs>
            <linearGradient id="owlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="50" rx="28" ry="35" fill="url(#owlGrad)" className="body float"/>
          <circle cx="40" cy="40" r="8" fill="#FFFFFF" className="eye-bg"/>
          <circle cx="60" cy="40" r="8" fill="#FFFFFF" className="eye-bg"/>
          <circle cx="40" cy="40" r="4" fill="#1E1B4B" className="eye blink"/>
          <circle cx="60" cy="40" r="4" fill="#1E1B4B" className="eye blink"/>
          <path d="M45 50 L50 55 L55 50" stroke="#F59E0B" strokeWidth="2" fill="none" className="beak"/>
          <path d="M30 35 Q25 30 35 25" stroke="url(#owlGrad)" strokeWidth="3" fill="none" className="wing-left flap"/>
          <path d="M70 35 Q75 30 65 25" stroke="url(#owlGrad)" strokeWidth="3" fill="none" className="wing-right flap"/>
        </svg>
      `
    },
    {
      id: 3,
      name: 'Spark',
      description: 'An energetic lightning bolt who makes learning fast and exciting.',
      unlocked: false,
      unlockLevel: 5,
      abilities: ['Speed Boost', 'Quick Tips'],
      svg: `
        <svg viewBox="0 0 100 100" className="character-svg animated">
          <defs>
            <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FBBF24;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M50 10 L40 35 L55 35 L45 60 L65 35 L50 35 Z" fill="url(#sparkGrad)" className="lightning pulse"/>
          <circle cx="45" cy="25" r="2" fill="#1F2937" className="eye"/>
          <circle cx="55" cy="25" r="2" fill="#1F2937" className="eye"/>
          <path d="M45 30 Q50 35 55 30" stroke="#1F2937" strokeWidth="1" fill="none" className="smile"/>
        </svg>
      `
    },
    {
      id: 4,
      name: 'Pixel',
      description: 'A digital cat who loves pixel art and creative coding challenges.',
      unlocked: false,
      unlockLevel: 10,
      abilities: ['Creative Mode', 'Art Helper'],
      svg: `
        <svg viewBox="0 0 100 100" className="character-svg animated">
          <defs>
            <linearGradient id="pixelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#06B6D4;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0891B2;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect x="30" y="40" width="40" height="30" rx="15" fill="url(#pixelGrad)" className="body wiggle"/>
          <rect x="25" y="35" width="50" height="25" rx="12" fill="url(#pixelGrad)" className="head"/>
          <rect x="20" y="30" width="8" height="12" rx="4" fill="url(#pixelGrad)" className="ear-left"/>
          <rect x="72" y="30" width="8" height="12" rx="4" fill="url(#pixelGrad)" className="ear-right"/>
          <rect x="38" y="42" width="4" height="4" fill="#1E293B" className="eye pixel-eye"/>
          <rect x="58" y="42" width="4" height="4" fill="#1E293B" className="eye pixel-eye"/>
          <rect x="46" y="50" width="8" height="2" fill="#1E293B" className="mouth"/>
          <rect x="15" y="65" width="12" height="8" rx="4" fill="url(#pixelGrad)" className="tail wag"/>
        </svg>
      `
    },
    {
      id: 5,
      name: 'Quantum',
      description: 'A mysterious quantum entity that helps with advanced programming concepts.',
      unlocked: false,
      unlockLevel: 15,
      abilities: ['Advanced Logic', 'Quantum Tips'],
      svg: `
        <svg viewBox="0 0 100 100" className="character-svg animated">
          <defs>
            <linearGradient id="quantumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#A78BFA;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#C4B5FD;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="20" fill="url(#quantumGrad)" className="core quantum-pulse" opacity="0.8"/>
          <circle cx="50" cy="50" r="15" fill="none" stroke="url(#quantumGrad)" strokeWidth="2" className="ring-1 quantum-rotate"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="url(#quantumGrad)" strokeWidth="1" className="ring-2 quantum-rotate-reverse" opacity="0.6"/>
          <circle cx="45" cy="45" r="2" fill="#FFFFFF" className="eye quantum-glow"/>
          <circle cx="55" cy="45" r="2" fill="#FFFFFF" className="eye quantum-glow"/>
          <path d="M45 55 Q50 60 55 55" stroke="#FFFFFF" strokeWidth="1" fill="none" className="smile"/>
        </svg>
      `
    }
  ];
  
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [userProgress, setUserProgress] = useState({ level: 0, completedLevels: [] });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success'); // 'success' or 'hint'

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('brainquests-progress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('brainquests-progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Update character unlock status based on progress
  const updatedCharacters = characters.map(char => ({
    ...char,
    unlocked: char.unlockLevel <= userProgress.level
  }));

  // Character feedback functions
  const showSuccessFeedback = (message) => {
    setFeedbackMessage(message || getRandomSuccessMessage());
    setFeedbackType('success');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const showHintFeedback = (message) => {
    setFeedbackMessage(message || getRandomHintMessage());
    setFeedbackType('hint');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 4000);
  };

  const getRandomSuccessMessage = () => {
    const messages = [
      "Great job! You're getting the hang of this!",
      "Excellent work! Keep it up!",
      "Amazing! You solved it perfectly!",
      "Fantastic! Your coding skills are improving!",
      "Well done! That was a tricky one!",
      "Brilliant! You're thinking like a programmer!",
      "Outstanding! Ready for the next challenge?",
      "Perfect! You're mastering these concepts!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomHintMessage = () => {
    const messages = [
      "Don't worry! Let's break this down step by step.",
      "Hmm, try thinking about the pattern differently.",
      "Take your time! Sometimes the solution isn't obvious.",
      "Good attempt! Let me give you a hint...",
      "Almost there! Try approaching it from another angle.",
      "No problem! Every programmer faces challenges.",
      "Let's think about this together. What if we...",
      "Great effort! Here's a tip to help you out."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const updateProgress = (newLevel, completedLevel) => {
    setUserProgress(prev => ({
      level: Math.max(prev.level, newLevel),
      completedLevels: [...new Set([...prev.completedLevels, completedLevel])]
    }));
  };

  return (
    <CharacterContext.Provider value={{
      characters: updatedCharacters,
      selectedCharacter,
      setSelectedCharacter,
      userProgress,
      updateProgress,
      showSuccessFeedback,
      showHintFeedback,
      showFeedback,
      feedbackMessage,
      feedbackType
    }}>
      {children}
      {/* Character Feedback Popup */}
      {showFeedback && selectedCharacter && (
        <div className={`character-feedback-popup ${feedbackType}`}>
          <div className="feedback-character">
            <div 
              className="feedback-avatar"
              dangerouslySetInnerHTML={{ __html: selectedCharacter.svg }}
            />
          </div>
          <div className="feedback-content">
            <div className="feedback-message">{feedbackMessage}</div>
            <div className="feedback-character-name">- {selectedCharacter.name}</div>
          </div>
          <button 
            className="feedback-close"
            onClick={() => setShowFeedback(false)}
          >
            ×
          </button>
        </div>
      )}
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