document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    const inputText = document.getElementById('inputText');
    const drawTextButton = document.getElementById('drawTextButton');

    // スライダーと値表示要素の取得
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const currentFontSizeSpan = document.getElementById('currentFontSize');
    const posXSlider = document.getElementById('posXSlider');
    const currentPosXSpan = document.getElementById('currentPosX');
    const posYSlider = document.getElementById('posYSlider');
    const currentPosYSpan = document.getElementById('currentPosY');

    // 初期値設定 (HTMLのvalue属性と合わせる)
    let currentFontSize = parseInt(fontSizeSlider.value);
    let currentPosXOffset = parseInt(posXSlider.value);
    let currentPosYOffset = parseInt(posYSlider.value);

    // テキスト描画の固定設定
    // fixedFontSize は削除
    const fixedFontFamily = '"Yu Gothic", "Meiryo", "Hiragino Kaku Gothic ProN", sans-serif'; // ゴシック体
    const fixedFillStyle = 'black'; // 黒に固定
    const fixedStrokeStyle = 'transparent'; // 縁は透明
    const fixedLineWidth = 0; // 縁の太さ

    let baseImage = null;
    let overlayImage = new Image();
    overlayImage.src = 'overlay.png'; // 透過画像の名前は 'overlay.png'
    overlayImage.crossOrigin = "Anonymous"; // CORSエラーを避けるため

    let currentText = inputText.value; // 初期テキスト

    // 透過画像が読み込まれても、ここでは描画をトリガーしない
    overlayImage.onload = () => {
        console.log('透過画像が読み込まれました。');
        // 元画像が既に読み込まれている場合のみ、透過画像を再描画
        if (baseImage) {
            drawImages();
        }
    };

    overlayImage.onerror = () => {
        console.error('透過画像の読み込みに失敗しました。パスを確認してください。');
        messageElement.textContent = 'エラー: 透過画像が見つかりません。';
        messageElement.classList.remove('hidden');
    };

    // 元画像が選択されたときの処理
    baseImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            messageElement.textContent = '画像を読み込み中です...';
            messageElement.classList.remove('hidden');
            downloadButton.disabled = true;

            const reader = new FileReader();
            reader.onload = (e) => {
                baseImage = new Image();
                baseImage.onload = () => {
                    // Canvasのサイズを元画像に合わせる (DPI非考慮)
                    imageCanvas.width = baseImage.width;
                    imageCanvas.height = baseImage.height;

                    drawImages(); // 元画像が読み込まれたら描画
                    downloadButton.disabled = false;
                    messageElement.classList.add('hidden');
                };
                baseImage.onerror = () => {
                    messageElement.textContent = 'エラー: 元画像の読み込みに失敗しました。';
                    messageElement.classList.remove('hidden');
                    downloadButton.disabled = true;
                    baseImage = null;
                    // 元画像が読み込めない場合はCanvasをクリア
                    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
                    imageCanvas.width = 0;
                    imageCanvas.height = 0;
                };
                baseImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            baseImage = null; // 元画像をクリア
            // 元画像がクリアされたらCanvasもクリア
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            imageCanvas.width = 0;
            imageCanvas.height = 0;
            downloadButton.disabled = true;
            messageElement.classList.add('hidden');
        }
    });

    // 「テキストを描画」ボタンがクリックされたときの処理
    drawTextButton.addEventListener('click', () => {
        if (baseImage) { // 元画像が読み込まれている場合のみ描画
            currentText = inputText.value;
            drawImages();
        } else {
            alert('元画像を先にアップロードしてください。');
        }
    });

    // テキスト入力欄が変更されたらリアルタイム描画
    inputText.addEventListener('input', () => {
        if (baseImage) {
            currentText = inputText.value;
            drawImages();
        }
    });

    // フォントサイズスライダーの変更イベント
    fontSizeSlider.addEventListener('input', (event) => {
        currentFontSize = parseInt(event.target.value);
        currentFontSizeSpan.textContent = `${currentFontSize}px`;
        if (baseImage) {
            drawImages();
        }
    });

    // X位置スライダーの変更イベント
    posXSlider.addEventListener('input', (event) => {
        currentPosXOffset = parseInt(event.target.value);
        currentPosXSpan.textContent = `${currentPosXOffset}px`;
        if (baseImage) {
            drawImages();
        }
    });

    // Y位置スライダーの変更イベント
    posYSlider.addEventListener('input', (event) => {
        currentPosYOffset = parseInt(event.target.value);
        currentPosYSpan.textContent = `${currentPosYOffset}px`;
        if (baseImage) {
            drawImages();
        }
    });

    // 画像とテキストを描画する関数
    function drawImages() {
        // Canvasのサイズが0の場合、描画しない
        if (imageCanvas.width === 0 || imageCanvas.height === 0) {
            return;
        }

        // Canvasをクリアする前に、以前のDPIスケーリングがあればリセット
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

        // 1. 元画像を背景に描画
        if (baseImage) {
            ctx.drawImage(baseImage, 0, 0, imageCanvas.width, imageCanvas.height);
        }

        let overlayDrawX = 0;
        let overlayDrawY = 0;
        let overlayDrawWidth = 0;
        let overlayDrawHeight =
