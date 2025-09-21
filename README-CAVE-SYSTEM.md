# Cave Entrance & Crystal Collection System

This document explains the new terrain designer features and cave entrance system with math puzzle integration.

## Features Implemented

### 1. Multi-Level Terrain Designer

The terrain designer now supports multiple levels:
- **Level 0**: Surface terrain
- **Level 1**: Underground terrain

#### New Controls:
- **Level switching**: Toggle between surface and underground levels
- **Cave connection tool**: Create connections between levels
- **Multi-level save**: Export terrain with level connections

### 2. Cave Entrance System

#### Creating Cave Entrances:
1. Click "Create Cave Connection" button
2. Switch to Surface level (Level 0)
3. Click where you want the cave entrance
4. Switch to Underground level (Level 1) 
5. Click where the player should spawn underground

#### Cave Entrance Asset:
- Uses: `C:\Users\angel\math-game-1\public\assets\characters\terrain-object\Other\Cave_enter.png`
- Automatically placed on surface level
- Visually highlighted with orange border and glow effect

### 3. Crystal Collection with Math Puzzles

#### How it Works:
1. Player approaches a crystal object
2. Math question popup appears with Blockly interface
3. Player must solve using block-based programming
4. Correct answer = crystal collected
5. Wrong answer = crystal stays protected

#### Math Questions:
- Loaded from `NumerationProblem.json`
- Difficulty scales with level
- Includes story-based problems
- Uses existing Blockly integration

## File Structure

```
src/
├── pages/
│   ├── TerrainDesigner.jsx       # Enhanced terrain designer
│   └── TerrainGameDemo.jsx       # Demo/test page
├── components/
│   ├── GameTerrain.jsx           # Multi-level terrain renderer
│   ├── CrystalCollectionModal.jsx # Math puzzle modal for crystals
│   └── TreasureQuestionModal.jsx  # Original treasure modal
└── data/
    └── NumerationProblem.json    # Math questions database
```

## Usage

### Terrain Designer
1. Access via `/terrain-designer`
2. Use level controls to switch between surface/underground
3. Create cave connections using the connection tool
4. Place crystals in both levels
5. Save as multilevel JSON file

### Game Demo
1. Access via `/terrain-game-demo`
2. Load terrain file or create sample terrain
3. Click crystals to trigger math puzzles
4. Use cave entrances to travel between levels

## Integration with Open World Game

To integrate with existing open world game:

1. **Load terrain data**:
```jsx
import GameTerrain from './components/GameTerrain';

// In your game component
<GameTerrain
  terrainData={loadedTerrainData}
  playerPosition={playerPos}
  onPlayerMove={handlePlayerMove}
  onCrystalCollected={handleCrystalCollection}
  currentLevel={currentLevel}
  onLevelChange={handleLevelChange}
/>
```

2. **Handle player interactions**:
```jsx
// Check for crystal collection or cave entrance
useEffect(() => {
  const handleSpaceKey = (e) => {
    if (e.code === 'Space') {
      window.handlePlayerInteraction?.(playerX, playerY);
    }
  };
  
  window.addEventListener('keydown', handleSpaceKey);
  return () => window.removeEventListener('keydown', handleSpaceKey);
}, []);
```

## Terrain File Format

```json
{
  "levels": {
    "0": [/* surface terrain grid */],
    "1": [/* underground terrain grid */]
  },
  "levelConnections": [
    {
      "from": { "row": 5, "col": 7, "level": 0 },
      "to": { "row": 5, "col": 7, "level": 1 },
      "id": 1234567890
    }
  ],
  "dimensions": { "rows": 20, "cols": 30 },
  "metadata": {
    "surfaceLevel": 0,
    "undergroundLevel": 1,
    "caveEntrances": 1
  }
}
```

## Testing

1. Go to `/terrain-designer`
2. Create a simple terrain with crystals and a cave entrance
3. Save the terrain file
4. Go to `/terrain-game-demo`
5. Load your terrain file
6. Test crystal collection and cave travel

## Next Steps

- Integrate with main open world game
- Add more obstacle types and interactions
- Implement save/load for game progress
- Add sound effects and animations
- Support for multiple underground levels
