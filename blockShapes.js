// ブロックの形状定義
const BLOCK_SHAPES = {
    // 1x1 単体ブロック
    single: {
        pattern: [[1]],
        color: '#667eea'
    },
    
    // 2x2 正方形
    square2x2: {
        pattern: [
            [1, 1],
            [1, 1]
        ],
        color: '#48bb78'
    },
    
    // 3x3 正方形
    square3x3: {
        pattern: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ],
        color: '#ed8936'
    },
    
    // I字形（縦）
    lineVertical3: {
        pattern: [
            [1],
            [1],
            [1]
        ],
        color: '#38b2ac'
    },
    
    // I字形（横）
    lineHorizontal3: {
        pattern: [[1, 1, 1]],
        color: '#38b2ac'
    },
    
    // I字形（縦5）
    lineVertical5: {
        pattern: [
            [1],
            [1],
            [1],
            [1],
            [1]
        ],
        color: '#9f7aea'
    },
    
    // I字形（横5）
    lineHorizontal5: {
        pattern: [[1, 1, 1, 1, 1]],
        color: '#9f7aea'
    },
    
    // L字形
    lShape: {
        pattern: [
            [1, 0],
            [1, 0],
            [1, 1]
        ],
        color: '#f56565'
    },
    
    // 逆L字形
    lShapeReversed: {
        pattern: [
            [0, 1],
            [0, 1],
            [1, 1]
        ],
        color: '#f56565'
    },
    
    // T字形
    tShape: {
        pattern: [
            [1, 1, 1],
            [0, 1, 0]
        ],
        color: '#4299e1'
    },
    
    // Z字形
    zShape: {
        pattern: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: '#ecc94b'
    },
    
    // 逆Z字形
    zShapeReversed: {
        pattern: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: '#ecc94b'
    },
    
    // 十字形
    crossShape: {
        pattern: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        color: '#805ad5'
    },
    
    // 小さなL字形（2x2）
    smallL: {
        pattern: [
            [1, 0],
            [1, 1]
        ],
        color: '#38a169'
    },
    
    // 角型ブロック
    corner3x3: {
        pattern: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0]
        ],
        color: '#dd6b20'
    },
    
    // ===== 特殊形状：山と口 =====
    
    // 山形（5x3） - 特殊な赤色
    mountainShape: {
        pattern: [
            [0, 0, 1, 0, 0],
            [1, 0, 1, 0, 1],
            [1, 1, 1, 1, 1]
        ],
        color: '#ef4444',
        special: true
    },
    
    // 口形（3x3中空） - 特殊な赤色
    squareHollow: {
        pattern: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1]
        ],
        color: '#ef4444',
        special: true
    },
    
    // ===== テトリス系ブロック =====
    
    // I字形（横4）- テトリス標準
    tetrisI: {
        pattern: [[1, 1, 1, 1]],
        color: '#00f0f0'
    },
    
    // O字形（2x2） - テトリス標準
    tetrisO: {
        pattern: [
            [1, 1],
            [1, 1]
        ],
        color: '#f0f000'
    },
    
    // T字形 - テトリス標準
    tetrisT: {
        pattern: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: '#a000f0'
    },
    
    // J字形 - テトリス標準
    tetrisJ: {
        pattern: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#0000f0'
    },
    
    // L字形 - テトリス標準
    tetrisL: {
        pattern: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: '#f0a000'
    },
    
    // S字形 - テトリス標準
    tetrisS: {
        pattern: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: '#00f000'
    },
    
    // Z字形 - テトリス標準
    tetrisZ: {
        pattern: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: '#f00000'
    },
    
    // ===== 追加の創作形状 =====
    
    // 大きなL字形（4x4）
    bigL: {
        pattern: [
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 1, 1]
        ],
        color: '#8b5cf6'
    },
    
    // 階段形（4x4）
    stairShape: {
        pattern: [
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 1]
        ],
        color: '#06b6d4'
    },
    
    // ダイヤ形（3x3）
    diamondShape: {
        pattern: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        color: '#f59e0b'
    },
    
    // U字形（3x3）
    uShape: {
        pattern: [
            [1, 0, 1],
            [1, 0, 1],
            [1, 1, 1]
        ],
        color: '#10b981'
    },
    
    // 矢印形（3x3）
    arrowShape: {
        pattern: [
            [0, 1, 0],
            [1, 1, 1],
            [1, 0, 1]
        ],
        color: '#6366f1'
    },
    
    // 小さな十字（3x3）
    smallCross: {
        pattern: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        color: '#ec4899'
    }
};

