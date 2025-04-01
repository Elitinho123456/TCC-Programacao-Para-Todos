document.addEventListener('DOMContentLoaded', () => {
    // Player
    const player = document.querySelector('.player');
    const parede = document.querySelector('.desafio');
    const pauseButton = document.querySelector('.pause');

    let loop;
    let isGameOver = false; // Adicionamos uma flag para controlar o estado do jogo

    // Função: Verificação Player colidiu ou não com a Parede e Reinicio Automatico.
    function iniciarLoop() {
        if (loop) clearInterval(loop); // Limpa qualquer loop existente
        
        loop = setInterval(() => {
            if (isGameOver) return; // Não verifica colisões se o jogo estiver pausado

            const playerPosition = player.offsetLeft;
            const paredePostion = parede.offsetLeft;
            const paredetop = parede.offsetTop;

            if (paredetop < 520) {
                if (playerPosition >= (paredePostion - (player.width - 30))) {
                    gameOver();
                }
            }
        }, 10);
    }

    function gameOver() {
        console.log('Game Over');
        
        // Para o loop
        clearInterval(loop);
        isGameOver = true;

        // Animação de game over
        const playerPosition = player.offsetLeft;
        player.style.animation = 'none';
        player.style.left = `${playerPosition}px`;
        player.style.animation = 'game-over 1s ease-out';
        player.style.bottom = '-80px';

        // Troca a imagem do Personagem
        player.src = './images/Level-1 ref-Super-Mario/playerT.png';
        player.style.width = '100px';
        player.style.height = '100px';

        // Mostra o botão de pause (que agora funciona como botão de reinício)
        pauseButton.style.display = 'block';

        // Adiciona o evento 'animationend'
        player.addEventListener('animationend', () => {
            // Não chamamos resetPlayer() aqui, esperamos pelo clique no botão
        });
    }

    function resetPlayer() {
        // Redefine a posição e o estilo do player
        player.style.left = '-3%';
        player.style.bottom = '72px';
        player.style.width = '80px';
        player.style.height = '100px';
        player.src = './images/Level-1 ref-Super-Mario/playerT.gif';
        player.style.animation = '';
        
        // Esconde o botão
        pauseButton.style.display = 'none';
        
        // Reseta o estado do jogo
        isGameOver = false;
        
        // Reinicia o loop
        iniciarLoop();
    }

    // Inicia o loop pela primeira vez
    iniciarLoop();

    pauseButton.addEventListener('click', resetPlayer);

    // Restante do código das nuvens...
    const container = document.getElementById('nuvens-container');

    function criarNuvem() {
        const nuvem = document.createElement('img');
        nuvem.src = './images/Level-1 ref-Super-Mario/clouds.png';
        nuvem.classList.add('nuvem');

        const tamanhoAleatorio = Math.floor(Math.random() * (600 - 350 + 1)) + 350;
        nuvem.style.width = `${tamanhoAleatorio}px`;

        const posicaoVertical = Math.random() * 50;
        nuvem.style.top = `${posicaoVertical}%`;

        if (Math.random() < 0.3) {
            nuvem.classList.add('nuvem-invertida');
        }

        container.appendChild(nuvem);

        nuvem.addEventListener('animationiteration', () => {
            nuvem.remove();
        });
    }

    function gerarNuvensAleatoriamente() {
        const intervalo = Math.random() * 5000 + 1000;
        criarNuvem();
        setTimeout(gerarNuvensAleatoriamente, intervalo);
    }

    gerarNuvensAleatoriamente();
});