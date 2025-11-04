// Simple test to verify movement detection improvements
import { GAME_CONFIG } from '../config/gameConfig.js';

// Mock the checkWalkable function for testing
const checkWalkable = (x, y) => {
  // Simple mock - allow movement except in specific blocked areas
  const blockedX = 300;
  const blockedY = 300;
  const blockedRadius = 50;
  
  const distance = Math.sqrt(Math.pow(x - blockedX, 2) + Math.pow(y - blockedY, 2));
  return distance > blockedRadius;
};

// Test movement detection logic
export function testMovementDetection() {
  console.log('🎮 Testing Movement Detection System...\n');
  
  // Test data
  const testCases = [
    {
      name: 'Normal movement',
      startX: 100,
      startY: 100,
      inputX: 1,
      inputY: 0,
      moveSpeed: 5,
      expectedBlocked: false
    },
    {
      name: 'Movement into obstacle',
      startX: 280,
      startY: 300,
      inputX: 1,
      inputY: 0,
      moveSpeed: 25,
      expectedBlocked: true
    },
    {
      name: 'Diagonal movement',
      startX: 100,
      startY: 100,
      inputX: 0.707,
      inputY: 0.707,
      moveSpeed: 5,
      expectedBlocked: false
    },
    {
      name: 'Boundary movement',
      startX: 50,
      startY: 50,
      inputX: -1,
      inputY: -1,
      moveSpeed: 10,
      expectedBlocked: false
    },
    {
      name: 'Blocked diagonal, fallback horizontal succeeds',
      startX: 270,
      startY: 300,
      inputX: 0.707,
      inputY: 0.707,
      moveSpeed: 40,
      expectedBlocked: false
    },
    {
      name: 'Blocked diagonal, fallback vertical succeeds',
      startX: 300,
      startY: 270,
      inputX: 0.707,
      inputY: 0.707,
      moveSpeed: 40,
      expectedBlocked: false
    },
    {
      name: 'Blocked straight, reduced-step succeeds',
      startX: 260,
      startY: 300,
      inputX: 1,
      inputY: 0,
      moveSpeed: 80,
      expectedBlocked: false
    },
    {
      name: 'At left/top boundary clamp',
      startX: 5,
      startY: 5,
      inputX: -1,
      inputY: -1,
      moveSpeed: 20,
      expectedBlocked: false
    },
    {
      name: 'At right/bottom boundary clamp',
      startX: GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - 5,
      startY: GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - 5,
      inputX: 1,
      inputY: 1,
      moveSpeed: 20,
      expectedBlocked: false
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    
    const proposedX = testCase.startX + testCase.inputX * testCase.moveSpeed;
    const proposedY = testCase.startY + testCase.inputY * testCase.moveSpeed;
    
    // Calculate world boundaries
    const worldPixelSize = GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
    const playerHalfSize = GAME_CONFIG.PLAYER_SIZE / 2;
    const minBoundary = playerHalfSize;
    const maxBoundaryX = worldPixelSize - playerHalfSize;
    const maxBoundaryY = worldPixelSize - playerHalfSize;
    
    // Enhanced collision detection with multiple fallback strategies
    let finalX = proposedX;
    let finalY = proposedY;
    let movementBlocked = false;
    
    // First attempt: Check the proposed position
    if (!checkWalkable(proposedX, proposedY)) {
      movementBlocked = true;
      
      // Second attempt: Try horizontal movement only
      if (testCase.inputX !== 0) {
        const testX = testCase.startX + testCase.inputX * testCase.moveSpeed;
        const clampedTestX = Math.max(minBoundary, Math.min(maxBoundaryX, testX));
        if (checkWalkable(clampedTestX, testCase.startY)) {
          finalX = clampedTestX;
          finalY = testCase.startY;
          movementBlocked = false;
        }
      }
      
      // Third attempt: Try vertical movement only (if horizontal failed)
      if (movementBlocked && testCase.inputY !== 0) {
        const testY = testCase.startY + testCase.inputY * testCase.moveSpeed;
        const clampedTestY = Math.max(minBoundary, Math.min(maxBoundaryY, testY));
        if (checkWalkable(testCase.startX, clampedTestY)) {
          finalX = testCase.startX;
          finalY = clampedTestY;
          movementBlocked = false;
        }
      }
      
      // Fourth attempt: Try smaller steps (reduced movement)
      if (movementBlocked) {
        const reducedSpeed = testCase.moveSpeed * 0.5;
        const reducedX = testCase.startX + testCase.inputX * reducedSpeed;
        const reducedY = testCase.startY + testCase.inputY * reducedSpeed;
        
        if (checkWalkable(reducedX, reducedY)) {
          finalX = reducedX;
          finalY = reducedY;
          movementBlocked = false;
        }
      }
    }
    
    // Apply boundary constraints
    finalX = Math.max(minBoundary, Math.min(maxBoundaryX, finalX));
    finalY = Math.max(minBoundary, Math.min(maxBoundaryY, finalY));
    
    // Enhanced position tracking and validation
    const positionChanged = Math.abs(finalX - testCase.startX) > 0.1 || Math.abs(finalY - testCase.startY) > 0.1;
    
    console.log(`  Start position: (${testCase.startX}, ${testCase.startY})`);
    console.log(`  Proposed position: (${proposedX.toFixed(2)}, ${proposedY.toFixed(2)})`);
    console.log(`  Final position: (${finalX.toFixed(2)}, ${finalY.toFixed(2)})`);
    console.log(`  Movement blocked: ${movementBlocked}`);
    console.log(`  Position changed: ${positionChanged}`);
    
    const testPassed = movementBlocked === testCase.expectedBlocked;
    console.log(`  Result: ${testPassed ? '✅ PASS' : '❌ FAIL'}\n`);
    
    if (testPassed) {
      passedTests++;
    }
  });
  
  console.log(`\n📊 Movement Detection Test Results:`);
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All movement detection tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Review the movement detection logic.');
  }
}

// If run directly via dev helpers, expose runner
export async function runAllTests() {
  return testMovementDetection();
}