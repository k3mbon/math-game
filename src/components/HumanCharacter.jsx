import React, { useState, useEffect, useRef } from 'react';
import './HumanCharacter.css';

/**
 * Enhanced Human Character Component with Canvas-based Sprite Animation
 * Uses multiple Swordsman sprite sheets for different animation states
 */
const HumanCharacter = ({ 
  size = 72, // Increased by 150% (48 * 1.5 = 72)
  x = 0, 
  y = 0, 
  direction = 'right', 
  isAnimating = false,
  animationState = 'idle' // 'idle', 'breathing', 'walking', 'running', 'walkAttack', 'runAttack', 'idleAttack', 'death'
}) => {
  const canvasRef = useRef(null);
  const spriteImages = useRef({
    idle: null,
    walk: null,
    run: null,
    walkAttack: null,
    runAttack: null,
    idleAttack: null,
    death: null
  });
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [previousAnimationState, setPreviousAnimationState] = useState('idle');
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({
    idle: false,
    walk: false,
    run: false,
    walkAttack: false,
    runAttack: false,
    idleAttack: false,
    death: false
  });
  const [previousDirection, setPreviousDirection] = useState(direction);
  const [directionTransitionProgress, setDirectionTransitionProgress] = useState(1);
  const [isDirectionTransitioning, setIsDirectionTransitioning] = useState(false);

  // Sprite sheet configurations for different animation states
  const SPRITE_CONFIGS = {
    idle: {
      spriteWidth: 64,
      spriteHeight: 64,
      columns: 4,
      rows: 4,
      frameCount: 4,
      src: '/assets/characters/char-zeno/Swordsman_lvl3_Idle.png'
    },
    walk: {
      spriteWidth: 64,
      spriteHeight: 64,
      columns: 6,
      rows: 4,
      frameCount: 6,
      src: '/assets/characters/char-zeno/Swordsman_lvl3_Walk_with_shadow.png'
    },
    run: {
      spriteWidth: 64,
      spriteHeight: 64,
      columns: 6,
      rows: 4,
      frameCount: 6,
      src: '/assets/characters/char-zeno/Swordsman_lvl3_Walk_with_shadow.png'
    },
    walkAttack: {
      spriteWidth: 64,
      spriteHeight: 64,
      columns: 6,
      rows: 4,
      frameCount: 6,
      src: '/assets/characters/char-zeno/Swordsman_lvl3_Walk_Attack_with_shadow.png'
    },
    runAttack: {
      spriteWidth: 64,
      spriteHeight: 64,
      columns: 6,
      rows: 4,
      frameCount: 6,
      src: '/assets/characters/char-zeno/Swordsman_lvl3_Run_Attack_with_shadow.png'
    },
    idleAttack: {
      spriteWidth: 64,
      spriteHeight: 64,
      columns: 6,
      rows: 4,
      frameCount: 6,
      src: '/assets/characters/char-zeno/Swordsman_lvl3_attack_with_shadow.png'
    },
    death: {
      spriteWidth: 64,
      spriteHeight: 64,
      columns: 6,
      rows: 4,
      frameCount: 6,
      src: '/assets/characters/char-zeno/Swordsman_lvl3_Death_with_shadow.png'
    }
  };

  // Direction mapping (consistent across all sprite sheets)
  const DIRECTION_MAP = {
    'down': 0,   // front-facing
    'left': 1,   // left-facing
    'right': 2,  // right-facing
    'up': 3      // up-facing (back)
  };

  // Load all sprite sheet images
  useEffect(() => {
    const loadImage = (type, src) => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [type]: true }));
      };
      img.onerror = () => {
        console.error(`Failed to load ${type} sprite: ${src}`);
      };
      img.src = src;
      spriteImages.current[type] = img;
    };

    // Load all sprite sheets
    Object.entries(SPRITE_CONFIGS).forEach(([type, config]) => {
      loadImage(type, config.src);
    });
  }, []);

  // Render current sprite frame to canvas with transition support
  const renderSprite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Helper function to get sprite type from animation state
    const getSpriteType = (state) => {
      if (state === 'walking') return 'walk';
      if (state === 'running') return 'run';
      if (state === 'walkAttack') return 'walkAttack';
      if (state === 'runAttack') return 'runAttack';
      if (state === 'idleAttack') return 'idleAttack';
      if (state === 'death') return 'death';
      return 'idle'; // Default for 'breathing' and 'idle'
    };
    
    // Helper function to draw a sprite frame
    const drawSpriteFrame = (spriteType, opacity = 1, dirOverride = direction) => {
      const image = spriteImages.current[spriteType];
      const config = SPRITE_CONFIGS[spriteType];
      
      if (!image || !imagesLoaded[spriteType]) return;
      
      const directionRow = DIRECTION_MAP[dirOverride] || 0;
      const frameColumn = currentFrame % config.columns;
      const srcX = frameColumn * config.spriteWidth;
      const srcY = directionRow * config.spriteHeight;
      
      ctx.globalAlpha = opacity;
      ctx.drawImage(
        image,
        srcX, srcY,
        config.spriteWidth, config.spriteHeight,
        0, 0,
        canvas.width, canvas.height
      );
    };
    
    if (isTransitioning && transitionProgress < 1) {
      // During transition, blend previous and current states
      const previousSpriteType = getSpriteType(previousAnimationState);
      const currentSpriteType = getSpriteType(animationState);
      
      // Draw previous state with decreasing opacity
      drawSpriteFrame(previousSpriteType, 1 - transitionProgress);
      
      // Draw current state with increasing opacity
      drawSpriteFrame(currentSpriteType, transitionProgress);
    } else if (isDirectionTransitioning && directionTransitionProgress < 1) {
      // Blend between previous and current directions within the same animation state
      const currentSpriteType = getSpriteType(animationState);
      drawSpriteFrame(currentSpriteType, 1 - directionTransitionProgress, previousDirection);
      drawSpriteFrame(currentSpriteType, directionTransitionProgress, direction);
    } else {
      // Normal rendering without transition
      const currentSpriteType = getSpriteType(animationState);
      drawSpriteFrame(currentSpriteType, 1);
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1;
  };

  // Update canvas when frame, direction, or transition state changes
  useEffect(() => {
    renderSprite();
  }, [currentFrame, direction, imagesLoaded, animationState, isTransitioning, transitionProgress, previousAnimationState, isDirectionTransitioning, directionTransitionProgress, previousDirection]);

  // Handle animation state transitions
  useEffect(() => {
    if (animationState !== previousAnimationState) {
      // Start transition
      setIsTransitioning(true);
      setTransitionProgress(0);
      setPreviousAnimationState(animationState);
      
      // Transition duration based on state change type
      const transitionDuration = getTransitionDuration(previousAnimationState, animationState);
      
      const transitionInterval = setInterval(() => {
        setTransitionProgress(prev => {
          const newProgress = prev + (16 / transitionDuration); // 16ms per frame
          if (newProgress >= 1) {
            setIsTransitioning(false);
            clearInterval(transitionInterval);
            return 1;
          }
          return newProgress;
        });
      }, 16);
      
      return () => clearInterval(transitionInterval);
    }
  }, [animationState, previousAnimationState]);

  // Get transition duration based on state change
  const getTransitionDuration = (from, to) => {
    // Attack transitions are faster
    if (to.includes('Attack') || from.includes('Attack')) {
      return 150; // 150ms for attack transitions
    }
    // Death transitions are slower
    if (to === 'death' || from === 'death') {
      return 500; // 500ms for death transitions
    }
    // Default movement transitions
    return 250; // 250ms for normal transitions
  };

  // Handle direction change transitions
  useEffect(() => {
    if (direction !== previousDirection) {
      setIsDirectionTransitioning(true);
      setDirectionTransitionProgress(0);
      const oldDirection = direction; // capture new direction in closure
      setPreviousDirection(prev => prev); // keep existing previousDirection
      // Run transition
      const duration = 180; // 180ms for direction turns
      const interval = setInterval(() => {
        setDirectionTransitionProgress(prev => {
          const next = prev + (16 / duration);
          if (next >= 1) {
            clearInterval(interval);
            setIsDirectionTransitioning(false);
            setPreviousDirection(direction);
            return 1;
          }
          return next;
        });
      }, 16);
      return () => clearInterval(interval);
    }
  }, [direction, previousDirection]);

  // Enhanced animation timing and state management with smooth transitions
  useEffect(() => {
    // Determine sprite type and get its configuration
    let spriteType = 'idle';
    if (animationState === 'walking') {
      spriteType = 'walk';
    } else if (animationState === 'running') {
      spriteType = 'run';
    } else if (animationState === 'walkAttack') {
      spriteType = 'walkAttack';
    } else if (animationState === 'runAttack') {
      spriteType = 'runAttack';
    } else if (animationState === 'idleAttack') {
      spriteType = 'idleAttack';
    } else if (animationState === 'death') {
      spriteType = 'death';
    } else if (animationState === 'breathing' || animationState === 'idle') {
      spriteType = 'idle';
    }
    
    const spriteConfig = SPRITE_CONFIGS[spriteType];
    let frameCount = spriteConfig.frameCount;
    let speed = 200; // Default speed
    
    // Adjust animation parameters based on state with smoother transitions
    if (animationState === 'breathing') {
      speed = 1200; // Slower for more natural breathing
    } else if (animationState === 'walking') {
      speed = 200; // Smoother walking animation
    } else if (animationState === 'running') {
      speed = 100; // Faster for running
    } else if (animationState === 'walkAttack') {
      speed = 120; // Balanced for walk attack
    } else if (animationState === 'runAttack') {
      speed = 80; // Fast for run attack
    } else if (animationState === 'idleAttack') {
      speed = 110; // Smooth idle attack
    } else if (animationState === 'death') {
      speed = 180; // Smoother death animation
    } else if (animationState === 'idle') {
      speed = 400; // Slower for idle
    }
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frameCount);
      // Randomly change animation phase for variety in idle state
      if (animationState === 'idle' && Math.random() < 0.1) {
        setAnimationPhase(prev => {
          const phases = ['idle', 'shift', 'blink'];
          const currentIndex = phases.indexOf(prev);
          return phases[(currentIndex + 1) % phases.length];
        });
      }
    }, speed);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [animationState, isAnimating]);

  // Calculate animation transforms for visual effects
  const getAnimationTransforms = () => {
    const transforms = [];
    
    if (animationState === 'breathing') {
      // Gentle breathing effect
      const breathingScale = 1 + Math.sin(currentFrame * 0.3) * 0.02;
      transforms.push(`scale(${breathingScale})`);
    }
    
    if (animationState === 'walking' && isAnimating) {
      // Walking bounce effect
      const bounceY = Math.abs(Math.sin(currentFrame * 0.5)) * 2;
      transforms.push(`translateY(-${bounceY}px)`);
      
      // Slight sway based on direction
      const swayX = Math.sin(currentFrame * 0.3) * 1;
      transforms.push(`translateX(${swayX}px)`);
    }
    
    if (animationState === 'running' && isAnimating) {
      // Running bounce effect - more pronounced than walking
      const bounceY = Math.abs(Math.sin(currentFrame * 0.8)) * 3;
      transforms.push(`translateY(-${bounceY}px)`);
      
      // More dynamic sway for running
      const swayX = Math.sin(currentFrame * 0.5) * 1.5;
      transforms.push(`translateX(${swayX}px)`);
      
      // Removed rotation for running to prevent spinning
    }
    
    if (animationState === 'walkAttack' && isAnimating) {
      // Walk attack effect - combine walking bounce with attack thrust
      const bounceY = Math.abs(Math.sin(currentFrame * 0.5)) * 2;
      transforms.push(`translateY(-${bounceY}px)`);
      
      // Attack thrust effect
      const thrustX = Math.sin(currentFrame * 0.8) * 2;
      transforms.push(`translateX(${thrustX}px)`);
      
      // Removed rotation for attack swing to prevent spinning
    }
    
    if (animationState === 'runAttack' && isAnimating) {
      // Run attack effect - more aggressive than walk attack
      const bounceY = Math.abs(Math.sin(currentFrame * 0.8)) * 3;
      transforms.push(`translateY(-${bounceY}px)`);
      
      // More pronounced attack thrust
      const thrustX = Math.sin(currentFrame * 1.0) * 3;
      transforms.push(`translateX(${thrustX}px)`);
      
      // Dynamic attack swing
      const swingAngle = Math.sin(currentFrame * 0.8) * 5;
      transforms.push(`rotate(${swingAngle}deg)`);
    }
    
    if (animationState === 'idleAttack') {
      // Idle attack effect - focused attack without movement
      const attackPulse = Math.sin(currentFrame * 1.2) * 1.5;
      transforms.push(`translateX(${attackPulse}px)`);
      
      // Attack swing rotation
      const swingAngle = Math.sin(currentFrame * 1.0) * 4;
      transforms.push(`rotate(${swingAngle}deg)`);
      
      // Slight scale effect for impact
      const scaleEffect = 1 + Math.abs(Math.sin(currentFrame * 0.8)) * 0.05;
      transforms.push(`scale(${scaleEffect})`);
    }
    
    if (animationState === 'death') {
      // Death animation effect - gradual fall and fade
      const fallProgress = Math.min(currentFrame / 30, 1); // Gradual fall over 30 frames
      const fallY = fallProgress * 10;
      const fallRotation = fallProgress * 15;
      const fadeScale = 1 - (fallProgress * 0.2);
      
      transforms.push(`translateY(${fallY}px)`);
      transforms.push(`rotate(${fallRotation}deg)`);
      transforms.push(`scale(${fadeScale})`);
    }
    
    if (animationState === 'idle') {
      // Idle effect - occasional subtle movements
      if (currentFrame % 60 < 3) {
        // Occasional blink or small movement
        const idleShift = Math.sin(currentFrame * 2) * 0.5;
        transforms.push(`translateY(${idleShift}px)`);
      }
    }
    
    return transforms.join(' ');
  };

  // Get animation class for CSS animations
  const getAnimationClass = () => {
    const classes = ['human-character'];
    
    // Add transition classes based on current transition state
    if (isTransitioning) {
      classes.push('state-transitioning');
      
      // Add specific transition type classes
      if (animationState.includes('Attack') || previousAnimationState.includes('Attack')) {
        classes.push('attack-transition');
      } else if (animationState === 'death' || previousAnimationState === 'death') {
        classes.push('death-transition');
      } else {
        classes.push('movement-transition');
      }
    }
    
    if (isAnimating) {
      classes.push('moving');
      
      // Add specific movement class
      if (animationState === 'running') {
        classes.push('running');
      } else if (animationState === 'walking') {
        classes.push('walking');
      } else if (animationState === 'walkAttack') {
        classes.push('walking', 'attacking');
      } else if (animationState === 'runAttack') {
        classes.push('running', 'attacking');
      } else if (animationState === 'idleAttack') {
        classes.push('attacking');
      } else if (animationState === 'death') {
        classes.push('dying');
      }
    }
    
    classes.push(`animation-${animationState}`);
    classes.push(`facing-${direction}`);
    
    return classes.join(' ');
  };

  return (
    <div
      className={getAnimationClass()}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: 10,
        transform: getAnimationTransforms(),
        transition: isAnimating 
          ? animationState === 'running'
            ? 'left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          : 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transformOrigin: 'center bottom',
      }}
    >
      {/* Canvas for sprite rendering */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated', // Maintain pixel art quality
        }}
      />
      
      {/* Optional: Add particle effects or additional visual elements */}
      {(animationState === 'walking' || animationState === 'running' || animationState === 'walkAttack' || animationState === 'runAttack') && (
        <div className="movement-dust" style={{
          position: 'absolute',
          bottom: '-2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: (animationState === 'running' || animationState === 'runAttack') ? '6px' : '4px',
          height: (animationState === 'running' || animationState === 'runAttack') ? '3px' : '2px',
          backgroundColor: (animationState === 'running' || animationState === 'runAttack') 
            ? 'rgba(139, 69, 19, 0.5)' 
            : 'rgba(139, 69, 19, 0.3)',
          borderRadius: '50%',
          opacity: currentFrame % ((animationState === 'running' || animationState === 'runAttack') ? 3 : 4) < 2 ? 1 : 0,
          transition: 'opacity 0.1s ease'
        }} />
      )}
      
      {/* Running speed lines effect */}
      {(animationState === 'running' || animationState === 'runAttack') && (
        <div className="speed-lines" style={{
          position: 'absolute',
          top: '20%',
          left: direction === 'right' ? '-10px' : 'auto',
          right: direction === 'left' ? '-10px' : 'auto',
          width: '8px',
          height: '60%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          opacity: currentFrame % 3 === 0 ? 0.8 : 0,
          transition: 'opacity 0.05s ease'
        }} />
      )}
      
      {/* Breathing indicator - subtle glow */}
      {animationState === 'breathing' && (
        <div className="breathing-glow" style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '20%',
          background: 'radial-gradient(ellipse, rgba(76, 175, 80, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          opacity: 0.3 + Math.sin(currentFrame * 0.1) * 0.2,
          transition: 'opacity 0.2s ease'
        }} />
      )}
      
      {/* Attack effects - sword slash indicators */}
      {(animationState === 'walkAttack' || animationState === 'runAttack' || animationState === 'idleAttack') && (
        <div className="attack-slash" style={{
          position: 'absolute',
          top: '30%',
          left: direction === 'right' ? '60%' : '20%',
          width: '20px',
          height: '3px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.8), transparent)',
          borderRadius: '2px',
          opacity: currentFrame % 4 < 2 ? 0.9 : 0,
          transform: `rotate(${direction === 'right' ? '45deg' : '-45deg'})`,
          transition: 'opacity 0.05s ease'
        }} />
      )}
      
      {/* Attack impact sparkles */}
      {(animationState === 'walkAttack' || animationState === 'runAttack' || animationState === 'idleAttack') && (
        <div className="attack-sparkles" style={{
          position: 'absolute',
          top: '25%',
          left: direction === 'right' ? '65%' : '15%',
          width: '4px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          opacity: currentFrame % 3 === 0 ? 1 : 0,
          boxShadow: '0 0 6px rgba(255, 215, 0, 0.8)',
          transition: 'opacity 0.1s ease'
        }} />
      )}
      
      {/* Death fade effect */}
      {animationState === 'death' && (
        <div className="death-fade" style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, transparent 30%, rgba(0, 0, 0, 0.3) 70%)',
          borderRadius: '50%',
          opacity: Math.min(currentFrame / 20, 0.7),
          transition: 'opacity 0.3s ease'
        }} />
      )}
    </div>
  );
};

export default HumanCharacter;