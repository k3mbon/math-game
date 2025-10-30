import { gameProfiler } from '../utils/performanceProfiler';
import { PhysicsWorld } from '../utils/physicsOptimizer';
import { RenderingOptimizer } from '../utils/renderingOptimizer';
import { ResourceManager } from '../utils/resourceManager';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Performance Testing Suite
 * Tests collision detection, rendering performance, and resource management
 */

class PerformanceTestSuite {
  constructor() {
    this.testResults = [];
    this.physicsWorld = new PhysicsWorld();
    this.renderingOptimizer = new RenderingOptimizer();
    this.resourceManager = new ResourceManager();
  }

  // Collision Detection Performance Tests
  async testCollisionPerformance() {
    console.log('🧪 Starting Collision Performance Tests...');
    
    const testCases = [
      { objects: 10, iterations: 1000 },
      { objects: 50, iterations: 1000 },
      { objects: 100, iterations: 1000 },
      { objects: 500, iterations: 100 }
    ];

    for (const testCase of testCases) {
      const result = await this.runCollisionTest(testCase.objects, testCase.iterations);
      this.testResults.push({
        test: 'collision_detection',
        objects: testCase.objects,
        iterations: testCase.iterations,
        ...result
      });
    }
  }

  async runCollisionTest(objectCount, iterations) {
    // Setup test objects
    const objects = [];
    for (let i = 0; i < objectCount; i++) {
      objects.push({
        id: `obj_${i}`,
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        width: 32,
        height: 32
      });
    }

    // Add objects to physics world
    objects.forEach(obj => {
      this.physicsWorld.addDynamicObject(obj.id, obj.x, obj.y, obj.width, obj.height);
    });

    // Measure collision detection performance
    gameProfiler.startTimer('collision_test');
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      // Test random movements
      const randomObj = objects[Math.floor(Math.random() * objects.length)];
      const newX = randomObj.x + (Math.random() - 0.5) * 10;
      const newY = randomObj.y + (Math.random() - 0.5) * 10;
      
      this.physicsWorld.moveObject(randomObj.id, newX, newY, randomObj.width, randomObj.height);
    }

    const endTime = performance.now();
    gameProfiler.endTimer('collision_test');

