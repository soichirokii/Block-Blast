/**
 * ドラッグアンドドロップとゴースト表示機能
 */

let dragState = {
    isDragging: false,
    currentBlock: null,
    dragElement: null,
    ghostCells: [],
    startX: 0,
    startY: 0
};

/**
 * ドラッグ機能を初期化
 */
function initializeDragAndDrop() {
    const waitingContainers = document.querySelectorAll('.waiting-block-container');
    
    waitingContainers.forEach((container, index) => {
        // マウスイベント
        container.addEventListener('mousedown', handleMouseDown);
        
        // タッチイベント（モバイル対応）
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
    });
    
    // グローバルイベント
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
}

/**
 * マウスダウンハンドラー
 */
function handleMouseDown(event) {
    const container = event.currentTarget;
    const blockData = container.blockData;
    
    if (!blockData || container.classList.contains('disabled')) {
        return;
    }
    
    startDrag(event.clientX, event.clientY, container, blockData);
    event.preventDefault();
}

/**
 * タッチスタートハンドラー
 */
function handleTouchStart(event) {
    const container = event.currentTarget;
    const blockData = container.blockData;
    
    if (!blockData || container.classList.contains('disabled')) {
        return;
    }
    
    const touch = event.touches[0];
    startDrag(touch.clientX, touch.clientY, container, blockData);
    event.preventDefault();
}

/**
 * ドラッグ開始
 */
function startDrag(clientX, clientY, container, blockData) {
    dragState.isDragging = true;
    dragState.currentBlock = blockData;
    dragState.startX = clientX;
    dragState.startY = clientY;
    
    // ドラッグ用のブロック要素を作成
    createDragElement(blockData, clientX, clientY);
    
    // 元のコンテナを半透明に
    container.style.opacity = '0.3';
    
    document.body.style.cursor = 'grabbing';
}

/**
 * ドラッグ用の要素を作成
 * 特殊ブロックの視覚的区別を含む
 */
function createDragElement(blockData, x, y) {
    const dragElement = document.createElement('div');
    dragElement.className = 'dragging-block';
    dragElement.style.position = 'fixed';
    dragElement.style.left = x + 'px';
    dragElement.style.top = y + 'px';
    dragElement.style.zIndex = '1000';
    dragElement.style.pointerEvents = 'none';
    
    // 特殊ブロックの場合、特別なエフェクトを追加
    const isSpecial = blockData.special || false;
    if (isSpecial) {
        dragElement.classList.add('special-dragging');
        dragElement.style.filter = 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))';
    }
    
    // ブロック形状を作成
    const blockVisual = createBlockVisual(blockData.pattern, blockData.color, 30, isSpecial);
    dragElement.appendChild(blockVisual);
    
    document.body.appendChild(dragElement);
    dragState.dragElement = dragElement;
}

/**
 * マウス移動ハンドラー
 */
function handleMouseMove(event) {
    if (!dragState.isDragging) return;
    
    updateDragPosition(event.clientX, event.clientY);
    updateGhostPreview(event.clientX, event.clientY);
}

/**
 * タッチ移動ハンドラー
 */
function handleTouchMove(event) {
    if (!dragState.isDragging) return;
    
    const touch = event.touches[0];
    updateDragPosition(touch.clientX, touch.clientY);
    updateGhostPreview(touch.clientX, touch.clientY);
    event.preventDefault();
}

/**
 * ドラッグ要素の位置を更新
 */
function updateDragPosition(x, y) {
    if (dragState.dragElement) {
        const offsetX = -dragState.dragElement.offsetWidth / 2;
        const offsetY = -dragState.dragElement.offsetHeight / 2;
        
        dragState.dragElement.style.left = (x + offsetX) + 'px';
        dragState.dragElement.style.top = (y + offsetY) + 'px';
    }
}

/**
 * ゴーストプレビューを更新
 */
function updateGhostPreview(x, y) {
    clearGhostPreview();
    
    const gameBoard = document.getElementById('game-board');
    const boardRect = gameBoard.getBoundingClientRect();
    
    // ゲームボード上にマウスがあるかチェック
    if (x >= boardRect.left && x <= boardRect.right &&
        y >= boardRect.top && y <= boardRect.bottom) {
        
        // ボード内の相対座標を計算
        const relativeX = x - boardRect.left;
        const relativeY = y - boardRect.top;
        
        // セル位置を計算（パディングとギャップを考慮）
        const padding = 10;
        const cellSize = 40;
        const gap = 2;
        
        const col = Math.floor((relativeX - padding) / (cellSize + gap));
        const row = Math.floor((relativeY - padding) / (cellSize + gap));
        
        // ブロックが配置可能かチェック
        if (row >= 0 && col >= 0 && 
            canPlaceBlock(gameState.board, dragState.currentBlock.pattern, row, col)) {
            showGhostPreview(row, col, dragState.currentBlock.pattern);
        }
    }
}

/**
 * ゴーストプレビューを表示
 */
function showGhostPreview(startRow, startCol, pattern) {
    const ghostOverlay = document.getElementById('ghost-overlay');
    const gameBoard = document.getElementById('game-board');
    const boardRect = gameBoard.getBoundingClientRect();
    const overlayRect = ghostOverlay.getBoundingClientRect();
    
    const padding = 10;
    const cellSize = 40;
    const gap = 2;
    
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === 1) {
                const ghostCell = document.createElement('div');
                ghostCell.className = 'ghost-cell visible';
                
                const cellRow = startRow + row;
                const cellCol = startCol + col;
                
                const left = padding + cellCol * (cellSize + gap);
                const top = padding + cellRow * (cellSize + gap);
                
                ghostCell.style.left = left + 'px';
                ghostCell.style.top = top + 'px';
                ghostCell.style.width = cellSize + 'px';
                ghostCell.style.height = cellSize + 'px';
                
                ghostOverlay.appendChild(ghostCell);
                dragState.ghostCells.push(ghostCell);
            }
        }
    }
}

