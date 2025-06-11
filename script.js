document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    const inputText = document.getElementById('inputText');
    const drawTextButton = document.getElementById('drawTextButton');

    // 固定するテキスト描画設定
    const fixedFontSize = 20; // 20pxに固定
    const fixedFontFamily = '"Yu Gothic", "Meiryo", "Hiragino Kaku Gothic ProN", sans-serif'; // ゴシック体
    const fixedFillStyle = 'black'; // 黒に固定
    const fixedStrokeStyle = 'transparent'; // 縁は透明
    const fixedLineWidth = 0; // 縁の太さ

    // テキストの固定位置オフセット
    const fixedOffsetX = 150; // 中央から左に150px
    const fixedBottomOffset = 80; // 下から80px上に固定

    let baseImage = null;
    let overlayImage = new Image();
    overlayImage.src = 'overlay.png'; // 透過画像の名前は 'overlay.png'
    overlayImage.crossOrigin = "Anonymous";

    let currentText = ""; // ユーザーが入力したテキスト

    // 透過画像が読み込まれたら Canvas を描画
    overlayImage.onload = () => {
        console.log('透過画像が読み込まれました。');
        // baseImage がなくても overlayImage を描画するために drawImages を呼び出す
        // ただし、Canvasサイズが決定されていない場合があるので初期描画用の処理を考慮
        if (!baseImage) { // baseImageがまだ読み込まれていない場合のみ
            // 初期表示用のCanvasサイズを設定（例として固定値か、透過画像のサイズを使用）
            // ここでは、デフォルトで仮のサイズを設定するか、透過画像のサイズを初期
