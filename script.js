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
    const fixedFontFamily = 'sans-serif'; // ゴシック系フォント (多くのシステムで利用可能)
    const fixedFillStyle = 'black'; // 黒に固定
    const fixedStrokeStyle = 'transparent'; // 縁は透明 (必要なければ削除してもOK)
    const fixedLineWidth = 0; // 縁の太さ (縁がないので0)

    // 固定するY座標のオフセット (下から少し上)
    // Canvasの高さからこの値を引いた位置がテキストのY座標になる
    const fixedBottomOffset = 20; // 画像の下端から20px上に固定

    let baseImage = null;
    let overlayImage = new Image();
    // ここで固定の透過画像のパスを指定します
    overlayImage.src = 'transparent_overlay.webp'; // または 'transparent_overlay.png'
    overlayImage.crossOrigin = "Anonymous";

    let currentText = ""; // ユーザーが入力したテキスト

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
            ctx.font = `${fixedFontSize}px "${fixedFontFamily}"`;
            ctx.fillStyle = fixedFillStyle;
            ctx.strokeStyle = fixedStrokeStyle;
            ctx.lineWidth = fixedLineWidth;

            // テキストのX座標を中央に固定
            const textX = imageCanvas.width / 2;
            // テキストのY座標を下から少し上に固定
            // textBaselineを'alphabetic'（デフォルト）として、フォントのベースラインがY座標に来るようにする
            // もしテキストが完全にY座標の上に来るようにしたい場合は、textBaselineを'bottom'に変更し、
            // Y座標を fixedBottomOffset そのままにする
            const textY = imageCanvas.height - fixedBottomOffset;

            ctx.textAlign = 'center'; // 水平方向の中心に揃える
            ctx.textBaseline = 'alphabetic'; // 垂直方向の基準線（下から上に描画される文字の一般的な基準）

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

    downloadButton.disabled = true;
});
