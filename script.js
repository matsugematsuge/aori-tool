document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    const inputText = document.getElementById('inputText');
    const drawTextButton = document.getElementById('drawTextButton');

    // 固定するテキスト描画設定
    const fixedFontSize = 13; // 13pxに固定
    // より確実にゴシック体に見せるためのフォント指定
    const fixedFontFamily = '"Yu Gothic", "Meiryo", "Hiragino Kaku Gothic ProN", sans-serif';
    const fixedFillStyle = 'black'; // 黒に固定
    const fixedStrokeStyle = 'transparent'; // 縁は透明
    const fixedLineWidth = 0; // 縁の太さ

    // 固定するY座標のオフセット (下から少し上)
    const fixedBottomOffset = 20; // 画像の下端から20px上に固定 (ピクセル単位)

    let baseImage = null;
    let overlayImage = new Image();
    // 透過画像の名前を 'overlay.webp' に変更
    overlayImage.src = 'overlay.webp';
    overlayImage.crossOrigin = "Anonymous";

    let currentText = ""; // ユーザーが入力したテキスト

    // 透過画像が読み込まれたらメッセージを非表示にする
    overlayImage.onload = () => {
        console.log('透過画像が読み込まれました。');
        // 元画像とテキストが揃っていれば描画を試みる
        if (baseImage && currentText) {
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

                    drawImages(); // 画像が読み込まれたら描画
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
        if (baseImage) { // 元画像が読み込まれている場合のみ描画
            currentText = inputText.value; // 入力されたテキストを保存
            drawImages(); // 再描画してテキストを反映
        } else {
            alert('元画像を先にアップロードしてください。');
        }
    });

    // 画像を描画する関数 (テキスト描画ロジックを含む)
    function drawImages() {
        // Canvasの描画バッファが0の場合、描画しない
        if (imageCanvas.width === 0 || imageCanvas.height === 0) {
            return;
        }

        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

        if (baseImage) {
            ctx.drawImage(baseImage, 0, 0, imageCanvas.width, imageCanvas.height);
        }

        // 透過画像が読み込まれていれば描画
        if (overlayImage.complete && overlayImage.naturalWidth > 0) {
            ctx.drawImage(overlayImage, 0, 0, imageCanvas.width, imageCanvas.height);
        } else {
            console.warn('透過画像がまだ読み込まれていないか、破損しています。');
        }

        // テキストの描画
        if (currentText && baseImage) { // テキストがあり、元画像が読み込まれていれば描画
            // Canvasコンテキストのスタイル設定
            ctx.font = `${fixedFontSize}px "${fixedFontFamily}"`; // サイズとフォントを適用
            ctx.fillStyle = fixedFillStyle; // 塗りつぶし色を適用
            ctx.strokeStyle = fixedStrokeStyle; // 縁の色を適用
            ctx.lineWidth = fixedLineWidth; // 縁の太さを適用

            // テキストのX座標を中央に固定
            const textX = imageCanvas.width / 2;
            // テキストのY座標を下から少し上に固定
            const textY = imageCanvas.height - fixedBottomOffset;

            ctx.textAlign = 'center';       // 水平方向の中心に揃える
            ctx.textBaseline = 'alphabetic'; // 垂直方向の基準線（一般的な文字のベースライン）

            ctx.fillText(currentText, textX, textY);
            if (fixedLineWidth > 0) { // 縁の太さが0より大きい場合のみ描画
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
});
