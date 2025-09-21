// Mathematical analysis for optimal tile limits
// Based on map sizes and crystal collection requirements

function calculateOptimalMoves(level) {
  const levels = {
    1: { width: 8, height: 6, name: 'Mudah' },
    2: { width: 10, height: 8, name: 'Sedang' },
    3: { width: 12, height: 10, name: 'Sulit' },
    4: { width: 14, height: 12, name: 'Sangat Sulit' },
    5: { width: 16, height: 14, name: 'Ahli' }
  };

  const config = levels[level];
  if (!config) return null;

  // Calculate theoretical distances
  const maxDistance = config.width + config.height; // Maximum Manhattan distance
  const avgDistance = (config.width + config.height) / 2; // Average distance
  const diagonalDistance = Math.sqrt(config.width * config.width + config.height * config.height);

  // Crystal collection requirements
  const crystalCount = 3;
  const avgCrystalDistance = avgDistance * 0.6; // Crystals spread across map
  
  // Estimate moves needed:
  // 1. Start to first crystal
  // 2. First to second crystal  
  // 3. Second to third crystal
  // 4. Third crystal to target
  const estimatedMoves = avgCrystalDistance * (crystalCount + 1);
  
  // Add buffer for obstacles and non-optimal paths
  const obstacleBuffer = Math.ceil(estimatedMoves * 0.4); // 40% buffer
  const totalEstimated = Math.ceil(estimatedMoves + obstacleBuffer);
  
  // Add level-specific adjustments
  const levelMultiplier = {
    1: 1.2, // Beginner needs more moves
    2: 1.3, // More complex navigation
    3: 1.4, // Loops and math operations
    4: 1.5, // Advanced features
    5: 1.6  // Master level
  }[level] || 1.3;

  const recommended = Math.ceil(totalEstimated * levelMultiplier);
  
  return {
    level,
    name: config.name,
    mapSize: `${config.width}x${config.height}`,
    maxDistance,
    avgDistance: Math.round(avgDistance * 100) / 100,
    estimatedMoves: Math.round(estimatedMoves),
    withBuffer: totalEstimated,
    recommended,
    currentLimit: getCurrentLimit(level)
  };
}

function getCurrentLimit(level) {
  const current = {
    1: 10,
    2: 15, 
    3: 20,
    4: 25,
    5: 30
  };
  return current[level] || 0;
}

// Calculate for all levels
console.log('Optimal Move Analysis for Crystal Collection:');
console.log('='.repeat(60));

for (let level = 1; level <= 5; level++) {
  const analysis = calculateOptimalMoves(level);
  console.log(`Level ${level} (${analysis.name}):`);
  console.log(`  Map Size: ${analysis.mapSize}`);
  console.log(`  Estimated Moves: ${analysis.estimatedMoves}`);
  console.log(`  With Buffer: ${analysis.withBuffer}`);
  console.log(`  Recommended: ${analysis.recommended}`);
  console.log(`  Current Limit: ${analysis.currentLimit}`);
  console.log(`  Status: ${analysis.recommended <= analysis.currentLimit ? '✅ OK' : '❌ TOO LOW'}`);
  console.log('-'.repeat(40));
}
