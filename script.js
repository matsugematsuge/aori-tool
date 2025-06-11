document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    const inputText = document.getElementById('inputText');
    const drawTextButton = document.getElementById('drawTextButton');

    const fontSizeInput = document.getElementById('fontSizeInput');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const fontFamilyInput = document.getElementById('fontFamilyInput'); // 新しく追加
    const textXInput = document.getElementById('textXInput');
    const textYInput = document.getElementById('textYInput');
    const applyTextPositionButton = document.getElementById('applyTextPositionButton');
    const resetTextPositionButton = document.getElementById('resetTextPositionButton');

    let baseImage = null;
    let overlayImage = new Image();
    // ここで固定の透過画像のパスを指定します
    overlayImage.src = 'transparent_overlay.webp'; // または 'transparent_overlay.png'
    overlayImage.crossOrigin = "Anonymous";

    // テキスト描画のための変数
    let currentText = "";
    let textFontSize = parseInt(fontSizeInput.value); // 初期フォントサイズ
    let textFontFamily = fontFamilyInput.value; // 初期フォント
    let textX = 0; // テキストのX座標
    let textY = 0; // テキストのY座標

    // スライダーの初期値を表示に反映
    fontSizeValue.textContent = `${textFontSize}px`;

    // 透過画像が読み込まれたらメッセージを非表示にする
    overlayImage.onload = () => {
        console.log('透過画像が読み込まれました。');
        if (baseImage || currentText) {
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
                    imageCanvas.width = baseImage.width;
                    imageCanvas.height = baseImage.height;

                    // テキストの初期位置を画像の中央に設定
                    textX = imageCanvas.width / 2;
                    textY = imageCanvas.height / 2;
                    textXInput.value = Math.round(textX); // 入力フィールドにも反映
                    textYInput.value = Math.round(textY); // 入力フィールドにも反映

                    // フォントサイズの初期値を画像のサイズに基づいて調整（オプション）
                    // 例えば、画像の高さの1/10を初期サイズにするなど
                    // textFontSize = Math.max(10, Math.min(200, Math.round(imageCanvas.height * 0.1)));
                    // fontSizeInput.value = textFontSize;
                    // fontSizeValue.textContent = `${textFontSize}px`;

                    drawImages();
                    downloadButton.disabled = false;
                    messageElement.classList.add('hidden');
                };
                baseImage.onerror = () => {
                    messageElement.textContent = 'エラー: 元画像の読み込みに失敗しました。';
                    messageElement.classList.remove('hidden');
                    downloadButton.disabled = true;
                    baseImage = null;
                };
                baseImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            baseImage = null;
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            imageCanvas.width = 0;
            imageCanvas.height = 0;
            downloadButton.disabled = true;
            messageElement.classList.add('hidden');
        }
    });

    // 「テキストを描画」ボタンがクリックされたときの処理
    drawTextButton.addEventListener('click', () => {
        if (baseImage) {
            currentText = inputText.value;
            drawImages();
        } else {
            alert('元画像を先にアップロードしてください。');
        }
    });

    // フォントサイズスライダーのイベントリスナー
    fontSizeInput.addEventListener('input', () => {
        textFontSize = parseInt(fontSizeInput.value);
        fontSizeValue.textContent = `${textFontSize}px`;
        if (baseImage) { // 画像が読み込まれていればリアルタイムで反映
            drawImages();
        }
    });

    // フォントファミリー選択のイベントリスナー
    fontFamilyInput.addEventListener('change', () => {
        textFontFamily = fontFamilyInput.value;
        if (baseImage) { // 画像が読み込まれていればリアルタイムで反映
            drawImages();
        }
    });

    // 位置適用ボタンのイベントリスナー
    applyTextPositionButton.addEventListener('click', () => {
        if (baseImage) {
            textX = parseInt(textXInput.value);
            textY = parseInt(textYInput.value);
            drawImages();
        } else {
            alert('元画像を先にアップロードしてください。');
        }
    });

    // 位置リセットボタンのイベントリスナー
    resetTextPositionButton.addEventListener('click', () => {
        if (baseImage) {
            textX = imageCanvas.width / 2;
            textY = imageCanvas.height / 2;
            textXInput.value = Math.round(textX);
            textYInput.value = Math.round(textY);
            drawImages();
        } else {
            alert('元画像を先にアップロードしてください。');
        }
    });


    // 画像を描画する関数 (テキスト描画ロジックを含む)
    function drawImages() {
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

        if (baseImage) {
            ctx.drawImage(baseImage, 0, 0, imageCanvas.width, imageCanvas.height);
        }

        if (overlayImage.complete && overlayImage.naturalWidth > 0) {
            ctx.drawImage(overlayImage, 0, 0, imageCanvas.width, imageCanvas.height);
        } else {
            console.warn('透過画像がまだ読み込まれていないか、破損しています。');
        }

        // テキストの描画
        if (currentText && baseImage) {
            ctx.font = `bold ${textFontSize}px "${textFontFamily}"`; // フォントとサイズ、スタイルを設定
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = textFontSize / 20; // 太字の太さもフォントサイズに合わせる
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillText(currentText, textX, textY);
            ctx.strokeText(currentText, textX, textY);
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

    downloadButton.disabled = true;
});
