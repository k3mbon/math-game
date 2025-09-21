// Realistic tile limit calculation for crystal collection game
// Based on minimum viable paths considering obstacles and crystal spread

function calculateRealisticMoves(level) {
  const levels = {
    1: { width: 8, height: 6, name: 'Mudah', loops: false },
    2: { width: 10, height: 8, name: 'Sedang', loops: false },
    3: { width: 12, height: 10, name: 'Sulit', loops: true },
    4: { width: 14, height: 12, name: 'Sangat Sulit', loops: true },
    5: { width: 16, height: 14, name: 'Ahli', loops: true }
  };

  const config = levels[level];
  if (!config) return null;

  // More realistic calculation considering:
  // 1. Crystals are placed avoiding obstacles
  // 2. Player can use efficient pathfinding
  // 3. Loops can reduce tile usage significantly
  
  const mapArea = config.width * config.height;
  const maxSingleDistance = Math.max(config.width, config.height);
  
  // Minimum moves needed (optimal path):
  // Assume crystals are reasonably distributed
  const minMovesPerCrystal = Math.ceil(maxSingleDistance * 0.5);
  const minTotalMoves = minMovesPerCrystal * 4; // 3 crystals + 1 to target
  
  // Add buffer for:
  // - Non-optimal paths (25%)
  // - Obstacle avoidance (20%)  
  // - Learning curve (beginner bonus)
  let bufferMultiplier = 1.45; // 45% buffer
  
  // Level-specific adjustments
  if (level === 1) bufferMultiplier = 1.8; // Beginners need more moves
  if (level === 2) bufferMultiplier = 1.6; // Still learning
  if (config.loops) bufferMultiplier *= 0.8; // Loops reduce needed tiles
  
  const recommendedMoves = Math.ceil(minTotalMoves * bufferMultiplier);
  
  // Ensure minimum viable gameplay
  const minViableMove = Math.max(15, Math.ceil(mapArea * 0.3));
  const finalRecommended = Math.max(recommendedMoves, minViableMove);
  
  return {
    level,
    name: config.name,
    mapSize: `${config.width}x${config.height}`,
    minMoves: minTotalMoves,
    bufferMultiplier: Math.round(bufferMultiplier * 100) / 100,
    recommended: finalRecommended,
    current: getCurrentLimit(level),
    hasLoops: config.loops
  };
}

function getCurrentLimit(level) {
  const current = { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30 };
  return current[level] || 0;
}

// Generate recommendations
console.log('REALISTIC Tile Limit Analysis:');
console.log('='.repeat(50));

const recommendations = [];
for (let level = 1; level <= 5; level++) {
  const analysis = calculateRealisticMoves(level);
  recommendations.push(analysis);
  
  console.log(`Level ${level} (${analysis.name}):`);
  console.log(`  Map: ${analysis.mapSize} | Loops: ${analysis.hasLoops ? 'Yes' : 'No'}`);
  console.log(`  Min Moves: ${analysis.minMoves}`);
  console.log(`  Buffer: ${analysis.bufferMultiplier}x`);
  console.log(`  Current: ${analysis.current} → Recommended: ${analysis.recommended}`);
  console.log(`  Change: ${analysis.recommended > analysis.current ? '+' : ''}${analysis.recommended - analysis.current}`);
  console.log('-'.repeat(40));
}

console.log('\nSUMMARY - Recommended Changes:');
console.log('='.repeat(30));
recommendations.forEach(r => {
  console.log(`Level ${r.level}: ${r.current} → ${r.recommended} moves`);
});
