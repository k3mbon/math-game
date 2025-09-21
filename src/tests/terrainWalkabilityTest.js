// Test file for enhanced terrain walkability functionality
import { 
  generateEnhancedTerrain, 
  convertToLegacyTerrain,
  enhancedTerrainGenerator
} from '../utils/enhancedTerrainGenerator.js';
import { ENHANCED_TERRAIN_TYPES } from '../utils/pixelTerrainAssets.js';

// Test configuration
const TEST_CONFIG = {
  width: 10,
  height: 8,
  startPos: { x: 1, y: 1 },
  targetPos: { x: 8, y: 6 }
};

// Test enhanced terrain generation
export const testEnhancedTerrainGeneration = () => {
  console.log('🧪 Testing Enhanced Terrain Generation...');
  
  try {
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
    
    // Verify terrain structure
    if (!enhancedTerrain || enhancedTerrain.length !== TEST_CONFIG.height) {
      throw new Error('Invalid terrain dimensions');
    }
    
    // Check each row
    for (let y = 0; y < TEST_CONFIG.height; y++) {
      if (!enhancedTerrain[y] || enhancedTerrain[y].length !== TEST_CONFIG.width) {
        throw new Error(`Invalid row ${y} dimensions`);
      }
      
      // Check each cell has required properties
      for (let x = 0; x < TEST_CONFIG.width; x++) {
        const cell = enhancedTerrain[y][x];
        if (!cell || typeof cell.walkable !== 'boolean' || !cell.asset || !cell.type) {
          throw new Error(`Invalid cell at (${x}, ${y}): missing required properties`);
        }
      }
    }
    
    console.log('✅ Enhanced terrain generation test passed');
    return { success: true, terrain: enhancedTerrain };
  } catch (error) {
    console.error('❌ Enhanced terrain generation test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test walkability functionality
export const testWalkabilityFunctionality = (enhancedTerrain) => {
  console.log('🧪 Testing Walkability Functionality...');
  
  try {
    let walkableCells = 0;
    let nonWalkableCells = 0;
    let collectibleCells = 0;
    
    // Count different cell types
    for (let y = 0; y < TEST_CONFIG.height; y++) {
      for (let x = 0; x < TEST_CONFIG.width; x++) {
        const cell = enhancedTerrain[y][x];
        
        if (cell.walkable) {
          walkableCells++;
        } else {
          nonWalkableCells++;
        }
        
        if (cell.collectible) {
          collectibleCells++;
        }
      }
    }
    
    // Verify we have a mix of walkable and non-walkable terrain
    if (walkableCells === 0) {
      throw new Error('No walkable cells found - terrain generation failed');
    }
    
    if (nonWalkableCells === 0) {
      console.warn('⚠️ No non-walkable cells found - terrain may be too simple');
    }
    
    // Test start and target positions are walkable
    const startCell = enhancedTerrain[TEST_CONFIG.startPos.y][TEST_CONFIG.startPos.x];
    const targetCell = enhancedTerrain[TEST_CONFIG.targetPos.y][TEST_CONFIG.targetPos.x];
    
    if (!startCell.walkable) {
      throw new Error('Start position is not walkable');
    }
    
    if (!targetCell.walkable) {
      throw new Error('Target position is not walkable');
    }
    
    console.log(`✅ Walkability test passed:`);
    console.log(`   - Walkable cells: ${walkableCells}`);
    console.log(`   - Non-walkable cells: ${nonWalkableCells}`);
    console.log(`   - Collectible cells: ${collectibleCells}`);
    console.log(`   - Start position walkable: ${startCell.walkable}`);
    console.log(`   - Target position walkable: ${targetCell.walkable}`);
    
    return { 
      success: true, 
      stats: { walkableCells, nonWalkableCells, collectibleCells }
    };
  } catch (error) {
    console.error('❌ Walkability test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test pathfinding functionality
export const testPathfindingFunctionality = (enhancedTerrain) => {
  console.log('🧪 Testing Pathfinding Functionality...');
  
  try {
    // Debug: Check start and target positions
    const startCell = enhancedTerrain[TEST_CONFIG.startPos.y][TEST_CONFIG.startPos.x];
    const targetCell = enhancedTerrain[TEST_CONFIG.targetPos.y][TEST_CONFIG.targetPos.x];
    
    console.log(`   - Start position (${TEST_CONFIG.startPos.x}, ${TEST_CONFIG.startPos.y}): ${startCell.type}, walkable: ${startCell.walkable}`);
    console.log(`   - Target position (${TEST_CONFIG.targetPos.x}, ${TEST_CONFIG.targetPos.y}): ${targetCell.type}, walkable: ${targetCell.walkable}`);
    
    const hasPath = enhancedTerrainGenerator.hasValidPath(
      enhancedTerrain, 
      TEST_CONFIG.startPos, 
      TEST_CONFIG.targetPos, 
      TEST_CONFIG.width, 
      TEST_CONFIG.height
    );
    
    if (!hasPath) {
      // Debug: Show terrain layout
      console.log('   - Terrain layout (W=walkable, X=blocked):');
      for (let y = 0; y < TEST_CONFIG.height; y++) {
        let row = '     ';
        for (let x = 0; x < TEST_CONFIG.width; x++) {
          if (x === TEST_CONFIG.startPos.x && y === TEST_CONFIG.startPos.y) {
            row += 'S';
          } else if (x === TEST_CONFIG.targetPos.x && y === TEST_CONFIG.targetPos.y) {
            row += 'T';
          } else {
            row += enhancedTerrain[y][x].walkable ? 'W' : 'X';
          }
        }
        console.log(row);
      }
      throw new Error('No valid path found between start and target positions');
    }
    
    console.log('✅ Pathfinding test passed: Valid path exists between start and target');
    return { success: true, hasPath: true };
  } catch (error) {
    console.error('❌ Pathfinding test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test terrain type consistency
export const testTerrainTypeConsistency = (enhancedTerrain) => {
  console.log('🧪 Testing Terrain Type Consistency...');
  
  try {
    const terrainTypes = new Set();
    const assetPaths = new Set();
    
    for (let y = 0; y < TEST_CONFIG.height; y++) {
      for (let x = 0; x < TEST_CONFIG.width; x++) {
        const cell = enhancedTerrain[y][x];
        terrainTypes.add(cell.type);
        assetPaths.add(cell.asset);
        
        // Verify terrain type exists in ENHANCED_TERRAIN_TYPES
        if (!ENHANCED_TERRAIN_TYPES[cell.type]) {
          throw new Error(`Unknown terrain type: ${cell.type}`);
        }
        
        // Verify asset path is valid
        if (!cell.asset || !cell.asset.includes('Map_tile_')) {
          throw new Error(`Invalid asset path: ${cell.asset}`);
        }
      }
    }
    
    console.log(`✅ Terrain type consistency test passed:`);
    console.log(`   - Unique terrain types: ${terrainTypes.size}`);
    console.log(`   - Unique assets used: ${assetPaths.size}`);
    console.log(`   - Terrain types found: ${Array.from(terrainTypes).join(', ')}`);
    
    return { 
      success: true, 
      stats: { 
        terrainTypes: Array.from(terrainTypes), 
        assetCount: assetPaths.size 
      }
    };
  } catch (error) {
    console.error('❌ Terrain type consistency test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Run all tests
export const runAllTerrainTests = () => {
  console.log('🚀 Starting Enhanced Terrain Walkability Tests...');
  console.log('=' .repeat(50));
  
  const results = {
    generation: null,
    walkability: null,
    pathfinding: null,
    consistency: null
  };
  
  // Test 1: Enhanced terrain generation
  const generationResult = testEnhancedTerrainGeneration();
  results.generation = generationResult;
  
  if (!generationResult.success) {
    console.log('❌ Stopping tests due to terrain generation failure');
    return results;
  }
  
  const enhancedTerrain = generationResult.terrain;
  
  // Test 2: Walkability functionality
  results.walkability = testWalkabilityFunctionality(enhancedTerrain);
  
  // Test 3: Pathfinding functionality
  results.pathfinding = testPathfindingFunctionality(enhancedTerrain);
  
  // Test 4: Terrain type consistency
  results.consistency = testTerrainTypeConsistency(enhancedTerrain);
  
  // Summary
  console.log('=' .repeat(50));
  console.log('📊 Test Results Summary:');
  const passedTests = Object.values(results).filter(r => r && r.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All enhanced terrain walkability tests passed!');
  } else {
    console.log('⚠️ Some tests failed - check logs above for details');
  }
  
  return results;
};

// Export for use in browser console or other test runners
if (typeof window !== 'undefined') {
  window.terrainTests = {
    runAllTerrainTests,
    testEnhancedTerrainGeneration,
    testWalkabilityFunctionality,
    testPathfindingFunctionality,
    testTerrainTypeConsistency
  };
}

// Run tests when executed directly
runAllTerrainTests();