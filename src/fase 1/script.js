document.addEventListener('DOMContentLoaded', () => {
    // ============= SELEÇÃO DE ELEMENTOS =============
    const player = document.querySelector('.player');
    const parede = document.querySelector('.desafio');
    const pauseButton = document.querySelector('.pause');
    const bandeira = document.querySelector('.bandeira');
    const vitoriaBotao = document.querySelector('.vitoria-conteiner');

    // ============= VARIÁVEIS DE CONTROLE =============
    let loop;
    let isGameOver = false;

    // ============= LÓGICA PRINCIPAL DO JOGO =============
    function iniciarLoop() {
        if (loop) clearInterval(loop);

        loop = setInterval(() => {
            if (isGameOver) return;

            // Verificação de colisão com a parede
            const playerPosition = player.offsetLeft;
            const paredePostion = parede.offsetLeft;
            const paredetop = parede.offsetTop;

            if (paredetop < 520 && playerPosition >= (paredePostion - (player.width - 20))) {
                gameOver();
            }

            // Verificação de chegada na bandeira
            const bandeiraPosition = bandeira.offsetLeft;
            if (playerPosition >= (bandeiraPosition - (player.width - 85))) {
                vitoria();
            }
        }, 10);
    }

    // ============= ESTADOS DO JOGO =============
    function gameOver() {
        console.log('Game Over');
        clearInterval(loop);
        isGameOver = true;

        // Animação e efeitos visuais
        const playerPosition = player.offsetLeft;
        player.style.animation = 'none';
        player.style.left = `${playerPosition - player.width}px`;
        player.style.animation = 'game-over 1s ease-out';
        player.style.bottom = '-80px';

        // Atualização do sprite
        player.src = '../images/Level-1 ref-Super-Mario/playerT.png';
        player.style.width = '100px';
        player.style.height = '100px';

        // Controles de interface
        pauseButton.style.display = 'block';
        player.addEventListener('animationend', () => { });
    }

    function vitoria() {
        console.log("Vitória!");
        clearInterval(loop);
        isGameOver = true;

        // Posicionamento final do jogador
        player.style.left = `${bandeira.offsetLeft - player.width + 85}px`;
        player.style.animation = 'none';

        // Exibição dos elementos de vitória
        vitoriaBotao.style.display = 'block';
    }

    // ============= SISTEMA DE RESET =============
    function resetPlayer() {
        // Reset de posição e estilo
        player.style.left = '-3%';
        player.style.bottom = '72px';
        player.style.width = '80px';
        player.style.height = '100px';
        player.src = '../images/Level-1 ref-Super-Mario/playerT.gif';
        player.style.animation = '';

        // Controles de interface
        pauseButton.style.display = 'none';
        vitoriaBotao.style.display = 'none';

        // Reinicialização do jogo
        isGameOver = false;
        iniciarLoop();
    }

    // ============= INICIALIZAÇÃO DO JOGO =============
    iniciarLoop();
    pauseButton.addEventListener('click', resetPlayer);
    vitoriaBotao.addEventListener('click', resetPlayer);

    // ============= SISTEMA DE NUVENS =============
    const container = document.getElementById('nuvens-container');

    function criarNuvem() {
        const nuvem = document.createElement('img');
        nuvem.src = '../images/Level-1 ref-Super-Mario/clouds.png';
        nuvem.classList.add('nuvem');

        // Configurações aleatórias
        nuvem.style.width = `${Math.floor(Math.random() * 251) + 350}px`;
        nuvem.style.top = `${Math.random() * 50}%`;
        if (Math.random() < 0.3) nuvem.classList.add('nuvem-invertida');

        container.appendChild(nuvem);
        nuvem.addEventListener('animationiteration', () => nuvem.remove());
    }

    function gerarNuvensAleatoriamente() {
        criarNuvem();
        setTimeout(gerarNuvensAleatoriamente, Math.random() * 5000 + 1000);
    }

    gerarNuvensAleatoriamente();

    function pegarValor() {
        var valorDigitado = document.getElementById("meuInput").value;
        console.log("O valor digitado foi: " + valorDigitado);
    }
});