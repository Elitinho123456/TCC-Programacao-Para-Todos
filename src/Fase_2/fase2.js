document.addEventListener('DOMContentLoaded', () => {

    // ============= Editor de Codigo =============
    const code = document.getElementById('meu-editor-codigo');
    const editor = CodeMirror(code, {
        value: `// Bem-vindo ao sandbox!
// Você tem acesso a um objeto chamado 'jogo'.
// Mude a propriedade 'fatorAceleracao' para vencer.

// O objetivo é ter velocidade >= 40 ao chegar no loop.
// A velocidade atual é mostrada no canto superior esquerdo.

// Exemplo básico:
//jogo.fatorAceleracao = 0.08;

// Seja criativo! Você pode usar 'if', criar funções, etc.
// O que acontece se a aceleração mudar no meio do caminho?
/*
if (elementos.playerContainer.offsetLeft > 300) {
  // Nitro!
  jogo.fatorAceleracao = 2.0; 
}
*/
`,
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

    // Objeto que será compartilhado com o sandbox do usuário!
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

        // 1. Aceleração: Aumenta a velocidade baseada no fator DENTRO DO OBJETO JOGO.
        velocidadeAtual += jogo.fatorAceleracao;

        // 2. Movimento: Atualiza a posição baseada na velocidade atual.
        posicaoX += velocidadeAtual * 0.1;

        // 3. Aplica a nova posição ao elemento.
        playerContainer.style.left = `${posicaoX}px`;

        // 4. Atualiza o display.
        velocidadeAtualDisplay.textContent = Math.floor(velocidadeAtual);

        // 5. Verifica se chegou no trigger do loop.
        const playerFront = playerContainer.offsetLeft + playerContainer.offsetWidth;
        const loopStart = loopTrigger.offsetLeft;
        if (!loopHasBeenTriggered && playerFront >= (loopStart + 65)) {
            loopHasBeenTriggered = true;
            fazerLoop();
        }

        // 6. Verifica a condição de vitória (se passou do loop).
        const playerRect = playerContainer.getBoundingClientRect();
        const bandeiraRect = bandeira.getBoundingClientRect();
        if (playerRect.right >= bandeiraRect.left) {
            vitoria();
        }

        // Continua o loop no próximo quadro.
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    // ============= ESTADOS DO JOGO =============

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

    // ============= EXECUTOR DO CÓDIGO DO USUÁRIO =============

    function executarCodigo() {
        // Reseta o fator de aceleração para o padrão antes de cada execução.
        // Isso garante que, se o usuário apagar a linha, o jogo ainda funcione.
        jogo.fatorAceleracao = 0.05;

        // Coloca o jogador no início, pronto para a nova tentativa.
        resetPlayer();

        try {
            const codigoDoUsuario = editor.getValue();
            console.log("Executando código do sandbox...");

            // Prepara as "ferramentas" que o usuário poderá usar.
            const elementos = {
                playerContainer: playerContainer,
                bandeira: bandeira
            };
            const acoes = {
                // Futuramente, você pode adicionar ações aqui.
            };

            // Cria a função sandboxed, passando nossos objetos como argumentos.
            const funcaoDoUsuario = new Function('jogo', 'elementos', 'acoes', `'use strict';\n${codigoDoUsuario}`);

            // Executa a função do usuário, entregando os objetos a ela.
            funcaoDoUsuario(jogo, elementos, acoes);

            console.log("Código executado! Novo fator de aceleração inicial:", jogo.fatorAceleracao);

        } catch (e) {
            alert("Ocorreu um erro no seu código:\n" + e.message);
            // Se o código do usuário quebrar, paramos o jogo para evitar comportamento estranho.
            gameOver();
        }
    }

    // ============= EVENT LISTENERS E INICIALIZAÇÃO =============

    tentarNovamenteBtn.addEventListener('click', executarCodigo);

    if (botaoDica && textoDica) {
        botaoDica.addEventListener('click', () => {
            const isHidden = textoDica.style.display === 'none' || textoDica.style.display === '';
            textoDica.style.display = isHidden ? 'block' : 'none';
            botaoDica.textContent = isHidden ? 'Esconder Dica' : 'Ver Dica';
        });
    }

    function incrementarTentativas() {
        tentativas++;
        atualizaTentativas();
    }
    function atualizaTentativas() {
        if (tentativasDisplay) tentativasDisplay.textContent = tentativas;
    }

    // Inicia o jogo pela primeira vez quando a página carrega.
    resetPlayer();
    atualizaTentativas();
});