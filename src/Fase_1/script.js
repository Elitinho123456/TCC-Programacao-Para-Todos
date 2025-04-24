document.addEventListener('DOMContentLoaded', () => {

    // ============= Editor de Codigo =============

    const code = document.getElementById('meu-editor-codigo');

    const editor = CodeMirror(code, {
        value: "/* Escreva seu código CSS aqui */\n .desafio{\nwidth: 140px;\nheight: 140px;\nright: 50%;\ntop: 381px;\n}",
        mode: "css", // Linguagem (css, htmlmixed, javascript)
        theme: "dracula", // Tema
        lineNumbers: true, // Mostrar números das linhas
    });

    // Guardar a referência ao editor para usar depois
    window.meuEditor = editor;

    //função para alterar as informações do css
    function alteraJogo(){
        const codigo = editor.getValue(); //pega o codigo css do editor
        console.log("aplicando css", codigo); //debug

        //verifica a tag style ou cria uma nova
        const styleTagId = 'estilos-editor';
        let styleTag = document.getElementById(styleTagId);
        if(!styleTag){
            styleTag = document.createElement('style');
            styleTag.id = styleTagId;
            document.head.appendChild(styleTag);
        }

        styleTag.textContent = codigo;
        console.log("aplicado" + styleTagId);
    }

    alteraJogo();


    let timeout
    window.meuEditor.on('change', () =>{
        clearTimeout(timeout); //cancela timeout anterior
        timeout = setTimeout(alteraJogo, 500);
    });

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
        player.src = 'imagem-level-1/playerT.png';
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
        player.src = ''

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
        player.src = 'imagem-level-1/playerT.gif';
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
    let timeoutId; // Variável para guardar o ID do timeout

    function criarNuvem() {

        const nuvem = document.createElement('img');

        nuvem.src = 'imagem-level-1/clouds.png';

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

});