// Enhanced interaction system for game objects
import { GAME_CONFIG } from '../config/gameConfig.js';

export class InteractionSystem {
  constructor() {
    // Make interaction distance configurable and centered around object/player positions
    this.interactionRadius = (GAME_CONFIG?.INTERACTION_RADIUS) ?? (GAME_CONFIG.TILE_SIZE * 2); // default ~2 tiles
    this.interactionRadiusSquared = this.interactionRadius * this.interactionRadius;
    this.lastInteractionTime = 0;
    // Use game-config cooldown if available, fallback to a small anti-spam delay
    this.interactionCooldown = (GAME_CONFIG?.INTERACTION_COOLDOWN) ?? 100; // ms
  }

  // Map direction string to forward unit vector
  getDirectionVector(direction) {
    switch (direction) {
      case 'up':
      case 'back':
        return { x: 0, y: -1 };
      case 'down':
      case 'front':
        return { x: 0, y: 1 };
      case 'left':
        return { x: -1, y: 0 };
      case 'right':
        return { x: 1, y: 0 };
      default:
        return { x: 0, y: 1 }; // default face down/front
    }
  }

  // Check if player can interact with an object using optimized collision detection
  canInteract(playerX, playerY, objectX, objectY, _objectWidth, _objectHeight) {
    // Positions are already treated as centers across the codebase
    const dx = playerX - objectX;
    const dy = playerY - objectY;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared <= this.interactionRadiusSquared;
  }

  // Check interaction with cooldown to prevent spam
  canInteractWithCooldown(playerX, playerY, objectX, objectY, _objectWidth, _objectHeight) {
    const currentTime = performance.now();
    if (currentTime - this.lastInteractionTime < this.interactionCooldown) {
      return false;
    }
    return this.canInteract(playerX, playerY, objectX, objectY, _objectWidth, _objectHeight);
  }

  // Mark interaction as occurred (for cooldown tracking)
  markInteraction() {
    this.lastInteractionTime = performance.now();
  }

  // Get all interactable objects within range
  getInteractableObjects(playerX, playerY, objects) {
    return objects.filter(obj => !obj.collected && this.canInteract(playerX, playerY, obj.x, obj.y));
  }

  // Find the closest interactable object
  getClosestInteractable(playerX, playerY, objects) {
    let closest = null;
    let closestDistanceSquared = Infinity;
    
    for (const obj of objects) {
      if (obj.collected) continue;
      const dx = playerX - obj.x;
      const dy = playerY - obj.y;
      const distanceSquared = dx * dx + dy * dy;
      
      if (distanceSquared <= this.interactionRadiusSquared && distanceSquared < closestDistanceSquared) {
        closest = obj;
        closestDistanceSquared = distanceSquared;
      }
    }
    
    return closest;
  }

  // Check if object lies within player's facing cone
  isFacing(playerX, playerY, playerDirection, objectX, objectY, _objectWidth, _objectHeight, facingToleranceCos = (GAME_CONFIG?.INTERACTION_FACING_COS ?? 0.35)) {
    const dx = objectX - playerX;
    const dy = objectY - playerY;
    const mag = Math.hypot(dx, dy) || 1; // avoid divide by zero
    const dir = this.getDirectionVector(playerDirection);
    const dot = (dx / mag) * dir.x + (dy / mag) * dir.y; // cos(angle)

    return dot >= facingToleranceCos; // within cone (e.g., 60° => cos ~ 0.5)
  }

  // Combined check: within interaction range AND within facing cone
  canInteractFacing(playerX, playerY, playerDirection, objectX, objectY, objectWidth, objectHeight, facingToleranceCos = (GAME_CONFIG?.INTERACTION_FACING_COS ?? 0.35)) {
    return this.canInteract(playerX, playerY, objectX, objectY, objectWidth, objectHeight) &&
           this.isFacing(playerX, playerY, playerDirection, objectX, objectY, objectWidth, objectHeight, facingToleranceCos);
  }

  // Update interaction radius (useful for different interaction types)
  setInteractionRadius(radius) {
    this.interactionRadius = radius;
    this.interactionRadiusSquared = radius * radius;
  }

  // Update interaction cooldown to match game configuration or context
  setInteractionCooldown(cooldownMs) {
    const v = Number(cooldownMs);
    if (!Number.isNaN(v) && v >= 0) {
      this.interactionCooldown = v;
    }
  }

  // Get interaction radius for UI purposes
  getInteractionRadius() {
    return this.interactionRadius;
  }
}

// Global interaction system instance
export const globalInteractionSystem = new InteractionSystem();

// Hook for using the interaction system in React components
export const useInteractionSystem = () => {
  return {
    canInteract: globalInteractionSystem.canInteract.bind(globalInteractionSystem),
    canInteractWithCooldown: globalInteractionSystem.canInteractWithCooldown.bind(globalInteractionSystem),
    markInteraction: globalInteractionSystem.markInteraction.bind(globalInteractionSystem),
    getInteractableObjects: globalInteractionSystem.getInteractableObjects.bind(globalInteractionSystem),
    getClosestInteractable: globalInteractionSystem.getClosestInteractable.bind(globalInteractionSystem),
    isFacing: globalInteractionSystem.isFacing.bind(globalInteractionSystem),
    canInteractFacing: globalInteractionSystem.canInteractFacing.bind(globalInteractionSystem),
    setInteractionRadius: globalInteractionSystem.setInteractionRadius.bind(globalInteractionSystem),
    setInteractionCooldown: globalInteractionSystem.setInteractionCooldown.bind(globalInteractionSystem),
    getInteractionRadius: globalInteractionSystem.getInteractionRadius.bind(globalInteractionSystem)
  };
};