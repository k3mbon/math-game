// Simple loot generation system tuned by depth and world seed.
// Returns a normalized loot payload that the game state can apply.
// The system avoids heavy randomness for deterministic behavior per chest id.

import { GAME_CONFIG } from '../config/gameConfig';

// Deterministic pseudo-random from a string key
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rngFromKey(key) {
  let seed = hashString(String(key));
  return () => {
    // xorshift32
    seed ^= seed << 13; seed >>>= 0;
    seed ^= seed >> 17; seed >>>= 0;
    seed ^= seed << 5;  seed >>>= 0;
    return (seed >>> 0) / 0xFFFFFFFF;
  };
}

// Core loot table by depth level, lightly scaled
const BASE_LOOT_TABLE = [
  { coins: [10, 30], crystals: [0, 1], items: ['potion'] },
  { coins: [20, 50], crystals: [0, 2], items: ['potion', 'scroll'] },
  { coins: [30, 80], crystals: [1, 3], items: ['potion', 'scroll', 'elixir'] },
  { coins: [40, 120], crystals: [2, 4], items: ['potion', 'elixir'] },
  { coins: [60, 160], crystals: [3, 5], items: ['elixir'] }
];

export function generateLootForTreasure({ chestId, depthLevel = 0, worldSeed = '' }) {
  const idx = Math.max(0, Math.min(BASE_LOOT_TABLE.length - 1, depthLevel));
  const table = BASE_LOOT_TABLE[idx];
  const rand = rngFromKey(`${worldSeed}:${chestId}:${depthLevel}`);

  const coinsMin = table.coins[0];
  const coinsMax = table.coins[1];
  const crystalsMin = table.crystals[0];
  const crystalsMax = table.crystals[1];

  // sample integers within ranges
  const coins = Math.round(coinsMin + (coinsMax - coinsMin) * rand());
  const crystals = Math.round(crystalsMin + (crystalsMax - crystalsMin) * rand());

  // choose up to 1 item deterministically
  let item = null;
  if (table.items && table.items.length) {
    const i = Math.floor(rand() * table.items.length);
    item = table.items[i];
  }

  return {
    coins,
    crystals,
    items: item ? [item] : [],
    // convenience scoring hook; can be tuned later
    scoreDelta: coins + crystals * 50
  };
}

// Apply loot to game state (pure function helper)
export function applyLoot(prevState, loot) {
  const nextScore = (prevState.score || 0) + (loot.scoreDelta || 0);
  const nextCrystals = (prevState.crystalsCollected || 0) + (loot.crystals || 0);
  return {
    ...prevState,
    score: nextScore,
    crystalsCollected: nextCrystals,
    inventory: Array.isArray(prevState.inventory)
      ? [...prevState.inventory, ...loot.items]
      : [...(loot.items || [])]
  };
}