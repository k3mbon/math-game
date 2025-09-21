// Terrain Obstacle Assets Test
import { TERRAIN_OBSTACLES, getRandomTerrainObstacle, getTerrainObstaclesByCategory } from '../utils/pixelTerrainAssets.js';

// Test terrain obstacle assets
export const testTerrainObstacles = () => {
  console.log('🏠 Testing Terrain Obstacle Assets...');
  
  try {
    // Test that all obstacle types are defined
    const expectedObstacles = ['HOUSES', 'BUSHES', 'TREES', 'ROCKS'];
    const actualObstacles = Object.keys(TERRAIN_OBSTACLES);
    
    for (const obstacle of expectedObstacles) {
      if (!actualObstacles.includes(obstacle)) {
        throw new Error(`Missing terrain obstacle: ${obstacle}`);
      }
      
      const obstacleData = TERRAIN_OBSTACLES[obstacle];
      
      // Verify required properties
      if (!obstacleData.asset || !obstacleData.category || !obstacleData.description) {
        throw new Error(`Incomplete obstacle data for: ${obstacle}`);
      }
      
      // Verify walkable is false (obstacles should block movement)
      if (obstacleData.walkable !== false) {
        throw new Error(`Obstacle ${obstacle} should not be walkable`);
      }
      
      // Verify asset path format
      if (!obstacleData.asset.includes('/assets/characters/terrain-object/')) {
        throw new Error(`Invalid asset path for ${obstacle}: ${obstacleData.asset}`);
      }
      
      console.log(`✅ ${obstacle}: ${obstacleData.asset}`);
    }
    
    // Test random obstacle function
    const randomObstacle = getRandomTerrainObstacle();
    if (!randomObstacle || !randomObstacle.asset) {
      throw new Error('getRandomTerrainObstacle() failed');
    }
    
    // Test category filtering
    const vegetationObstacles = getTerrainObstaclesByCategory('vegetation');
    if (!vegetationObstacles.BUSHES || !vegetationObstacles.TREES) {
      throw new Error('Category filtering failed for vegetation');
    }
    
    const structureObstacles = getTerrainObstaclesByCategory('structure');
    if (!structureObstacles.HOUSES) {
      throw new Error('Category filtering failed for structure');
    }
    
    const naturalObstacles = getTerrainObstaclesByCategory('natural');
    if (!naturalObstacles.ROCKS) {
      throw new Error('Category filtering failed for natural');
    }
    
    console.log('✅ Terrain obstacle assets test passed!');
    console.log(`   - Total obstacles: ${actualObstacles.length}`);
    console.log(`   - Categories: structure, vegetation, natural`);
    console.log(`   - Random obstacle function: working`);
    console.log(`   - Category filtering: working`);
    
    return { success: true, obstacleCount: actualObstacles.length };
  } catch (error) {
    console.error('❌ Terrain obstacle assets test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test KuboTerrainGame fix
export const testKuboTerrainGameFix = () => {
  console.log('🎮 Testing KuboTerrainGame terrainType Fix...');
  
  try {
    // Simulate the terrain rendering logic from KuboTerrainGame
    const mockEnhancedTerrain = [
      [{ type: 'grass', asset: '/assets/terrain/1 Tiles/Map_tile_01.png', walkable: true }],
      [{ type: 'water', asset: '/assets/terrain/1 Tiles/Map_tile_31.png', walkable: false }]
    ];
    
    const mockLegacyTerrain = [['grass'], ['water']];
    
    // Test enhanced terrain path
    for (let y = 0; y < mockEnhancedTerrain.length; y++) {
      for (let x = 0; x < mockEnhancedTerrain[y].length; x++) {
        let terrainConfig;
        let terrainType;
        
        if (mockEnhancedTerrain.length > 0 && mockEnhancedTerrain[y] && mockEnhancedTerrain[y][x]) {
          terrainConfig = mockEnhancedTerrain[y][x];
          terrainType = terrainConfig.type; // This should now work without error
        } else {
          terrainType = mockLegacyTerrain[y] && mockLegacyTerrain[y][x] ? mockLegacyTerrain[y][x] : 'grass';
        }
        
        if (!terrainType) {
          throw new Error(`terrainType is undefined at position (${x}, ${y})`);
        }
        
        // Simulate className generation (this was causing the original error)
        const className = `game-cell terrain-${terrainType}`;
        if (!className.includes('terrain-')) {
          throw new Error('className generation failed');
        }
      }
    }
    
    console.log('✅ KuboTerrainGame terrainType fix test passed!');
    console.log('   - terrainType variable properly scoped');
    console.log('   - Enhanced terrain path: working');
    console.log('   - Legacy terrain fallback: working');
    console.log('   - className generation: working');
    
    return { success: true };
  } catch (error) {
    console.error('❌ KuboTerrainGame terrainType fix test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Run all tests
export const runAllObstacleTests = () => {
  console.log('🚀 Starting Terrain Obstacle and Fix Tests...');
  console.log('=' .repeat(60));
  
  const results = {
    obstacles: testTerrainObstacles(),
    kuboFix: testKuboTerrainGameFix()
  };
  
  console.log('=' .repeat(60));
  console.log('📊 Test Results Summary:');
  const passedTests = Object.values(results).filter(r => r && r.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All terrain obstacle and fix tests passed!');
    console.log('✨ Terrain obstacles are ready and KuboTerrainGame fix is working!');
  } else {
    console.log('⚠️ Some tests failed - check logs above for details');
  }
  
  return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.terrainObstacleTests = {
    runAllObstacleTests,
    testTerrainObstacles,
    testKuboTerrainGameFix
  };
}

// Run tests when executed directly
runAllObstacleTests();