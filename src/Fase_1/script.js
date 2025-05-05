document.addEventListener('DOMContentLoaded', () => {

    // ============= Editor de Codigo =============

    const code = document.getElementById('meu-editor-codigo');

    const editor = CodeMirror(code, {
        value: `
/********************************************************************
 * Olá, futuro(a) programador(a)! Use este editor para controlar o jogo.
 * Seu objetivo: Chegar à bandeira sem colidir com o obstáculo!
 *
 * Ferramentas disponíveis:
 * =======================
 *
 * 1. \`elementos\`: Acessa partes visuais do jogo.
 * - \`elementos.jogador\`: É o seu personagem (uma imagem).
 * - \`elementos.obstaculo\`: A parede ou desafio.
 * - \`elementos.meta\`: A bandeira no final.
 * Você pode mudar o estilo deles, por exemplo: elementos.jogador.style.opacity = 0.5;
 *
 * 2. \`acoes\`: Realiza ações pré-definidas no jogo.
 * - \`acoes.reiniciar()\`: Recomeça a fase. Útil se você ficar preso! (Verifique se o nome é 'reiniciar' no seu objeto 'funcoesUsua')
 * // - \`acoes.ganharJogo()\`: (Se ativo) Completa a fase.
 * // - \`acoes.perder()\`: (Se ativo) Causa game over. (Verifique se o nome é 'perder' no seu objeto 'funcoesUsua')
 *
 * 3. \`console.log()\`: Uma ferramenta ESSENCIAL! Use para mostrar mensagens
 * no console do navegador (aperte F12 para abrir) e entender o que
 * seu código está fazendo. Ex: console.log('Minha mensagem');
 *
 * COMO USAR:
 * ==========
 * - Leia os comentários (como este!).
 * - Altere o código abaixo ou adicione o seu.
 * - As mudanças são aplicadas ao clicar no botão "Rodar Código" (ou automaticamente se você ativou).
 * - Se errar, use o console (F12) para ver mensagens de erro.
 * - Use \`acoes.reiniciar()\` se precisar recomeçar.
 *
 ********************************************************************/

// --- Código Inicial ---

// Vamos começar mostrando uma mensagem no console. Veja o console (F12)!
console.log("Olá do Editor de Código! Preparado para programar?");
console.log("Seu personagem é:", elementos.jogador);
console.log("O obstáculo é:", elementos.obstaculo);

// --- Experimente! ---
// Descomente (remova o // no início) das linhas abaixo para testar:

// Que tal deixar o jogador um pouco transparente? (0=invisível, 1=totalmente visível)
// elementos.jogador.style.opacity = 0.7;
// console.log('Opacidade do jogador alterada!');

// E se diminuirmos um pouco o jogador? Isso pode facilitar... ou não! 😉
// Cuidado: Mudar o tamanho afeta a colisão.
// elementos.jogador.style.width = '70px'; // Era 80px originalmente? Verifique!
// elementos.jogador.style.height = '90px'; // Era 100px?
// console.log('Tamanho do jogador alterado!');

// Se você quiser recomeçar a fase a qualquer momento (use o nome correto da função):
// acoes.reiniciar();
// console.log('Fase reiniciada pelo código!');


// --- Seu Desafio ---
/*
 * Tente fazer o seguinte:
 * 1. Consegue fazer o jogador ficar INVISÍVEL usando a opacidade?
 * 2. Consegue deixar o jogador MUITO PEQUENO? Como isso afeta o jogo?
 * 3. Você pode usar console.log() para mostrar a posição do jogador?
 * Dica: Tente console.log(elementos.jogador.getBoundingClientRect().left);
 * (A posição pode mudar constantemente devido à animação do jogo).
 *
 * Escreva seu código aqui embaixo! Boa sorte!
 */


// Fim do script inicial.
`,
        mode: "javascript", // Linguagem (css, htmlmixed, javascript)
        theme: "dracula", // Tema
        lineNumbers: true, // Mostrar números das linhas
    });

    // Guardar a referência ao editor para usar depois
    window.meuEditor = editor;
    

    // ============= SELEÇÃO DE ELEMENTOS =============
    const rodaConsoleBotao = document.querySelector('.rodar-codigo');
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
        player.style.left = `${bandeira.offsetLeft - player.width + 70}px`;
        player.style.margin-top == 30;

        player.style.animation = 'none';
        player.src = 'imagem-level-1/playerV.png';

        // Atualiza elementos
        player.style.width = '100px';
        player.style.height = '100px';

        // Exibição dos elementos de vitória
        vitoriaBotao.style.display = 'block';

        player.addEventListener('animationend', () => { });
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
                reiniar: resetPlayer,
                perder: gameOver
            };

            const funcaoDoUsuario = new Function('elementos', 'acoes', `'use strict';\n ${codigo}`);

            funcaoDoUsuario(elementosUsu, funcoesUsua);

            console.log("Codigo será executado aqui...");
        
        }catch (error){
            alert("Erro no seu código: " + erro.message);
        }
        
    }

    //alteraJogo();


    if(rodaConsoleBotao){
        rodaConsoleBotao.addEventListener('click', alteraJogo);
        console.log("alterou o jogo");
    }else{
        console.log("Não foi achado o botão");
    }

});