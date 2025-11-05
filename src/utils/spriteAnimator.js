// Lightweight sprite animator helpers for directional idle/walk/run states
// Uses the same Swordsman sprite sheets referenced in HumanCharacter.jsx

export const DIRECTION_MAP = {
  front: 0, // facing down
  left: 1,
  right: 2,
  back: 3   // facing up
};

// Default sprite sheet configs; consumer may override per sheet
export const SPRITE_CONFIGS = {
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
    src: '/assets/characters/char-zeno/Swordsman_lvl3_Run_with_shadow.png'
  }
};

// Frame rates tuned for smoothness and performance
export const FRAME_RATES = {
  idle: 6,
  walking: 10,
  running: 14
};

// Given animationState, return canonical sprite key used by sheets
export function getSpriteType(state) {
  if (state === 'walking') return 'walk';
  if (state === 'running') return 'run';
  return 'idle';
}

// Compute next frame index using elapsed time; returns {index, updatedTime}
export function nextFrameIndex(animationState, lastTime, now, currentIndex) {
  const fps = FRAME_RATES[animationState] || FRAME_RATES.idle;
  const frameDuration = 1000 / fps;
  const spriteType = getSpriteType(animationState);
  const frameCount = SPRITE_CONFIGS[spriteType]?.frameCount || 4;
  let newIndex = currentIndex;
  let updatedTime = lastTime;

  if (now - lastTime >= frameDuration) {
    const steps = Math.floor((now - lastTime) / frameDuration);
    newIndex = (currentIndex + steps) % frameCount;
    updatedTime = lastTime + steps * frameDuration;
  }

  return { index: newIndex, updatedTime };
}

// Get src rect for a given state/direction/frame
export function getSrcRect(animationState, direction, frameIndex) {
  const spriteType = getSpriteType(animationState);
  const config = SPRITE_CONFIGS[spriteType];
  const dirRow = DIRECTION_MAP[direction] ?? 0;
  const col = frameIndex % config.columns;
  return {
    sx: col * config.spriteWidth,
    sy: dirRow * config.spriteHeight,
    sw: config.spriteWidth,
    sh: config.spriteHeight
  };
}