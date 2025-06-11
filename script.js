document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    const inputText = document.getElementById('inputText');
    const drawTextButton = document.getElementById('drawTextButton');

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
    let currentText = inputText.value; // 初期テキスト

    // テキスト描画の固定設定
    const fontFamily = '"Yu Gothic", "Meiryo", "Hiragino Kaku Gothic ProN", sans-serif'; // ゴシック体
    const fillStyle = 'black'; // 黒に固定
    const strokeStyle = 'transparent'; // 縁は透明
    const lineWidth = 0; // 縁の太さ

    let baseImage = null;
    let overlayImage = new Image();
    overlayImage.src = 'overlay.png'; // 透過画像の名前は 'overlay.png'
    overlayImage.crossOrigin = "Anonymous"; // CORSエラーを避けるため

    // --- イベントリスナー ---

    // 透過画像の読み込み完了
    overlayImage.onload = () => {
        console.log('透過画像が読み込まれました。');
        // 元画像があれば再描画を試みる
        if (baseImage) {
            drawImages();
        }
    };

    // 透過画像の読み込みエラー
    overlayImage.onerror = () => {
        console.error('透過画像の読み込みに失敗しました。パスを確認してください。');
        messageElement.textContent = 'エラー: 透過画像が見つかりません。';
        messageElement.classList.remove('hidden');
    };

    // 元画像が選択されたときの処理
    baseImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            resetCanvasAndButtons();
            return;
        }

        messageElement.textContent = '画像を読み込み中です...';
        messageElement.classList.remove('hidden');
        downloadButton.disabled = true;

        const reader = new FileReader();
        reader.onload = (e) => {
            baseImage = new Image();
            baseImage.onload = () => {
                imageCanvas.width = baseImage.width;
                imageCanvas.height = baseImage.height;
                drawImages(); // 元画像読み込み後、初回描画
                downloadButton.disabled = false;
                messageElement.classList.add('hidden');
            };
            baseImage.onerror = () => {
                messageElement.textContent = 'エラー: 元画像の読み込みに失敗しました。';
                messageElement.classList.remove('hidden');
                resetCanvasAndButtons();
            };
            baseImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 「テキストを描画」ボタンクリックまたはテキスト入力変更
    drawTextButton.addEventListener('click', () => {
        if (baseImage) {
            currentText = inputText.value;
            drawImages();
        } else {
            alert('元画像を先にアップロードしてください。');
        }
    });

    inputText.addEventListener('input', () => {
        // リアルタイムでテキストプレビュー
        if (baseImage) {
            currentText = inputText.value;
            drawImages();
        }
    });

    // スライダー変更イベント
    fontSizeSlider.addEventListener('input', updateTextSettings);
    posXSlider.addEventListener('input', updateTextSettings);
    posYSlider.addEventListener('input', updateTextSettings);

    function updateTextSettings() {
        currentFontSize = parseInt(fontSizeSlider.value);
        currentPosXOffset = parseInt(posXSlider.value);
        currentPosYOffset = parseInt(posYSlider.value);

        currentFontSizeSpan.textContent = `${currentFontSize}px`;
        currentPosXSpan.textContent = `${currentPosXOffset}px`;
        currentPosYSpan.textContent = `${currentPosYOffset}px`;

        console.log('スライダーで設定されたフォントサイズ
