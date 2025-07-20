import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

/**
 * Extract character animation frames from sprite sheet
 * This script extracts 11 frames from the King Human idle animation
 */
async function extractCharacterFrames() {
  try {
    console.log('Loading character sprite sheet...');
    
    // Load the sprite sheet
    const spriteSheetPath = path.join(__dirname, 'src', 'assets', 'downloaded-assets', 'characters', 'kings-and-pigs', '01-King Human', 'Idle (78x58).png');
    const spriteSheet = await loadImage(spriteSheetPath);
    
    console.log(`Sprite sheet loaded: ${spriteSheet.width}x${spriteSheet.height}`);
    
    // Character sprite configuration
    const frameWidth = 78;  // Width of each frame
    const frameHeight = 58; // Height of each frame
    const totalFrames = 11; // Number of frames in the animation
    const framesPerRow = Math.floor(spriteSheet.width / frameWidth);
    
    console.log(`Frame size: ${frameWidth}x${frameHeight}`);
    console.log(`Total frames: ${totalFrames}`);
    console.log(`Frames per row: ${framesPerRow}`);
    
    // Create output directory
    const outputDir = path.join(__dirname, 'public', 'assets', 'characters', 'king-human-idle');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Extract each frame
    for (let i = 0; i < totalFrames; i++) {
      // Calculate source position
      const col = i % framesPerRow;
      const row = Math.floor(i / framesPerRow);
      const sourceX = col * frameWidth;
      const sourceY = row * frameHeight;
      
      // Create canvas for this frame
      const canvas = createCanvas(frameWidth, frameHeight);
      const ctx = canvas.getContext('2d');
      
      // Draw the frame
      ctx.drawImage(
        spriteSheet,
        sourceX, sourceY, frameWidth, frameHeight,
        0, 0, frameWidth, frameHeight
      );
      
      // Save the frame
      const frameFilename = `frame_${i.toString().padStart(2, '0')}.png`;
      const frameBuffer = canvas.toBuffer('image/png');
      const framePath = path.join(outputDir, frameFilename);
      
      fs.writeFileSync(framePath, frameBuffer);
      console.log(`Extracted frame ${i + 1}/${totalFrames}: ${frameFilename}`);
    }
    
    // Create frame manifest for easy loading
    const manifest = {
      name: 'King Human Idle Animation',
      frameCount: totalFrames,
      frameWidth: frameWidth,
      frameHeight: frameHeight,
      frameDuration: 100, // milliseconds per frame
      frames: []
    };
    
    for (let i = 0; i < totalFrames; i++) {
      manifest.frames.push({
        index: i,
        filename: `frame_${i.toString().padStart(2, '0')}.png`,
        path: `/assets/characters/king-human-idle/frame_${i.toString().padStart(2, '0')}.png`
      });
    }
    
    // Save manifest
    const manifestPath = path.join(outputDir, 'animation-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('\n✅ Character frame extraction completed!');
    console.log(`📁 Frames saved to: ${outputDir}`);
    console.log(`📄 Animation manifest: ${manifestPath}`);
    console.log(`🎬 Total frames extracted: ${totalFrames}`);
    
  } catch (error) {
    console.error('❌ Error extracting character frames:', error);
  }
}

// Run the extraction
if (import.meta.url === `file://${process.argv[1]}`) {
  extractCharacterFrames();
}

export { extractCharacterFrames };