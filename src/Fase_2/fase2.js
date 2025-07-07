document.addEventListener('DOMContentLoaded', () => {

    // --- SEÇÃO DE GERAÇÃO DE ANIMAÇÃO POR FÓRMULA MATEMÁTICA ---
    const LOOP_HORIZONTAL_STRETCH = 65;
    const LOOP_HEIGHT = 90;
    const FALL_THRESHOLD = 0.9;
    const FALL_Y_TARGET = 200;
    const FALL_ROTATION = -180;

    function lerp(start, end, t) { return start * (1 - t) + end * t; }
    function successPathFunction(progress) { const x = (1 - Math.cos(progress * Math.PI * 2)) * LOOP_HORIZONTAL_STRETCH; const y = -Math.sin(progress * Math.PI * 2) * LOOP_HEIGHT; const rot = -progress * 360; return { x, y, rot }; }
    function failurePathFunction(progress) { if (progress < FALL_THRESHOLD) { return successPathFunction(progress); } else { const startPoint = successPathFunction(FALL_THRESHOLD); const fallProgress = (progress - FALL_THRESHOLD) / (1 - FALL_THRESHOLD); const x = startPoint.x; const y = lerp(startPoint.y, FALL_Y_TARGET, fallProgress); const rot = lerp(startPoint.rot, FALL_ROTATION, fallProgress); const opacity = lerp(1, 0, fallProgress); return { x, y, rot, opacity }; } }
    function generateKeyframesCss(name, steps, pathingFunction) { let keyframes = `@keyframes ${name} {\n`; for (let i = 0; i <= steps; i++) { const progress = i / steps; const percentage = progress * 100; const pos = pathingFunction(progress); const transformString = `transform: translateX(${pos.x.toFixed(2)}px) translateY(${pos.y.toFixed(2)}px) rotate(${pos.rot.toFixed(2)}deg);`; const opacityString = pos.opacity !== undefined ? ` opacity: ${pos.opacity.toFixed(2)};` : ''; keyframes += `  ${percentage}% { ${transformString}${opacityString} }\n`; } keyframes += '}\n'; return keyframes; }
    function injectCss(cssString) { const styleElement = document.createElement('style'); styleElement.innerHTML = cssString; document.head.appendChild(styleElement); }
    const keyframeSucesso = generateKeyframesCss('loop-sucesso-gerado', 100, successPathFunction);
    const keyframeFalha = generateKeyframesCss('loop-falha-gerado', 100, failurePathFunction);
    injectCss(keyframeSucesso + keyframeFalha);

    // --- SELEÇÃO DE ELEMENTOS E CONFIGURAÇÃO ---
    const code = document.getElementById('meu-editor-codigo');
    const editor = CodeMirror(code, { value: `// Dê um impulso na velocidade do jogador!\n// Exemplo: elementos.velocidadeAtual = 20;`, mode: "javascript", theme: "dracula", lineNumbers: true });
    const playerContainer = document.getElementById('player-container');
    const player = document.getElementById('player');
    const bandeira = document.querySelector('.bandeira');
    const loopTrigger = document.querySelector('.loop-costas');
    const pauseButton = document.getElementById('botao-tentar-novamente');
    const homeButton = document.getElementById('botao-voltar-menu');
    const vitoriaBotao = document.querySelector('.vitoria-conteiner');
    const tentativasDisplay = document.getElementById('tentativas-jogador');
    const velocidadeAtualDisplay = document.getElementById('velocidade-atual-display');
    const velocidadeNecessariaDisplay = document.getElementById('velocidade-necessaria-display');

    let gameLoop, speedInterval;
    let isGameOver = false, isLooping = false, loopHasBeenTriggered = false;
    let tentativas = 0, velocidadeAtual = 0;
    const velocidadeNecessaria = 10;

    const elementos = { _velocidadeInicial: 0, set velocidadeAtual(valor) { if (typeof valor === 'number' && valor >= 0) { this._velocidadeInicial = valor; } else { console.error("Valor inválido."); } }, get velocidadeAtual() { return velocidadeAtual; }, get velocidadeNecessaria() { return velocidadeNecessaria; } };

    // --- LÓGICA DO JOGO ---

    function fazerLoop() {
        if (isLooping || isGameOver) return;
        isLooping = true;
        playerContainer.style.animation = 'none';
        const LOOP_BASE_OFFSET_X = 25;
        playerContainer.style.left = `${loopTrigger.offsetLeft + LOOP_BASE_OFFSET_X}px`;
        playerContainer.style.bottom = `72px`;
        if (velocidadeAtual >= velocidadeNecessaria) {
            playerContainer.classList.add('player-loop-sucesso');
            player.addEventListener('animationend', onLoopSuccessEnd, { once: true });
        } else {
            playerContainer.classList.add('player-loop-falha');
            player.addEventListener('animationend', onLoopFailEnd, { once: true });
        }
    }

    // **MUDANÇA FINAL: Lógica para sair do loop com perfeição**
    function onLoopSuccessEnd() {
        if (isGameOver) return;

        // 1. Calcula a posição final da animação do loop
        const finalPosition = successPathFunction(1); // progress = 1 significa 100%
        const finalOffsetX = finalPosition.x;

        // 2. Pega a posição ATUAL do container (no início do loop)
        const startLoopLeft = playerContainer.offsetLeft;

        // 3. Remove a classe de estado e a animação do player
        playerContainer.classList.remove('player-loop-sucesso');
        player.style.animation = 'none';
        
        // 4. "Assa" a transformação:
        //    a) Reseta a transformação visual do player para zero
        player.style.transform = '';
        //    b) Move o CONTAINER para a posição final correta
        playerContainer.style.left = `${startLoopLeft + finalOffsetX}px`;

        // 5. Agora que o container está no lugar certo, retoma a animação de corrida
        playerContainer.style.animation = `player-continue-animation 2s linear forwards`;
        isLooping = false;
    }

    function onLoopFailEnd() {
        if (isGameOver) return;
        player.style.animation = 'none';
        playerContainer.classList.remove('player-loop-falha');
        gameOver();
    }
    
    // --- FUNÇÕES RESTANTES (Sem alterações) ---
    function resetPlayer(velocidadeInicial = 0) {
        if (speedInterval) clearInterval(speedInterval);
        velocidadeAtual = velocidadeInicial;
        speedInterval = setInterval(() => {
            if (!isGameOver && !isLooping) {
                if (velocidadeAtual < 100) velocidadeAtual++;
                const duracaoBase = 12; const duracaoMinima = 5;
                const novaDuracao = duracaoBase - (velocidadeAtual / 100) * (duracaoBase - duracaoMinima);
                playerContainer.style.animationDuration = `${novaDuracao}s`;
                if (velocidadeAtualDisplay) velocidadeAtualDisplay.textContent = velocidadeAtual;
            }
        }, 100);
        if (velocidadeNecessariaDisplay) velocidadeNecessariaDisplay.textContent = velocidadeNecessaria;
        if (velocidadeAtualDisplay) velocidadeAtualDisplay.textContent = velocidadeAtual;
        playerContainer.style.left = '-10%'; playerContainer.style.bottom = '72px'; player.src = 'imagem-level-2/playerT.gif';
        playerContainer.classList.remove('player-loop-sucesso', 'player-loop-falha');
        player.style.animation = ''; player.style.transform = '';
        playerContainer.style.animation = 'none';
        void playerContainer.offsetWidth;
        playerContainer.style.animation = `player-animation 12s linear forwards`;
        playerContainer.style.animationPlayState = 'running';
        pauseButton.style.display = 'none'; homeButton.style.display = 'none'; vitoriaBotao.style.display = 'none';
        isGameOver = false; isLooping = false; loopHasBeenTriggered = false;
        iniciarLoop();
    }
    pauseButton.addEventListener('click', () => { incrementarTentativas(); elementos._velocidadeInicial = 0; const codigoDoUsuario = editor.getValue(); try { const funcaoDoUsuario = new Function('elementos', codigoDoUsuario); funcaoDoUsuario(elementos); } catch (e) { console.error("Erro no seu código:", e.message); alert("Seu código contém um erro. Verifique o console (F12)."); } resetPlayer(elementos._velocidadeInicial); });
    const botaoDica = document.getElementById('botao-dica'); const textoDica = document.getElementById('texto-dica'); if (botaoDica && textoDica) { botaoDica.addEventListener('click', () => { const isHidden = textoDica.style.display === 'none' || textoDica.style.display === ''; textoDica.style.display = isHidden ? 'block' : 'none'; botaoDica.textContent = isHidden ? 'Esconder Dica' : 'Ver Dica'; }); }
    function incrementarTentativas() { tentativas++; atualizaTentativas(); }
    function atualizaTentativas() { if (tentativasDisplay) tentativasDisplay.textContent = tentativas; }
    atualizaTentativas();
    resetPlayer();
    function iniciarLoop() { if (gameLoop) clearInterval(gameLoop); gameLoop = setInterval(() => { if (isGameOver) return; if (!isLooping && !loopHasBeenTriggered) { const playerFront = playerContainer.offsetLeft + playerContainer.offsetWidth; const loopStart = loopTrigger.offsetLeft; if (playerFront >= (loopStart + 65)) { loopHasBeenTriggered = true; fazerLoop(); } } if (!isLooping) { const playerRect = playerContainer.getBoundingClientRect(); const bandeiraRect = bandeira.getBoundingClientRect(); if (playerRect.right >= bandeiraRect.left) { vitoria(); } } }, 10); }
    function gameOver() { if (isGameOver) return; isGameOver = true; clearInterval(gameLoop); clearInterval(speedInterval); incrementarTentativas(); playerContainer.style.animationPlayState = 'paused'; player.src = 'imagem-level-2/playerT.png'; pauseButton.style.display = 'block'; homeButton.style.display = 'block'; }
    function vitoria() { if (isGameOver) return; isGameOver = true; clearInterval(gameLoop); clearInterval(speedInterval); playerContainer.style.animationPlayState = 'paused'; playerContainer.style.left = `${bandeira.offsetLeft - playerContainer.offsetWidth / 2}px`; player.src = 'imagem-level-2/playerV.png'; vitoriaBotao.style.display = 'block'; }
});