document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    const inputText = document.getElementById('inputText');
    const drawTextButton = document.getElementById('drawTextButton');

    // 固定するテキスト描画設定
    const fixedFontSize = 40; // 30pxから10px大きくして40pxに
    const fixedFontFamily = '"Yu Gothic", "Meiryo", "Hiragino Kaku Gothic ProN", sans-serif'; // ゴシック体
    const fixedFillStyle = 'black'; // 黒に固定
    const fixedStrokeStyle = 'transparent'; // 縁は透明
    const fixedLineWidth = 0; // 縁の太さ

    // テキストの固定位置オフセット (透過画像基準)
    const textOffsetXFromOverlayLeft = 35; // 透過画像の左端から右に35px
    const textOffsetYFromOverlayBottom = 70; // 透過画像の下端から上に70px

    let baseImage = null;
    let overlayImage = new Image();
    overlayImage.src = 'overlay.png'; // 透過画像の名前は 'overlay.png'
    overlayImage.crossOrigin = "Anonymous"; // CORSエラーを避けるため

    let currentText = ""; // ユーザーが入力したテキスト

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

    // 「
