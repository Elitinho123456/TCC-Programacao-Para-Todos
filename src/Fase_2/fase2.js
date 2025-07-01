document.addEventListener('DOMContentLoaded', () => {

    const code = document.getElementById('meu-editor-codigo');
    const editor = CodeMirror(code, {
        value: `// Nesta fase, o loop é automático!
// O desafio é ter velocidade suficiente quando o personagem chegar lá.
// Nenhum código é necessário. Apenas clique em 'Tentar Novamente' e observe!`,
        mode: "javascript", theme: "dracula", lineNumbers: true, readOnly: true
    });
    window.meuEditor = editor;

    // Seleção de elementos
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

    // Variáveis de estado
    let gameLoop, speedInterval;
    let isGameOver = false;
    let isLooping = false;
    let tentativas = 0;
    let velocidadeAtual = 0;
    const velocidadeNecessaria = 30;

    // MUDANÇA: A "trava" para garantir que o loop só aconteça uma vez.
    let loopHasBeenTriggered = false;

    function fazerLoop() {
        if (isLooping || isGameOver) return;
        isLooping = true;

        // MUDANÇA: Atualize os nomes das classes aqui!
        const classeSucesso = 'player-is-looping-success-suave';
        const classeFalha = 'player-is-looping-fail-suave';

        const currentLeft = playerContainer.offsetLeft;
        playerContainer.style.animation = 'none';
        playerContainer.style.left = `${currentLeft}px`;

        if (velocidadeAtual >= velocidadeNecessaria) {
            playerContainer.classList.add(classeSucesso);
            playerContainer.addEventListener('animationend', onLoopSuccessEnd, { once: true });
        } else {
            playerContainer.classList.add(classeFalha);
            playerContainer.addEventListener('animationend', onLoopFailEnd, { once: true });
        }
    }

    function onLoopSuccessEnd() {
        if (isGameOver) return;
        playerContainer.classList.remove('player-is-looping-success-suave');
        playerContainer.style.transform = '';

        const currentDuration = parseFloat(playerContainer.style.animationDuration) || 8;
        const currentLeft = playerContainer.offsetLeft;
        const totalWidth = playerContainer.parentElement.offsetWidth;
        const progress = currentLeft / totalWidth;
        const remainingTime = currentDuration * (1 - progress);

        playerContainer.style.animation = `player-continue-animation ${remainingTime}s linear forwards`;

        isLooping = false;
    }

    function onLoopFailEnd() {
        if (isGameOver) return;
        playerContainer.classList.remove('player-is-looping-fail-suave'); // <-- ATUALIZE AQUI
        gameOver();
    }

    function iniciarLoop() {
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(() => {
            if (isGameOver) return;

            // MUDANÇA: Adicionamos a verificação da nossa "trava".
            if (!isLooping && !loopHasBeenTriggered) {
                const playerFront = playerContainer.offsetLeft + playerContainer.offsetWidth;
                const loopStart = loopTrigger.offsetLeft;

                if (playerFront >= (loopStart + 65)) {
                    // MUDANÇA: Acionamos a trava!
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
        playerContainer.classList.remove('player-is-looping-success', 'player-is-looping-fail');
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
        // MUDANÇA: Resetamos a trava para a próxima tentativa.
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