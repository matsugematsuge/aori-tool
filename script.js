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
        let overlayDrawHeight = 0;

        // 2. 透過画像を元画像の上に描画（アスペクト比を維持し、下中央に配置）
        if (baseImage && overlayImage.complete && overlayImage.naturalWidth > 0) {
            const baseAspect = imageCanvas.width / imageCanvas.height;
            const overlayAspect = overlayImage.naturalWidth / overlayImage.naturalHeight;

            // 透過画像がCanvas（元画像）の幅に合わせて調整
            // まずは幅に合わせて拡大/縮小
            drawWidth = imageCanvas.width;
            drawHeight = drawWidth / overlayAspect;

            // もし幅に合わせて調整した高さがCanvasの高さより大きい場合は、高さを基準に調整
            if (drawHeight > imageCanvas.height) {
                drawHeight = imageCanvas.height;
                drawWidth = drawHeight * overlayAspect;
            }

            // X座標を中央に配置
            overlayDrawX = (imageCanvas.width - drawWidth) / 2;
            // Y座標を最下部に配置
            overlayDrawY = imageCanvas.height - drawHeight;

            // 透過画像を描画
            ctx.drawImage(overlayImage, overlayDrawX, overlayDrawY, drawWidth, drawHeight);

            // 透過画像の描画情報を保存 (テキストの位置計算に使うため)
            overlayDrawWidth = drawWidth;
            overlayDrawHeight = drawHeight;

        } else if (!baseImage) {
            // 元画像がない場合は透過画像も描画しない
        } else {
            console.warn('透過画像がまだ読み込まれていないか、破損しています。');
        }

        // 3. テキストを描画
        if (currentText && baseImage) { // テキストがあり、元画像が読み込まれていれば描画
            // Canvasコンテキストのスタイル設定
            // ここでfixedFontSizeではなくcurrentFontSizeを使用
            ctx.font = `${currentFontSize}px "${fixedFontFamily}"`; 
            ctx.fillStyle = fixedFillStyle;
            ctx.strokeStyle = fixedStrokeStyle;
            ctx.lineWidth = fixedLineWidth;

            // テキストのX座標: 透過画像の左端位置 + スライダーのオフセット
            const textX = overlayDrawX + currentPosXOffset;
            // テキストのY座標: 透過画像の上端位置 + 透過画像の高さ - スライダーのオフセット (透過画像の下端から上へ)
            const textY = overlayDrawY + overlayDrawHeight - currentPosYOffset;

            ctx.textAlign = 'left';          // 水平方向を左端に揃える
            ctx.textBaseline = 'alphabetic'; // 垂直方向の基準線（一般的な文字のベースライン）

            ctx.fillText(currentText, textX, textY);
            if (fixedLineWidth > 0) {
                ctx.strokeText(currentText, textX, textY);
            }
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

    // 初期状態ではダウンロードボタンを無効化
    downloadButton.disabled = true;

    // 初期表示時に現在のスライダー値を表示
    currentFontSizeSpan.textContent = `${fontSizeSlider.value}px`;
    currentPosXSpan.textContent = `${posXSlider.value}px`;
    currentPosYSpan.textContent = `${posYSlider.value}px`;
});
