/**
 * Smart randomization system for crystal and target placement
 * Ensures all generated layouts are solvable within the move limit
 */

// Calculate Manhattan distance between two points
const manhattanDistance = (a, b) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Generate all possible positions on the grid, excluding forbidden areas
const generateAllPositions = (gridWidth, gridHeight, excludePositions = []) => {
  const positions = [];
  
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight - 1; y++) { // Exclude last row (y = gridHeight - 1)
      // Check if this position is excluded
      const isExcluded = excludePositions.some(pos => pos.x === x && pos.y === y);
      if (!isExcluded) {
        positions.push({ x, y });
      }
    }
  }
  
  return positions;
};

// Find the shortest path to collect all crystals and reach target
const findOptimalPath = (start, crystals, target) => {
  if (crystals.length === 0) {
    return manhattanDistance(start, target);
  }
  
  // Generate all possible permutations of crystal collection orders
  const permutations = [];
  
  const generatePermutations = (arr, current = []) => {
    if (arr.length === 0) {
      permutations.push([...current]);
      return;
    }
    
    for (let i = 0; i < arr.length; i++) {
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
      generatePermutations(remaining, [...current, arr[i]]);
    }
  };
  
  generatePermutations(crystals.map((_, index) => index));
  
  let minPath = Infinity;
  
  // Test each permutation
  for (const perm of permutations) {
    let totalMoves = 0;
    let current = start;
    
    // Visit crystals in this order
    for (const crystalIndex of perm) {
      const crystal = crystals[crystalIndex];
      totalMoves += manhattanDistance(current, crystal);
      current = crystal;
    }
    
    // Go to target
    totalMoves += manhattanDistance(current, target);
    
    if (totalMoves < minPath) {
      minPath = totalMoves;
    }
  }
  
  return minPath;
};

// Check if a layout is solvable within the move limit
const isLayoutSolvable = (start, crystals, target, maxMoves) => {
  const minMoves = findOptimalPath(start, crystals, target);
  return minMoves <= maxMoves;
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate a random but solvable layout
export const generateRandomLayout = (options = {}) => {
  const {
    gridWidth = 6,
    gridHeight = 5,
    crystalCount = 3,
    maxMoves = 12,
    startPosition = { x: 0, y: 3 }
  } = options;
  
  // Define forbidden positions (areas to avoid)
  const forbiddenPositions = [
    startPosition, // Don't place crystals or target on start position
    // Additional positions near start to ensure clear spawning area
    { x: 1, y: 3 }, // Adjacent to start position
  ];
  
  // Generate all possible positions
  const allPositions = generateAllPositions(gridWidth, gridHeight, forbiddenPositions);
  
  // Try to generate a solvable layout (with max attempts to prevent infinite loops)
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Shuffle positions for randomness
    const shuffledPositions = shuffleArray(allPositions);
    
    // Select random positions for crystals and target
    const selectedPositions = shuffledPositions.slice(0, crystalCount + 1);
    const crystalPositions = selectedPositions.slice(0, crystalCount);
    const targetPosition = selectedPositions[crystalCount];
    
    // Check if this layout is solvable
    if (isLayoutSolvable(startPosition, crystalPositions, targetPosition, maxMoves)) {
      // Generate crystal objects
      const crystals = {};
      crystalPositions.forEach((pos, index) => {
        crystals[`${pos.x}-${pos.y}`] = {
          x: pos.x,
          y: pos.y,
          collected: false
        };
      });
      
      return {
        crystals,
        target: targetPosition,
        optimalMoves: findOptimalPath(startPosition, crystalPositions, targetPosition),
        attempts
      };
    }
  }
  
  // Fallback to a known solvable layout if random generation fails
  console.warn('Could not generate random solvable layout, using fallback');
  return generateFallbackLayout(crystalCount);
};

// Generate a fallback layout that's guaranteed to be solvable
const generateFallbackLayout = (crystalCount) => {
  const fallbackLayouts = {
    3: {
      crystals: {
        '2-2': { x: 2, y: 2, collected: false },
        '4-1': { x: 4, y: 1, collected: false },
        '5-0': { x: 5, y: 0, collected: false }
      },
      target: { x: 4, y: 2 },
      optimalMoves: 11
    },
    4: {
      crystals: {
        '2-2': { x: 2, y: 2, collected: false },
        '4-1': { x: 4, y: 1, collected: false },
        '5-0': { x: 5, y: 0, collected: false },
        '1-1': { x: 1, y: 1, collected: false }
      },
      target: { x: 4, y: 2 },
      optimalMoves: 13
    },
    5: {
      crystals: {
        '2-2': { x: 2, y: 2, collected: false },
        '4-1': { x: 4, y: 1, collected: false },
        '5-0': { x: 5, y: 0, collected: false },
        '1-1': { x: 1, y: 1, collected: false },
        '3-0': { x: 3, y: 0, collected: false }
      },
      target: { x: 4, y: 2 },
      optimalMoves: 15
    }
  };
  
  return fallbackLayouts[crystalCount] || fallbackLayouts[3];
};

// Generate a balanced random layout that's not too easy or too hard
export const generateBalancedLayout = (options = {}) => {
  const {
    crystalCount = 3,
    maxMoves = 12,
    difficultyTarget = 0.8 // Target 80% of max moves for good challenge
  } = options;
  
  const targetMoves = Math.floor(maxMoves * difficultyTarget);
  let bestLayout = null;
  let bestScore = Infinity;
  
  // Try multiple random layouts and pick the one closest to target difficulty
  for (let i = 0; i < 20; i++) {
    const layout = generateRandomLayout(options);
    const movesDiff = Math.abs(layout.optimalMoves - targetMoves);
    
    if (movesDiff < bestScore) {
      bestScore = movesDiff;
      bestLayout = layout;
    }
  }
  
  return bestLayout || generateRandomLayout(options);
};

export default {
  generateRandomLayout,
  generateBalancedLayout,
  isLayoutSolvable,
  findOptimalPath
};