document.addEventListener('DOMContentLoaded', () => {
    const baseImageInput = document.getElementById('baseImageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const downloadButton = document.getElementById('downloadButton');
    const messageElement = document.getElementById('message');

    let baseImage = null;
    let overlayImage = new Image();
    // �����ŌŒ�̓��߉摜�̃p�X���w�肵�܂�
    // GitHub Pages�̃��[�g�f�B���N�g���ɒu���ꍇ�� 'transparent_overlay.png' ��OK�ł�
    overlayImage.src = 'transparent_overlay.png'; 
    overlayImage.crossOrigin = "Anonymous"; // CORS��������邽�߁i�O���摜�̏ꍇ�j

    // ���߉摜���ǂݍ��܂ꂽ�烁�b�Z�[�W���\���ɂ���
    overlayImage.onload = () => {
        console.log('���߉摜���ǂݍ��܂�܂����B');
        // ���摜���I������Ă��Ȃ��ꍇ�͕`�悵�Ȃ�
        if (baseImage) {
            drawImages();
        }
    };

    overlayImage.onerror = () => {
        console.error('���߉摜�̓ǂݍ��݂Ɏ��s���܂����B�p�X���m�F���Ă��������B');
        messageElement.textContent = '�G���[: ���߉摜��������܂���B';
        messageElement.classList.remove('hidden');
    };

    // ���摜���I�����ꂽ�Ƃ��̏���
    baseImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            messageElement.textContent = '�摜��ǂݍ��ݒ��ł�...';
            messageElement.classList.remove('hidden');
            downloadButton.disabled = true; // �������̓_�E�����[�h�{�^���𖳌���

            const reader = new FileReader();
            reader.onload = (e) => {
                baseImage = new Image();
                baseImage.onload = () => {
                    // �L�����o�X�̃T�C�Y�����摜�ɍ��킹��
                    imageCanvas.width = baseImage.width;
                    imageCanvas.height = baseImage.height;
                    drawImages(); // �摜���ǂݍ��܂ꂽ��`��
                    downloadButton.disabled = false; // �`���Ƀ_�E�����[�h�{�^����L����
                    messageElement.classList.add('hidden'); // ���b�Z�[�W���\����
                };
                baseImage.onerror = () => {
                    messageElement.textContent = '�G���[: ���摜�̓ǂݍ��݂Ɏ��s���܂����B';
                    messageElement.classList.remove('hidden');
                    downloadButton.disabled = true;
                    baseImage = null; // �G���[���͉摜���N���A
                };
                baseImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            // �t�@�C�����I������Ă��Ȃ��ꍇ�̓L�����o�X���N���A���A�{�^���𖳌���
            baseImage = null;
            ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            imageCanvas.width = 0; // �L�����o�X�̃T�C�Y�����Z�b�g
            imageCanvas.height = 0;
            downloadButton.disabled = true;
            messageElement.classList.add('hidden');
        }
    });

    // �摜��`�悷��֐�
    function drawImages() {
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height); // �L�����o�X���N���A

        if (baseImage) {
            ctx.drawImage(baseImage, 0, 0, imageCanvas.width, imageCanvas.height); // ���摜��`��
        }

        if (overlayImage.complete && overlayImage.naturalWidth > 0) { // ���߉摜�����S�ɓǂݍ��܂�Ă��邩�A���L���ȉ摜���m�F
            // ���߉摜�̈ʒu�ƃT�C�Y�𒲐�
            // ��: ���摜�S�̂𕢂��悤�Ɋg��E�k�����ĕ`��
            ctx.drawImage(overlayImage, 0, 0, imageCanvas.width, imageCanvas.height);

            // �K�v�ł���΁A���߉摜�̕s�����x��ݒ肷�邱�Ƃ��\
            // ctx.globalAlpha = 0.8; // ��: 80%�̕s�����x
            // ctx.drawImage(overlayImage, 0, 0, imageCanvas.width, imageCanvas.height);
            // ctx.globalAlpha = 1.0; // ���ɖ߂�
        } else {
            console.warn('���߉摜���܂��ǂݍ��܂�Ă��Ȃ����A�j�����Ă��܂��B');
        }
    }

    // �_�E�����[�h�{�^�����N���b�N���ꂽ�Ƃ��̏���
    downloadButton.addEventListener('click', () => {
        if (baseImage && imageCanvas.width > 0 && imageCanvas.height > 0) {
            // �������ꂽ�摜��PNG�`���ŃG�N�X�|�[�g�i���ߏ�񂪕ێ������j
            const dataURL = imageCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'merged_image.png'; // �_�E�����[�h���̃t�@�C����
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('��������摜������܂���B���摜���A�b�v���[�h���Ă��������B');
        }
    });

    // ������Ԃł̓_�E�����[�h�{�^���𖳌���
    downloadButton.disabled = true;
});