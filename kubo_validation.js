// Test script to validate Kubo game step limits and pathfinding logic

class KuboGameValidator {
  constructor() {
    this.levels = {
      1: { width: 8, height: 6, maxMoves: 22, name: 'Mudah' },
      2: { width: 10, height: 8, maxMoves: 28, name: 'Sedang' },
      3: { width: 12, height: 10, maxMoves: 34, name: 'Sulit' },
      4: { width: 14, height: 12, maxMoves: 38, name: 'Sangat Sulit' },
      5: { width: 16, height: 14, maxMoves: 42, name: 'Ahli' }
    };
  }

  // Calculate minimum moves needed to collect all crystals and reach target
  calculateMinimumPath(level, startPos, targetPos, crystalPositions) {
    const config = this.levels[level];
    if (!config) return null;

    // Use greedy approach to find shortest path through all crystals
    let totalMoves = 0;
    let currentPos = startPos;
    const remainingCrystals = [...crystalPositions];

    // Visit each crystal in optimal order
    while (remainingCrystals.length > 0) {
      let nearestIndex = -1;
      let minDistance = Infinity;

      remainingCrystals.forEach((crystal, index) => {
        const distance = this.manhattanDistance(currentPos, crystal);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });

      if (nearestIndex >= 0) {
        totalMoves += minDistance;
        currentPos = remainingCrystals[nearestIndex];
        remainingCrystals.splice(nearestIndex, 1);
      }
    }

    // Add final move to target
    totalMoves += this.manhattanDistance(currentPos, targetPos);

    return totalMoves;
  }

  manhattanDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  // Validate if step limit makes sense for the level
  validateLevel(level) {
    const config = this.levels[level];
    if (!config) return null;

    // Generate sample scenarios for this level
    const scenarios = this.generateTestScenarios(level, 10);
    const results = [];

    scenarios.forEach((scenario, index) => {
      const minMoves = this.calculateMinimumPath(
        level,
        scenario.start,
        scenario.target,
        scenario.crystals
      );

      const buffer = config.maxMoves - minMoves;
      const bufferPercentage = (buffer / minMoves) * 100;

      results.push({
        scenario: index + 1,
        minMoves,
        maxAllowed: config.maxMoves,
        buffer,
        bufferPercentage: Math.round(bufferPercentage),
        feasible: buffer >= minMoves * 0.2 // At least 20% buffer
      });
    });

    const avgMinMoves = Math.round(results.reduce((sum, r) => sum + r.minMoves, 0) / results.length);
    const avgBuffer = Math.round(results.reduce((sum, r) => sum + r.buffer, 0) / results.length);
    const feasibleCount = results.filter(r => r.feasible).length;

    return {
      level,
      name: config.name,
      mapSize: `${config.width}x${config.height}`,
      maxMoves: config.maxMoves,
      avgMinMoves,
      avgBuffer,
      feasibilityRate: Math.round((feasibleCount / results.length) * 100),
      recommendation: this.getRecommendation(avgMinMoves, config.maxMoves, feasibleCount, results.length)
    };
  }

  generateTestScenarios(level, count) {
    const config = this.levels[level];
    const scenarios = [];

    for (let i = 0; i < count; i++) {
      // Generate random but logical positions
      const start = { x: 1, y: 1 }; // Fixed start
      const target = {
        x: Math.floor(config.width * 0.7) + Math.floor(Math.random() * Math.floor(config.width * 0.3)),
        y: Math.floor(config.height * 0.7) + Math.floor(Math.random() * Math.floor(config.height * 0.3))
      };

      // Generate 3 crystals distributed across the map
      const crystals = this.generateCrystalPositions(config.width, config.height, start, target);

      scenarios.push({ start, target, crystals });
    }

    return scenarios;
  }

  generateCrystalPositions(width, height, start, target) {
    const crystals = [];
    const attempts = 100;

    for (let i = 0; i < 3 && attempts > 0; i++) {
      let crystal;
      let valid = false;
      let attemptCount = 0;

      while (!valid && attemptCount < attempts) {
        crystal = {
          x: Math.floor(Math.random() * width),
          y: Math.floor(Math.random() * height)
        };

        // Check if crystal is not too close to start, target, or other crystals
        const distanceFromStart = this.manhattanDistance(crystal, start);
        const distanceFromTarget = this.manhattanDistance(crystal, target);
        const minDistanceFromOthers = crystals.length === 0 ? true :
          crystals.every(c => this.manhattanDistance(crystal, c) >= 2);

        valid = distanceFromStart >= 2 && distanceFromTarget >= 2 && minDistanceFromOthers;
        attemptCount++;
      }

      if (valid) {
        crystals.push(crystal);
      }
    }

    // Ensure we have exactly 3 crystals (fallback)
    while (crystals.length < 3) {
      crystals.push({
        x: Math.floor(width / 2) + crystals.length - 1,
        y: Math.floor(height / 2)
      });
    }

    return crystals;
  }

  getRecommendation(avgMinMoves, maxMoves, feasibleCount, totalScenarios) {
    const bufferRatio = maxMoves / avgMinMoves;
    const feasibilityRate = feasibleCount / totalScenarios;

    if (feasibilityRate < 0.7) {
      return `🔴 TOO LOW - Increase by ${Math.ceil(avgMinMoves * 1.5 - maxMoves)} moves`;
    } else if (bufferRatio < 1.3) {
      return `🟡 TIGHT - Consider +${Math.ceil(avgMinMoves * 1.4 - maxMoves)} moves`;
    } else if (bufferRatio > 2.0) {
      return `🔵 TOO HIGH - Could reduce by ${Math.ceil(maxMoves - avgMinMoves * 1.6)} moves`;
    } else {
      return `🟢 OPTIMAL - Good balance`;
    }
  }
}

// Run validation
const validator = new KuboGameValidator();

console.log('KUBO GAME STEP LIMIT VALIDATION');
console.log('='.repeat(50));

for (let level = 1; level <= 5; level++) {
  const validation = validator.validateLevel(level);
  
  console.log(`Level ${level} (${validation.name}):`);
  console.log(`  Map Size: ${validation.mapSize}`);
  console.log(`  Max Moves: ${validation.maxMoves}`);
  console.log(`  Avg Min Needed: ${validation.avgMinMoves}`);
  console.log(`  Avg Buffer: ${validation.avgBuffer} moves`);
  console.log(`  Feasibility: ${validation.feasibilityRate}%`);
  console.log(`  Status: ${validation.recommendation}`);
  console.log('-'.repeat(40));
}

console.log('\nSUMMARY:');
console.log('Updated step limits should provide reasonable challenge');
console.log('while ensuring crystal collection is always possible.');
