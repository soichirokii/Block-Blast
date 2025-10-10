/**
 * ゲームの基本ロジック
 */

// ゲーム状態
let gameState = {
    board: [],
    score: 0,
    waitingBlocks: [],
    isGameOver: false
};

/**
 * ゲームを初期化
 */
function initializeGame() {
    // 10x10のボードを作成
    gameState.board = Array(10).fill().map(() => Array(10).fill(0));
    gameState.score = 0;
    gameState.isGameOver = false;
    
    // ボードをDOMに描画
    createGameBoard();
    
    // 初期ブロックを生成
    generateNewBlocks();
    
    // スコア更新
    updateScore();
    
    // ドラッグ機能を初期化
    initializeDragAndDrop();
}

/**
 * ゲームボードをDOMに作成
 */
function createGameBoard() {
    const gameBoardElement = document.getElementById('game-board');
    gameBoardElement.innerHTML = '';
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            gameBoardElement.appendChild(cell);
        }
    }
}

/**
 * ゲームボードの表示を更新
 */
function updateGameBoard() {
    const cells = document.querySelectorAll('.game-board .cell');
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (gameState.board[row][col] === 0) {
            cell.classList.remove('filled');
            cell.classList.remove('placed');
        } else {
            cell.classList.add('filled');
            cell.classList.add('placed');
            
            // アニメーション後にクラスを削除
            setTimeout(() => {
                cell.classList.remove('placed');
            }, 300);
        }
    });
    
    // ブロックの配置可能性を更新
    updateBlockAvailability();
}

/**
 * 新しいブロックを生成
 * 特殊ブロックの視覚的区別を含む
 */
function generateNewBlocks() {
    const containers = document.querySelectorAll('.waiting-block-container');
    
    containers.forEach(container => {
        if (!container.blockData) {
            const blockData = getRandomBlockShape();
            container.blockData = blockData;
            
            // ブロック表示を更新
            const waitingBlock = container.querySelector('.waiting-block');
            waitingBlock.innerHTML = '';
            
            // 特殊ブロックかどうかをチェック
            const isSpecial = blockData.special || false;
            const blockVisual = createBlockVisual(blockData.pattern, blockData.color, 25, isSpecial);
            waitingBlock.appendChild(blockVisual);
            
            // 特殊ブロックの場合、コンテナに特殊クラスを追加
            if (isSpecial) {
                container.classList.add('special-container');
            } else {
                container.classList.remove('special-container');
            }
            
            container.classList.remove('disabled');
        }
    });
    
    // 配置可能性をチェック
    updateBlockAvailability();
    
    // ゲームオーバーチェック
    checkGameOver();
}

/**
 * 行と列の削除をチェック
 */
function checkAndClearLines() {
    const linesToClear = [];
    let linesCleared = 0;
    
    // 行をチェック
    for (let row = 0; row < 10; row++) {
        if (gameState.board[row].every(cell => cell !== 0)) {
            linesToClear.push({ type: 'row', index: row });
        }
    }
    
    // 列をチェック
    for (let col = 0; col < 10; col++) {
        if (gameState.board.every(row => row[col] !== 0)) {
            linesToClear.push({ type: 'col', index: col });
        }
    }
    
    // 削除アニメーション
    if (linesToClear.length > 0) {
        animateLineClear(linesToClear, () => {
            // 実際に削除
            linesToClear.forEach(line => {
                if (line.type === 'row') {
                    for (let col = 0; col < 10; col++) {
                        gameState.board[line.index][col] = 0;
                    }
                    linesCleared++;
                } else if (line.type === 'col') {
                    for (let row = 0; row < 10; row++) {
                        gameState.board[row][line.index] = 0;
                    }
                    linesCleared++;
                }
            });
            
            // スコア加算
            addScore(linesCleared);
            
            // ボード更新
            updateGameBoard();
            
            // 再帰的にチェック（連続削除）
            setTimeout(() => {
                checkAndClearLines();
            }, 300);
        });
    }
}

