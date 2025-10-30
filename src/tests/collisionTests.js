import { PhysicsWorld, SpatialHashGrid, CollisionSystem } from '../utils/physicsOptimizer';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Collision System Test Suite
 * Tests collision detection accuracy, edge cases, and performance
 */

class CollisionTestSuite {
  constructor() {
    this.testResults = [];
    this.physicsWorld = new PhysicsWorld();
    this.spatialGrid = new SpatialHashGrid(64); // 64px cell size
    this.collisionSystem = new CollisionSystem();
  }

  // Basic collision detection tests
  testBasicCollisions() {
    console.log('🔍 Testing Basic Collision Detection...');
    
    const tests = [
      {
        name: 'No Collision',
        obj1: { x: 0, y: 0, width: 32, height: 32 },
        obj2: { x: 50, y: 50, width: 32, height: 32 },
        expected: false
      },
      {
        name: 'Perfect Overlap',
        obj1: { x: 0, y: 0, width: 32, height: 32 },
        obj2: { x: 0, y: 0, width: 32, height: 32 },
        expected: true
      },
      {
        name: 'Partial Overlap',
        obj1: { x: 0, y: 0, width: 32, height: 32 },
        obj2: { x: 16, y: 16, width: 32, height: 32 },
        expected: true
      },
      {
        name: 'Edge Touch',
        obj1: { x: 0, y: 0, width: 32, height: 32 },
        obj2: { x: 32, y: 0, width: 32, height: 32 },
        expected: false // Touching edges should not be collision
      },
      {
        name: 'Corner Touch',
        obj1: { x: 0, y: 0, width: 32, height: 32 },
        obj2: { x: 32, y: 32, width: 32, height: 32 },
        expected: false
      }
    ];

    tests.forEach(test => {
      const result = this.collisionSystem.checkCollision(
        test.obj1.x, test.obj1.y, test.obj1.width, test.obj1.height,
        test.obj2.x, test.obj2.y, test.obj2.width, test.obj2.height
      );

      const passed = result === test.expected;
      this.testResults.push({
        test: 'basic_collision',
        name: test.name,
        expected: test.expected,
        actual: result,
        passed
      });

      console.log(`  ${passed ? '✅' : '❌'} ${test.name}: Expected ${test.expected}, Got ${result}`);
    });
  }

