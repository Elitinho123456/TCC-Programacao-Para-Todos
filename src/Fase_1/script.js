document.addEventListener('DOMContentLoaded', () => {

    // ============= Editor de Codigo =============

    const code = document.getElementById('meu-editor-codigo');

    const editor = CodeMirror(code, {
        value: '// Elementos disponíveis:\n// - elementos.jogador\n// - elementos.obstaculo\n// - elementos.meta\n\n// Ações disponíveis:\n// - acoes.reiniciar()\n// - acoes.perder()\n\n// Exemplo: Se o jogador estiver perto do obstáculo, faça algo\n// if (elementos.jogador.offsetLeft > elementos.obstaculo.offsetLeft - 50) {\n//    console.log("Jogador perto do obstáculo!");\n// }\n',
        mode: "javascript", // Linguagem (css, htmlmixed, javascript)
        theme: "dracula", // Tema
        lineNumbers: true, // Mostrar números das linhas
    });

    // Guardar a referência ao editor para usar depois
    window.meuEditor = editor;
    

    // ============= SELEÇÃO DE ELEMENTOS =============
    const player = document.querySelector('.player');
    const parede = document.querySelector('.desafio');
    const pauseButton = document.querySelector('.pause');
    const homeButton = document.querySelector('.pause1');
    const bandeira = document.querySelector('.bandeira');
    const vitoriaBotao = document.querySelector('.vitoria-conteiner');
    const tentativasDisplay = document.getElementById('tentativas-jogador');

    // ============= VARIÁVEIS DE CONTROLE =============
    let loop;
    let isGameOver = false;
    let tentativas = 0;

    // ============= LÓGICA PRINCIPAL DO JOGO =============
    function iniciarLoop() {
        if (loop) clearInterval(loop);

        loop = setInterval(() => {
            if (isGameOver) return;

            const playerRect = player.getBoundingClientRect();
            const paredeRect = parede.getBoundingClientRect();
            const bandeiraRect = bandeira.getBoundingClientRect();

            // Verifica se há sobreposição (colisão)
            const colidiu = !(
                (playerRect.right - 25) < paredeRect.left ||
                playerRect.left > paredeRect.right ||
                playerRect.bottom < paredeRect.top ||
                playerRect.top > paredeRect.bottom
            );

            if (colidiu) {
                gameOver();
            }

            // Verificação de chegada na bandeira
            const CBandeira = !((playerRect.right - 85) < bandeiraRect.left)

            if (CBandeira) {
                vitoria();
            }
        }, 10);
    }

    // ============= FUNCIONALIDADE DO BOTÃO DE DICA =============
    const botaoDica = document.getElementById('botao-dica');
    const textoDica = document.getElementById('texto-dica');

    // Verifica se ambos os elementos (botão e parágrafo da dica) existem na página
    if (botaoDica && textoDica) {
        botaoDica.addEventListener('click', () => {
            // Verifica o estado atual de exibição do texto da dica
            if (textoDica.style.display === 'none' || textoDica.style.display === '') {
                // Se estiver escondido, mostra o texto e muda o texto do botão
                textoDica.style.display = 'block'; // Ou 'inline', 'flex', dependendo do seu layout para o parágrafo
                botaoDica.textContent = 'Esconder Dica';
            } else {
                // Se estiver visível, esconde o texto e volta o texto original do botão
                textoDica.style.display = 'none';
                botaoDica.textContent = 'Ver Dica';
            }
        });
    } else {
        // Opcional: Avisa no console se os elementos não forem encontrados
        if (!botaoDica) {
            console.warn("Elemento com ID 'botao-dica' não encontrado.");
        }
        if (!textoDica) {
            console.warn("Elemento com ID 'texto-dica' não encontrado.");
        }
    }

    // ============= ESTADOS DO JOGO =============
    function gameOver() {
        console.log('Game Over');
        clearInterval(loop);
        isGameOver = true;

        //incrementa tentativa
        incrementarTentativas();

        // Animação e efeitos visuais
        const playerPosition = player.offsetLeft;
        player.style.animation = 'none';
        player.style.left = `${playerPosition}px`;
        player.style.animation = 'game-over 1s ease-out';
        player.style.hidden = 'none';

        // Atualização do sprite
        player.src = '/src/Fase_1/imagem-level-1/playerT.png';
        player.style.width = '100px';
        player.style.height = '100px';

        // Controles de interface
        pauseButton.style.display = 'block';
        homeButton.style.display = 'block';
        player.addEventListener('animationend', () => { });
        player.style.opacity = 0;
    }

    function vitoria() {
        console.log("Vitória!");
        clearInterval(loop);
        isGameOver = true;

        // Posicionamento final do jogador
        player.style.left = `${bandeira.offsetLeft - player.width + 70}px`;
        //player.style.marginTop == 30;

        player.style.animation = 'none';
        player.src = '/src/Fase_1/imagem-level-1/playerV.png';

        // Atualiza elementos
        player.style.width = '100px';
        player.style.height = '100px';

        // Exibição dos elementos de vitória
        vitoriaBotao.style.display = 'block';

        player.addEventListener('animationend', () => { });
        // Ao vencer, podemos resetar as tentativas para a próxima fase ou manter, dependendo da lógica do jogo.
        // Por enquanto, vamos resetar.
        tentativas = 0;
        atualizaTentativas(); // Atualiza o display de tentativas
    }

    // ============= SISTEMA DE CONTAGEM DE TENTATIVAS =============

    function incrementarTentativas(){
        tentativas++;
        atualizaTentativas();
    }

    function atualizaTentativas(){
        if(tentativasDisplay){ // É importante verificar se o elemento existe antes de tentar manipulá-lo
            tentativasDisplay.textContent = tentativas;
        }
    }

    // ============= SISTEMA DE RESET =============
    function resetPlayer() {
        // Reset de posição e estilo
        player.style.opacity = 100
        player.style.left = '-3%';
        player.style.bottom = '72px';
        player.style.width = '80px';
        player.style.height = '100px';
        player.src = '/src/Fase_1/imagem-level-1/playerT.gif';
        player.style.animation = '';

        // Controles de interface
        pauseButton.style.display = 'none';
        homeButton.style.display = 'none';
        vitoriaBotao.style.display = 'none';

        // Reinicialização do jogo
        isGameOver = false;
        iniciarLoop();
    }

    // ============= INICIALIZAÇÃO DO JOGO =============
    iniciarLoop();
    
    vitoriaBotao.addEventListener('click', resetPlayer);

    atualizaTentativas(); 

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


    //função para alterar as informações do css
    function alteraJogo(){
        const codigo = editor.getValue(); //pega o codigo css do editor
        console.log("aplicando java", codigo); //debug

        //try catch para erro na execução do jogador
        try{
            //Codigo que o jogador pode usar
            const elementosUsu = {
                jogador: player, //elemento DOM do player
                obstaculo: parede, //elemento DOM da parede
                meta: bandeira //elemento DOM da Bandeira
            };

            const funcoesUsua = {
                reiniciar: resetPlayer, // Renomeado para 'reiniciar' para maior clareza
                perder: gameOver
            };

            const funcaoDoUsuario = new Function('elementos', 'acoes', `'use strict';\n ${codigo}`);

            funcaoDoUsuario(elementosUsu, funcoesUsua);

            console.log("Codigo será executado aqui...");
        
        }catch (error){
            alert("Erro no seu código: " + error.message);
        }
        
    }

    //alteraJogo();

    function alteraERoda(){
        resetPlayer();
        alteraJogo();
    }


    if(pauseButton){
        pauseButton.addEventListener('click', alteraERoda);
        console.log("alterou o jogo");
    }else{
        console.log("Não foi achado o botão");
    }

});

module.exports = alteraERoda, gameOver, vitoria, incrementarTentativas;
