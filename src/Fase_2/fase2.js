// Variável global para o áudio
let bgMusic;

// Função global para alternar o mudo
function toggleMute() {
    if (!bgMusic) {
        bgMusic = document.getElementById('bgMusic');
        if (!bgMusic) return;
        bgMusic.volume = 0.5;
    }

    bgMusic.muted = !bgMusic.muted;
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.textContent = bgMusic.muted ? '🔇' : '🔊';
    }
}

// Adiciona o event listener para o botão de mudo
bgMusic = document.getElementById('bgMusic');

document.addEventListener('DOMContentLoaded', () => {
    // Adiciona o event listener para o botão de mudo
    bgMusic = document.getElementById('bgMusic');
    
    if (bgMusic) {
        bgMusic.volume = 0.5;

        // Tenta reproduzir a música quando o usuário interagir com a página
        function startMusic() {
            const playPromise = bgMusic.play();

            // Em navegadores que não permitem autoplay, isso irá capturar a rejeição
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('A reprodução automática foi impedida. O usuário precisa interagir primeiro.');
                });
            }
        }

        // Tenta iniciar a música quando o usuário clicar pela primeira vez
        function initAudio() {
            startMusic();
            // Remove o event listener após o primeiro clique para não ativar várias vezes
            document.removeEventListener('click', initAudio);
        }

        document.addEventListener('click', initAudio);
    }

    // ============= Editor de Codigo =============
    const code = document.getElementById('meu-editor-codigo');
    const editor = CodeMirror(code, {
        value: `// Pense no objeto 'jogo' como o painel de controle da física.
// Sua missão é adicionar uma configuração para a aceleração.

// Para adicionar ou modificar uma configuração, usamos a sintaxe:
// nomeDoObjeto.nomeDaPropriedade = valor;

// Por exemplo, se quiséssemos registrar o nome do piloto, faríamos:
// jogo.nomeDoPiloto = "Sonic"; // <-- Isso é um exemplo da SINTAXE.

// Agora é sua vez!
// Use a propriedade 'fatorAceleracao' no objeto 'jogo'
// e dê a ela um valor forte, como 8.0 ou 10.0, para vencer o loop!

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
    const tentarNovamenteBtn = document.getElementById('pause');

    // ============= VARIÁVEIS DE ESTADO E JOGO =============
    let gameLoopId;
    let posicaoX = 0;
    let velocidadeAtual = 0;
    const escala = 10;

    const jogo = {
        fatorAceleracao: 0.5
    };

    let isGameOver = false;
    let isLooping = false;
    let loopHasBeenTriggered = false;
    let tentativas = 0;
    const velocidadeNecessaria = 100;

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

            if (jogo.fatorAceleracao >= 21) {
                // Quanto maior o fator, mais rápido e mais longe ele sobe
                gameOver();
                const distancia = Math.min(jogo.fatorAceleracao * 15, 1200);
                const duracaoSubida = Math.max(300, 2000 - (jogo.fatorAceleracao * 20 ));

                x_offset = 80;
                y_offset = (-progresso * distancia);
                rot_offset = progresso * -360;

                playerContainer.style.transform = `translateX(${x_offset}px) translateY(${y_offset}px) rotate(${rot_offset}deg)`;

                if (progresso < 1) {
                    // Duração personalizada para a subida
                    gameOver();
                    setTimeout(() => requestAnimationFrame(passoDaAnimacao), duracaoSubida / 60);
                } else {
                    gameOver();
                    playerContainer.style.opacity = 0;
                    if (onComplete) onComplete(x_offset);
                }
                return;
            }

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

        // ===================================================================
        // A velocidade da animação agora é dinâmica
        // ===================================================================
        // A duração base da animação é reduzida pela velocidade atual do jogador.
        // Math.max garante que a animação não fique rápida demais a ponto de não ser vista.
        const baseDuration = 3000; // Duração em ms se a velocidade fosse 0
        const speedFactor = 40;   // Fator de redução
        const animationDuration = Math.max(800, baseDuration - (velocidadeAtual * speedFactor));
        // ===================================================================

        if (velocidadeAtual >= velocidadeNecessaria) {
            animarLoopCalculado(animationDuration, true, onLoopSuccessEnd);
        } else {
            // A animação de falha também usa a velocidade, mas é um pouco mais longa
            animarLoopCalculado(animationDuration + 500, false, onLoopFailEnd);
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

    // ===================================================================
    // AQUI ESTÁ A MUDANÇA: Lógica de vitória aprimorada
    // ===================================================================
    function vitoria() {
        // Impede vitória se fatorAceleracao for absurdo
        if (jogo.fatorAceleracao >= 21) return;
        if (isGameOver) return;
        isGameOver = true;
        cancelAnimationFrame(gameLoopId);

        player.src = './imagem-level-2/playerT.gif';
        vitoriaBotao.style.display = 'block';

        function runOffScreenAnimation() {
            posicaoX += velocidadeAtual * 0.1;
            playerContainer.style.left = `${posicaoX}px`;
            if (playerContainer.offsetLeft < window.innerWidth + 100) {
                requestAnimationFrame(runOffScreenAnimation);
            }
        }
        runOffScreenAnimation();
    }
    // ===================================================================

    function resetPlayer() {
        if (gameLoopId) cancelAnimationFrame(gameLoopId);

        posicaoX = -100;
        velocidadeAtual = 0;

        velocidadeNecessariaDisplay.textContent = velocidadeNecessaria;
        velocidadeAtualDisplay.textContent = 0;
        jogo.fatorAceleracao = 0.5 / escala;

        playerContainer.style.left = `${posicaoX}px`;
        playerContainer.style.bottom = '72px';
        player.src = './imagem-level-2/playerT.gif';
        playerContainer.style.transform = '';
        playerContainer.style.opacity = 1;

        tentarNovamenteBtn.style.display = 'none';
        vitoriaBotao.style.display = 'none';

        isGameOver = false;
        isLooping = false;
        loopHasBeenTriggered = false;

        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function executarCodigo() {
        // 1. Reseta a aceleração para o valor padrão JÁ ESCALADO
        jogo.fatorAceleracao = 0.5 / escala;
        resetPlayer();

        try {
            const codigoDoUsuario = editor.getValue();

            const elementos = {
                playerContainer: playerContainer,
                bandeira: bandeira
            };
            const acoes = {};

            const funcaoDoUsuario = new Function('jogo', 'elementos', 'acoes', `'use strict';\n${codigoDoUsuario}`);
            funcaoDoUsuario(jogo, elementos, acoes);

            jogo.fatorAceleracao = jogo.fatorAceleracao / escala;


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

    // Inicia o jogo
    resetPlayer();
    atualizaTentativas();
});