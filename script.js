document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    const inputText = document.getElementById('inputText');
    const drawTextButton = document.getElementById('drawTextButton');

    // 固定するテキスト描画設定
    const fixedFontSize = 25; // 25pxに固定
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

    // 透過画像が読み込まれても、ここでは描画をトリガーしない
    overlayImage.onload = () => {
        console.log('透過画像が読み込まれました。');
        // 初期表示では透過画像は描画せず、元画像が読み込まれた時に描画する
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

    // 画像とテキストを描画する関数
    function drawImages() {
        // Canvasのサイズが0の場合、描画しない
        if (imageCanvas.width === 0 || imageCanvas.height === 0) {
            return;
        }

        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

        if (baseImage) {
            ctx.drawImage(baseImage, 0, 0, imageCanvas.width, imageCanvas.height);
        }

        // 透過画像は baseImage が存在する場合のみ描画
        if (baseImage && overlayImage.complete && overlayImage.naturalWidth > 0) {
            ctx.drawImage(overlayImage, 0, 0, imageCanvas.width, imageCanvas.height);
        } else if (!baseImage) {
            // 元画像がない場合で、Canvasが空の場合にメッセージを表示（オプション）
            // messageElement.textContent = '元画像をアップロードしてください。';
            // messageElement.classList.remove('hidden');
        } else {
            console.warn('透過画像がまだ読み込まれていないか、破損しています。');
        }

        // テキストの描画
        if (currentText && baseImage) { // テキストがあり、元画像が読み込まれていれば描画
            // Canvasコンテキストのスタイル設定
            ctx.font = `${fixedFontSize}px "${fixedFontFamily}"`;
            ctx.fillStyle = fixedFillStyle;
            ctx.strokeStyle = fixedStrokeStyle;
            ctx.lineWidth = fixedLineWidth;

            // テキストのX座標: 中央から左にオフセット
            const textX = (imageCanvas.width / 2) - fixedOffsetX;
            // テキストのY座標: 下から上にオフセット
            const textY = imageCanvas.height - fixedBottomOffset;

            ctx.textAlign = 'center';       // 水平方向の中心に揃える
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

    // ページロード時の初期描画は行わないため、overlayImage.onload からの呼び出しは削除
    // Canvasの初期状態は空にするため、明示的な初期描画処理は不要
});
