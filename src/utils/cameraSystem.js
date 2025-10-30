/**
 * Camera System with Deadzone Optimization
 * Provides smooth camera movement with configurable deadzones for different screen sizes
 */

export class CameraSystem {
  constructor(config = {}) {
    this.config = {
      // Default deadzone as percentage of screen size
      deadzoneWidthPercent: 0.3,  // 30% of screen width
      deadzoneHeightPercent: 0.3, // 30% of screen height
      
      // Minimum deadzone sizes in pixels
      minDeadzoneWidth: 100,
      minDeadzoneHeight: 80,
      
      // Maximum deadzone sizes in pixels
      maxDeadzoneWidth: 300,
      maxDeadzoneHeight: 200,
      
      // Camera smoothing factors
      followLerpFactor: 0.15,     // When following player
      boundaryLerpFactor: 0.1,    // When at world boundaries
      
      // Screen size breakpoints for adaptive deadzones
      breakpoints: {
        small: { width: 600, deadzonePercent: 0.25 },
        medium: { width: 1200, deadzonePercent: 0.3 },
        large: { width: 1920, deadzonePercent: 0.35 }
      },
      
      ...config
    };
    
    this.currentDeadzone = this.calculateDeadzone(800, 600); // Default canvas size
  }
  
  /**
   * Calculate optimal deadzone size based on screen dimensions
   */
  calculateDeadzone(canvasWidth, canvasHeight) {
    // Determine screen size category
    let deadzonePercent = this.config.deadzoneWidthPercent;
    
    for (const [size, breakpoint] of Object.entries(this.config.breakpoints)) {
      if (canvasWidth <= breakpoint.width) {
        deadzonePercent = breakpoint.deadzonePercent;
        break;
      }
    }
    
    // Calculate deadzone dimensions
    let deadzoneWidth = canvasWidth * deadzonePercent;
    let deadzoneHeight = canvasHeight * deadzonePercent;
    
    // Apply min/max constraints
    deadzoneWidth = Math.max(
      this.config.minDeadzoneWidth,
      Math.min(this.config.maxDeadzoneWidth, deadzoneWidth)
    );
    
    deadzoneHeight = Math.max(
      this.config.minDeadzoneHeight,
      Math.min(this.config.maxDeadzoneHeight, deadzoneHeight)
    );
    
    return {
      width: deadzoneWidth,
      height: deadzoneHeight,
      halfWidth: deadzoneWidth / 2,
      halfHeight: deadzoneHeight / 2
    };
  }
  
  /**
   * Update camera position with deadzone logic
   */
  updateCamera(playerX, playerY, currentCameraX, currentCameraY, canvasWidth, canvasHeight, worldBounds) {
    // Update deadzone if canvas size changed
    this.currentDeadzone = this.calculateDeadzone(canvasWidth, canvasHeight);
    
    // Calculate player position relative to camera center
    const cameraCenterX = currentCameraX + canvasWidth / 2;
    const cameraCenterY = currentCameraY + canvasHeight / 2;
    
    // Calculate deadzone boundaries
    const deadzoneLeft = cameraCenterX - this.currentDeadzone.halfWidth;
    const deadzoneRight = cameraCenterX + this.currentDeadzone.halfWidth;
    const deadzoneTop = cameraCenterY - this.currentDeadzone.halfHeight;
    const deadzoneBottom = cameraCenterY + this.currentDeadzone.halfHeight;
    
    // Determine ideal camera position
    let idealCameraX = currentCameraX;
    let idealCameraY = currentCameraY;
    
    // Check if player is outside deadzone horizontally
    if (playerX < deadzoneLeft) {
      idealCameraX = playerX - canvasWidth / 2 + this.currentDeadzone.halfWidth;
    } else if (playerX > deadzoneRight) {
      idealCameraX = playerX - canvasWidth / 2 - this.currentDeadzone.halfWidth;
    }
    
    // Check if player is outside deadzone vertically
    if (playerY < deadzoneTop) {
      idealCameraY = playerY - canvasHeight / 2 + this.currentDeadzone.halfHeight;
    } else if (playerY > deadzoneBottom) {
      idealCameraY = playerY - canvasHeight / 2 - this.currentDeadzone.halfHeight;
    }
    
    // Apply world boundaries
    const minCameraX = worldBounds.minX || 0;
    const maxCameraX = worldBounds.maxX || (worldBounds.worldWidth - canvasWidth);
    const minCameraY = worldBounds.minY || 0;
    const maxCameraY = worldBounds.maxY || (worldBounds.worldHeight - canvasHeight);
    
    // Clamp camera to world boundaries
    idealCameraX = Math.max(minCameraX, Math.min(maxCameraX, idealCameraX));
    idealCameraY = Math.max(minCameraY, Math.min(maxCameraY, idealCameraY));
    
    // Check if camera is at boundaries
    const isAtBoundary = {
      left: idealCameraX <= minCameraX,
      right: idealCameraX >= maxCameraX,
      top: idealCameraY <= minCameraY,
      bottom: idealCameraY >= maxCameraY
    };
    
    // Choose appropriate lerp factor
    const lerpFactor = (isAtBoundary.left || isAtBoundary.right || isAtBoundary.top || isAtBoundary.bottom)
      ? this.config.boundaryLerpFactor
      : this.config.followLerpFactor;
    
    // Apply smooth interpolation
    const newCameraX = currentCameraX + (idealCameraX - currentCameraX) * lerpFactor;
    const newCameraY = currentCameraY + (idealCameraY - currentCameraY) * lerpFactor;
    
    return {
      x: newCameraX,
      y: newCameraY,
      atBoundary: isAtBoundary,
      deadzone: this.currentDeadzone,
      // Debug info
      debug: {
        playerInDeadzone: {
          x: playerX >= deadzoneLeft && playerX <= deadzoneRight,
          y: playerY >= deadzoneTop && playerY <= deadzoneBottom
        },
        deadzoneRect: {
          left: deadzoneLeft,
          right: deadzoneRight,
          top: deadzoneTop,
          bottom: deadzoneBottom
        }
      }
    };
  }
  
  /**
   * Get current deadzone info for debugging/UI
   */
  getDeadzoneInfo() {
    return {
      ...this.currentDeadzone,
      config: this.config
    };
  }
  
  /**
   * Update camera configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global camera system instance
export const globalCameraSystem = new CameraSystem();

// React hook for using the camera system
export const useCameraSystem = (config = {}) => {
  const cameraSystem = new CameraSystem(config);
  
  return {
    updateCamera: cameraSystem.updateCamera.bind(cameraSystem),
    getDeadzoneInfo: cameraSystem.getDeadzoneInfo.bind(cameraSystem),
    updateConfig: cameraSystem.updateConfig.bind(cameraSystem)
  };
};