/**
 * ゴーストプレビューをクリア
 */
function clearGhostPreview() {
    dragState.ghostCells.forEach(cell => {
        if (cell.parentNode) {
            cell.parentNode.removeChild(cell);
        }
    });
    dragState.ghostCells = [];
}

/**
 * マウスアップハンドラー
 */
function handleMouseUp(event) {
    if (!dragState.isDragging) return;
    
    handleDrop(event.clientX, event.clientY);
}

/**
 * タッチエンドハンドラー
 */
function handleTouchEnd(event) {
    if (!dragState.isDragging) return;
    
    const touch = event.changedTouches[0];
    handleDrop(touch.clientX, touch.clientY);
}

/**
 * ドロップ処理
 */
function handleDrop(x, y) {
    const gameBoard = document.getElementById('game-board');
    const boardRect = gameBoard.getBoundingClientRect();
    
    let placed = false;
    
    // ゲームボード上にドロップされた場合
    if (x >= boardRect.left && x <= boardRect.right &&
        y >= boardRect.top && y <= boardRect.bottom) {
        
        const relativeX = x - boardRect.left;
        const relativeY = y - boardRect.top;
        
        const padding = 10;
        const cellSize = 40;
        const gap = 2;
        
        const col = Math.floor((relativeX - padding) / (cellSize + gap));
        const row = Math.floor((relativeY - padding) / (cellSize + gap));
        
        // ブロックを配置
        if (row >= 0 && col >= 0 && 
            canPlaceBlock(gameState.board, dragState.currentBlock.pattern, row, col)) {
            
            placeBlockOnBoard(gameState.board, dragState.currentBlock.pattern, row, col);
            updateGameBoard();
            
            // 特殊ブロックが使用されたかチェック
            const isSpecialBlockUsed = dragState.currentBlock.special || false;
            
            // 配置されたブロックを待機エリアから削除
            const containers = document.querySelectorAll('.waiting-block-container');
            containers.forEach(container => {
                if (container.blockData === dragState.currentBlock) {
                    container.blockData = null;
                    container.innerHTML = '<div class="waiting-block"></div>';
                    container.classList.add('disabled');
                    container.classList.remove('special-container');
                }
            });
            
            // 特殊ブロック配置時の特別エフェクト
            if (isSpecialBlockUsed) {
                showSpecialPlacementEffect(row, col);
                // 即座に特殊ブロックボーナスを追加
                addScore(0, true);
            }
            
            // 行や列の削除チェック
            checkAndClearLines();
            
            // 新しいブロックを生成
            generateNewBlocks();
            
            placed = true;
        }
    }
    
    // ドラッグ終了処理
    endDrag(placed);
}

/**
 * ドラッグ終了
 */
function endDrag(placed) {
    // ドラッグ要素を削除
    if (dragState.dragElement) {
        document.body.removeChild(dragState.dragElement);
        dragState.dragElement = null;
    }
    
    // ゴーストプレビューをクリア
    clearGhostPreview();
    
    // 元のコンテナの透明度を戻す
    const containers = document.querySelectorAll('.waiting-block-container');
    containers.forEach(container => {
        if (!placed && container.blockData === dragState.currentBlock) {
            container.style.opacity = '1';
        }
    });
    
    // ドラッグ状態をリセット
    dragState.isDragging = false;
    dragState.currentBlock = null;
    
    document.body.style.cursor = 'default';
}

/**
 * ブロックが配置可能かチェック（待機エリアの更新用）
 */
function updateBlockAvailability() {
    const containers = document.querySelectorAll('.waiting-block-container');
    
    containers.forEach(container => {
        if (container.blockData) {
            let canPlace = false;
            
            // ボード全体をチェックして配置可能な場所があるか確認
            for (let row = 0; row < gameState.board.length; row++) {
                for (let col = 0; col < gameState.board[0].length; col++) {
                    if (canPlaceBlock(gameState.board, container.blockData.pattern, row, col)) {
                        canPlace = true;
                        break;
                    }
                }
                if (canPlace) break;
            }
            
            if (canPlace) {
                container.classList.remove('disabled');
            } else {
                container.classList.add('disabled');
            }
        }
    });
}

/**
 * 特殊ブロック配置時の特別エフェクト
 */
function showSpecialPlacementEffect(row, col) {
    const gameBoard = document.getElementById('game-board');
    const effectElement = document.createElement('div');
    effectElement.className = 'special-placement-effect';
    
    // エフェクトの位置を計算
    const padding = 10;
    const cellSize = 40;
    const gap = 2;
    
    const left = padding + col * (cellSize + gap) + (cellSize / 2);
    const top = padding + row * (cellSize + gap) + (cellSize / 2);
    
    effectElement.style.cssText = `
        position: absolute;
        left: ${left}px;
        top: ${top}px;
        width: 60px;
        height: 60px;
        background: radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0) 70%);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
        z-index: 100;
        animation: specialPlacementPulse 0.8s ease-out;
    `;
    
    gameBoard.appendChild(effectElement);
    
    // アニメーション終了後に削除
    setTimeout(() => {
        if (gameBoard.contains(effectElement)) {
            gameBoard.removeChild(effectElement);
        }
    }, 800);
}