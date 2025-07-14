document.addEventListener('DOMContentLoaded', () => {

    const code = document.getElementById('meu-editor-codigo');
    const editor = CodeMirror(code, {
        value: `// Nesta fase, o loop é automático!
// O desafio é ter velocidade suficiente quando o personagem chegar lá.
// O motor de animação do loop agora é controlado por JavaScript!`,
        mode: "javascript", theme: "dracula", lineNumbers: true, readOnly: true
    });
    window.meuEditor = editor;

    // --- SELEÇÃO DE ELEMENTOS ---
    const playerContainer = document.getElementById('player-container');
    const player = document.getElementById('player');
    const bandeira = document.querySelector('.bandeira');
    const loopTrigger = document.querySelector('.loop-costas');
    const pauseButton = document.querySelector('.pause');
    const homeButton = document.querySelector('.pause1');
    const vitoriaBotao = document.querySelector('.vitoria-conteiner');
    const tentativasDisplay = document.getElementById('tentativas-jogador');
    const velocidadeAtualDisplay = document.getElementById('velocidade-atual-display');
    const velocidadeNecessariaDisplay = document.getElementById('velocidade-necessaria-display');

    // --- VARIÁVEIS DE ESTADO ---
    let gameLoop, speedInterval;
    let isGameOver = false;
    let isLooping = false;
    let loopHasBeenTriggered = false;
    let tentativas = 0;
    let velocidadeAtual = 0;
    const velocidadeNecessaria = 20;

    // --- MUDANÇA: CONSTANTES CALIBRADAS COM BASE NAS IMAGENS E CSS ---
    const LOOP_RAIO_H = 40;  // Metade da largura do túnel (130px)
    const LOOP_RAIO_V = 54.8; // Raio vertical ajustado para a altura de 280px da imagem
    const LOOP_CENTRO_X = LOOP_RAIO_H; // O centro X é o próprio raio para fechar o círculo
    const LOOP_CENTRO_Y = -LOOP_RAIO_V + 3; // O centro Y está acima do jogador

    /**
     * Anima o jogador em uma trajetória de loop calculada matematicamente.
     * @param {number} duration - Duração total da animação em milissegundos.
     * @param {boolean} isSuccess - Se true, completa o loop. Se false, falha no topo.
     * @param {Function} onComplete - Função a ser chamada no final da animação.
     */
    function animarLoopCalculado(duration, isSuccess, onComplete) {
        const startTime = performance.now();

        function passoDaAnimacao(currentTime) {
            const tempoDecorrido = currentTime - startTime;
            let progresso = tempoDecorrido / duration;
            if (progresso >= 1) progresso = 1;

            let x_offset, y_offset, rot_offset;

            if (isSuccess) {
                // --- LÓGICA DE SUCESSO ---
                const anguloInicial = Math.PI / 1.85;
                const anguloTotal = -1.85 * Math.PI; // Volta completa no sentido horário
                const anguloAtual = anguloInicial + progresso * anguloTotal;

                x_offset = LOOP_CENTRO_X + LOOP_RAIO_H * Math.cos(anguloAtual);
                y_offset = LOOP_CENTRO_Y + LOOP_RAIO_V * Math.sin(anguloAtual);
                rot_offset = progresso * -360;
            } else {
                // --- LÓGICA DE FALHA ---
                const progressoMaximoFalha = 0.55;
                if (progresso <= progressoMaximoFalha) {
                    const progressoDaSubida = progresso / progressoMaximoFalha;
                    const anguloInicial = Math.PI / 2;
                    const anguloDaSubida = -1.1 * Math.PI;
                    const anguloAtual = anguloInicial + progressoDaSubida * anguloDaSubida;

                    x_offset = LOOP_CENTRO_X + LOOP_RAIO_H * Math.cos(anguloAtual);
                    y_offset = LOOP_CENTRO_Y + LOOP_RAIO_V * Math.sin(anguloAtual);
                    rot_offset = progressoDaSubida * -200;
                } else {
                    const anguloNoPico = -Math.PI / 2 + -1.1 * Math.PI;
                    x_offset = LOOP_CENTRO_X + LOOP_RAIO_H * Math.cos(anguloNoPico);
                    
                    const yNoPico = LOOP_CENTRO_Y - LOOP_RAIO_V * Math.sin(anguloNoPico);
                    const tempoDeQueda = (progresso - progressoMaximoFalha) / (1 - progressoMaximoFalha);
                    y_offset = yNoPico + (400 * Math.pow(tempoDeQueda, 2));
                    
                    rot_offset = -200 + tempoDeQueda * -360;
                    playerContainer.style.opacity = 1 - tempoDeQueda;
                }
            }

            playerContainer.style.transform = `translateX(${x_offset}px) translateY(${y_offset}px) rotate(${rot_offset}deg)`;

            if (progresso < 1) {
                requestAnimationFrame(passoDaAnimacao);
            } else {
                if (onComplete) onComplete(x_offset); // Passa o deslocamento final para a função de callback
            }
        }
        requestAnimationFrame(passoDaAnimacao);
    }

    function fazerLoop() {
        if (isLooping || isGameOver) return;
        isLooping = true;

        const currentLeft = playerContainer.offsetLeft;
        playerContainer.style.animation = 'none';
        playerContainer.style.left = `${currentLeft}px`;
        playerContainer.style.transform = '';
        playerContainer.style.opacity = 1;

        if (velocidadeAtual >= velocidadeNecessaria) {
            animarLoopCalculado(1500, true, onLoopSuccessEnd);
        } else {
            animarLoopCalculado(2000, false, onLoopFailEnd);
        }
    }

    // --- MUDANÇA: MELHORIA NA TRANSIÇÃO PÓS-LOOP ---
    function onLoopSuccessEnd(finalOffsetX) {
        if (isGameOver) return;
        
        // Atualiza a posição 'left' para incluir o deslocamento da animação
        const currentLeft = playerContainer.offsetLeft;
        playerContainer.style.left = `${currentLeft + finalOffsetX}px`;
        
        // Limpa a transformação para a próxima animação começar do zero
        playerContainer.style.transform = '';

        const currentDuration = parseFloat(playerContainer.style.animationDuration) || 8;
        const totalWidth = playerContainer.parentElement.offsetWidth;
        const progress = playerContainer.offsetLeft / totalWidth;
        const remainingTime = currentDuration * (1 - progress);

        playerContainer.style.animation = `player-continue-animation ${remainingTime}s linear forwards`;
        isLooping = false;
    }

    function onLoopFailEnd() {
        if (isGameOver) return;
        gameOver();
    }

    function iniciarLoop() {
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(() => {
            if (isGameOver) return;

            if (!isLooping && !loopHasBeenTriggered) {
                const playerFront = playerContainer.offsetLeft + playerContainer.offsetWidth;
                const loopStart = loopTrigger.offsetLeft;
                if (playerFront >= (loopStart + 65)) {
                    loopHasBeenTriggered = true;
                    fazerLoop();
                }
            }

            if (!isLooping) {
                const playerRect = playerContainer.getBoundingClientRect();
                const bandeiraRect = bandeira.getBoundingClientRect();
                if (playerRect.right >= bandeiraRect.left) {
                    vitoria();
                }
            }
        }, 10);
    }

    function gameOver() {
        if (isGameOver) return;
        isGameOver = true;
        clearInterval(gameLoop);
        clearInterval(speedInterval);
        incrementarTentativas();
        playerContainer.style.animationPlayState = 'paused';
        player.src = 'imagem-level-2/playerT.png';
        pauseButton.style.display = 'block';
        homeButton.style.display = 'block';
    }

    function vitoria() {
        if (isGameOver) return;
        isGameOver = true;
        clearInterval(gameLoop);
        clearInterval(speedInterval);
        playerContainer.style.animationPlayState = 'paused';
        playerContainer.style.left = `${bandeira.offsetLeft - playerContainer.offsetWidth / 2}px`;
        player.src = 'imagem-level-2/playerV.png';
        vitoriaBotao.style.display = 'block';
    }

    function resetPlayer() {
        if (speedInterval) clearInterval(speedInterval);

        velocidadeAtual = 0;
        speedInterval = setInterval(() => {
            if (!isGameOver && !isLooping) {
                if (velocidadeAtual < 100) velocidadeAtual++;
                const duracaoBase = 12;
                const duracaoMinima = 5;
                const novaDuracao = duracaoBase - (velocidadeAtual / 100) * (duracaoBase - duracaoMinima);
                playerContainer.style.animationDuration = `${novaDuracao}s`;
                if (velocidadeAtualDisplay) velocidadeAtualDisplay.textContent = velocidadeAtual;
            }
        }, 100);

        if (velocidadeNecessariaDisplay) velocidadeNecessariaDisplay.textContent = velocidadeNecessaria;
        if (velocidadeAtualDisplay) velocidadeAtualDisplay.textContent = 0;

        playerContainer.style.left = '-10%';
        playerContainer.style.bottom = '72px';
        player.src = 'imagem-level-2/playerT.gif';
        
        playerContainer.style.transform = '';
        playerContainer.style.opacity = 1;
        playerContainer.style.animation = 'none';
        void playerContainer.offsetWidth;
        playerContainer.style.animation = `player-animation 12s linear forwards`;
        playerContainer.style.animationPlayState = 'running';

        pauseButton.style.display = 'none';
        homeButton.style.display = 'none';
        vitoriaBotao.style.display = 'none';

        isGameOver = false;
        isLooping = false;
        loopHasBeenTriggered = false;
        iniciarLoop();
    }

    pauseButton.addEventListener('click', resetPlayer);
    resetPlayer();

    const botaoDica = document.getElementById('botao-dica');
    const textoDica = document.getElementById('texto-dica');
    if (botaoDica && textoDica) {
        botaoDica.addEventListener('click', () => {
            const isHidden = textoDica.style.display === 'none' || textoDica.style.display === '';
            textoDica.style.display = isHidden ? 'block' : 'none';
            botaoDica.textContent = isHidden ? 'Esconder Dica' : 'Ver Dica';
        });
    }

    function incrementarTentativas() { tentativas++; atualizaTentativas(); }
    function atualizaTentativas() { if (tentativasDisplay) tentativasDisplay.textContent = tentativas; }
    atualizaTentativas();
});