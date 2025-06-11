document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    // inputText が textarea になったことを想定
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
    const fontFamily = 'Arial, sans-serif'; // 汎用的なフォント
    const fillStyle = 'black'; // 黒に固定
    const strokeStyle = 'transparent'; // 縁は透明
    const lineWidth = 0; // 縁の太さ
    const lineHeightMultiplier = 1.2; // 行の高さの倍率 (フォントサイズの1.2倍)

    let baseImage = null;
    let overlayImage = new Image();
    overlayImage.src = 'overlay.png'; // 透過画像の名前は 'overlay.png'
    overlayImage.crossOrigin = "Anonymous"; // CORSエラーを避けるため

    // --- イベントリスナー ---

    // 透過画像の読み込み完了
    overlayImage.onload = () => {
        console.log('透過画像が読み込まれました。');
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
                drawImages(); 
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

        if (baseImage) {
            drawImages(); // 設定変更時にリアルタイムで再描画
        }
    }

    // ダウンロードボタンがクリックされたときの処理
    downloadButton.addEventListener('click', () => {
        if (baseImage && imageCanvas.width > 0 && imageCanvas.height > 0) {
            const dataURL = imageCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'merged_image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('合成する画像がありません。元画像をアップロードしてください。');
        }
    });

    // --- ヘルパー関数 ---

    // 画像とテキストを描画するメイン関数
    function drawImages() {
        if (imageCanvas.width === 0 || imageCanvas.height === 0) {
            return;
        }

        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height); 

        // 1. 元画像を背景に描画
        if (baseImage) {
            ctx.drawImage(baseImage, 0, 0, imageCanvas.width, imageCanvas.height);
        }

        let overlayDrawX = 0;
        let overlayDrawY = 0;
        let overlayDrawWidth = 0;
        let overlayDrawHeight = 0;

        // 2. 透過画像を元画像の上に描画（アスペクト比を維持し、下中央に配置）
        if (baseImage && overlayImage.complete && overlayImage.naturalWidth > 0) {
            const overlayAspect = overlayImage.naturalWidth / overlayImage.naturalHeight;

            let drawWidth = imageCanvas.width;
            let drawHeight = drawWidth / overlayAspect;

            if (drawHeight > imageCanvas.height) {
                drawHeight = imageCanvas.height;
                drawWidth = drawHeight * overlayAspect;
            }

            overlayDrawX = (imageCanvas.width - drawWidth) / 2;
            overlayDrawY = imageCanvas.height - drawHeight;

            ctx.drawImage(overlayImage, overlayDrawX, overlayDrawY, drawWidth, drawHeight);

            overlayDrawWidth = drawWidth;
            overlayDrawHeight = drawHeight;

        } else if (!baseImage) {
            // 元画像がない場合は透過画像も描画しない
        } else {
            console.warn('透過画像がまだ読み込まれていないか、破損しています。');
        }

        // 3. テキストを描画
        if (currentText && baseImage) {
            ctx.font = `${currentFontSize}px "${fontFamily}"`; 
            ctx.fillStyle = fillStyle;
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;

            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic'; 

            // テキストを改行文字で分割
            const lines = currentText.split('\n');
            // 行の高さ
            const lineHeight = currentFontSize * lineHeightMultiplier;

            // テキストブロックの最下行のベースラインが基準位置になるように調整
            // Y座標の計算ロジックは、テキストブロック全体の高さを考慮して調整されます
            let startY = overlayDrawY + overlayDrawHeight - currentPosYOffset; 
            
            // 最初の行のY座標 = startY - (行数 - 1) * 行の高さ
            const totalTextHeight = (lines.length - 1) * lineHeight;
            let currentLineY = startY - totalTextHeight;


            lines.forEach((line, index) => {
                const lineY = currentLineY + (index * lineHeight); // 各行のY座標
                const textX = overlayDrawX + currentPosXOffset; // X座標は共通

                ctx.fillText(line, textX, lineY);
                if (lineWidth > 0) {
                    ctx.strokeText(line, textX, lineY);
                }
            });
        }
    }

    // Canvasとボタンの状態をリセットする関数
    function resetCanvasAndButtons() {
        baseImage = null;
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        imageCanvas.width = 0;
        imageCanvas.height = 0;
        downloadButton.disabled = true;
        messageElement.classList.add('hidden');
    }

    // --- 初期化 ---
    downloadButton.disabled = true; 
    updateTextSettings(); 
});
