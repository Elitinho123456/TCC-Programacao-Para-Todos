document.addEventListener('DOMContentLoaded', function () {

    const player = document.querySelector('.player');
    const desafio = document.querySelector('.desafio');
    const bandeira = document.querySelector('.bandeira');
    const pauseButton = document.querySelector('.pause');
    const vitoriaContainer = document.querySelector('.vitoria-conteiner');
    const tentativasJogador = document.getElementById('tentativas-jogador');
    let tentativas = 0;
    let gameStarted = false;
    let playerMorto = false;

    const posiçãoInicialPlayer = {
        bottom: '75px',
        left: 'calc(10% - 40px)'
    };

    const posiçãoInicialDesafio = {
        bottom: '80px',
        right: 'calc(50% - 70px)'
    };

    function funcaoChecaColisao() {
        if (!gameStarted || playerMorto) {
            return false;
        }

        const playerRect = player.getBoundingClientRect();
        const desafioRect = desafio.getBoundingClientRect();

        return !(playerRect.right < desafioRect.left ||
            playerRect.left > desafioRect.right ||
            playerRect.bottom < desafioRect.top ||
            playerRect.top > desafioRect.bottom);
    }

    function funcaoChecaVitoria() {
        if (!gameStarted || playerMorto) {
            return false;
        }

        const playerRect = player.getBoundingClientRect();
        const bandeiraRect = bandeira.getBoundingClientRect();

        return !(playerRect.right < bandeiraRect.left ||
            playerRect.left > bandeiraRect.right ||
            playerRect.bottom < bandeiraRect.top ||
            playerRect.top > bandeiraRect.bottom);
    }

    function ativaGameOver() {
        const playerPosition = player.offsetLeft;

        if (playerMorto) return;

        playerMorto = true;
        gameStarted = false;

        player.style.animation = 'game-over 1.5s ease-out forwards';
        player.style.left = `${playerPosition}px`;
        player.src = '/src/Fase_1/imagem-level-1/playerT.png';
        player.style.width = '100px';
        player.style.height = '100px';

        setTimeout(() => {
            pauseButton.style.display = 'block';
        }, 1500); 
    }

    player.addEventListener('animationend', function (event) {
        if (event.animationName === 'game-over') {
            player.style.display = 'none';
        }
    });

    function ativaVitoria() {
        if (!gameStarted) return;
        
        gameStarted = false;
        
        // 1. CAPTURA a posição exata (em pixels) em que o jogador está durante a animação.
        const currentLeft = window.getComputedStyle(player).left;
        const currentBottom = window.getComputedStyle(player).bottom;
    
        // 2. APLICA essa posição como um estilo direto. Isso "congela" o jogador no lugar.
        player.style.left = currentLeft;
        player.style.bottom = currentBottom;
    
        // 3. AGORA, com o jogador já travado na posição correta, removemos a animação.
        // Ele não vai mais saltar para o início.
        player.style.animation = 'none';
        
        // 4. Força o navegador a processar as mudanças de estilo acima antes da próxima.
        void player.offsetWidth; 
        
        // 5. Adiciona uma transição suave apenas para a propriedade 'left'.
        player.style.transition = 'left 1s ease-out';
        
        // 6. Calcula a nova posição (100 pixels à frente) e a aplica para iniciar a transição.
        const finalLeft = parseInt(currentLeft, 10) + 250;
        player.style.left = finalLeft + 'px';
        
        // 7. Mostra a mensagem de vitória quando a transição terminar.
        setTimeout(() => {
            vitoriaContainer.style.display = 'block';
        }, 1000); // 1000ms = 1 segundo (duração da transição)
    }

    function resetGame() {
        playerMorto = false;
        gameStarted = true;

        player.src = '/src/Fase_1/imagem-level-1/playerT.gif';
        player.style.width = '80px';
        player.style.height = '100px';

        player.style.display = 'block';

        player.style.left = posiçãoInicialPlayer.left;
        player.style.bottom = posiçãoInicialPlayer.bottom;
        player.style.animation = 'player-animation 5s infinite linear';
        desafio.style.right = posiçãoInicialDesafio.right;
        desafio.style.bottom = posiçãoInicialDesafio.bottom;
        desafio.style.animation = '';
        pauseButton.style.display = 'none';
        vitoriaContainer.style.display = 'none';
    }

    pauseButton.addEventListener('click', function () {
        tentativas++;
        tentativasJogador.textContent = tentativas;
        resetGame();
        // Execute o código do editor após o reset do jogo
        executaCodigo();
    });

    function gameLoop() {
        if (funcaoChecaColisao()) {
            ativaGameOver();
        } else if (funcaoChecaVitoria()) {
            ativaVitoria();
        }
        requestAnimationFrame(gameLoop);
    }

    resetGame();
    gameLoop();

    // Editor de código
    const editor = CodeMirror(document.getElementById('meu-editor-codigo'), {
        value: localStorage.getItem('userCode') || `// Bem-vindo à Fase 1!\n// Use os seletores 'elementos' para interagir com o jogo.\n// Exemplo: elementos.jogador.style.left = '50px';\n\nconst elementos = {\n    jogador: document.querySelector('.player'),\n    obstaculo: document.querySelector('.desafio'),\n    meta: document.querySelector('.bandeira')\n};\n\n// Tente mover o jogador para a direita\nelementos.jogador.style.left = '200px';\n\n// Descomente a linha abaixo para tentar mover o obstáculo\n// elementos.obstaculo.style.bottom = '150px';\n`,
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true
    });

    function executaCodigo() {
        const code = editor.getValue();
        localStorage.setItem('userCode', code);

        // Cria um objeto 'elementos' acessível dentro do código do usuário
        const elementos = {
            jogador: player,
            obstaculo: desafio,
            meta: bandeira
        };

        try {

            // Executa o código do usuário
            const execute = new Function('elementos', code);
            execute(elementos);

        } catch (e) {
            console.error("Erro ao executar o código:", e);
        }
    }


    // ============= SISTEMA DE NUVENS =============
    const container = document.getElementById('nuvens-container');
    let timeoutId; // Variável para guardar o ID do timeout

    function criarNuvem() {

        const nuvem = document.createElement('img');

        nuvem.src = '/src/Fase_1/imagem-level-1/clouds.png';

        nuvem.classList.add('nuvem');

        // Configurações aleatórias
        nuvem.style.width = `${Math.floor(Math.random() * 251) + 350}px`; // Largura entre 350px e 600px
        nuvem.style.top = `${Math.random() * 50}%`; // Posição vertical aleatória na metade superior

        if (Math.random() < 0.4) { // 40% de chance de inverter a nuvem horizontalmente
            nuvem.classList.add('nuvem-invertida');
        }

        container.appendChild(nuvem);

        nuvem.addEventListener('animationiteration', () => {
            console.log('Removendo nuvem após iteração da animação'); // Log para debug
            nuvem.remove();
        });

        // Remover a nuvem após um tempo fixo caso a animação não funcione como esperado
        setTimeout(() => {
            if (container.contains(nuvem)) { // Verifica se a nuvem ainda existe antes de remover
                console.log('Removendo nuvem por tempo limite'); // Log para debug
                nuvem.remove();
            }
        }, 20000); // Remove após 20 segundos
    }

    function gerarNuvensAleatoriamente() {
        criarNuvem(); // Cria a nuvem imediatamente


        // Guarda o ID do timeout para cancelá-lo depois se a página ficar oculta
        timeoutId = setTimeout(gerarNuvensAleatoriamente, Math.random() * 5000 + 1000); // Próxima nuvem entre 1 e 6 segundos
    }

    // Função que será chamada quando a visibilidade da página mudar
    function handleVisibilityChange() {
        if (document.hidden) {
            // Se a página ficou OCULTA
            // Cancela o próximo agendamento de criarNuvem
            clearTimeout(timeoutId);
            console.log("Geração de nuvens pausada (página oculta)."); // Para debug
        } else {
            console.log("Geração de nuvens retomada (página visível)."); // Para debug
            // Limpa qualquer timeout residual (segurança extra) e inicia o ciclo
            clearTimeout(timeoutId);
            gerarNuvensAleatoriamente();
        }
    }

    // --- Inicialização ---
    // Este evento dispara sempre que o estado de visibilidade da aba muda.
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Inicia a geração de nuvens APENAS se a página já estiver visível quando o script for carregado.
    if (!document.hidden) {
        gerarNuvensAleatoriamente();
    } else {
        console.log("Página carregada oculta. Geração de nuvens aguardando visibilidade."); //Para debug
    }

    // Executa o código inicial e também ao clicar em tentar novamente
    executaCodigo();

    const dicaButton = document.getElementById('botao-dica');
    const textoDica = document.getElementById('texto-dica');

    dicaButton.addEventListener('click', function () {
        textoDica.style.display = textoDica.style.display === 'none' ? 'block' : 'none';
    });
});