/**
 * ランダムなブロック形状を取得
 * 特殊ブロック（山・口）の出現率を調整
 */
function getRandomBlockShape() {
    const shapeKeys = Object.keys(BLOCK_SHAPES);
    const specialShapes = ['mountainShape', 'squareHollow'];
    
    // 特殊ブロックは10%の確率で出現
    if (Math.random() < 0.1) {
        const specialKey = specialShapes[Math.floor(Math.random() * specialShapes.length)];
        return {
            key: specialKey,
            ...BLOCK_SHAPES[specialKey]
        };
    }
    
    // 通常ブロックから選択
    const normalKeys = shapeKeys.filter(key => !specialShapes.includes(key));
    const randomKey = normalKeys[Math.floor(Math.random() * normalKeys.length)];
    return {
        key: randomKey,
        ...BLOCK_SHAPES[randomKey]
    };
}

/**
 * ブロックの幅と高さを取得
 */
function getBlockDimensions(pattern) {
    return {
        width: pattern[0].length,
        height: pattern.length
    };
}

/**
 * ブロックのセル座標を取得（相対座標）
 */
function getBlockCells(pattern) {
    const cells = [];
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === 1) {
                cells.push({ row, col });
            }
        }
    }
    return cells;
}

/**
 * ブロックが指定位置に配置可能かチェック
 */
function canPlaceBlock(board, pattern, startRow, startCol) {
    const dimensions = getBlockDimensions(pattern);
    
    // ボード境界チェック
    if (startRow + dimensions.height > board.length || 
        startCol + dimensions.width > board[0].length) {
        return false;
    }
    
    // 既存ブロックとの重複チェック
    for (let row = 0; row < dimensions.height; row++) {
        for (let col = 0; col < dimensions.width; col++) {
            if (pattern[row][col] === 1) {
                const boardRow = startRow + row;
                const boardCol = startCol + col;
                
                if (board[boardRow][boardCol] !== 0) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

/**
 * ブロックをボードに配置
 */
function placeBlockOnBoard(board, pattern, startRow, startCol, blockValue = 1) {
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === 1) {
                board[startRow + row][startCol + col] = blockValue;
            }
        }
    }
}

/**
 * ブロックの視覚的表示を生成
 * 特殊ブロックに特別なスタイルを適用
 */
function createBlockVisual(pattern, color, cellSize = 25, isSpecial = false) {
    const blockDiv = document.createElement('div');
    blockDiv.className = 'waiting-block';
    
    const dimensions = getBlockDimensions(pattern);
    blockDiv.style.gridTemplateColumns = `repeat(${dimensions.width}, ${cellSize}px)`;
    blockDiv.style.gap = '2px';
    
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            const cell = document.createElement('div');
            if (pattern[row][col] === 1) {
                cell.className = 'block-cell';
                
                if (isSpecial) {
                    // 特殊ブロックのスタイル
                    cell.style.background = `linear-gradient(135deg, ${color}, ${darkenColor(color, 0.2)})`;
                    cell.style.border = `2px solid ${darkenColor(color, 0.4)}`;
                    cell.style.boxShadow = `0 2px 4px rgba(239, 68, 68, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)`;
                    cell.classList.add('special-block');
                } else {
                    cell.style.backgroundColor = color;
                }
            } else {
                cell.style.visibility = 'hidden';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
            }
            blockDiv.appendChild(cell);
        }
    }
    
    return blockDiv;
}

/**
 * 色を暗くするヘルパー関数
 */
function darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - factor)));
    const g = Math.max(0, Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - factor)));
    const b = Math.max(0, Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - factor)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}