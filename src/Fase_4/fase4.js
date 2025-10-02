window.addEventListener('load', () => {

    // ============= CONFIGURAÇÕES E SELEÇÃO DE ELEMENTOS =============
    const canvas = document.querySelector('canvas');
    const pacmanSprite = document.getElementById('pacman-sprite');
    const ctx = canvas.getContext('2d');
    const box = document.getElementById('box');
    const tentarNovamenteBtn = document.getElementById('tentar-novamente-btn');

    canvas.width = box.clientWidth;
    canvas.height = box.clientHeight;

    const tileMapWidth = 15, tileMapHeight = 7;
    const tileCountX = tileMapWidth, tileCountY = tileMapHeight;

    const map = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 2, 1, 2, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 2, 1, 2, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    let originalMapState = JSON.stringify(map);
    let pacman, totalPilulas, pilulasColetadas, tentativas, gameLoopId, logicFunction;
    let isUsingUserCode = false;

    const editor = CodeMirror(document.getElementById('meu-editor-codigo'), {
        value: `// Guie o Pac-Man para coletar todas as pílulas!

// --- SUAS FERRAMENTAS ---
// [SENSORES DE PÍLULA] - Retornam 'true' ou 'false'
//   - sensores.pilulaEstaADireita
//   - sensores.pilulaEstaAEsquerda
//   - sensores.pilulaEstaAcima
//   - sensores.pilulaEstaAbaixo

// [SENSORES DE CAMINHO] - Também retornam 'true' ou 'false'
//   - sensores.podeMoverParaDireita
//   - sensores.podeMoverParaEsquerda
//   // ...e para Cima/Baixo

// [AÇÕES] - Funções para mover o Pac-Man
//   - acoes.moverParaDireita()
//   // ...e para Esquerda/Cima/Baixo


// --- COMPLETE A LÓGICA ABAIXO ---

// Exemplo para a Direita:
// SE a pílula está à direita E o caminho para a direita está livre...
if (sensores.pilulaEstaADireita && sensores.podeMoverParaDireita) {
    // ...ENTÃO, mova para a direita!
    acoes.moverParaDireita();
}
`,
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true,
    });

    const logicaPadrao = (sensores, acoes) => {
        acoes.moverParaDireita();
    };

    function inicializar() {
        pacmanGifs = {
            up: document.getElementById('pacman-gif-up'),
            down: document.getElementById('pacman-gif-down'),
            left: document.getElementById('pacman-gif-left'),
            right: document.getElementById('pacman-gif'),
        }

        totalPilulas = map.flat().filter(c => c === 2).length;
        tentarNovamenteBtn.addEventListener('click', executarCodigoDoUsuario);
        tentativas = 0;
        startNewRun();
    }

    function startNewRun() {
        resetGame();
        logicFunction = isUsingUserCode ? compilarCodigoDoUsuario() : logicaPadrao;
        if (logicFunction) {
            gameLoopId = setInterval(gameTick, 150); // Um pouco mais lento para ver melhor
        }
    }

    function resetGame() {
        if (gameLoopId) clearInterval(gameLoopId);

        const savedMap = JSON.parse(originalMapState);
        map.forEach((row, i) => map[i] = [...savedMap[i]]);

        pacman = { x: 1, y: 1, dir: 'right', nextDir: 'right' };
        pilulasColetadas = 0;

        document.querySelector('.vitoria-conteiner').style.display = 'none';
        tentarNovamenteBtn.style.display = 'none';

        atualizarUI();
        draw();
    }

    function executarCodigoDoUsuario() {
        tentativas++;
        isUsingUserCode = true;
        startNewRun();
    }

    function compilarCodigoDoUsuario() {
        try {
            const codigoDoUsuario = editor.getValue();
            return new Function('sensores', 'acoes', codigoDoUsuario);
        } catch (e) {
            alert("Erro de sintaxe no seu código: " + e.message);
            isUsingUserCode = false; // Volta ao modo padrão se o código quebrar.
            return null; // Retorna nulo para indicar falha na compilação
        }
    }

    function gameOver() {
        clearInterval(gameLoopId);
        gameLoopId = null;
        tentarNovamenteBtn.style.display = 'block';
    }

    function vitoria() {
        clearInterval(gameLoopId);
        document.querySelector('.vitoria-conteiner').style.display = 'flex';
    }

    function gameTick() {
        const sensores = criarSensores();
        const acoes = {
            moverParaCima: () => { pacman.nextDir = 'up'; },
            moverParaBaixo: () => { pacman.nextDir = 'down'; },
            moverParaEsquerda: () => { pacman.nextDir = 'left'; },
            moverParaDireita: () => { pacman.nextDir = 'right'; },
        };

        try {
            if (logicFunction) logicFunction(sensores, acoes);
        } catch (e) {
            gameOver("Erro ao executar sua lógica: " + e.message);
            return;
        }

        moverPacman();

        if (gameLoopId) {
            coletarPilula();
            draw();
            atualizarPacmanSprite();
            if (pilulasColetadas >= totalPilulas) vitoria();
        }
    }

    function moverPacman() {
        if (!checarColisao(pacman.x, pacman.y, pacman.nextDir)) {
            pacman.dir = pacman.nextDir;
        }

        if (checarColisao(pacman.x, pacman.y, pacman.dir)) {
            gameOver();
            return;
        }

        switch (pacman.dir) {
            case 'up': pacman.y--; break;
            case 'down': pacman.y++; break;
            case 'left': pacman.x--; break;
            case 'right': pacman.x++; break;
        }
    }

    function coletarPilula() {
        if (map[pacman.y]?.[pacman.x] === 2) {
            map[pacman.y][pacman.x] = 0;
            pilulasColetadas++;
            atualizarUI();
        }
    }

    function checarColisao(x, y, dir) {
        let nextX = x, nextY = y;
        switch (dir) {
            case 'up': nextY--; break;
            case 'down': nextY++; break;
            case 'left': nextX--; break;
            case 'right': nextX++; break;
        }
        if (nextY < 0 || nextY >= tileCountY || nextX < 0 || nextX >= tileCountX) return true;
        return map[nextY][nextX] === 1;
    }

    function criarSensores() {
        const encontrarPilulaMaisProxima = () => {
            let maisProxima = null, menorDistancia = Infinity;
            for (let y = 0; y < tileCountY; y++) {
                for (let x = 0; x < tileCountX; x++) {
                    if (map[y][x] === 2) {
                        const distancia = Math.abs(pacman.x - x) + Math.abs(pacman.y - y);
                        if (distancia < menorDistancia) {
                            menorDistancia = distancia;
                            maisProxima = { x, y };
                        }
                    }
                }
            }
            // Se não houver mais pílulas, retorna a posição do pacman para evitar erros.
            return maisProxima || { x: pacman.x, y: pacman.y };
        };

        const pilulaProxima = encontrarPilulaMaisProxima();

        return {
            // Sensores de Posição da Pílula
            pilulaEstaAcima: pilulaProxima.y < pacman.y,
            pilulaEstaAbaixo: pilulaProxima.y > pacman.y,
            pilulaEstaAEsquerda: pilulaProxima.x < pacman.x,
            pilulaEstaADireita: pilulaProxima.x > pacman.x,

            // Sensores de Caminho Livre
            podeMoverParaCima: !checarColisao(pacman.x, pacman.y, 'up'),
            podeMoverParaBaixo: !checarColisao(pacman.x, pacman.y, 'down'),
            podeMoverParaEsquerda: !checarColisao(pacman.x, pacman.y, 'left'),
            podeMoverParaDireita: !checarColisao(pacman.x, pacman.y, 'right'),
        };
    }

    function atualizarUI() {
        const pilulasDisplay = document.getElementById('pilulas-coletadas');
        const tentativasDisplay = document.getElementById('tentativas-jogador');
        if (pilulasDisplay) pilulasDisplay.textContent = `${pilulasColetadas} / ${totalPilulas}`;
        if (tentativasDisplay) tentativasDisplay.textContent = tentativas;
    }

    function atualizarPacmanSprite() {
        // Garante que o sprite só apareça depois de o jogo começar
        if (!pacmanGifs || !pacman) {
            pacmanSprite.style.display = 'none';
            return;
        }
    
        const cellWidth = canvas.width / tileCountX;
        const cellHeight = canvas.height / tileCountY;
    
        // Pega a imagem correta das nossas fontes escondidas
        const gifSource = pacmanGifs[pacman.dir];
        if (pacmanSprite.src !== gifSource.src) {
            pacmanSprite.src = gifSource.src;
        }
    
        // Calcula tamanho e posição (mesma lógica de antes)
        const radius = cellWidth / 2.5;
        const characterSize = radius * 2;
        const centerX = pacman.x * cellWidth + cellWidth / 2;
        const centerY = pacman.y * cellHeight + cellHeight / 2;
        
        // Aplica os estilos CSS para mover e dimensionar a imagem
        pacmanSprite.style.width = `${characterSize}px`;
        pacmanSprite.style.height = `${characterSize}px`;
        pacmanSprite.style.left = `${centerX - characterSize / 2}px`;
        pacmanSprite.style.top = `${centerY - characterSize / 2}px`;
        pacmanSprite.style.display = 'block';
    }

    function draw() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cellWidth = canvas.width / tileCountX, cellHeight = canvas.height / tileCountY;

        for (let y = 0; y < tileCountY; y++) {
            for (let x = 0; x < tileCountX; x++) {
                const cellX = x * cellWidth, cellY = y * cellHeight;
                if (map[y]?.[x] === 1) {
                    ctx.fillStyle = '#0000FF';
                    ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
                } else if (map[y]?.[x] === 2) {
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(cellX + cellWidth / 2, cellY + cellHeight / 2, cellWidth / 8, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }

        }

    const botaoDica = document.getElementById('botao-dica');
    const textoDica = document.getElementById('texto-dica');
    if (botaoDica && textoDica) {
        botaoDica.addEventListener('click', () => {
            const isHidden = textoDica.style.display === 'none' || textoDica.style.display === '';
            textoDica.style.display = isHidden ? 'block' : 'none';
            botaoDica.textContent = isHidden ? 'Esconder Dica' : 'Ver Dica';
        });
    }

    inicializar();
});