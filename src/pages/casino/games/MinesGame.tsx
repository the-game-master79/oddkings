import React, { useState } from 'react';
import './MinesGame.css';

// URL path: /casino/games/mines
const MinesGame = () => {
  const [grid, setGrid] = useState(generateGrid(5, 5, 5));
  const [gameOver, setGameOver] = useState(false);

  function generateGrid(rows, cols, mines) {
    // Initialize grid
    const grid = Array(rows).fill(null).map(() => Array(cols).fill({ mine: false, revealed: false }));
    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!grid[row][col].mine) {
        grid[row][col].mine = true;
        minesPlaced++;
      }
    }
    return grid;
  }

  const handleClick = (row, col) => {
    if (gameOver || grid[row][col].revealed) return;
    const newGrid = [...grid];
    newGrid[row][col].revealed = true;
    if (newGrid[row][col].mine) {
      setGameOver(true);
      alert('Game Over!');
    }
    setGrid(newGrid);
  };

  return (
    <div className="mines-game">
      <h1>Mines Game</h1>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell.revealed ? 'revealed' : ''}`}
                onClick={() => handleClick(rowIndex, colIndex)}
              >
                {cell.revealed && (cell.mine ? '💣' : '')}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MinesGame;