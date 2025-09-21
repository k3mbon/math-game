# Auto-Loading Terrain Files

## How to Use

1. **Export** terrain from the Terrain Designer page
2. **Copy** the generated JSON file to this folder (`/public/terrain-data/`)
3. **Refresh** the Open World Game page - your terrain will load automatically!

## Supported Filenames

The game will automatically look for these filenames (in order):

- `terrain-seamless-30x30-1757059823695.json` (current file)
- `terrain.json`
- `custom-terrain.json`
- `level-design.json`
- `world.json`

## Tips

- ✅ **Rename your file** to `terrain.json` for easy loading
- ✅ **Replace existing files** to update your terrain
- ✅ **Keep backups** of terrain designs you want to reuse
- ✅ **Check browser console** for loading status

## Current Files

- `terrain-seamless-30x30-1757059823695.json` - 30x30 seamless terrain
