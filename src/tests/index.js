/**
 * Math Game Testing Framework
 * Comprehensive testing suite for performance, collision detection, and game systems
 */

// Import all test suites
import { PerformanceTestSuite } from './performanceTests.js';
import { CollisionTestSuite } from './collisionTests.js';
import { GameSystemTestSuite } from './gameSystemTests.js';
import { TestRunner } from './testRunner.js';
import * as MovementTests from './movementTest.js';

// Export all test suites and runner
export {
  PerformanceTestSuite,
  CollisionTestSuite,
  GameSystemTestSuite,
  TestRunner,
  MovementTests
};

// Convenience functions for quick testing
export const runAllTests = async () => {
  const runner = new TestRunner();
  return await runner.runAllTests();
};

export const runPerformanceTests = async () => {
  const suite = new PerformanceTestSuite();
  return await suite.runAllTests();
};

export const runCollisionTests = async () => {
  const suite = new CollisionTestSuite();
  return await suite.runAllTests();
};

export const runGameSystemTests = async () => {
  const suite = new GameSystemTestSuite();
  return await suite.runAllTests();
};

export const runMovementTests = async () => {
  return await MovementTests.runAllTests?.();
};

export const runBenchmarks = async () => {
  const runner = new TestRunner();
  return await runner.runBenchmarks();
};

// Test configuration
export const TEST_CONFIG = {
  // Performance test thresholds
  PERFORMANCE_THRESHOLDS: {
    COLLISION_DETECTION_MS: 16, // 60 FPS target
    RENDERING_MS: 16,
    MEMORY_MB: 100,
    MIN_FPS: 30
  },
  
  // Test data sizes
  TEST_SIZES: {
    SMALL: 100,
    MEDIUM: 1000,
    LARGE: 10000
  },
  
  // Test iterations
  ITERATIONS: {
    PERFORMANCE: 100,
    STRESS: 1000,
    BENCHMARK: 10
  }
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Make testing functions globally available in development
  window.mathGameTests = {
    runAllTests,
    runPerformanceTests,
    runCollisionTests,
    runGameSystemTests,
    runMovementTests,
    runBenchmarks,
    TestRunner,
    PerformanceTestSuite,
    CollisionTestSuite,
    GameSystemTestSuite,
    MovementTests
  };

  // Add console commands
  console.log('🧪 Math Game Testing Framework loaded!');
  console.log('Available commands:');
  console.log('  - mathGameTests.runAllTests()');
  console.log('  - mathGameTests.runPerformanceTests()');
  console.log('  - mathGameTests.runCollisionTests()');
  console.log('  - mathGameTests.runGameSystemTests()');
  console.log('  - mathGameTests.runMovementTests()');
  console.log('  - mathGameTests.runBenchmarks()');
}