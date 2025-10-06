import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const SIZE = 10;

/** ===== 形状定義 ===== */
// テトリス7種 + 特殊（山・口）
const SHAPES = [
  [[1, 1, 1, 1]],                    // I
  [[1, 1],[1, 1]],                   // O
  [[0, 1, 0],[1, 1, 1]],             // T
  [[1, 0, 0],[1, 1, 1]],             // L
  [[0, 0, 1],[1, 1, 1]],             // J
  [[0, 1, 1],[1, 1, 0]],             // S
  [[1, 1, 0],[0, 1, 1]],             // Z
  [[1, 0, 0],[1, 1, 0]],      
  [[1, 1]], 
  [[1, 1, 1, 1, 1]],                    // I     
  // 山（固定向き）
  [
    [0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  // 口（固定向き）
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
];

// 色：山/口=赤、それ以外=黒
const getColor = (shape) => {
  const h = shape.length, w = shape[0].length;
  const isM = h === 3 && w === 5;                       // 山
  const isK = h === 3 && w === 3 && shape[1][1] === 0;  // 口
  return (isM || isK) ? "#ef4444" : "#111111";
};

// 盤面
const emptyBoard = () =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

// 置けるか判定
const canPlace = (board, shape, r, c) => {
  const h = shape.length, w = shape[0].length;
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (!shape[i][j]) continue;
      const rr = r + i, cc = c + j;
      if (rr < 0 || rr >= SIZE || cc < 0 || cc >= SIZE) return false;
      if (board[rr][cc]) return false;
    }
  }
  return true;
};

// 配置
const place = (board, shape, color, r, c) => {
  const next = board.map((row) => row.slice());
  const h = shape.length, w = shape[0].length;
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (shape[i][j]) next[r + i][c + j] = color;
    }
  }
  return next;
};

// 行/列消去
const clearFullLines = (board) => {
  const next = board.map((row) => row.slice());
  let cleared = 0;

  // 横
  for (let r = 0; r < SIZE; r++) {
    if (next[r].every((cell) => cell)) {
      for (let c = 0; c < SIZE; c++) next[r][c] = null;
      cleared++;
    }
  }
  // 縦
  for (let c = 0; c < SIZE; c++) {
    let full = true;
    for (let r = 0; r < SIZE; r++) if (!next[r][c]) { full = false; break; }
    if (full) {
      for (let r = 0; r < SIZE; r++) next[r][c] = null;
      cleared++;
    }
  }
  return { next, cleared };
};

// ランダム供給
const randomPiece = () => {
  const shape = JSON.parse(JSON.stringify(
    SHAPES[Math.floor(Math.random() * SHAPES.length)]
  ));
  return { shape, color: getColor(shape) };
};

