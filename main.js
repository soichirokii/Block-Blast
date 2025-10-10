/**
 * メインエントリーポイント
 */

// DOM読み込み完了後にゲームを初期化
document.addEventListener('DOMContentLoaded', function() {
    // ゲームを初期化
    initializeGame();
    
    // New Gameボタンのイベントリスナー
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', restartGame);
    }
    
    console.log('Block Blast game initialized!');
});

// グローバル関数として公開（HTMLから呼び出し可能にする）
window.restartGame = restartGame;