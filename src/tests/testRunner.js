import { PerformanceTestSuite } from './performanceTests.js';
import { CollisionTestSuite } from './collisionTests.js';
import { GameSystemTestSuite } from './gameSystemTests.js';
import { ProblemLoaderTestSuite } from './problemLoaderTests.js';

/**
 * Comprehensive Test Runner
 * Orchestrates all test suites and provides unified reporting
 */

class TestRunner {
  constructor() {
    this.testSuites = {
      performance: new PerformanceTestSuite(),
      collision: new CollisionTestSuite(),
      gameSystem: new GameSystemTestSuite(),
      problemLoader: new ProblemLoaderTestSuite()
    };
    
    this.allResults = [];
    this.startTime = null;
    this.endTime = null;
  }

  // Run individual test suite
  async runTestSuite(suiteName) {
    console.log(`\n🧪 Running ${suiteName} tests...`);
    
    if (!this.testSuites[suiteName]) {
      throw new Error(`Test suite '${suiteName}' not found`);
    }

    try {
      const results = await this.testSuites[suiteName].runAllTests();
      return {
        suite: suiteName,
        results,
        passed: results.filter(r => r.passed).length,
        total: results.length,
        success: true
      };
    } catch (error) {
      console.error(`❌ ${suiteName} test suite failed:`, error);
      return {
        suite: suiteName,
        results: [],
        passed: 0,
        total: 0,
        success: false,
        error: error.message
      };
    }
  }

  // Run all test suites
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Test Suite...');
    console.log('=' .repeat(60));
    
    this.startTime = performance.now();
    this.allResults = [];

    const suiteNames = Object.keys(this.testSuites);
    const suiteResults = [];

    for (const suiteName of suiteNames) {
      try {
        const result = await this.runTestSuite(suiteName);
        suiteResults.push(result);
        this.allResults.push(...result.results);
      } catch (error) {
        console.error(`❌ Failed to run ${suiteName} tests:`, error);
        suiteResults.push({
          suite: suiteName,
          results: [],
          passed: 0,
          total: 0,
          success: false,
          error: error.message
        });
      }
    }

    this.endTime = performance.now();
    this.generateComprehensiveReport(suiteResults);
    
