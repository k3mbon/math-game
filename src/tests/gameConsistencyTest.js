// Game Consistency Test - Verify both Game1.jsx and KuboTerrainGame.jsx work with new pixel assets
import { generateEnhancedTerrain, enhancedTerrainGenerator } from '../utils/enhancedTerrainGenerator.js';
import { ENHANCED_TERRAIN_TYPES } from '../utils/pixelTerrainAssets.js';

// Test configuration
const TEST_CONFIG = {
  width: 10,
  height: 8,
  startPos: { x: 1, y: 1 },
  targetPos: { x: 8, y: 6 }
};

// Test Game1.jsx compatibility
export const testGame1Compatibility = () => {
  console.log('🎮 Testing Game1.jsx Compatibility...');
  
  try {
    // Generate enhanced terrain as Game1.jsx would
    const enhancedTerrain = generateEnhancedTerrain(
      TEST_CONFIG.width,
      TEST_CONFIG.height,
      TEST_CONFIG.startPos,
      TEST_CONFIG.targetPos,
      {
        useTransitions: true,
        biomeSize: 4,
        transitionWidth: 1,
        ensurePath: true
      }
    );
    
    // Verify terrain structure matches Game1.jsx expectations
    if (!enhancedTerrain || enhancedTerrain.length !== TEST_CONFIG.height) {
      throw new Error('Enhanced terrain dimensions invalid for Game1.jsx');
    }
    
    // Check that all cells have required properties for Game1.jsx rendering
    let validCells = 0;
    let walkableCells = 0;
    let collectibleCells = 0;
    
    for (let y = 0; y < TEST_CONFIG.height; y++) {
      for (let x = 0; x < TEST_CONFIG.width; x++) {
        const cell = enhancedTerrain[y][x];
        
        // Verify cell has all required properties
        if (cell && 
            typeof cell.walkable === 'boolean' && 
            typeof cell.collectible === 'boolean' && 
            cell.asset && 
            cell.type && 
            ENHANCED_TERRAIN_TYPES[cell.type]) {
          validCells++;
          if (cell.walkable) walkableCells++;
          if (cell.collectible) collectibleCells++;
        } else {
          throw new Error(`Invalid cell at (${x}, ${y}) for Game1.jsx`);
        }
      }
    }
    
    // Verify pathfinding works for Game1.jsx
    const hasPath = enhancedTerrainGenerator.hasValidPath(
      enhancedTerrain,
      TEST_CONFIG.startPos,
      TEST_CONFIG.targetPos,
      TEST_CONFIG.width,
      TEST_CONFIG.height
    );
    
    if (!hasPath) {
      throw new Error('No valid path found for Game1.jsx');
    }
    
    console.log('✅ Game1.jsx compatibility test passed:');
    console.log(`   - Valid cells: ${validCells}/${TEST_CONFIG.width * TEST_CONFIG.height}`);
    console.log(`   - Walkable cells: ${walkableCells}`);
    console.log(`   - Collectible cells: ${collectibleCells}`);
    console.log(`   - Valid path exists: ${hasPath}`);
    
    return { 
      success: true, 
      stats: { validCells, walkableCells, collectibleCells, hasPath }
    };
  } catch (error) {
    console.error('❌ Game1.jsx compatibility test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test KuboTerrainGame.jsx compatibility
export const testKuboTerrainGameCompatibility = () => {
  console.log('🤖 Testing KuboTerrainGame.jsx Compatibility...');
  
  try {
    // Generate enhanced terrain as KuboTerrainGame.jsx would
    const enhancedTerrain = generateEnhancedTerrain(
      TEST_CONFIG.width,
      TEST_CONFIG.height,
      TEST_CONFIG.startPos,
      TEST_CONFIG.targetPos,
      {
        useTransitions: true,
        biomeSize: 3,
        transitionWidth: 1,
        ensurePath: true
      }
    );
    
    // Test legacy terrain conversion (KuboTerrainGame.jsx uses both formats)
    const legacyTerrain = enhancedTerrain.map(row => 
      row.map(cell => cell ? cell.type : 'grass')
    );
    
    // Verify legacy terrain structure
    if (!legacyTerrain || legacyTerrain.length !== TEST_CONFIG.height) {
      throw new Error('Legacy terrain conversion failed for KuboTerrainGame.jsx');
    }
    
    // Check terrain rendering compatibility
    let validTerrainTypes = 0;
    let crystalCount = 0;
    const terrainTypesSeen = new Set();
    
    for (let y = 0; y < TEST_CONFIG.height; y++) {
      for (let x = 0; x < TEST_CONFIG.width; x++) {
        const enhancedCell = enhancedTerrain[y][x];
        const legacyType = legacyTerrain[y][x];
        
        // Verify consistency between enhanced and legacy formats
        if (enhancedCell.type !== legacyType) {
          throw new Error(`Terrain type mismatch at (${x}, ${y}): enhanced=${enhancedCell.type}, legacy=${legacyType}`);
        }
        
        // Verify terrain type is valid
        if (ENHANCED_TERRAIN_TYPES[legacyType]) {
          validTerrainTypes++;
          terrainTypesSeen.add(legacyType);
          
          if (enhancedCell.collectible) {
            crystalCount++;
          }
        } else {
          throw new Error(`Invalid terrain type for KuboTerrainGame.jsx: ${legacyType}`);
        }
      }
    }
    
    // Test collision detection logic (as used in KuboTerrainGame.jsx)
    const startCell = enhancedTerrain[TEST_CONFIG.startPos.y][TEST_CONFIG.startPos.x];
    const targetCell = enhancedTerrain[TEST_CONFIG.targetPos.y][TEST_CONFIG.targetPos.x];
    
    if (!startCell.walkable || !targetCell.walkable) {
      throw new Error('Start or target position not walkable in KuboTerrainGame.jsx');
    }
    
    console.log('✅ KuboTerrainGame.jsx compatibility test passed:');
    console.log(`   - Valid terrain types: ${validTerrainTypes}/${TEST_CONFIG.width * TEST_CONFIG.height}`);
    console.log(`   - Terrain types used: ${Array.from(terrainTypesSeen).join(', ')}`);
    console.log(`   - Crystal count: ${crystalCount}`);
    console.log(`   - Start/target walkable: ${startCell.walkable}/${targetCell.walkable}`);
    
    return { 
      success: true, 
      stats: { 
        validTerrainTypes, 
        terrainTypes: Array.from(terrainTypesSeen), 
        crystalCount,
        startWalkable: startCell.walkable,
        targetWalkable: targetCell.walkable
      }
    };
  } catch (error) {
    console.error('❌ KuboTerrainGame.jsx compatibility test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test visual consistency between games
export const testVisualConsistency = () => {
  console.log('🎨 Testing Visual Consistency...');
  
  try {
    // Generate terrain for both games
    const game1Terrain = generateEnhancedTerrain(
      TEST_CONFIG.width, TEST_CONFIG.height, 
      TEST_CONFIG.startPos, TEST_CONFIG.targetPos,
      { useTransitions: true, biomeSize: 4 }
    );
    
    const kuboTerrain = generateEnhancedTerrain(
      TEST_CONFIG.width, TEST_CONFIG.height, 
      TEST_CONFIG.startPos, TEST_CONFIG.targetPos,
      { useTransitions: true, biomeSize: 3 }
    );
    
    // Check that both use the same terrain types and asset system
    const game1Types = new Set();
    const kuboTypes = new Set();
    const game1Assets = new Set();
    const kuboAssets = new Set();
    
    // Collect terrain types and assets from both games
    [game1Terrain, kuboTerrain].forEach((terrain, gameIndex) => {
      const types = gameIndex === 0 ? game1Types : kuboTypes;
      const assets = gameIndex === 0 ? game1Assets : kuboAssets;
      
      terrain.forEach(row => {
        row.forEach(cell => {
          types.add(cell.type);
          assets.add(cell.asset);
        });
      });
    });
    
    // Verify both games use valid terrain types
    const allTypes = new Set([...game1Types, ...kuboTypes]);
    for (const type of allTypes) {
      if (!ENHANCED_TERRAIN_TYPES[type]) {
        throw new Error(`Invalid terrain type found: ${type}`);
      }
    }
    
    // Verify asset paths are consistent
    const allAssets = new Set([...game1Assets, ...kuboAssets]);
    for (const asset of allAssets) {
      if (!asset || !asset.includes('Map_tile_') || !asset.includes('.png')) {
        throw new Error(`Invalid asset path found: ${asset}`);
      }
    }
    
    console.log('✅ Visual consistency test passed:');
    console.log(`   - Game1 terrain types: ${game1Types.size} (${Array.from(game1Types).join(', ')})`);
    console.log(`   - Kubo terrain types: ${kuboTypes.size} (${Array.from(kuboTypes).join(', ')})`);
    console.log(`   - Total unique assets: ${allAssets.size}`);
    console.log(`   - All terrain types valid: ${allTypes.size} types`);
    
    return { 
      success: true, 
      stats: { 
        game1Types: Array.from(game1Types),
        kuboTypes: Array.from(kuboTypes),
        totalAssets: allAssets.size,
        validTypes: allTypes.size
      }
    };
  } catch (error) {
    console.error('❌ Visual consistency test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Run all game consistency tests
export const runAllGameConsistencyTests = () => {
  console.log('🚀 Starting Game Consistency Tests...');
  console.log('=' .repeat(60));
  
  const results = {
    game1: null,
    kubo: null,
    visual: null
  };
  
  // Test Game1.jsx compatibility
  results.game1 = testGame1Compatibility();
  
  // Test KuboTerrainGame.jsx compatibility
  results.kubo = testKuboTerrainGameCompatibility();
  
  // Test visual consistency
  results.visual = testVisualConsistency();
  
  // Summary
  console.log('=' .repeat(60));
  console.log('📊 Game Consistency Test Results Summary:');
  const passedTests = Object.values(results).filter(r => r && r.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All game consistency tests passed!');
    console.log('✨ Both games are fully compatible with the new pixel terrain assets!');
  } else {
    console.log('⚠️ Some consistency tests failed - check logs above for details');
  }
  
  return results;
};

// Export for use in browser console or other test runners
if (typeof window !== 'undefined') {
  window.gameConsistencyTests = {
    runAllGameConsistencyTests,
    testGame1Compatibility,
    testKuboTerrainGameCompatibility,
    testVisualConsistency
  };
}

// Run tests when executed directly
runAllGameConsistencyTests();