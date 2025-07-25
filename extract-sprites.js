/**
 * Simple Node.js script to extract sprites from sprite sheets
 * Run with: node extract-sprites.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Configuration for different sprite types
const SPRITE_CONFIGS = {
  CHARACTER_BASIC: {
    spriteWidth: 32,
    spriteHeight: 32,
    columns: 4,
    rows: 4,
    namePrefix: 'character'
  },
  TILESET_32: {
    spriteWidth: 32,
    spriteHeight: 32,
    columns: 8,
    rows: 8,
    namePrefix: 'tile'
  },
  TILESET_16: {
    spriteWidth: 16,
    spriteHeight: 16,
    columns: 16,
    rows: 16,
    namePrefix: 'tile_16'
  },
  ITEMS: {
    spriteWidth: 24,
    spriteHeight: 24,
    columns: 8,
    rows: 8,
    namePrefix: 'item'
  }
};

/**
 * Extract sprites from a sprite sheet
 * @param {string} inputPath - Path to the sprite sheet
 * @param {string} outputDir - Directory to save extracted sprites
 * @param {Object} config - Sprite configuration
 */
async function extractSprites(inputPath, outputDir, config) {
  try {
    console.log(`Loading sprite sheet: ${inputPath}`);
    const image = await loadImage(inputPath);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const { spriteWidth, spriteHeight, columns, rows, namePrefix } = config;
    const canvas = createCanvas(spriteWidth, spriteHeight);
    const ctx = canvas.getContext('2d');
    
    let extractedCount = 0;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Clear canvas
        ctx.clearRect(0, 0, spriteWidth, spriteHeight);
        
        // Draw the specific sprite from the sheet
        ctx.drawImage(
          image,
          col * spriteWidth, // source x
          row * spriteHeight, // source y
          spriteWidth, // source width
          spriteHeight, // source height
          0, // destination x
          0, // destination y
          spriteWidth, // destination width
          spriteHeight // destination height
        );
        
        // Save the sprite
        const spriteIndex = row * columns + col;
        const filename = `${namePrefix}_${spriteIndex.toString().padStart(3, '0')}.png`;
        const outputPath = path.join(outputDir, filename);
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        extractedCount++;
        
        // Show progress
        if (extractedCount % 10 === 0 || extractedCount === rows * columns) {
          console.log(`Extracted ${extractedCount}/${rows * columns} sprites...`);
        }
      }
    }
    
    console.log(`✅ Successfully extracted ${extractedCount} sprites to ${outputDir}`);
    return extractedCount;
    
  } catch (error) {
    console.error(`❌ Error extracting sprites: ${error.message}`);
    throw error;
  }
}

/**
 * Main function to run the sprite extraction
 */
async function main() {
  console.log('🎮 Sprite Extractor Tool\n');
  
  // Example extractions - modify these paths as needed
  const extractions = [
    {
      input: './public/assets/downloaded-assets/terrain/Characters/Basic Charakter Spritesheet.png',
      output: './public/assets/extracted-sprites/characters',
      config: SPRITE_CONFIGS.CHARACTER_BASIC
    },
    {
      input: './public/assets/downloaded-assets/terrain/Tilesets/Grass.png',
      output: './public/assets/extracted-sprites/grass-tiles',
      config: SPRITE_CONFIGS.TILESET_32
    },
    {
      input: './public/assets/downloaded-assets/terrain/Tilesets/Water.png',
      output: './public/assets/extracted-sprites/water-tiles',
      config: SPRITE_CONFIGS.TILESET_32
    },
    {
      input: './public/assets/downloaded-assets/terrain/Tilesets/Hills.png',
      output: './public/assets/extracted-sprites/hill-tiles',
      config: SPRITE_CONFIGS.TILESET_32
    }
  ];
  
  for (const extraction of extractions) {
    if (fs.existsSync(extraction.input)) {
      console.log(`\n📂 Processing: ${path.basename(extraction.input)}`);
      try {
        await extractSprites(extraction.input, extraction.output, extraction.config);
      } catch (error) {
        console.error(`Failed to process ${extraction.input}:`, error.message);
      }
    } else {
      console.log(`⚠️  File not found: ${extraction.input}`);
    }
  }
  
  console.log('\n🎉 Sprite extraction complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Check the extracted sprites in the output directories');
  console.log('2. Use individual sprites in your game by importing them');
  console.log('3. Update your game code to use the extracted sprites');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { extractSprites, SPRITE_CONFIGS };