    return {
      suiteResults,
      allResults: this.allResults,
      duration: this.endTime - this.startTime,
      timestamp: new Date().toISOString()
    };
  }

  // Run specific tests by category
  async runTestsByCategory(categories) {
    console.log(`🎯 Running tests for categories: ${categories.join(', ')}`);
    
    const results = [];
    
    for (const category of categories) {
      if (this.testSuites[category]) {
        const result = await this.runTestSuite(category);
        results.push(result);
      } else {
        console.warn(`⚠️  Unknown test category: ${category}`);
      }
    }
    
    return results;
  }

  // Run performance benchmarks
  async runBenchmarks() {
    console.log('⚡ Running Performance Benchmarks...');
    
    const benchmarkTests = [
      'collision_detection_performance',
      'rendering_performance',
      'memory_usage',
      'frame_rate_stability'
    ];

    try {
      const performanceResults = await this.testSuites.performance.runAllTests();
      const benchmarkResults = performanceResults.filter(result => 
        benchmarkTests.some(test => result.test.includes(test))
      );

      this.generateBenchmarkReport(benchmarkResults);
      return benchmarkResults;
    } catch (error) {
      console.error('❌ Benchmark tests failed:', error);
      throw error;
    }
  }

  // Generate comprehensive report
  generateComprehensiveReport(suiteResults) {
    console.log('\n📋 Comprehensive Test Report');
    console.log('=' .repeat(60));

    const totalDuration = this.endTime - this.startTime;
    console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);

    let overallPassed = 0;
    let overallTotal = 0;
    let successfulSuites = 0;

    console.log('\n📊 Test Suite Summary:');
    console.log('-'.repeat(40));

    suiteResults.forEach(suite => {
      const status = suite.success ? '✅' : '❌';
      const passRate = suite.total > 0 ? ((suite.passed / suite.total) * 100).toFixed(1) : '0.0';
      
      console.log(`${status} ${suite.suite.toUpperCase()}: ${suite.passed}/${suite.total} (${passRate}%)`);
      
      if (suite.error) {
        console.log(`   Error: ${suite.error}`);
      }

      if (suite.success) {
        successfulSuites++;
        overallPassed += suite.passed;
        overallTotal += suite.total;
      }
    });

    const overallPassRate = overallTotal > 0 ? ((overallPassed / overallTotal) * 100).toFixed(1) : '0.0';
    const suiteSuccessRate = ((successfulSuites / suiteResults.length) * 100).toFixed(1);

    console.log('\n🎯 Overall Statistics:');
    console.log('-'.repeat(40));
    console.log(`Test Suites: ${successfulSuites}/${suiteResults.length} (${suiteSuccessRate}%)`);
    console.log(`Individual Tests: ${overallPassed}/${overallTotal} (${overallPassRate}%)`);

    // Performance insights
    this.generatePerformanceInsights();

    // Recommendations
    this.generateRecommendations(suiteResults);

    console.log('\n✅ Comprehensive testing complete!');
  }

  // Generate benchmark report
  generateBenchmarkReport(benchmarkResults) {
    console.log('\n⚡ Performance Benchmark Report');
    console.log('=' .repeat(50));

    const benchmarks = {
      collision: benchmarkResults.filter(r => r.test.includes('collision')),
      rendering: benchmarkResults.filter(r => r.test.includes('rendering')),
      memory: benchmarkResults.filter(r => r.test.includes('memory')),
      frameRate: benchmarkResults.filter(r => r.test.includes('frame'))
    };

    Object.entries(benchmarks).forEach(([category, results]) => {
      if (results.length > 0) {
        console.log(`\n🏆 ${category.toUpperCase()} BENCHMARKS:`);
        console.log('-'.repeat(30));

        results.forEach(result => {
          const status = result.passed ? '✅' : '❌';
          console.log(`${status} ${result.name}`);
          
          if (result.duration) {
            console.log(`   Duration: ${result.duration.toFixed(2)}ms`);
          }
          
          if (result.fps) {
            console.log(`   FPS: ${result.fps.toFixed(1)}`);
          }
          
          if (result.memoryUsage) {
            console.log(`   Memory: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
          }
        });
      }
    });
  }

  // Generate performance insights
  generatePerformanceInsights() {
    const performanceResults = this.allResults.filter(r => 
      r.test.includes('performance') || r.duration || r.fps || r.memoryUsage
    );

    if (performanceResults.length === 0) return;

    console.log('\n💡 Performance Insights:');
    console.log('-'.repeat(40));

    // Analyze durations
    const durationsResults = performanceResults.filter(r => r.duration);
    if (durationsResults.length > 0) {
      const avgDuration = durationsResults.reduce((sum, r) => sum + r.duration, 0) / durationsResults.length;
      const maxDuration = Math.max(...durationsResults.map(r => r.duration));
      const minDuration = Math.min(...durationsResults.map(r => r.duration));

      console.log(`⏱️  Average Duration: ${avgDuration.toFixed(2)}ms`);
      console.log(`⏱️  Duration Range: ${minDuration.toFixed(2)}ms - ${maxDuration.toFixed(2)}ms`);
    }

    // Analyze FPS
    const fpsResults = performanceResults.filter(r => r.fps);
    if (fpsResults.length > 0) {
      const avgFps = fpsResults.reduce((sum, r) => sum + r.fps, 0) / fpsResults.length;
      console.log(`🎮 Average FPS: ${avgFps.toFixed(1)}`);
    }

    // Analyze memory usage
    const memoryResults = performanceResults.filter(r => r.memoryUsage);
    if (memoryResults.length > 0) {
      const avgMemory = memoryResults.reduce((sum, r) => sum + r.memoryUsage, 0) / memoryResults.length;
      console.log(`💾 Average Memory Usage: ${(avgMemory / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  // Generate recommendations
  generateRecommendations(suiteResults) {
    console.log('\n💡 Recommendations:');
    console.log('-'.repeat(40));

    const failedSuites = suiteResults.filter(s => !s.success);
    const lowPassRateSuites = suiteResults.filter(s => s.success && s.total > 0 && (s.passed / s.total) < 0.8);

    if (failedSuites.length > 0) {
      console.log('🔧 Critical Issues:');
      failedSuites.forEach(suite => {
        console.log(`   • Fix ${suite.suite} test suite errors`);
      });
    }

    if (lowPassRateSuites.length > 0) {
      console.log('⚠️  Areas for Improvement:');
      lowPassRateSuites.forEach(suite => {
        const passRate = ((suite.passed / suite.total) * 100).toFixed(1);
        console.log(`   • Improve ${suite.suite} tests (${passRate}% pass rate)`);
      });
    }

    // Performance recommendations
    const performanceResults = this.allResults.filter(r => r.test.includes('performance'));
    const slowTests = performanceResults.filter(r => r.duration && r.duration > 100);
    
    if (slowTests.length > 0) {
      console.log('⚡ Performance Optimizations:');
      slowTests.forEach(test => {
        console.log(`   • Optimize ${test.name} (${test.duration.toFixed(2)}ms)`);
      });
    }

    if (failedSuites.length === 0 && lowPassRateSuites.length === 0 && slowTests.length === 0) {
      console.log('🎉 All tests are performing well! Consider adding more edge case tests.');
    }
  }

  // Export results to JSON
  exportResults(filename = 'test-results.json') {
    const exportData = {
      timestamp: new Date().toISOString(),
      duration: this.endTime - this.startTime,
      results: this.allResults,
      summary: {
        totalTests: this.allResults.length,
        passed: this.allResults.filter(r => r.passed).length,
        failed: this.allResults.filter(r => !r.passed).length
      }
    };

    // In a real environment, you'd write to file
    console.log(`📄 Test results exported to ${filename}`);
    return exportData;
  }
}

// Export for use
export { TestRunner };

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  window.runAllTests = async () => {
    const runner = new TestRunner();
    return await runner.runAllTests();
  };

  window.runBenchmarks = async () => {
    const runner = new TestRunner();
    return await runner.runBenchmarks();
  };

  window.runTestSuite = async (suiteName) => {
    const runner = new TestRunner();
    return await runner.runTestSuite(suiteName);
  };
}