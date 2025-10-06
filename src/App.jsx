import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/** ==== Block Blast 10x10 完全版 ====
 * - 山ブロック固定向き（[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]）
 * - 他ブロックはランダム回転
 * - ドラッグ操作＋正確なゴースト
 * - 一列揃いで光→ポップ消滅のアニメーション
 * - 山・口は赤、他は黒
 */

const SIZE = 10;

/* === 山ブロック === */
const MOUNTAIN = [
  [0, 0, 1, 0, 0],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1],
];

/* === 形定義 === */
const BASE_SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  MOUNTAIN,
  KUCHI: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
};

const COLOR_FOR = (key) =>
  key === "MOUNTAIN" || key === "KUCHI" ? "#e11d48" : "#111111";

/* ==== ユーティリティ ==== */
function rotate(shape) {
  return shape[0].map((_, i) => shape.map((row) => row[i])).reverse();
}
function rotateTimes(shape, n) {
  let s = shape;
  for (let i = 0; i < ((n % 4) + 4) % 4; i++) s = rotate(s);
  return s;
}
function toOffsets(shape) {
  const out = [];
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++) if (shape[r][c]) out.push([r, c]);
  return out;
}
function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}
function canPlace(board, piece, r, c) {
  return piece.offsets.every(([dr, dc]) => {
    const rr = r + dr, cc = c + dc;
    return rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && board[rr][cc] === null;
  });
}
function place(board, piece, r, c) {
  const next = board.map((row) => row.slice());
  piece.offsets.forEach(([dr, dc]) => (next[r + dr][c + dc] = piece.color));
  return next;
}

