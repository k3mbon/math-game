// Balanced tile limit calculation considering game balance and playability

function calculateBalancedMoves(level) {
  const levels = {
    1: { width: 8, height: 6, name: 'Mudah', hasLoops: false, complexity: 1.0 },
    2: { width: 10, height: 8, name: 'Sedang', hasLoops: false, complexity: 1.1 },
    3: { width: 12, height: 10, name: 'Sulit', hasLoops: true, complexity: 1.2 },
    4: { width: 14, height: 12, name: 'Sangat Sulit', hasLoops: true, complexity: 1.3 },
    5: { width: 16, height: 14, name: 'Ahli', hasLoops: true, complexity: 1.4 }
  };

  const config = levels[level];
  if (!config) return null;

  // Base calculation: minimum moves in ideal conditions
  const avgMapSize = (config.width + config.height) / 2;
  
  // Assume crystals are distributed across map requiring movement
  // 3 crystals + 1 target = 4 destinations
  // Average distance between points ≈ map_size / 3
  const avgSegmentDistance = Math.ceil(avgMapSize / 2.5);
  const baseMoves = avgSegmentDistance * 4; // 4 segments of movement
  
  // Apply modifiers
  let modifier = 1.0;
  
  // Level difficulty modifier
  modifier *= config.complexity;
  
  // Obstacle density modifier (more obstacles = more moves needed)
  modifier *= 1.3; // 30% more for obstacle navigation
  
  // Loop efficiency (loops can significantly reduce tile count)
  if (config.hasLoops) {
    modifier *= 0.7; // 30% reduction for loop efficiency
  }
  
  // Beginner friendly adjustment
  if (level <= 2) {
    modifier *= 1.2; // 20% more moves for learning
  }
  
  const calculated = Math.ceil(baseMoves * modifier);
  
  // Apply reasonable bounds
  const minMoves = Math.max(12, Math.ceil(avgMapSize * 1.5));
  const maxMoves = Math.ceil(avgMapSize * 4);
  
  const recommended = Math.max(minMoves, Math.min(calculated, maxMoves));
  
  return {
    level,
    name: config.name,
    mapSize: `${config.width}x${config.height}`,
    avgMapSize: Math.round(avgMapSize * 10) / 10,
    baseMoves,
    modifier: Math.round(modifier * 100) / 100,
    calculated,
    recommended,
    current: getCurrentLimit(level),
    hasLoops: config.hasLoops
  };
}

function getCurrentLimit(level) {
  const current = { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30 };
  return current[level] || 0;
}

console.log('BALANCED Tile Limit Analysis:');
console.log('='.repeat(50));

const recommendations = [];
for (let level = 1; level <= 5; level++) {
  const analysis = calculateBalancedMoves(level);
  recommendations.push(analysis);
  
  console.log(`Level ${level} (${analysis.name}):`);
  console.log(`  Map: ${analysis.mapSize} (avg: ${analysis.avgMapSize})`);
  console.log(`  Base moves: ${analysis.baseMoves} | Modifier: ${analysis.modifier}x`);
  console.log(`  Loops: ${analysis.hasLoops ? 'Yes' : 'No'}`);
  console.log(`  Current: ${analysis.current} → Recommended: ${analysis.recommended}`);
  
  const status = analysis.recommended <= analysis.current + 5 ? '✅ GOOD' : 
                analysis.recommended > analysis.current ? '⚠️ LOW' : '✅ OK';
  console.log(`  Status: ${status}`);
  console.log('-'.repeat(40));
}

console.log('\nFINAL RECOMMENDATIONS:');
console.log('='.repeat(25));
recommendations.forEach(r => {
  const change = r.recommended - r.current;
  const symbol = change > 0 ? '+' : '';
  console.log(`Level ${r.level}: ${r.current} → ${r.recommended} (${symbol}${change})`);
});
