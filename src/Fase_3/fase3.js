document.addEventListener('DOMContentLoaded', () => {

    // ============= Editor de Codigo =============
    const codeContainer = document.getElementById('meu-editor-codigo');
    const editor = CodeMirror(codeContainer, {
        value: `// A serpente já está se movendo! Rápido, assuma o controle com sua lógica de if/else!.

                // OBJETOS DISPONÍVEIS:
                // - elementos.serpente: { posicaoX, posicaoY }
                // - elementos.comida:   { posicaoX, posicaoY }

                // AÇÕES DISPONÍVEIS:
                // - acoes.moverParaDireita()
                // - acoes.moverParaEsquerda()
                // - acoes.moverParaCima()
                // - acoes.moverParaBaixo()

                // Exemplo:
                // if(comidaX = serpenteX) {
                // (oque você acha que a serpente deve fazer aqui)
                // }
                `,
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true,
    });

    window.meuEditor = editor;

    // ============= SELEÇÃO DE ELEMENTOS DO JOGO =============
    const box = document.getElementById('box');
    const vitoriaContainer = document.querySelector('.vitoria-conteiner');
    const pauseButton = document.querySelector('.pause');
    const tentativasDisplay = document.getElementById('tentativas-jogador');

    // ============= VARIÁVEIS DE CONTROLE DO JOGO =============
    const gridSize = 20;
    let snake, food, nextDirection, gameLoop, isGameOver;
    let tentativas = 0;

    // A lógica do usuário começa vazia. Será preenchida ao clicar no botão.
    let userLogicFunction = null;

    // ============= LÓGICA PRINCIPAL DO JOGO (SNAKE) =============

    function resetGame() {
        if (gameLoop) clearInterval(gameLoop);

        box.innerHTML = '';
        box.appendChild(vitoriaContainer);
        box.appendChild(pauseButton);

        snake = [{ x: 5, y: 10 }];
        food = generateFoodPosition();
        nextDirection = 'right'; // Direção padrão para o movimento automático
        isGameOver = false;

        vitoriaContainer.style.display = 'none';
        pauseButton.style.display = 'none';

        draw();
    }

    function draw() {
        const aRemover = box.querySelectorAll('.snake-head, .snake-body, .food');
        aRemover.forEach(el => el.remove());

        snake.forEach((segment, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.style.gridRowStart = segment.y;
            snakeElement.style.gridColumnStart = segment.x;
            snakeElement.classList.add(index === 0 ? 'snake-head' : 'snake-body');
            box.appendChild(snakeElement);
        });

        const foodElement = document.createElement('div');
        foodElement.style.gridRowStart = food.y;
        foodElement.style.gridColumnStart = food.x;
        foodElement.classList.add('food');
        box.appendChild(foodElement);
    }

    function generateFoodPosition() {
        let newFoodPosition;
        const boardWidth = Math.floor(box.clientWidth / gridSize);
        const boardHeight = Math.floor(box.clientHeight / gridSize);

        do {
            newFoodPosition = {
                x: Math.floor(Math.random() * boardWidth) + 1,
                y: Math.floor(Math.random() * boardHeight) + 1
            };
        } while (snake && snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
        return newFoodPosition;
    }

    function gameTick() {
        if (isGameOver) {
            clearInterval(gameLoop);
            return;
        }

        // **MUDANÇA PRINCIPAL AQUI**
        // Se uma função do usuário foi definida (pelo botão), executa ela.
        if (userLogicFunction) {
            const elementos = {
                serpente: { posicaoX: snake[0].x, posicaoY: snake[0].y },
                comida: { posicaoX: food.x, posicaoY: food.y }
            };
            const acoes = {
                moverParaCima: () => { if (nextDirection !== 'down') nextDirection = 'up'; },
                moverParaBaixo: () => { if (nextDirection !== 'up') nextDirection = 'down'; },
                moverParaEsquerda: () => { if (nextDirection !== 'right') nextDirection = 'left'; },
                moverParaDireita: () => { if (nextDirection !== 'left') nextDirection = 'right'; }
            };
            try {
                userLogicFunction(elementos, acoes);
            } catch (e) {
                alert("Erro ao executar seu código: " + e.message);
                gameOver();
                return;
            }
        }
        // Se não houver função do usuário, a serpente continua se movendo na 'nextDirection' atual.

        const head = { ...snake[0] };
        switch (nextDirection) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            vitoria();
        } else {
            snake.pop();
        }

        checkCollision();
        if (!isGameOver) {
            draw();
        }
    }

    function checkCollision() {
        const head = snake[0];
        const boardWidth = box.clientWidth / gridSize;
        const boardHeight = box.clientHeight / gridSize;

        // Colisão com as paredes
        if (head.x <= 0 || head.x > boardWidth || head.y <= 0 || head.y > boardHeight) {
            gameOver();
            return;
        }

        // Colisão com o próprio corpo
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
    }

    function gameOver() {
        if (isGameOver) return;
        isGameOver = true;
        clearInterval(gameLoop);
        incrementarTentativas();
        pauseButton.style.display = 'block';
        console.log('Game Over');
    }

    function vitoria() {
        isGameOver = true;
        clearInterval(gameLoop);
        vitoriaContainer.style.display = 'block';
        console.log("Vitória!");
    }

    // Função que é chamada pelo botão "Tentar Novamente"
    function aplicarCodigoDoUsuario() {
        incrementarTentativas();

        const codigoDoUsuario = editor.getValue();
        try {
            // Compila e armazena a lógica do usuário
            userLogicFunction = new Function('elementos', 'acoes', codigoDoUsuario);
        } catch (error) {
            alert("Erro de sintaxe no seu código: " + error.message);
            userLogicFunction = null; // Se der erro, anula a lógica para não quebrar o jogo
        }

        // Reseta o jogo e inicia o movimento imediatamente com a nova lógica (ou a padrão)
        resetGameEIniciaLoop();
    }

    function resetGameEIniciaLoop() {
        resetGame();
        gameLoop = setInterval(gameTick, 250); // Velocidade um pouco maior para mais desafio
    }

    pauseButton.addEventListener('click', aplicarCodigoDoUsuario);

    // ... (resto do código: botão de dica, sistema de tentativas, etc.)
    const botaoDica = document.getElementById('botao-dica');
    const textoDica = document.getElementById('texto-dica');
    if (botaoDica && textoDica) {
        botaoDica.addEventListener('click', () => {
            const isHidden = textoDica.style.display === 'none' || textoDica.style.display === '';
            textoDica.style.display = isHidden ? 'block' : 'none';
            botaoDica.textContent = isHidden ? 'Esconder Dica' : 'Ver Dica';
        });
    }

    function incrementarTentativas() {
        tentativas++;
        if (tentativasDisplay) {
            tentativasDisplay.textContent = tentativas;
        }
    }

    const style = document.createElement('style');
    style.innerHTML = `
        #box {
            display: grid;
            grid-template-rows: repeat(${Math.floor(box.clientHeight / gridSize)}, 1fr);
            grid-template-columns: repeat(${Math.floor(box.clientWidth / gridSize)}, 1fr);
            background-color: #1e4d2b;
            border: 5px solid #0c2412;
        }
        .snake-head { background-color: #FFD700; border-radius: 5px; z-index: 2;}
        .snake-body { background-color: #f0f0f0; border-radius: 3px; z-index: 1;}
        .food { background-color: #e52521; border-radius: 50%; z-index: 1;}
    `;
    document.head.appendChild(style);

    // **INICIALIZAÇÃO AUTOMÁTICA**
    // Inicia o jogo assim que a página é carregada.
    if (tentativasDisplay) tentativasDisplay.textContent = tentativas;
    resetGameEIniciaLoop();
});