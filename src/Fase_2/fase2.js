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
    // MUDANÇA: Usaremos a parte de trás do loop como nosso gatilho
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
    const velocidadeNecessaria = 10;

    function fazerLoop() {
        if (isLooping || isGameOver) return;
        isLooping = true;

        // Para a animação de corrida e fixa o jogador no lugar
        const currentLeft = playerContainer.offsetLeft;
        playerContainer.style.animation = 'none';
        playerContainer.style.left = `${currentLeft}px`;

        // Executa a animação de sucesso ou falha com base na velocidade
        if (velocidadeAtual >= velocidadeNecessaria) {
            playerContainer.classList.add('player-is-looping-success');
            playerContainer.addEventListener('animationend', onLoopSuccessEnd, { once: true });
        } else {
            playerContainer.classList.add('player-is-looping-fail');
            playerContainer.addEventListener('animationend', onLoopFailEnd, { once: true });
        }
    }

    function onLoopSuccessEnd() {
        if (isGameOver) return;

        // MUDANÇA CRUCIAL: Lógica de transferência de estado

        const exitDistance = 130; // O mesmo valor do 'translateX' no CSS!

        // 1. Remove a classe da animação do loop
        playerContainer.classList.remove('player-is-looping-success');

        // 2. Calcula a nova posição real do 'left'
        const newLeft = playerContainer.offsetLeft + exitDistance;

        // 3. Para TODAS as animações e limpa o 'transform'
        // Isso é vital para "travar" o jogador na sua nova posição visual.
        playerContainer.style.animation = 'none';
        playerContainer.style.transform = ''; // Reseta a rotação e o translateX

        // 4. Aplica a nova posição 'left' manualmente
        playerContainer.style.left = `${newLeft}px`;

        // 5. Agora, com o estado corrigido, calcula a animação restante e continua a corrida
        const currentDuration = parseFloat(playerContainer.style.animationDuration) || 8;
        const totalWidth = playerContainer.parentElement.offsetWidth;
        const progress = newLeft / totalWidth;
        const remainingTime = currentDuration * (1 - progress);

        // Força o navegador a recalcular os estilos antes de aplicar a nova animação
        void playerContainer.offsetWidth;

        // Inicia a animação de continuação a partir do novo ponto
        playerContainer.style.animation = `player-continue-animation ${remainingTime}s linear forwards`;

        // Permite que o jogo continue
        isLooping = false;
    }

    function onLoopFailEnd() {
        if (isGameOver) return;
        playerContainer.classList.remove('player-is-looping-fail');
        gameOver();
    }

    function iniciarLoop() {
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(() => {
            if (isGameOver) return;

            // LÓGICA AUTOMÁTICA DO LOOP
            if (!isLooping) {
                // Posição da frente do jogador
                const playerFront = playerContainer.offsetLeft + playerContainer.offsetWidth;
                // Posição do início da imagem de gatilho do loop
                const loopStart = loopTrigger.offsetLeft;

                // Se a frente do jogador alcançou o início do loop, aciona a ação!
                if (playerFront >= (loopStart + 75)) {
                    fazerLoop();
                }
            }

            // Lógica de vitória (só é checada se não estiver no meio do loop)
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
        // Ajusta a posição final para parecer que ele parou na bandeira
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
                // Acelera a animação conforme a velocidade aumenta
                const duracaoBase = 12; // segundos para cruzar a tela na velocidade 0
                const duracaoMinima = 5; // segundos para cruzar a tela na velocidade máxima
                const novaDuracao = duracaoBase - (velocidadeAtual / 100) * (duracaoBase - duracaoMinima);
                playerContainer.style.animationDuration = `${novaDuracao}s`;
                if (velocidadeAtualDisplay) velocidadeAtualDisplay.textContent = velocidadeAtual;
            }
        }, 100);

        if (velocidadeNecessariaDisplay) velocidadeNecessariaDisplay.textContent = velocidadeNecessaria;
        if (velocidadeAtualDisplay) velocidadeAtualDisplay.textContent = 0;

        // Reset completo do estado do jogador
        playerContainer.style.left = '-10%';
        playerContainer.style.bottom = '72px';
        player.src = 'imagem-level-2/playerT.gif';
        playerContainer.classList.remove('player-is-looping-success', 'player-is-looping-fail');
        playerContainer.style.transform = '';
        playerContainer.style.opacity = 1;
        playerContainer.style.animation = 'none';
        void playerContainer.offsetWidth; // Força o browser a resetar a animação
        playerContainer.style.animation = `player-animation 12s linear forwards`;
        playerContainer.style.animationPlayState = 'running';

        // Reset da UI
        pauseButton.style.display = 'none';
        homeButton.style.display = 'none';
        vitoriaBotao.style.display = 'none';

        isGameOver = false;
        isLooping = false;
        iniciarLoop();
    }

    // O botão de "Tentar Novamente" agora apenas reseta o nível
    pauseButton.addEventListener('click', resetPlayer);

    // Início do Jogo
    resetPlayer();

    // Lógica do botão de dica (mantida)
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