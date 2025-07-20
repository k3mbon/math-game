// Sprout Lands Asset Loader
// This utility manages loading and accessing the Sprout Lands inspired assets

import React, { useState, useEffect } from 'react';

// Asset paths for downloaded pixel art assets (using public directory paths)
const ASSET_PATHS = {
  characters: {
    player: '/assets/terrain/Characters/Basic Charakter Spritesheet.png',
    king: '/assets/characters/kings-and-pigs/01-King Human/Idle (78x58).png',
    pig: '/assets/characters/kings-and-pigs/03-Pig/Idle (34x28).png'
  },
  terrain: {
    grass: '/assets/terrain/Tilesets/Grass.png',
    water: '/assets/terrain/Tilesets/Water.png',
    hills: '/assets/terrain/Tilesets/Hills.png',
    dirt: '/assets/terrain/Tilesets/Tilled_Dirt.png'
  },
  items: {
    coin: '/assets/characters/kings-and-pigs/12-Live and Coins/Small Diamond (18x14).png',
    gem: '/assets/items/Resources/Resources/G_Idle.png',
    chest: '/assets/terrain/Objects/Chest.png',
    big_diamond: '/assets/characters/kings-and-pigs/12-Live and Coins/Big Diamond Idle (18x14).png',
    heart: '/assets/characters/kings-and-pigs/12-Live and Coins/Small Heart Idle (18x14).png'
  },
  decorations: {
    tree: '/assets/items/Resources/Trees/Tree.png',
    plants: '/assets/terrain/Objects/Basic_Plants.png',
    sheep: '/assets/items/Resources/Sheep/HappySheep_Idle.png'
  },
  buildings: {
    wooden_house: '/assets/terrain/Tilesets/Wooden_House_Walls_Tilset.png',
    roof: '/assets/terrain/Tilesets/Wooden_House_Roof_Tilset.png',
    bridge: '/assets/terrain/Objects/Wood_Bridge.png',
    gold_mine: '/assets/items/Resources/Gold Mine/GoldMine_Active.png'
  },
  ui: {
    icons: {
      regular: '/assets/items/UI/Icons/Regular_01.png',
      pressed: '/assets/items/UI/Icons/Pressed_01.png',
      disabled: '/assets/items/UI/Icons/Disable_01.png'
    },
    banners: '/assets/items/UI/Banners/Banner_Connection_Down.png'
  },
  effects: {
    explosion: '/assets/items/Effects/Explosion/Explosions.png',
    fire: '/assets/items/Effects/Fire/Fire.png'
  }
};

// Asset collections organized by category (for backward compatibility)
export const SPROUT_LANDS_ASSETS = ASSET_PATHS;

// Asset loading utility
export class SproutLandsAssetLoader {
  constructor() {
    this.loadedImages = new Map();
    this.loadingPromises = new Map();
  }

  // Load an image asset and return a promise
  loadImage(src) {
    if (this.loadedImages.has(src)) {
      return Promise.resolve(this.loadedImages.get(src));
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Load all assets in a category
  async loadCategory(category) {
    const assets = SPROUT_LANDS_ASSETS[category];
    if (!assets) {
      throw new Error(`Unknown asset category: ${category}`);
    }

    const loadPromises = Object.entries(assets).map(async ([key, value]) => {
      if (typeof value === 'string') {
        // Direct image path
        const img = await this.loadImage(value);
        return [key, img];
      } else if (typeof value === 'object' && value !== null) {
        // Nested object with multiple assets
        const nestedPromises = Object.entries(value).map(async ([nestedKey, src]) => {
          if (typeof src === 'string') {
            const img = await this.loadImage(src);
            return [nestedKey, img];
          }
          return [nestedKey, null];
        });
        const nestedResults = await Promise.all(nestedPromises);
        return [key, Object.fromEntries(nestedResults)];
      }
      return [key, null];
    });

    const results = await Promise.all(loadPromises);
    return Object.fromEntries(results);
  }

  // Load all assets
  async loadAllAssets() {
    const categories = Object.keys(SPROUT_LANDS_ASSETS);
    const loadPromises = categories.map(async (category) => {
      const assets = await this.loadCategory(category);
      return [category, assets];
    });

    const results = await Promise.all(loadPromises);
    return Object.fromEntries(results);
  }

  // Get a loaded image
  getImage(src) {
    return this.loadedImages.get(src);
  }

  // Check if an image is loaded
  isLoaded(src) {
    return this.loadedImages.has(src);
  }
}

// Create a singleton instance
export const sproutLandsLoader = new SproutLandsAssetLoader();

// Utility function to get asset path by category and name
export const getAssetPath = (category, name) => {
  const categoryAssets = SPROUT_LANDS_ASSETS[category];
  if (!categoryAssets) {
    console.warn(`Asset category '${category}' not found`);
    return null;
  }
  
  const asset = categoryAssets[name];
  if (!asset) {
    console.warn(`Asset '${name}' not found in category '${category}'`);
    return null;
  }
  
  return asset;
};

// React hook for loading Sprout Lands assets
export const useSproutLandsAssets = () => {
  const [assets, setAssets] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const loadedAssets = await sproutLandsLoader.loadAllAssets();
        setAssets(loadedAssets);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load Sprout Lands assets:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  return { assets, loading, error };
};