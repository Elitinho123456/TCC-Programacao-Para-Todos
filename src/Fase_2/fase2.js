document.addEventListener('DOMContentLoaded', () => {

    // ============= Editor de Codigo =============
    const code = document.getElementById('meu-editor-codigo');
    const editor = CodeMirror(code, {
        // ===================================================================
        // AQUI ESTÁ A MUDANÇA: O NOVO CÓDIGO INICIAL PARA O USUÁRIO
        // ===================================================================
        value: `// Pense no objeto 'jogo' como o painel de controle da física.
// Sua missão é adicionar uma configuração para a aceleração.

// Para adicionar ou modificar uma configuração, usamos a sintaxe:
// nomeDoObjeto.nomeDaPropriedade = valor;

// Por exemplo, se quiséssemos registrar o nome do piloto, faríamos:
// jogo.nomeDoPiloto = "Sonic"; // <-- Isso é um exemplo da SINTAXE.

// Agora é sua vez!
// Use a propriedade 'fatorAceleracao' no objeto 'jogo'
// e dê a ela um valor forte, como 0.8 ou 1.0, para vencer o loop!

`,
        // ===================================================================
        // FIM DA MODIFICAÇÃO
        // ===================================================================
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true
    });
    window.meuEditor = editor;

    // ============= SELEÇÃO DE ELEMENTOS =============
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
    const tentarNovamenteBtn = document.getElementById('tentar-novamente-btn');

    // ============= VARIÁVEIS DE ESTADO E JOGO =============
    let gameLoopId;
    let posicaoX = 0;
    let velocidadeAtual = 0;

    const jogo = {
        fatorAceleracao: 0.05
    };

    let isGameOver = false;
    let isLooping = false;
    let loopHasBeenTriggered = false;
    let tentativas = 0;
    const velocidadeNecessaria = 40;

    // ============= CONSTANTES DE ANIMAÇÃO =============
    const LOOP_RAIO_H = 40;
    const LOOP_RAIO_V = 54.8;
    const LOOP_CENTRO_X = LOOP_RAIO_H;
    const LOOP_CENTRO_Y = -LOOP_RAIO_V + 3;

    // ============= LÓGICA DE ANIMAÇÃO E JOGO =============

    function animarLoopCalculado(duration, isSuccess, onComplete) {
        const startTime = performance.now();
        function passoDaAnimacao(currentTime) {
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
        if (isGameOver) return;
        const currentLeft = playerContainer.offsetLeft;
        playerContainer.style.left = `${currentLeft + finalOffsetX}px`;
        playerContainer.style.transform = '';
        isLooping = false;
    }

    function onLoopFailEnd() {
        if (isGameOver) return;
        gameOver();
    }

    function gameLoop() {
        if (isGameOver || isLooping) {
            gameLoopId = requestAnimationFrame(gameLoop);
            return;
        }

        velocidadeAtual += jogo.fatorAceleracao;
        posicaoX += velocidadeAtual * 0.1;
        playerContainer.style.left = `${posicaoX}px`;
        velocidadeAtualDisplay.textContent = Math.floor(velocidadeAtual);

        const playerFront = playerContainer.offsetLeft + playerContainer.offsetWidth;
        const loopStart = loopTrigger.offsetLeft;
        if (!loopHasBeenTriggered && playerFront >= (loopStart + 65)) {
            loopHasBeenTriggered = true;
            fazerLoop();
        }

        const playerRect = playerContainer.getBoundingClientRect();
        const bandeiraRect = bandeira.getBoundingClientRect();
        if (playerRect.right >= bandeiraRect.left) {
            vitoria();
        }

        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        if (isGameOver) return;
        isGameOver = true;
        cancelAnimationFrame(gameLoopId);
        incrementarTentativas();
        player.src = './imagem-level-2/playerT.gif';
        tentarNovamenteBtn.style.display = 'block';
    }

    function vitoria() {
        if (isGameOver) return;
        isGameOver = true;
        cancelAnimationFrame(gameLoopId);
        playerContainer.style.left = `${bandeira.offsetLeft - playerContainer.offsetWidth / 2}px`;
        player.src = './imagem-level-2/playerT.gif';
        vitoriaBotao.style.display = 'block';
    }

    function resetPlayer() {
        if (gameLoopId) cancelAnimationFrame(gameLoopId);

        posicaoX = -100;
        velocidadeAtual = 0;

        velocidadeNecessariaDisplay.textContent = velocidadeNecessaria;
        velocidadeAtualDisplay.textContent = 0;

        playerContainer.style.left = `${posicaoX}px`;
        playerContainer.style.bottom = '72px';
        player.src = './imagem-level-2/playerT.gif';
        playerContainer.style.transform = '';
        playerContainer.style.opacity = 1;
        playerContainer.style.animation = 'none';

        tentarNovamenteBtn.style.display = 'none';
        vitoriaBotao.style.display = 'none';

        isGameOver = false;
        isLooping = false;
        loopHasBeenTriggered = false;

        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function executarCodigo() {
        jogo.fatorAceleracao = 0.05;
        resetPlayer();

        try {
            const codigoDoUsuario = editor.getValue();
            console.log("Executando código do sandbox...");

            const elementos = {
                playerContainer: playerContainer,
                bandeira: bandeira
            };
            const acoes = {};

            const funcaoDoUsuario = new Function('jogo', 'elementos', 'acoes', `'use strict';\n${codigoDoUsuario}`);
            funcaoDoUsuario(jogo, elementos, acoes);

            console.log("Código executado! Novo fator de aceleração inicial:", jogo.fatorAceleracao);

        } catch (e) {
            alert("Ocorreu um erro no seu código:\n" + e.message);
            gameOver();
        }
    }

    tentarNovamenteBtn.addEventListener('click', executarCodigo);

    if (botaoDica && textoDica) {
        botaoDica.addEventListener('click', () => {
            const isHidden = textoDica.style.display === 'none' || textoDica.style.display === '';
            textoDica.style.display = isHidden ? 'block' : 'none';
            botaoDica.textContent = ishidden ? 'Esconder Dica' : 'Ver Dica';
        });
    }

    function incrementarTentativas() {
        tentativas++;
        atualizaTentativas();
    }
    function atualizaTentativas() {
        if (tentativasDisplay) tentativasDisplay.textContent = tentativas;
    }

    resetPlayer();
    atualizaTentativas();
});