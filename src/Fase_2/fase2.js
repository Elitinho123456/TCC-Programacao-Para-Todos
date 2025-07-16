document.addEventListener('DOMContentLoaded', () => {

    const code = document.getElementById('meu-editor-codigo');
    const editor = CodeMirror(code, {
        value: `// Nesta fase, o loop é automático!
// O desafio é ter velocidade suficiente quando o personagem chegar lá.
// O motor de animação do loop agora é controlado por JavaScript!`,
        mode: "javascript", theme: "dracula", lineNumbers: true
    });
    window.meuEditor = editor;

    // --- SELEÇÃO DE ELEMENTOS ---
    const playerContainer = document.getElementById('player-container');
    const player = document.getElementById('player');
    const bandeira = document.querySelector('.bandeira');
    const loopTrigger = document.querySelector('.loop-costas');
    const vitoriaBotao = document.querySelector('.vitoria-conteiner');
    const tentativasDisplay = document.getElementById('tentativas-jogador');
    const velocidadeAtualDisplay = document.getElementById('velocidade-atual-display');
    const velocidadeNecessariaDisplay = document.getElementById('velocidade-necessaria-display');
    const botaoDica = document.getElementById('botao-dica');
    const textoDica = document.getElementById('texto-dica');

    // --- NOVOS BOTÕES ---
    const tentarNovamenteBtn = document.getElementById('tentar-novamente-btn');
    const faseAnteriorBtn = document.getElementById('fase-anterior');
    const proximaFaseBtn = document.getElementById('proxima-fase');

    // --- VARIÁVEIS DE ESTADO ---
    let gameLoop, speedInterval;
    let isGameOver = false;
    let isLooping = false;
    let loopHasBeenTriggered = false;
    let tentativas = 0;
    let velocidadeAtual = 0;
    const velocidadeNecessaria = 40;

    // --- CONSTANTES DE ANIMAÇÃO ---
    const LOOP_RAIO_H = 40;
    const LOOP_RAIO_V = 54.8;
    const LOOP_CENTRO_X = LOOP_RAIO_H;
    const LOOP_CENTRO_Y = -LOOP_RAIO_V + 3;

    function animarLoopCalculado(duration, isSuccess, onComplete) {
        const startTime = performance.now();
        function passoDaAnimacao(currentTime) {
            // ... (lógica da animação do loop, sem alterações)
            const tempoDecorrido = currentTime - startTime;
            let progresso = tempoDecorrido / duration;
            if (progresso >= 1) progresso = 1;
            let x_offset, y_offset, rot_offset;
            if (isSuccess) {
                const anguloInicial = Math.PI / 1.85;
                const anguloTotal = -1.85 * Math.PI;
                const anguloAtual = anguloInicial + progresso * anguloTotal;
                x_offset = LOOP_CENTRO_X + LOOP_RAIO_H * Math.cos(anguloAtual);
                y_offset = LOOP_CENTRO_Y + LOOP_RAIO_V * Math.sin(anguloAtual);
                rot_offset = progresso * -360;
            } else {
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
                if (onComplete) onComplete(x_offset);
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

    function onLoopSuccessEnd(finalOffsetX) {
        // ... (lógica de sucesso, sem alterações)
        if (isGameOver) return;
        const currentLeft = playerContainer.offsetLeft;
        playerContainer.style.left = `${currentLeft + finalOffsetX}px`;
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
        // ... (lógica do game loop, sem alterações)
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
        player.src = './imagem-level-2/playerT.gif'; // Imagem do Sonic "derrotado"
        tentarNovamenteBtn.style.display = 'block'; // Mostra o botão central
    }

    function vitoria() {
        // ... (lógica de vitória, sem alterações)
        if (isGameOver) return;
        isGameOver = true;
        clearInterval(gameLoop);
        clearInterval(speedInterval);
        playerContainer.style.animationPlayState = 'paused';
        playerContainer.style.left = `${bandeira.offsetLeft - playerContainer.offsetWidth / 2}px`;
        player.src = './imagem-level-2/playerT.gif'; // Imagem do Sonic vitorioso
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
        player.src = './imagem-level-2/playerT.gif'; // GIF do Sonic correndo
        playerContainer.style.transform = '';
        playerContainer.style.opacity = 1;
        playerContainer.style.animation = 'none';
        void playerContainer.offsetWidth;
        playerContainer.style.animation = `player-animation 12s linear forwards`;
        playerContainer.style.animationPlayState = 'running';
        
        tentarNovamenteBtn.style.display = 'none'; // Esconde o botão central
        vitoriaBotao.style.display = 'none';
        isGameOver = false;
        isLooping = false;
        loopHasBeenTriggered = false;
        iniciarLoop();
    }

    // --- EVENT LISTENERS ---
    tentarNovamenteBtn.addEventListener('click', resetPlayer);

    faseAnteriorBtn.addEventListener('click', () => {
        alert('Lógica para ir para a FASE ANTERIOR não implementada.');
    });

    proximaFaseBtn.addEventListener('click', () => {
        alert('Lógica para ir para a PRÓXIMA FASE não implementada.');
    });

    resetPlayer();

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