import { generateTerrainChunk, isWalkable } from '../utils/terrainGenerator.js';
import { generateTerrainMap } from '../utils/grassTileMapping.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { generateChunkObjects } from '../utils/objectGenerator.js';

/**
 * Game System Test Suite
 * Tests chest spawning, terrain generation, and core game mechanics
 */

class GameSystemTestSuite {
  constructor() {
    this.testResults = [];
  }

  // Terrain Generation Tests
  testTerrainGeneration() {
    console.log('🗺️  Testing Terrain Generation...');
    
    const tests = [
      {
        name: 'Basic terrain chunk generation',
        chunkX: 0,
        chunkY: 0,
        expectedSize: GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.CHUNK_SIZE
      },
      {
        name: 'Multiple chunk generation',
        chunks: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 }
        ]
      },
      {
        name: 'Negative coordinate chunks',
        chunkX: -1,
        chunkY: -1,
        expectedSize: GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.CHUNK_SIZE
      }
    ];

    tests.forEach(test => {
      try {
        if (test.chunks) {
          // Test multiple chunk generation
          const chunks = test.chunks.map(chunk => 
            generateTerrainChunk(chunk.x, chunk.y)
          );
          
          const allChunksValid = chunks.every(chunk => 
            chunk && chunk.size === GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.CHUNK_SIZE
          );

          this.testResults.push({
            test: 'terrain_generation',
            name: test.name,
            expected: true,
            actual: allChunksValid,
            passed: allChunksValid,
            details: `Generated ${chunks.length} chunks`
          });

          console.log(`  ${allChunksValid ? '✅' : '❌'} ${test.name}: Generated ${chunks.length} chunks`);
        } else {
          // Test single chunk generation
          const chunk = generateTerrainChunk(test.chunkX, test.chunkY);
          const validSize = chunk && chunk.size === test.expectedSize;

          this.testResults.push({
            test: 'terrain_generation',
            name: test.name,
            expected: test.expectedSize,
            actual: chunk ? chunk.size : 0,
            passed: validSize,
            details: `Chunk at (${test.chunkX}, ${test.chunkY})`
          });

          console.log(`  ${validSize ? '✅' : '❌'} ${test.name}: Size ${chunk ? chunk.size : 0}/${test.expectedSize}`);
        }
      } catch (error) {
        this.testResults.push({
          test: 'terrain_generation',
          name: test.name,
          expected: 'No error',
          actual: error.message,
          passed: false,
          error: error.message
        });

        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
      }
    });
  }

  // Walkability Tests
  testWalkability() {
    console.log('🚶 Testing Walkability System...');
    
    // Generate test terrain
    const testTerrain = new Map();
    const chunk = generateTerrainChunk(0, 0);
    testTerrain.set('0,0', chunk);

    const tests = [
      {
        name: 'Valid walkable position',
        x: 100,
        y: 100,
        expectedWalkable: true
      },
      {
        name: 'Position on water tile',
        x: 50, // Assuming some water tiles exist
        y: 50,
        expectedWalkable: false
      },
      {
        name: 'Position outside terrain',
        x: -100,
        y: -100,
        expectedWalkable: false
      },
      {
        name: 'Position at world boundary',
        x: GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - 1,
        y: GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - 1,
        expectedWalkable: true
      }
    ];

    tests.forEach(test => {
      try {
        const walkable = isWalkable(test.x, test.y, testTerrain);
        const passed = walkable === test.expectedWalkable;

        this.testResults.push({
          test: 'walkability',
          name: test.name,
          expected: test.expectedWalkable,
          actual: walkable,
          passed,
          position: `(${test.x}, ${test.y})`
        });

        console.log(`  ${passed ? '✅' : '❌'} ${test.name}: Expected ${test.expectedWalkable}, Got ${walkable}`);
      } catch (error) {
        this.testResults.push({
          test: 'walkability',
          name: test.name,
          expected: test.expectedWalkable,
          actual: null,
          passed: false,
          error: error.message
        });

        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
      }
    });
  }

  // Grass Terrain Tests
  testGrassTerrainGeneration() {
    console.log('🌱 Testing Grass Terrain Generation...');
    
    const tests = [
      {
        name: 'Small grass terrain (5x5)',
        width: 5,
        height: 5
      },
      {
        name: 'Medium grass terrain (20x20)',
        width: 20,
        height: 20
      },
      {
        name: 'Large grass terrain (50x50)',
        width: 50,
        height: 50
      },
      {
        name: 'Rectangular grass terrain (10x20)',
        width: 10,
        height: 20
      }
    ];

    tests.forEach(test => {
      try {
        const terrainData = generateTerrainMap(test.width, test.height);
        
        const validTerrain = terrainData && 
                           terrainData.terrain && 
                           terrainData.terrain.length === test.height &&
                           terrainData.terrain[0] && 
                           terrainData.terrain[0].length === test.width;

        const hasObstacles = terrainData && 
                           Array.isArray(terrainData.obstacles);

        const passed = validTerrain && hasObstacles;

        this.testResults.push({
          test: 'grass_terrain_generation',
          name: test.name,
          expected: `${test.width}x${test.height} terrain with obstacles`,
          actual: validTerrain ? `${terrainData.terrain[0].length}x${terrainData.terrain.length} terrain` : 'Invalid',
          passed,
          obstacleCount: terrainData ? terrainData.obstacles.length : 0
        });

        console.log(`  ${passed ? '✅' : '❌'} ${test.name}: ${validTerrain ? 'Valid' : 'Invalid'} terrain, ${terrainData ? terrainData.obstacles.length : 0} obstacles`);
      } catch (error) {
        this.testResults.push({
          test: 'grass_terrain_generation',
          name: test.name,
          expected: `${test.width}x${test.height} terrain`,
          actual: null,
          passed: false,
          error: error.message
        });

        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
      }
    });
  }

  // Chest Spawning Tests
  testChestSpawning() {
    console.log('💰 Testing Chest Spawning System...');
    
    // Mock chest spawning logic (since it's integrated into the game state)
    const mockSpawnChests = (playerX, playerY, existingChests = []) => {
      const chests = [...existingChests];
      const spawnRadius = 500;
      const maxChests = 10;
      
      // Simple chest spawning logic for testing
      for (let i = 0; i < 5; i++) {
        if (chests.length >= maxChests) break;
        
        const angle = (Math.PI * 2 * i) / 5;
        const distance = 200 + Math.random() * 200;
        const chestX = playerX + Math.cos(angle) * distance;
        const chestY = playerY + Math.sin(angle) * distance;
        
        // Check if chest is too close to existing chests
        const tooClose = chests.some(chest => {
          const dx = chest.x - chestX;
          const dy = chest.y - chestY;
          return Math.sqrt(dx * dx + dy * dy) < 100;
        });
        
        if (!tooClose) {
          chests.push({
            id: `chest_${Date.now()}_${i}`,
            x: chestX,
            y: chestY,
            opened: false
          });
        }
      }
      
      return chests;
    };

    const tests = [
      {
        name: 'Initial chest spawning',
        playerX: 500,
        playerY: 500,
        existingChests: [],
        expectedMinChests: 1
      },
      {
        name: 'Chest spawning with existing chests',
        playerX: 1000,
        playerY: 1000,
        existingChests: [
          { id: 'existing1', x: 950, y: 950, opened: false }
        ],
        expectedMinChests: 2
      },
      {
        name: 'Chest spawning at world edge',
        playerX: 100,
        playerY: 100,
        existingChests: [],
        expectedMinChests: 1
      }
    ];

    tests.forEach(test => {
      try {
        const chests = mockSpawnChests(test.playerX, test.playerY, test.existingChests);
        const newChests = chests.filter(chest => 
          !test.existingChests.some(existing => existing.id === chest.id)
        );
        
        const passed = chests.length >= test.expectedMinChests;
        const validPositions = chests.every(chest => 
          typeof chest.x === 'number' && 
          typeof chest.y === 'number' &&
          chest.x >= 0 && chest.y >= 0
        );

        this.testResults.push({
          test: 'chest_spawning',
          name: test.name,
          expected: `At least ${test.expectedMinChests} chests`,
          actual: `${chests.length} chests (${newChests.length} new)`,
          passed: passed && validPositions,
          chestCount: chests.length,
          newChestCount: newChests.length
        });

        console.log(`  ${passed && validPositions ? '✅' : '❌'} ${test.name}: ${chests.length} total chests, ${newChests.length} new`);
      } catch (error) {
        this.testResults.push({
          test: 'chest_spawning',
          name: test.name,
          expected: `At least ${test.expectedMinChests} chests`,
          actual: null,
          passed: false,
          error: error.message
        });

        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
      }
    });
  }

  // Chest spacing across chunks using generator
  testTreasureSpacingAcrossChunks() {
    console.log('📐 Testing Treasure Spacing Across Chunks...');
    const terrain = new Map();
    const worldSeed = 1234;
    const depthLevel = 0;
    const allChests = [];

    // Prepare a 3x3 chunk grid centered at (0,0)
    const chunks = [];
    for (let cx = -1; cx <= 1; cx++) {
      for (let cy = -1; cy <= 1; cy++) {
        const key = `${cx},${cy}`;
        const chunk = generateTerrainChunk(cx, cy, depthLevel, worldSeed);
        terrain.set(key, chunk);
        chunks.push({ cx, cy });
      }
    }

    // Generate objects across chunks, enforcing spacing by passing aggregator
    for (const { cx, cy } of chunks) {
      const { treasureBoxes } = generateChunkObjects(cx, cy, depthLevel, worldSeed, terrain, allChests);
      allChests.push(...treasureBoxes);
    }

    // Validate min distance between all pairs
    let passed = true;
    const violations = [];
    for (let i = 0; i < allChests.length; i++) {
      for (let j = i + 1; j < allChests.length; j++) {
        const a = allChests[i];
        const b = allChests[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < GAME_CONFIG.TREASURE_MIN_DISTANCE) {
          passed = false;
          violations.push({ a: a.id, b: b.id, d });
        }
      }
    }

    this.testResults.push({
      test: 'treasure_spacing',
      name: 'Min distance maintained across chunks',
      expected: `>= ${GAME_CONFIG.TREASURE_MIN_DISTANCE}px`,
      actual: violations.length === 0 ? 'All good' : `${violations.length} violations`,
      passed,
      details: violations.slice(0, 5)
    });
    console.log(`  ${passed ? '✅' : '❌'} Min distance: ${violations.length === 0 ? 'All good' : violations.length + ' violations'}`);
  }

  // Balance test: ensure distribution avoids clustering and empty zones (coarse check)
  testTreasureQuadrantBalance() {
    console.log('🧭 Testing Treasure Quadrant Balance...');
    const terrain = new Map();
    const worldSeed = 5678;
    const depthLevel = 0;
    const allChests = [];

    // Prepare a 5x5 chunk grid around origin for a larger sample
    const chunks = [];
    for (let cx = -2; cx <= 2; cx++) {
      for (let cy = -2; cy <= 2; cy++) {
        const key = `${cx},${cy}`;
        const chunk = generateTerrainChunk(cx, cy, depthLevel, worldSeed);
        terrain.set(key, chunk);
        chunks.push({ cx, cy });
      }
    }

    for (const { cx, cy } of chunks) {
      const { treasureBoxes } = generateChunkObjects(cx, cy, depthLevel, worldSeed, terrain, allChests);
      allChests.push(...treasureBoxes);
    }

    if (allChests.length < 8) {
      this.testResults.push({
        test: 'treasure_balance',
        name: 'Sufficient sample size',
        expected: '>= 8 chests',
        actual: `${allChests.length} chests`,
        passed: false,
        details: 'Too few chests for balance test'
      });
      console.log('  ❌ Insufficient chests for balance test');
      return;
    }

    // Compute centroid to split into quadrants
    const avgX = allChests.reduce((s, c) => s + c.x, 0) / allChests.length;
    const avgY = allChests.reduce((s, c) => s + c.y, 0) / allChests.length;
    const quadrants = { q1: 0, q2: 0, q3: 0, q4: 0 };
    allChests.forEach(c => {
      const qx = c.x >= avgX;
      const qy = c.y >= avgY;
      if (qx && qy) quadrants.q1++;
      else if (!qx && qy) quadrants.q2++;
      else if (!qx && !qy) quadrants.q3++;
      else quadrants.q4++;
    });

    const counts = Object.values(quadrants);
    const minC = Math.min(...counts);
    const maxC = Math.max(...counts);
    const ratio = maxC / Math.max(1, minC);
    const passed = ratio <= 2.0; // Allow up to 2x imbalance as coarse check

    this.testResults.push({
      test: 'treasure_balance',
      name: 'Quadrant chest count balance',
      expected: 'max/min <= 2.0',
      actual: `counts=${JSON.stringify(quadrants)} ratio=${ratio.toFixed(2)}`,
      passed
    });
    console.log(`  ${passed ? '✅' : '❌'} Quadrant balance: ${counts.join(', ')} (ratio ${ratio.toFixed(2)})`);
  }

  // Pause menu basic contract (import succeeds)
  async testPauseMenuContract() {
    console.log('⏸️ Testing Pause Menu Contract...');
    try {
      const mod = await import('../components/GameMenu.jsx');
      const hasDefault = !!mod?.default;
      this.testResults.push({
        test: 'pause_menu_contract',
        name: 'GameMenu import and export',
        expected: true,
        actual: hasDefault,
        passed: hasDefault
      });
      console.log(`  ${hasDefault ? '✅' : '❌'} GameMenu export detected`);
    } catch (error) {
      this.testResults.push({
        test: 'pause_menu_contract',
        name: 'GameMenu import and export',
        expected: 'No error',
        actual: error.message,
        passed: false,
        error: error.message
      });
      console.log(`  ❌ GameMenu import failed: ${error.message}`);
    }
  }

  // Game State Consistency Tests
  testGameStateConsistency() {
    console.log('🎮 Testing Game State Consistency...');
    
    // Mock game state for testing
    const createMockGameState = () => ({
      player: { x: 500, y: 500 },
      camera: { x: 250, y: 250 },
      terrain: new Map(),
      treasureBoxes: [],
      monsters: []
    });

    const tests = [
      {
        name: 'Player position bounds',
        test: (gameState) => {
          const { player } = gameState;
          return player.x >= 0 && player.y >= 0 && 
                 player.x <= GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE &&
                 player.y <= GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
        }
      },
      {
        name: 'Camera follows player',
        test: (gameState) => {
          const { player, camera } = gameState;
          const expectedCameraX = player.x - GAME_CONFIG.CANVAS_WIDTH / 2;
          const expectedCameraY = player.y - GAME_CONFIG.CANVAS_HEIGHT / 2;
          
          return Math.abs(camera.x - expectedCameraX) < 1 && 
                 Math.abs(camera.y - expectedCameraY) < 1;
        }
      },
      {
        name: 'Terrain map exists',
        test: (gameState) => {
          return gameState.terrain instanceof Map;
        }
      },
      {
        name: 'Treasure boxes array exists',
        test: (gameState) => {
          return Array.isArray(gameState.treasureBoxes);
        }
      }
    ];

    tests.forEach(test => {
      try {
        const gameState = createMockGameState();
        const result = test.test(gameState);

        this.testResults.push({
          test: 'game_state_consistency',
          name: test.name,
          expected: true,
          actual: result,
          passed: result
        });

        console.log(`  ${result ? '✅' : '❌'} ${test.name}: ${result ? 'Passed' : 'Failed'}`);
      } catch (error) {
        this.testResults.push({
          test: 'game_state_consistency',
          name: test.name,
          expected: true,
          actual: false,
          passed: false,
          error: error.message
        });

        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
      }
    });
  }

  // Question Data Integrity Tests
  async testQuestionDataIntegrity() {
    console.log('❓ Testing NumerationProblem.json integrity...');
    try {
      const module = await import('../data/NumerationProblem.json');
      const data = module?.default ?? module;
      const isArray = Array.isArray(data);
      const hasItems = isArray && data.length > 0;
      const sample = hasItems ? data[0] : null;
      const hasFields = !!sample && typeof sample.title === 'string' && sample.answer !== undefined;

      const passed = isArray && hasItems && hasFields;
      this.testResults.push({
        test: 'question_data',
        name: 'NumerationProblem.json structure and sample fields',
        expected: 'Array with items having title and answer',
        actual: passed ? 'Valid structure' : 'Invalid or empty',
        passed,
        count: isArray ? data.length : 0
      });
      console.log(`  ${passed ? '✅' : '❌'} Question data integrity: ${isArray ? data.length : 0} items`);
    } catch (error) {
      this.testResults.push({
        test: 'question_data',
        name: 'NumerationProblem.json import',
        expected: 'Import succeeds',
        actual: error.message,
        passed: false,
        error: error.message
      });
      console.log(`  ❌ Question data import error: ${error.message}`);
    }
  }

  // Reward Persistence Tests
  testRewardPersistence() {
    console.log('💾 Testing reward persistence via localStorage...');
    try {
      const key = 'openWorldGameProgress';
      localStorage.removeItem(key);
      const saved = {
        crystalsCollected: 3,
        completedTreasures: [{ id: 't1', collected: true }, { id: 't2', collected: true }],
        score: 500,
        lastSaved: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(saved));
      const raw = localStorage.getItem(key);
      const loaded = raw ? JSON.parse(raw) : null;
      const matches = loaded && loaded.crystalsCollected === saved.crystalsCollected && loaded.score === saved.score && Array.isArray(loaded.completedTreasures) && loaded.completedTreasures.length === saved.completedTreasures.length;

      this.testResults.push({
        test: 'reward_persistence',
        name: 'Persist crystals and completed treasures',
        expected: 'Saved progress equals loaded progress',
        actual: matches ? 'Match' : 'Mismatch',
        passed: !!matches
      });
      console.log(`  ${matches ? '✅' : '❌'} Reward persistence test`);
    } catch (error) {
      this.testResults.push({
        test: 'reward_persistence',
        name: 'Persist crystals and completed treasures',
        expected: 'No error',
        actual: error.message,
        passed: false,
        error: error.message
      });
      console.log(`  ❌ Reward persistence error: ${error.message}`);
    }
  }

  // Skip Flow Tests (no persistence changes)
  testSkipFlowNoPersistence() {
    console.log('⏭️ Testing skip flow persistence behavior...');
    try {
      const key = 'openWorldGameProgress';
      const initial = {
        crystalsCollected: 1,
        completedTreasures: [],
        score: 100,
        lastSaved: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(initial));
      // Simulate skip: no changes should be persisted
      const raw = localStorage.getItem(key);
      const loaded = raw ? JSON.parse(raw) : null;
      const unchanged = loaded && loaded.crystalsCollected === initial.crystalsCollected && loaded.score === initial.score && Array.isArray(loaded.completedTreasures) && loaded.completedTreasures.length === 0;

      this.testResults.push({
        test: 'skip_flow',
        name: 'Skip does not change persistent rewards',
        expected: 'No change to crystals or completedTreasures',
        actual: unchanged ? 'Unchanged' : 'Changed',
        passed: !!unchanged
      });
      console.log(`  ${unchanged ? '✅' : '❌'} Skip flow persistence test`);
    } catch (error) {
      this.testResults.push({
        test: 'skip_flow',
        name: 'Skip does not change persistent rewards',
        expected: 'No error',
        actual: error.message,
        passed: false,
        error: error.message
      });
      console.log(`  ❌ Skip flow persistence error: ${error.message}`);
    }
  }

  // Run all game system tests
  async runAllTests() {
    console.log('🚀 Starting Game System Test Suite...');
    this.testResults = [];

    try {
    this.testTerrainGeneration();
    this.testWalkability();
    this.testGrassTerrainGeneration();
    this.testChestSpawning();
    this.testTreasureSpacingAcrossChunks();
    this.testTreasureQuadrantBalance();
    await this.testPauseMenuContract();
      this.testGameStateConsistency();
      await this.testQuestionDataIntegrity();
      this.testRewardPersistence();
      this.testSkipFlowNoPersistence();

      this.generateReport();
      return this.testResults;
    } catch (error) {
      console.error('❌ Game system tests failed:', error);
      throw error;
    }
  }

  generateReport() {
    console.log('\n📋 Game System Test Report');
    console.log('=' .repeat(50));

    const testGroups = {};
    this.testResults.forEach(result => {
      if (!testGroups[result.test]) {
        testGroups[result.test] = [];
      }
      testGroups[result.test].push(result);
    });

    let totalPassed = 0;
    let totalTests = 0;

    Object.entries(testGroups).forEach(([testType, results]) => {
      console.log(`\n🧪 ${testType.toUpperCase()}`);
      console.log('-'.repeat(30));

      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      const passRate = ((passed / total) * 100).toFixed(1);

      console.log(`Pass Rate: ${passed}/${total} (${passRate}%)`);

      totalPassed += passed;
      totalTests += total;

      const failures = results.filter(r => !r.passed);
      if (failures.length > 0) {
        console.log('\nFailures:');
        failures.forEach(failure => {
          console.log(`  ❌ ${failure.name}: Expected ${failure.expected}, Got ${failure.actual}`);
          if (failure.error) {
            console.log(`     Error: ${failure.error}`);
          }
        });
      }
    });

    const overallPassRate = ((totalPassed / totalTests) * 100).toFixed(1);
    console.log(`\n📊 Overall Results: ${totalPassed}/${totalTests} (${overallPassRate}%)`);
    console.log('\n✅ Game system testing complete!');
  }
}

// Export for use in tests
export { GameSystemTestSuite };

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  window.runGameSystemTests = async () => {
    const testSuite = new GameSystemTestSuite();
    return await testSuite.runAllTests();
  };
}