  // Spatial hash grid tests
  testSpatialHashGrid() {
    console.log('🗂️  Testing Spatial Hash Grid...');
    
    // Test object insertion and retrieval
    const grid = new SpatialHashGrid(64);
    
    // Add objects to grid
    const objects = [
      { id: 'obj1', x: 10, y: 10, width: 32, height: 32 },
      { id: 'obj2', x: 70, y: 70, width: 32, height: 32 },
      { id: 'obj3', x: 15, y: 15, width: 32, height: 32 }, // Should be in same cell as obj1
      { id: 'obj4', x: 200, y: 200, width: 32, height: 32 }
    ];

    objects.forEach(obj => {
      grid.insert(obj.id, obj.x, obj.y, obj.width, obj.height);
    });

    // Test nearby object retrieval
    const nearbyObj1 = grid.getNearbyObjects(10, 10, 32, 32);
    const nearbyObj2 = grid.getNearbyObjects(70, 70, 32, 32);
    const nearbyObj4 = grid.getNearbyObjects(200, 200, 32, 32);

    const tests = [
      {
        name: 'Nearby Objects for obj1',
        actual: nearbyObj1.length,
        expected: 2, // obj1 and obj3 should be nearby
        passed: nearbyObj1.length === 2 && nearbyObj1.includes('obj1') && nearbyObj1.includes('obj3')
      },
      {
        name: 'Nearby Objects for obj2',
        actual: nearbyObj2.length,
        expected: 1, // Only obj2 itself
        passed: nearbyObj2.length === 1 && nearbyObj2.includes('obj2')
      },
      {
        name: 'Nearby Objects for obj4',
        actual: nearbyObj4.length,
        expected: 1, // Only obj4 itself
        passed: nearbyObj4.length === 1 && nearbyObj4.includes('obj4')
      }
    ];

    tests.forEach(test => {
      this.testResults.push({
        test: 'spatial_hash_grid',
        name: test.name,
        expected: test.expected,
        actual: test.actual,
        passed: test.passed
      });

      console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}: Expected ${test.expected}, Got ${test.actual}`);
    });
  }

  // Physics world integration tests
  testPhysicsWorldIntegration() {
    console.log('🌍 Testing Physics World Integration...');
    
    const world = new PhysicsWorld();
    
    // Add test objects
    world.addDynamicObject('player', 100, 100, 32, 32);
    world.addStaticObject('wall1', 150, 100, 32, 32);
    world.addStaticObject('wall2', 50, 100, 32, 32);

    const tests = [
      {
        name: 'Move to empty space',
        action: () => world.moveObject('player', 100, 150, 32, 32),
        expectedCollision: false
      },
      {
        name: 'Move into wall (right)',
        action: () => world.moveObject('player', 150, 100, 32, 32),
        expectedCollision: true
      },
      {
        name: 'Move into wall (left)',
        action: () => world.moveObject('player', 50, 100, 32, 32),
        expectedCollision: true
      },
      {
        name: 'Move to edge of wall',
        action: () => world.moveObject('player', 118, 100, 32, 32), // Just touching
        expectedCollision: false
      }
    ];

    tests.forEach(test => {
      const result = test.action();
      const collided = result ? result.collided : false;
      const passed = collided === test.expectedCollision;

      this.testResults.push({
        test: 'physics_world_integration',
        name: test.name,
        expected: test.expectedCollision,
        actual: collided,
        passed
      });

      console.log(`  ${passed ? '✅' : '❌'} ${test.name}: Expected collision=${test.expectedCollision}, Got collision=${collided}`);
    });
  }

  // Performance stress tests
  async testCollisionPerformance() {
    console.log('⚡ Testing Collision Performance...');
    
    const objectCounts = [10, 50, 100, 500];
    
    for (const count of objectCounts) {
      const startTime = performance.now();
      
      // Create objects
      const objects = [];
      for (let i = 0; i < count; i++) {
        objects.push({
          id: `perf_obj_${i}`,
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          width: 32,
          height: 32
        });
      }

      // Add to physics world
      const world = new PhysicsWorld();
      objects.forEach(obj => {
        world.addDynamicObject(obj.id, obj.x, obj.y, obj.width, obj.height);
      });

      // Perform collision checks
      const iterations = 1000;
      for (let i = 0; i < iterations; i++) {
        const randomObj = objects[Math.floor(Math.random() * objects.length)];
        const newX = randomObj.x + (Math.random() - 0.5) * 20;
        const newY = randomObj.y + (Math.random() - 0.5) * 20;
        
        world.moveObject(randomObj.id, newX, newY, randomObj.width, randomObj.height);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;

      this.testResults.push({
        test: 'collision_performance',
        objectCount: count,
        iterations,
        totalTime,
        averageTime: avgTime,
        operationsPerSecond: 1000 / avgTime
      });

      console.log(`  📊 ${count} objects: ${avgTime.toFixed(3)}ms avg, ${(1000/avgTime).toFixed(0)} ops/sec`);
    }
  }

  // Edge case tests
  testEdgeCases() {
    console.log('🔬 Testing Edge Cases...');
    
    const tests = [
      {
        name: 'Zero-sized object',
        obj1: { x: 0, y: 0, width: 0, height: 0 },
        obj2: { x: 0, y: 0, width: 32, height: 32 },
        expected: false
      },
      {
        name: 'Negative coordinates',
        obj1: { x: -10, y: -10, width: 32, height: 32 },
        obj2: { x: 10, y: 10, width: 32, height: 32 },
        expected: true
      },
      {
        name: 'Very large objects',
        obj1: { x: 0, y: 0, width: 10000, height: 10000 },
        obj2: { x: 5000, y: 5000, width: 32, height: 32 },
        expected: true
      },
      {
        name: 'Floating point precision',
        obj1: { x: 0.1, y: 0.1, width: 32.7, height: 32.3 },
        obj2: { x: 16.5, y: 16.8, width: 32.1, height: 32.9 },
        expected: true
      }
    ];

    tests.forEach(test => {
      try {
        const result = this.collisionSystem.checkCollision(
          test.obj1.x, test.obj1.y, test.obj1.width, test.obj1.height,
          test.obj2.x, test.obj2.y, test.obj2.width, test.obj2.height
        );

        const passed = result === test.expected;
        this.testResults.push({
          test: 'edge_cases',
          name: test.name,
          expected: test.expected,
          actual: result,
          passed,
          error: null
        });

        console.log(`  ${passed ? '✅' : '❌'} ${test.name}: Expected ${test.expected}, Got ${result}`);
      } catch (error) {
        this.testResults.push({
          test: 'edge_cases',
          name: test.name,
          expected: test.expected,
          actual: null,
          passed: false,
          error: error.message
        });

        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
      }
    });
  }

  // Run all collision tests
  async runAllTests() {
    console.log('🚀 Starting Collision Test Suite...');
    this.testResults = [];

    try {
      this.testBasicCollisions();
      this.testSpatialHashGrid();
      this.testPhysicsWorldIntegration();
      await this.testCollisionPerformance();
      this.testEdgeCases();

      this.generateReport();
      return this.testResults;
    } catch (error) {
      console.error('❌ Collision tests failed:', error);
      throw error;
    }
  }

  generateReport() {
    console.log('\n📋 Collision Test Report');
    console.log('=' .repeat(50));

    const testGroups = {};
    this.testResults.forEach(result => {
      if (!testGroups[result.test]) {
        testGroups[result.test] = [];
      }
      testGroups[result.test].push(result);
    });

    Object.entries(testGroups).forEach(([testType, results]) => {
      console.log(`\n🧪 ${testType.toUpperCase()}`);
      console.log('-'.repeat(30));

      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      const passRate = ((passed / total) * 100).toFixed(1);

      console.log(`Pass Rate: ${passed}/${total} (${passRate}%)`);

      if (testType === 'collision_performance') {
        console.log('\nPerformance Results:');
        results.forEach(result => {
          console.log(`  ${result.objectCount} objects: ${result.averageTime.toFixed(3)}ms avg`);
        });
      } else {
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
      }
    });

    console.log('\n✅ Collision testing complete!');
  }
}

// Export for use in tests
export { CollisionTestSuite };

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  window.runCollisionTests = async () => {
    const testSuite = new CollisionTestSuite();
    return await testSuite.runAllTests();
  };
}