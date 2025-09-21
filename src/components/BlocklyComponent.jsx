import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import * as BlocklyJS from 'blockly/javascript';
import './BlocklyComponent.css'; // You can create this file for styles
import {
  ArrowForward,
  ArrowBack,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';

export default function BlocklyMazeGame() {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const canvasRef = useRef(null);

  const startPos = { x: 0, y: 0, dir: 'right' };
  const tileSize = 60;
  const baseSize = 5;
  const [level, setLevel] = useState(() => {
    const saved = localStorage.getItem('mazeLevel');
    return saved ? parseInt(saved) : 1;
  });
  const mazeSize = Math.min(baseSize + Math.floor(level / 2), 10);
  const canvasWidth = mazeSize * tileSize;
  const canvasHeight = mazeSize * tileSize;

  const [player, setPlayer] = useState(startPos);
  const [maze, setMaze] = useState([]);
  const [toolbox, setToolbox] = useState([]);

  useEffect(() => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'move_forward',
        message0: '→ Move Right',
        previousStatement: null,
        nextStatement: null,
        colour: '#2196F3',
        style: 'movement_blocks',
      },
      {
        type: 'turn_left',
        message0: '← Move Left',
        previousStatement: null,
        nextStatement: null,
        colour: '#2196F3',
        style: 'movement_blocks',
      },
      {
        type: 'turn_right',
        message0: '↑ Move Up',
        previousStatement: null,
        nextStatement: null,
        colour: '#2196F3',
        style: 'movement_blocks',
      },
      {
        type: 'move_down',
        message0: '↓ Move Down',
        previousStatement: null,
        nextStatement: null,
        colour: '#2196F3',
        style: 'movement_blocks',
      },
    ]);

    // Define custom block styles
    Blockly.Theme.defineTheme('kubo_theme', {
      'blockStyles': {
        'movement_blocks': {
          'colourPrimary': '#2196F3',
          'colourSecondary': '#1976D2',
          'colourTertiary': '#0D47A1'
        },
        'logic_blocks': {
          'colourPrimary': '#9C27B0',
          'colourSecondary': '#7B1FA2',
          'colourTertiary': '#4A148C'
        },
        'loop_blocks': {
          'colourPrimary': '#00BCD4',
          'colourSecondary': '#0097A7',
          'colourTertiary': '#006064'
        },
        'math_blocks': {
          'colourPrimary': '#FF9800',
          'colourSecondary': '#F57C00',
          'colourTertiary': '#E65100'
        }
      },
      'categoryStyles': {
        'movement_category': {
          'colour': '#2196F3'
        },
        'logic_category': {
          'colour': '#9C27B0'
        },
        'loop_category': {
          'colour': '#00BCD4'
        },
        'math_category': {
          'colour': '#FF9800'
        }
      }
    });

    BlocklyJS.javascriptGenerator.forBlock['move_forward'] = () => 'moveRight();\n';
    BlocklyJS.javascriptGenerator.forBlock['turn_left'] = () => 'moveLeft();\n';
    BlocklyJS.javascriptGenerator.forBlock['turn_right'] = () => 'moveUp();\n';
    BlocklyJS.javascriptGenerator.forBlock['move_down'] = () => 'moveDown();\n';
  }, []);

  useEffect(() => {
    localStorage.setItem('mazeLevel', level.toString());
    const newMaze = generateSolvableMaze(mazeSize, mazeSize);
    setMaze(newMaze);

    const toolboxContents = [
      {
        kind: 'category',
        name: 'Logic',
        contents: [
          { kind: 'block', type: 'controls_if' },
          ...(level >= 3 ? [{ kind: 'block', type: 'controls_ifelse' }] : []),
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_boolean' },
        ],
      },
      {
        kind: 'category',
        name: 'Loops',
        contents: [{ kind: 'block', type: 'controls_repeat_ext' }],
      },
      {
        kind: 'category',
        name: 'Math',
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
        ],
      },
      {
        kind: 'category',
        name: 'Movement',
        contents: [
          { kind: 'block', type: 'move_forward' },
          { kind: 'block', type: 'turn_left' },
          { kind: 'block', type: 'turn_right' },
        ],
      },
    ];
    setToolbox(toolboxContents);
    setPlayer(startPos);
  }, [level]);

  useEffect(() => {
    if (workspaceRef.current) {
      workspaceRef.current.dispose();
    }

    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      theme: Blockly.Theme.Classic,
      toolbox: { kind: 'categoryToolbox', contents: toolbox },
      trashcan: true,
      scrollbars: true,
      grid: {
        spacing: 25,
        length: 3,
        colour: '#ccc',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
    });

    drawMaze();
  }, [maze]);

  useEffect(() => {
    drawMaze();
  }, [player]);

  const generateSolvableMaze = (rows, cols) => {
    let maze, path;
    const obstacleRate = Math.min(0.3 + level * 0.05, 0.6);

    do {
      maze = Array.from({ length: rows }, () => Array(cols).fill(0));
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if ((x !== 0 || y !== 0) && (x !== cols - 1 || y !== rows - 1)) {
            maze[y][x] = Math.random() < obstacleRate ? 1 : 0;
          }
        }
      }
      maze[0][0] = 'S';
      maze[rows - 1][cols - 1] = 'G';
      path = findPathBFS(maze, 0, 0, cols - 1, rows - 1);
    } while (!path);

    return maze;
  };

  const findPathBFS = (maze, sx, sy, gx, gy) => {
    const queue = [[sx, sy]];
    const visited = new Set();
    visited.add(`${sx},${sy}`);
    const directions = [[0, 1], [1, 0], [-1, 0], [0, -1]];

    while (queue.length) {
      const [x, y] = queue.shift();
      if (x === gx && y === gy) return true;
      for (let [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < maze[0].length &&
          ny < maze.length &&
          maze[ny][nx] !== 1 &&
          !visited.has(`${nx},${ny}`)
        ) {
          visited.add(`${nx},${ny}`);
          queue.push([nx, ny]);
        }
      }
    }
    return false;
  };

  const drawMaze = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        if (maze[y][x] === 1) {
          ctx.fillStyle = `hsl(${(Date.now() / 10 + x * 20 + y * 20) % 360}, 60%, 30%)`;
        } else if (maze[y][x] === 'S') {
          ctx.fillStyle = 'lightgreen';
        } else if (maze[y][x] === 'G') {
          ctx.fillStyle = 'gold';
        } else {
          ctx.fillStyle = '#eee';
        }
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = '#999';
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    // Draw player
    ctx.save();
    ctx.translate(player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2);
    const angles = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
    ctx.rotate(angles[player.dir] || 0);
    ctx.beginPath();
    ctx.moveTo(0, -tileSize / 3);
    ctx.lineTo(tileSize / 4, tileSize / 3);
    ctx.lineTo(-tileSize / 4, tileSize / 3);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.restore();
  };

  const runCode = () => {
    const code = BlocklyJS.javascriptGenerator.workspaceToCode(workspaceRef.current);
    let { x, y, dir } = player;
    const actions = [];

    const moveForward = () => actions.push('move');
    const turnLeft = () => actions.push('left');
    const turnRight = () => actions.push('right');

    try {
      new Function('moveForward', 'turnLeft', 'turnRight', code)(moveForward, turnLeft, turnRight);
      animateActions(actions, x, y, dir);
    } catch (err) {
      alert('Error running code:\n' + (err.stack || err.message));
    }
  };

  const animateActions = async (actions, x, y, dir) => {
    const moveSound = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg');
    for (let action of actions) {
      await new Promise((res) => setTimeout(res, 400));
      if (action === 'move') {
        const dx = dir === 'right' ? 1 : dir === 'left' ? -1 : 0;
        const dy = dir === 'down' ? 1 : dir === 'up' ? -1 : 0;
        const nx = x + dx,
          ny = y + dy;
        if (maze[ny] && maze[ny][nx] !== 1 && maze[ny][nx] !== undefined) {
          x = nx;
          y = ny;
          moveSound.play();
        }
      } else if (action === 'left') {
        dir = { up: 'left', left: 'down', down: 'right', right: 'up' }[dir];
      } else if (action === 'right') {
        dir = { up: 'right', right: 'down', down: 'left', left: 'up' }[dir];
      }
      setPlayer({ x, y, dir });
    }

    if (maze[y][x] === 'G') {
      setTimeout(() => {
        new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg').play();
        alert('🎉 Goal Reached!');
        const blockCount = workspaceRef.current.getAllBlocks(false).length;
        if (blockCount <= 5) {
          setLevel((prev) => prev + 1);
        } else {
          alert('Try solving the maze using fewer than 6 blocks to proceed to the next level.');
        }
      }, 300);
    }
  };

  return (
    <div className="maze-container">
      <div className="maze-header">
        <h2>Blockly Maze Game</h2>
        <p>Level {level}: Move from green start to yellow goal!</p>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="maze-canvas"
      />

      <div ref={blocklyDiv} className="maze-blockly" />

      <div className="maze-controls">
        <button onClick={runCode} className="maze-button run">
          ▶ Run Code
        </button>
        <button onClick={() => setPlayer(startPos)} className="maze-button reset">
          ⟳ Reset
        </button>
      </div>
    </div>
  );
}