    return {
      totalTime: endTime - startTime,
      averageTime: (endTime - startTime) / iterations,
      fps: 1000 / ((endTime - startTime) / iterations)
    };
  }

  // Rendering Performance Tests
  async testRenderingPerformance() {
    console.log('🎨 Starting Rendering Performance Tests...');
    
    const canvas = document.createElement('canvas');
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    const testCases = [
      { sprites: 100, frames: 60 },
      { sprites: 500, frames: 60 },
      { sprites: 1000, frames: 30 },
      { sprites: 2000, frames: 30 }
    ];

    for (const testCase of testCases) {
      const result = await this.runRenderingTest(ctx, testCase.sprites, testCase.frames);
      this.testResults.push({
        test: 'rendering_performance',
        sprites: testCase.sprites,
        frames: testCase.frames,
        ...result
      });
    }
  }

  async runRenderingTest(ctx, spriteCount, frameCount) {
    // Create test sprites
    const sprites = [];
    for (let i = 0; i < spriteCount; i++) {
      sprites.push({
        x: Math.random() * ctx.canvas.width,
        y: Math.random() * ctx.canvas.height,
        width: 32,
        height: 32,
        color: `hsl(${Math.random() * 360}, 50%, 50%)`
      });
    }

    gameProfiler.startTimer('rendering_test');
    const startTime = performance.now();

    for (let frame = 0; frame < frameCount; frame++) {
      // Clear canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Render sprites with optimization
      this.renderingOptimizer.optimizedRender(() => {
        sprites.forEach(sprite => {
          ctx.fillStyle = sprite.color;
          ctx.fillRect(sprite.x, sprite.y, sprite.width, sprite.height);
        });
      });

      // Simulate frame delay
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
    }

    const endTime = performance.now();
    gameProfiler.endTimer('rendering_test');

    return {
      totalTime: endTime - startTime,
      averageFrameTime: (endTime - startTime) / frameCount,
      fps: 1000 / ((endTime - startTime) / frameCount)
    };
  }

  // Memory Usage Tests
  async testMemoryUsage() {
    console.log('💾 Starting Memory Usage Tests...');
    
    const initialMemory = this.getMemoryUsage();
    
    // Test asset loading and caching
    const assets = [];
    for (let i = 0; i < 100; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = `hsl(${i * 3.6}, 50%, 50%)`;
      ctx.fillRect(0, 0, 64, 64);
      
      assets.push(canvas);
      this.resourceManager.cacheAsset(`test_asset_${i}`, canvas);
    }

    const peakMemory = this.getMemoryUsage();
    
    // Trigger garbage collection
    this.resourceManager.cleanup();
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalMemory = this.getMemoryUsage();

    this.testResults.push({
      test: 'memory_usage',
      initialMemory,
      peakMemory,
      finalMemory,
      memoryIncrease: peakMemory - initialMemory,
      memoryRecovered: peakMemory - finalMemory
    });
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }

  // Frame Rate Stability Tests
  async testFrameRateStability() {
    console.log('📊 Starting Frame Rate Stability Tests...');
    
    const frameTimes = [];
    const testDuration = 5000; // 5 seconds
    const startTime = performance.now();

    while (performance.now() - startTime < testDuration) {
      const frameStart = performance.now();
      
      // Simulate game loop work
      await this.simulateGameWork();
      
      const frameEnd = performance.now();
      frameTimes.push(frameEnd - frameStart);
      
      // Wait for next frame
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const minFrameTime = Math.min(...frameTimes);
    const maxFrameTime = Math.max(...frameTimes);
    const frameTimeVariance = this.calculateVariance(frameTimes);

    this.testResults.push({
      test: 'frame_rate_stability',
      averageFrameTime,
      minFrameTime,
      maxFrameTime,
      frameTimeVariance,
      averageFPS: 1000 / averageFrameTime,
      frameCount: frameTimes.length
    });
  }

  async simulateGameWork() {
    // Simulate collision detection
    for (let i = 0; i < 10; i++) {
      this.physicsWorld.moveObject('test_obj', Math.random() * 100, Math.random() * 100, 32, 32);
    }
    
    // Simulate rendering work
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(Math.random() * 100, Math.random() * 100, 10, 10);
    }
  }

  calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Performance Test Suite...');
    this.testResults = [];

    try {
      await this.testCollisionPerformance();
      await this.testRenderingPerformance();
      await this.testMemoryUsage();
      await this.testFrameRateStability();

      this.generateReport();
      return this.testResults;
    } catch (error) {
      console.error('❌ Performance tests failed:', error);
      throw error;
    }
  }

  generateReport() {
    console.log('\n📋 Performance Test Report');
    console.log('=' .repeat(50));

    this.testResults.forEach(result => {
      console.log(`\n🧪 ${result.test.toUpperCase()}`);
      console.log('-'.repeat(30));
      
      Object.entries(result).forEach(([key, value]) => {
        if (key !== 'test') {
          if (typeof value === 'number') {
            console.log(`${key}: ${value.toFixed(2)}`);
          } else if (typeof value === 'object') {
            console.log(`${key}:`, value);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
      });
    });

    // Performance recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 Performance Recommendations');
    console.log('=' .repeat(50));

    const collisionTests = this.testResults.filter(r => r.test === 'collision_detection');
    const renderingTests = this.testResults.filter(r => r.test === 'rendering_performance');
    const memoryTest = this.testResults.find(r => r.test === 'memory_usage');
    const frameRateTest = this.testResults.find(r => r.test === 'frame_rate_stability');

    // Collision performance recommendations
    if (collisionTests.length > 0) {
      const worstCollisionTest = collisionTests.reduce((worst, current) => 
        current.averageTime > worst.averageTime ? current : worst
      );
      
      if (worstCollisionTest.fps < 30) {
        console.log('⚠️  Collision detection performance is poor with many objects');
        console.log('   Consider implementing spatial partitioning or reducing collision checks');
      }
    }

    // Rendering performance recommendations
    if (renderingTests.length > 0) {
      const worstRenderingTest = renderingTests.reduce((worst, current) => 
        current.fps < worst.fps ? current : worst
      );
      
      if (worstRenderingTest.fps < 30) {
        console.log('⚠️  Rendering performance drops with many sprites');
        console.log('   Consider implementing object culling or sprite batching');
      }
    }

    // Memory usage recommendations
    if (memoryTest && memoryTest.memoryRecovered < memoryTest.memoryIncrease * 0.5) {
      console.log('⚠️  Memory cleanup is not effective');
      console.log('   Review garbage collection and asset management strategies');
    }

    // Frame rate stability recommendations
    if (frameRateTest && frameRateTest.frameTimeVariance > 5) {
      console.log('⚠️  Frame rate is unstable');
      console.log('   Consider implementing frame rate limiting or optimizing game loop');
    }

    console.log('\n✅ Performance testing complete!');
  }
}

// Export for use in tests
export { PerformanceTestSuite };

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  window.runPerformanceTests = async () => {
    const testSuite = new PerformanceTestSuite();
    return await testSuite.runAllTests();
  };
}