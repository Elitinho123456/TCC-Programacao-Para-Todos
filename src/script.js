document.addEventListener('DOMContentLoaded', () => {

    // Player
    const player = document.querySelector('.player');
    const parede = document.querySelector('.desafio');


    // Função: Verificação Player colidiu ou não com a Parede e Reinicio Automatico.
    let loop = setInterval(() => {

        function iniciarLoop() {
            loop = setInterval(() => {

                const playerPosition = player.offsetLeft; // Pega a posição do player
                const paredePostion = parede.offsetLeft; // Pega a posição da parede
                const paredetop = parede.offsetTop;

                if ((paredetop) < 520) {
                    if (playerPosition >= (paredePostion - (player.width - 120))) { // Caso o player esteja dentro do px designado, executa:

                        console.log(`Player morto = ${playerPosition} e parede ${paredePostion}`)

                        // Seta a animação para nenhuma, "reseta o personagem"
                        player.style.animation = 'none';
                        // Seta o Player para a posição onde colidiu com a "Parede"
                        player.style.left = `${playerPosition}px`;

                        player.style.animation = 'game-over 1s ease-out';
                        player.style.bottom = '-80px';

                        // Troca a cor do personagem para fins visuais
                        player.src = './images/Level-1 ref-Super-Mario/playerT.png';

                        // Encerra a verificação
                        clearInterval(loop);

                        // Adiciona o evento 'animationend'
                        player.addEventListener('animationend', resetPlayer);

                    }
                }


            }, 10);

        }

        iniciarLoop()

        function resetPlayer() {

            // Remove o 'animationend' para evitar múltiplas chamadas
            player.removeEventListener('animationend', resetPlayer);

            // Redefine a posição e o estilo do player

            player.style.left = '-3%';
            player.style.bottom = '60px';
            player.style.width = '250px';
            player.style.height = '100px';
            player.src = './images/Level-1 ref-Super-Mario/playerT.gif'; // volta a animação
            player.style.animation = ''; // Remove a animação 'game-over'

            // Reinicia o loop de verificação de colisão
            iniciarLoop();

        }

    }, 10);

    // Fim da Função.
    // Fim Player

    // Nuvens

    const container = document.getElementById('nuvens-container');

    function criarNuvem() {

        const nuvem = document.createElement('img'); // Cria o elemento "Nuvem" no html

        nuvem.src = './images/Level-1 ref-Super-Mario/clouds.png' // Busca a imagem para o elemento
        nuvem.classList.add('nuvem'); // Adiciona a class "nuvem" que carrega a animação

        const tamanhoAleatorio = Math.floor(Math.random() * (600 - 350 + 1)) + 350; // Esquema com Biblioteca Math para aleatorizar o tamanho das mesmas
        nuvem.style.width = `${tamanhoAleatorio}px`; // Seta o valor para o estipulado acima

        const posicaoVertical = Math.random() * 50; // Aleatoriza a posição onde as Nuvens irão aparacer em relacao ao eixo Y
        nuvem.style.top = `${posicaoVertical}%`; // Seta o valor para o estipulado acima

        if (Math.random() < 0.3) { // 30% de chance de inverter a nuvem para o outro lado
            nuvem.classList.add('nuvem-invertida');
        }

        container.appendChild(nuvem);

        nuvem.addEventListener('animationiteration', () => { // Deleta a nuvem após a animação ser executada
            nuvem.remove();
        })

    }

    function gerarNuvensAleatoriamente() {

        const intervalo = Math.random() * 5000 + 1000; // Intervalo aleatório entre 1s e 6s

        criarNuvem();

        setTimeout(gerarNuvensAleatoriamente, intervalo);

    }

    gerarNuvensAleatoriamente();

    //Fim Nuvens

});

