document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    // 新しく追加する要素
    const inputText = document.getElementById('inputText');
    const drawTextButton = document.getElementById('drawTextButton');

    let baseImage = null;
    let overlayImage = new Image();
    // ここで固定の透過画像のパスを指定します
    overlayImage.src = 'transparent_overlay.png';
    overlayImage.crossOrigin = "Anonymous"; // CORS問題を避けるため（外部画像の場合）

    // テキストを描画するための変数
    let currentText = "";
    let textX = 0; // テキストのX座標
    let textY = 0; // テキストのY座標

    // 透過画像が読み込まれたらメッセージを非表示にする
    overlayImage.onload = () => {
        console.log('透過画像が読み込まれました。');
        // 元画像が選択されている、またはテキストが入力されている場合に描画
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
            downloadButton.disabled = true; // 処理中はダウンロードボタンを無効化

            const reader = new FileReader();
            reader.onload = (e) => {
                baseImage = new Image();
                baseImage.onload = () => {
                    // キャンバスのサイズを元画像に合わせる
                    imageCanvas.width = baseImage.width;
                    imageCanvas.height = baseImage.height;

                    // テキストの初期位置を画像の中央に設定
                    textX = imageCanvas.width / 2;
                    textY = imageCanvas.height / 2;

                    drawImages(); // 画像が読み込まれたら描画
                    downloadButton.disabled = false; // 描画後にダウンロードボタンを有効化
                    messageElement.classList.add('hidden'); // メッセージを非表示に
                };
                baseImage.onerror = () => {
                    messageElement.textContent = 'エラー: 元画像の読み込みに失敗しました。';
                    messageElement.classList.remove('hidden');
                    downloadButton.disabled = true;
                    baseImage = null; // エラー時は画像をクリア
                };
                baseImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            // ファイルが選択されていない場合はキャンバスをクリアし、ボタンを無効化
            baseImage = null;
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            imageCanvas.width = 0; // キャンバスのサイズをリセット
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


    // 画像を描画する関数 (テキスト描画ロジックを追加)
    function drawImages() {
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height); // キャンバスをクリア

        if (baseImage) {
            ctx.drawImage(baseImage, 0, 0, imageCanvas.width, imageCanvas.height); // 元画像を描画
        }

        if (overlayImage.complete && overlayImage.naturalWidth > 0) { // 透過画像が完全に読み込まれているか、かつ有効な画像か確認
            // 透過画像の位置とサイズを調整
            // 例: 元画像全体を覆うように拡大・縮小して描画
            ctx.drawImage(overlayImage, 0, 0, imageCanvas.width, imageCanvas.height);
        } else {
            console.warn('透過画像がまだ読み込まれていないか、破損しています。');
        }

        // テキストの描画
        if (currentText && baseImage) { // テキストがあり、元画像が読み込まれていれば描画
            ctx.font = 'bold 50px Arial'; // フォント、サイズ、スタイルを設定
            ctx.fillStyle = 'white'; // テキストの色
            ctx.strokeStyle = 'black'; // テキストの縁の色
            ctx.lineWidth = 2; // テキストの縁の太さ
            ctx.textAlign = 'center'; // 水平方向の中心に揃える
            ctx.textBaseline = 'middle'; // 垂直方向の中心に揃える

            ctx.fillText(currentText, textX, textY); // テキストを塗りつぶしで描画
            ctx.strokeText(currentText, textX, textY); // テキストの縁を描画

            // ※テキストの位置調整（例: テキストボックスの下に表示するなど）は、
            //   textX, textY の値を調整することで可能です。
            //   ユーザーがドラッグして位置を調整する機能などは、さらに高度なJavaScriptが必要です。
        }
    }

    // ダウンロードボタンがクリックされたときの処理
    downloadButton.addEventListener('click', () => {
        if (baseImage && imageCanvas.width > 0 && imageCanvas.height > 0) {
            // 合成された画像をPNG形式でエクスポート（透過情報が保持される）
            const dataURL = imageCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'merged_image.png'; // ダウンロード時のファイル名
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