export default function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [rack, setRack] = useState([randomPiece(), randomPiece(), randomPiece()]);
  const [dragging, setDragging] = useState(null);   // { piece, offsetX, offsetY }
  const [hoverCell, setHoverCell] = useState(null); // { r, c }
  const [gameOver, setGameOver] = useState(false);
  const boardRef = useRef(null);

  // ---- Drag Start ----
  const startDrag = (e, piece) => {
    if (!piece || !boardRef.current) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;
    setDragging({ piece, offsetX: clientX, offsetY: clientY });
  };

  // ---- Drag Move ----
  const handleMove = (e) => {
    if (!dragging || !boardRef.current) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;

    const rect = boardRef.current.getBoundingClientRect();
    const cellW = rect.width / SIZE;
    const cellH = rect.height / SIZE;
    const c = Math.floor((clientX - rect.left) / cellW);
    const r = Math.floor((clientY - rect.top) / cellH);

    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) {
      setHoverCell(null);
    } else {
      setHoverCell({ r, c });
    }
  };

  // ---- Drop (End) ----
  const handleEnd = () => {
    if (dragging && hoverCell) {
      const { piece } = dragging;
      const { r, c } = hoverCell;

      if (canPlace(board, piece.shape, r, c)) {
        const placed = place(board, piece.shape, piece.color, r, c);
        const { next, cleared } = clearFullLines(placed);
        setBoard(next);

        // ラック更新
        const newRack = rack.filter((p) => p !== piece);
        setRack(newRack.length ? newRack : [randomPiece(), randomPiece(), randomPiece()]);

        // ちょい光るエフェクト
        if (cleared > 0) {
          requestAnimationFrame(() => {
            document.querySelectorAll(".tile").forEach((el) => {
              el.classList.add("tile-clearing");
              setTimeout(() => el.classList.remove("tile-clearing"), 360);
            });
          });
        }
      }
    }
    setDragging(null);
    setHoverCell(null);
  };

  // 画面外に出た時の取りこぼし防止
  const cancelDrag = () => {
    setDragging(null);
    setHoverCell(null);
  };

  // ゲームオーバー判定
  useEffect(() => {
    const movable = rack.some((p) => {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (canPlace(board, p.shape, r, c)) return true;
        }
      }
      return false;
    });
    setGameOver(!movable);
  }, [board, rack]);

  const reset = () => {
    setBoard(emptyBoard());
    setRack([randomPiece(), randomPiece(), randomPiece()]);
    setDragging(null);
    setHoverCell(null);
    setGameOver(false);
  };

  return (
    <div
      className="wrap"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onMouseUp={handleEnd}
      onTouchEnd={handleEnd}
      onMouseLeave={cancelDrag}
      onTouchCancel={cancelDrag}
    >
      <h1>Block Blast JS</h1>
      <div className="meta">Drag pieces onto the 10×10 board. Fill rows or columns to clear.</div>

      {/* Board */}
      <div ref={boardRef} className="board">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div key={`${r}-${c}`} className="cell">
              {cell && (
                <div
                  className="tile"
                  style={{
                    background:
                      cell === "#ef4444"
                        ? "linear-gradient(180deg,#f43f5e,#be123c)"
                        : "linear-gradient(180deg,#222,#555)",
                    borderColor: cell === "#ef4444" ? "#7f1d1d" : "#111",
                  }}
                />
              )}
            </div>
          ))
        )}

        {/* Ghost */}
        {dragging && hoverCell && (
          <div className="ghost-layer">
            {dragging.piece.shape.map((row, i) =>
              row.map(
                (v, j) =>
                  v && (
                    <div
                      key={`${i}-${j}`}
                      className="ghost-cell"
                      style={{
                        gridRowStart: hoverCell.r + i + 1,
                        gridColumnStart: hoverCell.c + j + 1,
                        background: canPlace(board, dragging.piece.shape, hoverCell.r, hoverCell.c)
                          ? "rgba(16,185,129,0.35)"
                          : "rgba(239,68,68,0.45)",
                        border: `2px solid ${
                          canPlace(board, dragging.piece.shape, hoverCell.r, hoverCell.c)
                            ? "rgba(5,150,105,0.9)"
                            : "rgba(185,28,28,0.9)"
                        }`,
                      }}
                    />
                  )
              )
            )}
          </div>
        )}
      </div>

      {/* Rack */}
      <div className="rack">
        {rack.map((p, i) => (
          <div
            key={i}
            className="piece piece-grab"
            onMouseDown={(e) => startDrag(e, p)}
            onTouchStart={(e) => startDrag(e, p)}
          >
            <PiecePreview piece={p} />
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="overlay">
          <div className="panel">
            <div className="big">Game Over</div>
            <div className="sub">No moves left.</div>
            <button className="btn" onClick={reset}>Restart</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PiecePreview({ piece }) {
  const w = piece.shape[0].length;
  return (
    <div className="preview" style={{ gridTemplateColumns: `repeat(${w}, 1fr)` }}>
      {piece.shape.flat().map((v, i) => (
        <div key={i} className="preview-cell">
          {v ? (
            <div
              className="preview-tile"
              style={{
                background:
                  piece.color === "#ef4444"
                    ? "linear-gradient(180deg,#f43f5e,#be123c)"
                    : "linear-gradient(180deg,#222,#555)",
                borderColor: piece.color === "#ef4444" ? "#7f1d1d" : "#111",
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}