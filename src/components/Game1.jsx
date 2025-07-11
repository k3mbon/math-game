import React, { useRef, useEffect, useState } from "react";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import "./Game1.css";

const NUMBER_LINE_LENGTH = 10; // 0 to 10
const START_POS = 0;

// SVG Robot
const Robot = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <rect x="10" y="18" width="28" height="20" rx="6" fill="#90caf9" />
    <rect x="18" y="10" width="12" height="10" rx="4" fill="#1976d2" />
    <circle cx="18" cy="24" r="2" fill="#263238" />
    <circle cx="30" cy="24" r="2" fill="#263238" />
    <rect x="22" y="30" width="4" height="6" rx="2" fill="#1976d2" />
  </svg>
);

const CUSTOM_BLOCKS_REGISTERED = {};

function registerCustomBlocks() {
  // Only register once per session
  if (CUSTOM_BLOCKS_REGISTERED.move_forward && CUSTOM_BLOCKS_REGISTERED.move_backward) return;

  if (!Blockly.Blocks["move_forward"]) {
    Blockly.Blocks["move_forward"] = {
      init: function () {
        this.appendDummyInput().appendField("move forward");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Move robot forward by 1");
      },
    };
    CUSTOM_BLOCKS_REGISTERED.move_forward = true;
  }

  if (!Blockly.Blocks["move_backward"]) {
    Blockly.Blocks["move_backward"] = {
      init: function () {
        this.appendDummyInput().appendField("move backward");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(0);
        this.setTooltip("Move robot backward by 1");
      },
    };
    CUSTOM_BLOCKS_REGISTERED.move_backward = true;
  }

  // Register generators directly on javascriptGenerator (not forBlock)
  if (!javascriptGenerator["move_forward"]) {
    javascriptGenerator["move_forward"] = function () {
      return "moveForward();\n";
    };
  }
  if (!javascriptGenerator["move_backward"]) {
    javascriptGenerator["move_backward"] = function () {
      return "moveBackward();\n";
    };
  }
}

const Game1 = () => {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [robotPos, setRobotPos] = useState(START_POS);
  const [target, setTarget] = useState(
    Math.floor(Math.random() * (NUMBER_LINE_LENGTH + 1))
  );
  const [message, setMessage] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");

  // Register custom blocks and generators once
  useEffect(() => {
    registerCustomBlocks();
  }, []);

  // Initialize Blockly workspace with NumerationPage-style toolbox
  const initializeWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.dispose();
    }
    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      toolbox: {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "Robot",
            colour: "#5b80a5",
            contents: [
              { kind: "block", type: "move_forward" },
              { kind: "block", type: "move_backward" }
            ]
          },
          {
            kind: "category",
            name: "Loops",
            colour: "#a55b80",
            contents: [
              { kind: "block", type: "controls_repeat_ext" }
            ]
          },
          {
            kind: "category",
            name: "Math",
            colour: "#5b80a5",
            contents: [
              { kind: "block", type: "math_number" }
            ]
          }
        ]
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: "#eee",
        snap: true
      },
      trashcan: true
    });
  };

  // Reset game
  const resetGame = () => {
    setRobotPos(START_POS);
    setTarget(Math.floor(Math.random() * (NUMBER_LINE_LENGTH + 1)));
    setMessage("");
    setConsoleOutput("");
    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }
  };

  // Run Blockly code
  const runCode = () => {
    setMessage("");
    setConsoleOutput("");
    let pos = robotPos;
    const capturedOutput = [];
    const customConsole = {
      log: (...args) => {
        const msg = args.map(arg =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        ).join(" ");
        capturedOutput.push(msg);
        setConsoleOutput(prev => prev + msg + "\n");
      }
    };
    // Provide API for blocks
    const api = {
      moveForward: () => {
        pos = Math.min(NUMBER_LINE_LENGTH, pos + 1);
      },
      moveBackward: () => {
        pos = Math.max(0, pos - 1);
      }
    };
    // Generate code
    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
    try {
      // eslint-disable-next-line no-new-func
      const func = new Function("moveForward", "moveBackward", "console", code);
      func(api.moveForward, api.moveBackward, customConsole);
      setRobotPos(pos);
      if (pos === target) {
        setMessage("🎉 Success! Robot reached the target!");
      } else {
        setMessage(`❌ Try again! Robot is at ${pos}, target is ${target}`);
      }
    } catch (e) {
      setMessage(`⚠️ Error: ${e.message}`);
      setConsoleOutput(prev => prev + `Error: ${e.message}\n`);
    }
  };

  // Render number line
  const renderNumberLine = () => {
    const items = [];
    for (let i = 0; i <= NUMBER_LINE_LENGTH; i++) {
      items.push(
        <div
          key={i}
          className={
            "bnl-number" +
            (i === target ? " bnl-target" : "") +
            (i === robotPos ? " bnl-robot" : "")
          }
        >
          {i}
          {i === robotPos && (
            <div className="bnl-robot-icon">
              <Robot size={36} />
            </div>
          )}
          {i === target && <div className="bnl-target-flag">🎯</div>}
        </div>
      );
    }
    return <div className="bnl-number-line">{items}</div>;
  };

  useEffect(() => {
    initializeWorkspace();
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="bnl-container">
      <h2 className="bnl-title">Blockly Robot on Number Line</h2>
      <div className="bnl-desc">
        <p>
          Move the robot to <b>{target}</b> using Blockly code blocks!
        </p>
        <p>
          Use <span className="bnl-block">move forward</span> and <span className="bnl-block">move backward</span> blocks. You can also use <span className="bnl-block">repeat</span> for loops.
        </p>
      </div>
      <div className="bnl-main">
        <div className="bnl-visual">{renderNumberLine()}</div>
        <div className="bnl-blockly">
          <div ref={blocklyDiv} className="bnl-blockly-area" />
        </div>
      </div>
      <div className="bnl-controls">
        <button className="bnl-btn" onClick={runCode}>
          ▶️ Run Code
        </button>
        <button className="bnl-btn" onClick={resetGame}>
          🔄 Reset
        </button>
      </div>
      {message && <div className="bnl-message">{message}</div>}
      <pre className="bnl-console-output">
        {consoleOutput || "Console output will appear here..."}
      </pre>
    </div>
  );
};

export default Game1;