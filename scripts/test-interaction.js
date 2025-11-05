// ESM headless tests for chest interaction and facing logic
import { InteractionSystem } from '../src/utils/interactionSystem.js';
import { GAME_CONFIG } from '../src/config/gameConfig.js';

const logResult = (name, expected, actual) => {
  const passed = expected === actual;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`\nTest: ${name}`);
  console.log(`  Expected: ${expected}`);
  console.log(`  Actual:   ${actual}`);
  console.log(`  Result:   ${status}`);
  return passed;
};

async function runInteractionTests() {
  const interaction = new InteractionSystem();

  const player = { x: 500, y: 500 };
  const chestSize = GAME_CONFIG.TILE_SIZE; // default size

  let passed = 0;
  let total = 0;

  // 1) Within range, correct facing (right)
  total++;
  {
    const chest = { x: player.x + 60, y: player.y, width: chestSize, height: chestSize };
    const actual = interaction.canInteractFacing(player.x, player.y, 'right', chest.x, chest.y, chest.width, chest.height);
    if (logResult('Within range and facing right', true, actual)) passed++;
  }

  // 2) Within range, wrong facing (left)
  total++;
  {
    const chest = { x: player.x + 60, y: player.y, width: chestSize, height: chestSize };
    const actual = interaction.canInteractFacing(player.x, player.y, 'left', chest.x, chest.y, chest.width, chest.height);
    if (logResult('Within range but facing left (should fail)', false, actual)) passed++;
  }

  // 3) Out of range
  total++;
  {
    const chest = { x: player.x + 150, y: player.y, width: chestSize, height: chestSize };
    const actual = interaction.canInteractFacing(player.x, player.y, 'right', chest.x, chest.y, chest.width, chest.height);
    if (logResult('Out of range (should fail)', false, actual)) passed++;
  }

  // 4) Behind player (should fail)
  total++;
  {
    const chest = { x: player.x - 40, y: player.y, width: chestSize, height: chestSize };
    const actual = interaction.canInteractFacing(player.x, player.y, 'right', chest.x, chest.y, chest.width, chest.height);
    if (logResult('Within range but behind (should fail)', false, actual)) passed++;
  }

  // 5) Facing up, chest above (should pass)
  total++;
  {
    const chest = { x: player.x, y: player.y - 50, width: chestSize, height: chestSize };
    const actual = interaction.canInteractFacing(player.x, player.y, 'up', chest.x, chest.y, chest.width, chest.height);
    if (logResult('Facing up, chest above', true, actual)) passed++;
  }

  // 6) Facing up, chest diagonal up-right (within cone, should pass)
  total++;
  {
    const chest = { x: player.x + 40, y: player.y - 40, width: chestSize, height: chestSize };
    const actual = interaction.canInteractFacing(player.x, player.y, 'up', chest.x, chest.y, chest.width, chest.height);
    if (logResult('Facing up, chest diagonal up-right (within cone)', true, actual)) passed++;
  }

  // 7) Facing up, chest right (outside cone, should fail)
  total++;
  {
    const chest = { x: player.x + 70, y: player.y, width: chestSize, height: chestSize };
    const actual = interaction.canInteractFacing(player.x, player.y, 'up', chest.x, chest.y, chest.width, chest.height);
    if (logResult('Facing up, chest to the right (outside cone)', false, actual)) passed++;
  }

  // 8) Custom tighter cone tolerance (30°), diagonal should fail
  total++;
  {
    const chest = { x: player.x + 40, y: player.y - 40, width: chestSize, height: chestSize };
    const facingToleranceCos = Math.cos((30 * Math.PI) / 180); // ~0.866
    const actual = interaction.canInteractFacing(player.x, player.y, 'up', chest.x, chest.y, chest.width, chest.height, facingToleranceCos);
    if (logResult('Facing up, diagonal with tighter cone (30°) should fail', false, actual)) passed++;
  }

  // 9) Larger interaction radius allows further chest
  total++;
  {
    const chest = { x: player.x + 120, y: player.y, width: chestSize, height: chestSize };
    interaction.setInteractionRadius(130);
    const actual = interaction.canInteractFacing(player.x, player.y, 'right', chest.x, chest.y, chest.width, chest.height);
    if (logResult('Increased radius allows interaction further away', true, actual)) passed++;
  }

  console.log(`\n📊 Chest Interaction Test Results:\nPassed: ${passed}/${total}\nSuccess Rate: ${(passed / total * 100).toFixed(1)}%`);
}

runInteractionTests().catch(err => {
  console.error('Chest interaction tests failed with error:', err);
  process.exit(1);
});