/* ==== React ==== */
export default function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [rack, setRack] = useState([randomPiece(), randomPiece(), randomPiece()]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("bb-best") || 0));
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [clearingKeys, setClearingKeys] = useState(new Set());

  // ドラッグ関連
  const [dragPiece, setDragPiece] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [hoverValid, setHoverValid] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const boardRef = useRef(null);
  const metricsRef = useRef({});

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem("bb-best", String(score));
    }
  }, [score]);

  useEffect(() => {
    setGameOver(!anyMovesLeft(board, rack));
  }, [board, rack]);

  useEffect(() => {
    measureBoard();
    window.addEventListener("resize", measureBoard);
    return () => window.removeEventListener("resize", measureBoard);
  }, []);

  function measureBoard() {
    const el = boardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const padL = parseFloat(cs.paddingLeft) || 0;
    const padT = parseFloat(cs.paddingTop) || 0;
    const padR = parseFloat(cs.paddingRight) || 0;
    const padB = parseFloat(cs.paddingBottom) || 0;
    const gap = parseFloat(cs.gap) || 0;
    const contentW = rect.width - padL - padR;
    const contentH = rect.height - padT - padB;
    const cellW = (contentW - gap * (SIZE - 1)) / SIZE;
    const cellH = (contentH - gap * (SIZE - 1)) / SIZE;
    metricsRef.current = { padL, padT, cellW, cellH, gap };
  }

  function pointToCell(x, y, piece) {
    const rect = boardRef.current.getBoundingClientRect();
    const { padL, padT, cellW, cellH, gap } = metricsRef.current;
    let cx = x - rect.left - padL;
    let cy = y - rect.top - padT;
    cx = Math.max(0, Math.min(cx, cellW * SIZE + gap * (SIZE - 1)));
    cy = Math.max(0, Math.min(cy, cellH * SIZE + gap * (SIZE - 1)));
    const c = Math.floor(cx / (cellW + gap));
    const r = Math.floor(cy / (cellH + gap));
    return { r, c, valid: canPlace(board, piece, r, c) };
  }

  function onDragStart(p, idx, x, y) {
    if (gameOver) return;
    setDragPiece(p);
    setDragIdx(idx);
    setCursor({ x, y });
  }

  function onDragMove(x, y) {
    if (!dragPiece) return;
    setCursor({ x, y });
    const cell = pointToCell(x, y, dragPiece);
    setHoverCell({ r: cell.r, c: cell.c });
    setHoverValid(cell.valid);
  }

  function onDragEnd() {
    if (dragPiece && hoverCell && hoverValid) {
      const placed = place(board, dragPiece, hoverCell.r, hoverCell.c);
      const { fullRows, fullCols } = findFullLines(placed);
      const toClear = cellsFromLines(fullRows, fullCols);
      const lines = fullRows.length + fullCols.length;

      setRack((arr) => {
        const next = arr.slice();
        next[dragIdx] = null;
        return next.every((x) => x == null)
          ? [randomPiece(), randomPiece(), randomPiece()]
          : next;
      });

      if (toClear.size > 0) {
        setClearingKeys(toClear);
        setBoard(placed);
        setScore((s) => s + dragPiece.offsets.length + lines * 10);
        setMessage(`+${lines * 10} Line Clear!`);
        setTimeout(() => setMessage(""), 800);
        setTimeout(() => {
          const next = placed.map((row) => row.slice());
          for (const key of toClear) {
            const [r, c] = key.split("-").map(Number);
            next[r][c] = null;
          }
          setBoard(next);
          setClearingKeys(new Set());
        }, 360);
      } else {
        setBoard(placed);
        setScore((s) => s + dragPiece.offsets.length);
      }
    }
    setDragPiece(null);
    setDragIdx(null);
    setHoverCell(null);
    setHoverValid(false);
  }

  useEffect(() => {
    const mm = (e) => onDragMove(e.clientX, e.clientY);
    const mu = () => onDragEnd();
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  });

  function resetGame() {
    setBoard(emptyBoard());
    setRack([randomPiece(), randomPiece(), randomPiece()]);
    setScore(0);
    setMessage("");
    setGameOver(false);
  }

  return (
    <div className="wrap">
      <h1>Block Blast 10×10</h1>
      <div className="meta">Score: {score} | Best: {best}</div>
      {message && <div className="flash">{message}</div>}

      <div ref={boardRef} className="board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {board.flatMap((row, r) =>
          row.map((cell, c) => (
            <div key={`${r}-${c}`} className="cell">
              {cell && (
                <div
                  className={`tile ${clearingKeys.has(`${r}-${c}`) ? "tile-clearing" : ""}`}
                  style={{
                    background:
                      cell === "#e11d48"
                        ? "linear-gradient(180deg,#f43f5e,#be123c)"
                        : "linear-gradient(180deg,#222,#555)",
                    borderColor: cell === "#e11d48" ? "#7f1d1d" : "#111",
                    "--delay": `${(r + c) * 14}ms`,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {dragPiece && hoverCell && (
        <Ghost piece={dragPiece} hoverCell={hoverCell} ok={hoverValid} />
      )}

      <div className="rack">
        {rack.map((p, i) => (
          <div key={i} className="piece">
            <div
              className="piece-grab"
              onMouseDown={(e) => p && onDragStart(p, i, e.clientX, e.clientY)}
            >
              {p ? <MiniPreview piece={p} /> : <div className="dash">—</div>}
            </div>
          </div>
        ))}
      </div>

      {dragPiece && <Floating piece={dragPiece} x={cursor.x} y={cursor.y} />}

      {gameOver && (
        <div className="overlay">
          <div className="panel">
            <div className="big">Game Over</div>
            <div className="sub">Final: {score}</div>
            <button className="btn primary" onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==== その他関数 ==== */
function randomPiece() {
  const keys = Object.keys(BASE_SHAPES);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const base = BASE_SHAPES[key];
  const shape = key === "MOUNTAIN" ? base : rotateTimes(base, Math.floor(Math.random() * 4));
  const color = COLOR_FOR(key);
  return { key, shape, color, offsets: toOffsets(shape) };
}

function anyMovesLeft(board, rack) {
  for (const p of rack.filter(Boolean))
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (canPlace(board, p, r, c)) return true;
  return false;
}

function findFullLines(board) {
  const fullRows = [];
  const fullCols = [];
  for (let r = 0; r < SIZE; r++)
    if (board[r].every((v) => v !== null)) fullRows.push(r);
  for (let c = 0; c < SIZE; c++) {
    let full = true;
    for (let r = 0; r < SIZE; r++) if (board[r][c] === null) { full = false; break; }
    if (full) fullCols.push(c);
  }
  return { fullRows, fullCols };
}

function cellsFromLines(fullRows, fullCols) {
  const keys = new Set();
  for (const r of fullRows) for (let c = 0; c < SIZE; c++) keys.add(`${r}-${c}`);
  for (const c of fullCols) for (let r = 0; r < SIZE; r++) keys.add(`${r}-${c}`);
  return keys;
}

/* ==== コンポーネント ==== */
function MiniPreview({ piece }) {
  const cols = piece.shape[0].length;
  return (
    <div className="preview" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {piece.shape.flat().map((v, i) => (
        <div key={i} className="preview-cell">
          {v ? (
            <div
              className="preview-tile"
              style={{
                background:
                  piece.key === "MOUNTAIN" || piece.key === "KUCHI"
                    ? "linear-gradient(180deg,#f43f5e,#be123c)"
                    : "linear-gradient(180deg,#222,#555)",
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Floating({ piece, x, y }) {
  const cols = piece.shape[0].length;
  const size = 18;
  return (
    <div
      style={{
        position: "fixed",
        left: x + 12,
        top: y + 12,
        pointerEvents: "none",
        opacity: 0.9,
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${size}px)`,
          gap: 3,
          padding: 4,
          background: "rgba(255,255,255,0.85)",
          borderRadius: 10,
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          border: "1px solid #e2e8f0",
        }}
      >
        {piece.shape.flat().map((v, i) => (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: 5,
              background: v
                ? piece.key === "MOUNTAIN" || piece.key === "KUCHI"
                  ? "linear-gradient(180deg,#f43f5e,#be123c)"
                  : "linear-gradient(180deg,#222,#555)"
                : "transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Ghost({ piece, hoverCell, ok }) {
  const { padL, padT, cellW, cellH, gap } = metricsRef.current;
  return (
    <div
      style={{
        position: "absolute",
        left: padL,
        top: padT,
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {piece.offsets.map(([dr, dc], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (hoverCell.c + dc) * (cellW + gap),
            top: (hoverCell.r + dr) * (cellH + gap),
            width: cellW,
            height: cellH,
            borderRadius: 8,
            background: ok
              ? "rgba(16,185,129,0.3)"
              : "rgba(239,68,68,0.3)",
            border: `2px solid ${
              ok ? "rgba(5,150,105,0.9)" : "rgba(185,28,28,0.9)"
            }`,
          }}
        />
      ))}
    </div>
  );
}