/**
 * ライン削除のアニメーション
 */
function animateLineClear(linesToClear, callback) {
    const cells = document.querySelectorAll('.game-board .cell');
    const cellsToAnimate = [];
    
    linesToClear.forEach(line => {
        if (line.type === 'row') {
            for (let col = 0; col < 10; col++) {
                const cell = document.querySelector(`[data-row="${line.index}"][data-col="${col}"]`);
                if (cell) {
                    cellsToAnimate.push(cell);
                }
            }
        } else if (line.type === 'col') {
            for (let row = 0; row < 10; row++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${line.index}"]`);
                if (cell) {
                    cellsToAnimate.push(cell);
                }
            }
        }
    });
    
    cellsToAnimate.forEach(cell => {
        cell.classList.add('clearing');
    });
    
    setTimeout(() => {
        cellsToAnimate.forEach(cell => {
            cell.classList.remove('clearing');
        });
        callback();
    }, 500);
}

/**
 * スコアを加算
 * 特殊ブロックのボーナスを含む
 */
function addScore(linesCleared, specialBlockUsed = false) {
    const basePoints = 100;
    const lineBonus = 50;
    const comboBonus = linesCleared > 1 ? (linesCleared - 1) * 100 : 0;
    const specialBonus = specialBlockUsed ? 200 : 0; // 特殊ブロックボーナス
    
    const points = basePoints + (linesCleared * lineBonus) + comboBonus + specialBonus;
    gameState.score += points;
    
    updateScore();
    
    // スコア表示のアニメーション
    showScorePopup(points, specialBlockUsed);
}

/**
 * スコア表示を更新
 */
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

/**
 * スコアポップアップを表示
 * 特殊ブロックの場合は特別な表示
 */
function showScorePopup(points, isSpecial = false) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    
    if (isSpecial) {
        popup.innerHTML = `<span>✨ +${points} ✨</span><br><small>特殊ブロックボーナス！</small>`;
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 1.3em;
            font-weight: bold;
            z-index: 1000;
            text-align: center;
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
            border: 2px solid #fbbf24;
            animation: specialScorePopup 1.2s ease-out forwards;
        `;
    } else {
        popup.textContent = `+${points}`;
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 1000;
            animation: scorePopup 1s ease-out forwards;
        `;
    }
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (document.body.contains(popup)) {
            document.body.removeChild(popup);
        }
    }, isSpecial ? 1200 : 1000);
}

/**
 * ゲームオーバーをチェック
 */
function checkGameOver() {
    const containers = document.querySelectorAll('.waiting-block-container');
    let hasPlayableBlock = false;
    
    containers.forEach(container => {
        if (container.blockData && !container.classList.contains('disabled')) {
            hasPlayableBlock = true;
        }
    });
    
    if (!hasPlayableBlock) {
        // すべてのブロックが配置不可能な場合、ゲームオーバー
        gameState.isGameOver = true;
        showGameOverModal();
    }
}

/**
 * ゲームオーバーモーダルを表示
 */
function showGameOverModal() {
    const modal = document.createElement('div');
    modal.className = 'game-over-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>ゲームオーバー</h2>
            <p>最終スコア: ${gameState.score}</p>
            <button onclick="restartGame()" class="btn btn-primary">もう一度プレイ</button>
        </div>
    `;
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    
    const content = modal.querySelector('.modal-content');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(modal);
}

/**
 * ゲームを再開
 */
function restartGame() {
    // ゲームオーバーモーダルを削除
    const modal = document.querySelector('.game-over-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    // ゲームを初期化
    initializeGame();
}

// CSS アニメーションを追加
const style = document.createElement('style');
style.textContent = `
    @keyframes scorePopup {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -100%) scale(1);
        }
    }
    
    .score-popup {
        animation: scorePopup 1s ease-out forwards;
    }
`;
document.head.appendChild(style);