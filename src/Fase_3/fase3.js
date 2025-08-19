document.addEventListener('DOMContentLoaded', () => {

    // ============= Editor de Codigo =============
    const codeContainer = document.getElementById('meu-editor-codigo');
    const editor = CodeMirror(codeContainer, {
        value: `// A serpente já está se movendo! Rápido, assuma o controle com sua lógica de if/else!

// === OBJETOS DISPONÍVEIS: ===
// - elementos.serpente: { posicaoX, posicaoY }
// - elementos.comida:   { posicaoX, posicaoY }
// === AÇÕES DISPONÍVEIS: ===
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
    let easterEggAtivo = false; // <<< NOVO: Variável para controlar o Easter Egg

    // A lógica do usuário começa vazia. Será preenchida ao clicar no botão.
    let userLogicFunction = null;

    // ============= LÓGICA DO EASTER EGG (CÓDIGO KONAMI) =============
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];
    let konamiIndex = 0;

    function handleKonamiCode(e) {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                ativarEasterEgg();
                konamiIndex = 0; // Reseta para que possa ser ativado de novo
            }
        } else {
            konamiIndex = 0;
        }
    }

    function ativarEasterEgg() {
        if (easterEggAtivo) return; // Não faz nada se já estiver ativo
        easterEggAtivo = true;
        alert('Modo Clássico Ativado!');
        // Desativa a lógica do usuário e reseta o jogo no novo modo
        userLogicFunction = null;
        resetGameEIniciaLoop();
    }

    // Listener para o controle manual no modo Easter Egg
    function handlePlayerControls(e) {
        if (!easterEggAtivo || isGameOver) return;

        const key = e.key;
        if ((key === 'ArrowUp' || key.toLowerCase() === 'w') && nextDirection !== 'down') {
            nextDirection = 'up';
        } else if ((key === 'ArrowDown' || key.toLowerCase() === 's') && nextDirection !== 'up') {
            nextDirection = 'down';
        } else if ((key === 'ArrowLeft' || key.toLowerCase() === 'a') && nextDirection !== 'right') {
            nextDirection = 'left';
        } else if ((key === 'ArrowRight' || key.toLowerCase() === 'd') && nextDirection !== 'left') {
            nextDirection = 'right';
        }
    }

    document.addEventListener('keydown', handleKonamiCode);
    document.addEventListener('keydown', handlePlayerControls);

    // ============= LÓGICA PRINCIPAL DO SNAKE =============

    function resetGame() {
        if (gameLoop) clearInterval(gameLoop);

        box.innerHTML = '';
        box.appendChild(vitoriaContainer);
        box.appendChild(pauseButton);

        snake = [{ x: 5, y: 10 }];
        food = generateFoodPosition();
        nextDirection = 'right';
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

            if (index === 0) {
                let rotation = '0deg';
                switch (nextDirection) {
                    case 'up': rotation = '180deg'; break;
                    case 'down': rotation = '0deg'; break;
                    case 'left': rotation = '90deg'; break;
                    case 'right': rotation = '-90deg'; break;
                }
                snakeElement.style.transform = `rotate(${rotation}) scale(4)`;
            }
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

        // A lógica do usuário só roda se o Easter Egg NÃO estiver ativo
        if (userLogicFunction && !easterEggAtivo) {
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

        const head = { ...snake[0] };
        switch (nextDirection) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            // Se o Easter Egg estiver ativo, o jogo continua. Senão, o jogador vence.
            if (easterEggAtivo) {
                food = generateFoodPosition(); // <<< NOVO: Apenas gera uma nova comida
            } else {
                vitoria();
            }
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

        if (head.x <= 0 || head.x > boardWidth || head.y <= 0 || head.y > boardHeight) {
            gameOver();
            return;
        }

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

    function aplicarCodigoDoUsuario() {
        easterEggAtivo = false; // Desativa o modo secreto ao tentar um novo código
        incrementarTentativas();

        const codigoDoUsuario = editor.getValue();
        try {
            userLogicFunction = new Function('elementos', 'acoes', codigoDoUsuario);
        } catch (error) {
            alert("Erro de sintaxe no seu código: " + error.message);
            userLogicFunction = null;
        }

        resetGameEIniciaLoop();
    }

    function resetGameEIniciaLoop() {
        resetGame();
        // Se o modo secreto estiver ativo, a velocidade pode ser um pouco diferente
        const interval = easterEggAtivo ? 150 : 250;
        gameLoop = setInterval(gameTick, interval);
    }

    pauseButton.addEventListener('click', aplicarCodigoDoUsuario);

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
            background-color: #08525fff;
            background-image: linear-gradient(90deg, #487779ff 50%, transparent 50%), linear-gradient(0deg, #446974ff 50%, transparent 50%);
            background-size: ${gridSize * 2}px ${gridSize * 2}px;
            border: 5px solid #0c2412;
        }
        .snake-head { 
            background-image: url('./imagem-level-3/cobrinha.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 5px;
            z-index: 2;
        }
        .snake-body { background-color: #f0f0f0; border-radius: 3px; z-index: 1;}
        .food {
            background-color: red; 
            background-image: url('./imagem-level-3/frutas.png');
            background-size: contain; 
            background-repeat: no-repeat;
            border-radius: 50%; 
            z-index: 2;
        }
    `;
    document.head.appendChild(style);

    if (tentativasDisplay) tentativasDisplay.textContent = tentativas;
    resetGameEIniciaLoop();
});