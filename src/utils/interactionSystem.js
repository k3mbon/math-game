// Enhanced interaction system for game objects
import { GAME_CONFIG } from '../config/gameConfig';

export class InteractionSystem {
  constructor() {
    this.interactionRadius = 60; // pixels
    this.interactionRadiusSquared = this.interactionRadius * this.interactionRadius;
    this.lastInteractionTime = 0;
    this.interactionCooldown = 100; // ms to prevent spam
  }

  // Check if player can interact with an object using optimized collision detection
  canInteract(playerX, playerY, objectX, objectY, objectWidth = GAME_CONFIG.TILE_SIZE, objectHeight = GAME_CONFIG.TILE_SIZE) {
    // Use center-to-center distance for accurate collision detection
    const playerCenterX = playerX + GAME_CONFIG.TILE_SIZE / 2;
    const playerCenterY = playerY + GAME_CONFIG.TILE_SIZE / 2;
    const objectCenterX = objectX + objectWidth / 2;
    const objectCenterY = objectY + objectHeight / 2;
    
    const dx = playerCenterX - objectCenterX;
    const dy = playerCenterY - objectCenterY;
    const distanceSquared = dx * dx + dy * dy;
    
    return distanceSquared <= this.interactionRadiusSquared;
  }

  // Check interaction with cooldown to prevent spam
  canInteractWithCooldown(playerX, playerY, objectX, objectY, objectWidth, objectHeight) {
    const currentTime = performance.now();
    if (currentTime - this.lastInteractionTime < this.interactionCooldown) {
      return false;
    }
    
    return this.canInteract(playerX, playerY, objectX, objectY, objectWidth, objectHeight);
  }

  // Mark interaction as occurred (for cooldown tracking)
  markInteraction() {
    this.lastInteractionTime = performance.now();
  }

  // Get all interactable objects within range
  getInteractableObjects(playerX, playerY, objects) {
    return objects.filter(obj => 
      !obj.collected && 
      this.canInteract(playerX, playerY, obj.x, obj.y, obj.width, obj.height)
    );
  }

  // Find the closest interactable object
  getClosestInteractable(playerX, playerY, objects) {
    let closest = null;
    let closestDistanceSquared = Infinity;
    
    const playerCenterX = playerX + GAME_CONFIG.TILE_SIZE / 2;
    const playerCenterY = playerY + GAME_CONFIG.TILE_SIZE / 2;
    
    for (const obj of objects) {
      if (obj.collected) continue;
      
      const objectCenterX = obj.x + (obj.width || GAME_CONFIG.TILE_SIZE) / 2;
      const objectCenterY = obj.y + (obj.height || GAME_CONFIG.TILE_SIZE) / 2;
      
      const dx = playerCenterX - objectCenterX;
      const dy = playerCenterY - objectCenterY;
      const distanceSquared = dx * dx + dy * dy;
      
      if (distanceSquared <= this.interactionRadiusSquared && distanceSquared < closestDistanceSquared) {
        closest = obj;
        closestDistanceSquared = distanceSquared;
      }
    }
    
    return closest;
  }

  // Update interaction radius (useful for different interaction types)
  setInteractionRadius(radius) {
    this.interactionRadius = radius;
    this.interactionRadiusSquared = radius * radius;
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
    setInteractionRadius: globalInteractionSystem.setInteractionRadius.bind(globalInteractionSystem),
    getInteractionRadius: globalInteractionSystem.getInteractionRadius.bind(globalInteractionSystem)
  };
};