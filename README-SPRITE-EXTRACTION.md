# 🎮 Sprite Extraction Guide

This guide explains how to extract individual sprites from sprite sheets and use them in your game.

## 🚀 Quick Start

### Method 1: Browser-Based Sprite Extractor (Recommended)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the Sprite Extractor Tool:**
   - Navigate to: `http://localhost:5173/sprite-extractor.html`
   - Or open the `sprite-extractor.html` file directly in your browser

3. **Extract Sprites:**
   - Enter the asset path (e.g., `terrain/Characters/Basic Charakter Spritesheet.png`)
   - Choose the appropriate configuration
   - Click "Extract Sprites"
   - Download individual sprites or all at once

### Method 2: Manual Extraction

If you prefer to extract sprites manually, you can use any image editing software like:
- **GIMP** (Free)
- **Photoshop**
- **Aseprite** (Pixel art focused)
- **Paint.NET** (Windows)

## 📁 Asset Organization

### Current Asset Structure
```
public/
└── assets/
    └── downloaded-assets/
        ├── terrain/
        │   ├── Characters/
        │   │   └── Basic Charakter Spritesheet.png
        │   ├── Objects/
        │   └── Tilesets/
        │       ├── Grass.png
        │       ├── Water.png
        │       ├── Hills.png
        │       └── ...
        └── items/
            └── Resources/
                ├── Trees/
                ├── Gold Mine/
                ├── Sheep/
                └── Resources/
```

### Recommended Extracted Structure
```
public/
└── assets/
    └── extracted-sprites/
        ├── characters/
        │   ├── character_000.png
        │   ├── character_001.png
        │   └── ...
        ├── grass-tiles/
        │   ├── tile_000.png
        │   ├── tile_001.png
        │   └── ...
        └── water-tiles/
            ├── tile_000.png
            ├── tile_001.png
            └── ...
```

## ⚙️ Sprite Configurations

### Common Sprite Sheet Formats

| Type | Sprite Size | Grid | Description |
|------|-------------|------|-------------|
| **Character Basic** | 32x32 | 4x4 | Character animations |
| **Tileset 32px** | 32x32 | 8x8 | Terrain tiles |
| **Tileset 16px** | 16x16 | 16x16 | Small detail tiles |
| **Items** | 24x24 | 8x8 | Game items and objects |

### Custom Configuration
For non-standard sprite sheets, use the "Custom Configuration" option in the extractor tool:
- **Sprite Width/Height**: Size of each individual sprite
- **Columns/Rows**: Number of sprites in each direction
- **Filename Prefix**: Prefix for extracted sprite files

## 🔧 Using Extracted Sprites in Your Game

### Option 1: Import Individual Sprites
```javascript
// Import specific sprites
import characterIdle from '/assets/extracted-sprites/characters/character_000.png';
import characterWalk1 from '/assets/extracted-sprites/characters/character_001.png';
import characterWalk2 from '/assets/extracted-sprites/characters/character_002.png';

// Use in your component
const loadImage = (src, ref) => {
  const img = new Image();
  img.onload = () => ref.current = img;
  img.src = src;
};

loadImage(characterIdle, characterIdleRef);
```

### Option 2: Dynamic Loading
```javascript
// Load sprites dynamically
const loadSpriteSet = async (basePath, count, prefix = 'sprite') => {
  const sprites = [];
  for (let i = 0; i < count; i++) {
    const filename = `${prefix}_${i.toString().padStart(3, '0')}.png`;
    const img = new Image();
    img.src = `${basePath}/${filename}`;
    sprites.push(img);
  }
  return sprites;
};

// Usage
const characterSprites = await loadSpriteSet('/assets/extracted-sprites/characters', 16, 'character');
```

### Option 3: Sprite Animation System
```javascript
class SpriteAnimator {
  constructor(sprites, frameRate = 10) {
    this.sprites = sprites;
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.lastFrameTime = 0;
  }
  
  update(currentTime) {
    if (currentTime - this.lastFrameTime > 1000 / this.frameRate) {
      this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
      this.lastFrameTime = currentTime;
    }
  }
  
  getCurrentSprite() {
    return this.sprites[this.currentFrame];
  }
}

// Usage
const walkAnimation = new SpriteAnimator(characterWalkSprites, 8);
```

## 🎯 Integration Examples

### Character Animation
```javascript
// In your game component
const [characterSprites, setCharacterSprites] = useState([]);
const [currentAnimation, setCurrentAnimation] = useState('idle');

const animations = {
  idle: [0, 1, 2, 3],        // Frame indices for idle animation
  walk: [4, 5, 6, 7],       // Frame indices for walk animation
  attack: [8, 9, 10, 11]    // Frame indices for attack animation
};

// Render character with current animation frame
const renderCharacter = (ctx, x, y) => {
  const frameIndex = animations[currentAnimation][currentFrame];
  const sprite = characterSprites[frameIndex];
  if (sprite && sprite.complete) {
    ctx.drawImage(sprite, x, y, 32, 32);
  }
};
```

### Tilemap Rendering
```javascript
// Load tileset sprites
const grassTiles = await loadSpriteSet('/assets/extracted-sprites/grass-tiles', 64, 'tile');

// Render tilemap
const renderTile = (ctx, tileId, x, y) => {
  const tile = grassTiles[tileId];
  if (tile && tile.complete) {
    ctx.drawImage(tile, x, y, 32, 32);
  }
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Assets not loading:**
   - Check that assets are in the `public/assets/` folder
   - Verify file paths are correct
   - Check browser console for 404 errors

2. **Sprite extractor not working:**
   - Ensure the sprite sheet path is correct
   - Try different sprite configurations
   - Check that the image file is not corrupted

3. **Performance issues:**
   - Preload sprites during game initialization
   - Use sprite atlases for better performance
   - Consider using WebGL for hardware acceleration

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: May have limitations with large sprite sheets

## 📚 Additional Resources

- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Game Development with JavaScript](https://developer.mozilla.org/en-US/docs/Games)
- [Sprite Animation Techniques](https://gamedevelopment.tutsplus.com/tutorials/an-introduction-to-spritesheet-animation--gamedev-13099)

## 🤝 Contributing

If you find issues or want to improve the sprite extraction tools:
1. Report bugs in the project issues
2. Suggest improvements
3. Submit pull requests with enhancements

---

**Happy sprite extracting! 🎨**