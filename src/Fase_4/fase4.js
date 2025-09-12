document.addEventListener('DOMContentLoaded', () => {

    // ===== CONFIGURAÇÃO INICIAL E ELEMENTOS DO HTML =====
    const canvas = document.querySelector('canvas');
    const c = canvas.getContext('2d');
    const box = document.getElementById('box');
    const vitoriaContainer = document.querySelector('.vitoria-conteiner');
    const pauseButton = document.querySelector('.pause');
    const tentativasDisplay = document.getElementById('tentativas-jogador');
    const pilulasDisplay = document.getElementById('pilulas-coletadas');
    const editorContainer = document.getElementById('meu-editor-codigo');

    const CODIGO_PADRAO_EDITOR = `// Complete a lógica de decisão abaixo!
// Use as 'variáveis prontas' e os 'sensores'.

if (irParaDireita && labirinto.podeMoverParaDireita()) {
  // O que fazer aqui? Dica: acoes.mover...
  
} else if (irParaEsquerda && labirinto.podeMoverParaEsquerda()) {
  
} else if (irParaBaixo && labirinto.podeMoverParaBaixo()) {
  
} else if (irParaCima && labirinto.podeMoverParaCima()) {
  
}
`;

    const editor = CodeMirror(editorContainer, {
        value: CODIGO_PADRAO_EDITOR,
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true
    });

    // ===== CLASSES DO JOGO =====
    class Boundary { constructor({ position }) { this.position = position; this.width = 40; this.height = 40; } draw() { c.fillStyle = '#0000FF'; c.fillRect(this.position.x, this.position.y, this.width, this.height); } }
    class Character { constructor({ position, velocity, radius, color }) { this.position = position; this.velocity = velocity; this.radius = radius; this.color = color; } draw() { c.beginPath(); c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); c.fillStyle = this.color; c.fill(); c.closePath(); } }
    class Pellet { constructor({ position }) { this.position = position; this.radius = 3; } draw() { c.beginPath(); c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); c.fillStyle = 'white'; c.fill(); c.closePath(); } }

    // ===== VARIÁVEIS GLOBAIS DO JOGO =====
    const map = [['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'], 
                ['1', 'p', '.', '.', '.', '.', '.', '.', '.', '.', '.', '1'], 
                ['1', '.', '1', '1', '.', '.', '.', '.', '1', '1', '.', '1'], 
                ['1', '.', '.', '.', '.', '1', '1', '.', '.', '.', '.', '1'], 
                ['1', '.', '1', '1', '.', '.', '.', '.', '1', '1', '.', '1'], 
                ['1', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'g', '1'], 
                ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1']];
    let player, ghost, boundaries = [], pellets = [];
    let gameIntervalId = null;
    let isGameOver = false;
    let userLogicFunction = null;
    let tentativas = 0;
    let playerSpeed = 40;
    let ghostSpeed = 0.5; // Fantasma continua mais lento para ser justo
    let primeiraExecucao = true;
    let originalPelletsCount = 0;

    // ===== FUNÇÕES DE CONTROLE DO JOGO =====

    function inicializarJogo() {
        if (gameIntervalId) { clearInterval(gameIntervalId); }
        boundaries = []; pellets = []; isGameOver = false;
        vitoriaContainer.style.display = 'none';
        pauseButton.style.display = 'none';
        canvas.width = box.clientWidth;
        canvas.height = box.clientHeight;
        const tileWidth = canvas.width / map[0].length;
        const tileHeight = canvas.height / map.length;
        Boundary.width = tileWidth;
        Boundary.height = tileHeight;
        playerSpeed = tileWidth;
        ghostSpeed = tileWidth / 2;
        const charRadius = Math.min(tileWidth, tileHeight) / 2 * 0.7;

        map.forEach((row, i) => {
            row.forEach((symbol, j) => {
                const x = tileWidth * j + tileWidth / 2;
                const y = tileHeight * i + tileHeight / 2;
                switch (symbol) {
                    case '1': boundaries.push(new Boundary({ position: { x: tileWidth * j, y: tileHeight * i } })); break;
                    case '.': pellets.push(new Pellet({ position: { x, y } })); break;
                    case 'p': player = new Character({ position: { x, y }, velocity: { x: 0, y: 0 }, radius: charRadius, color: 'yellow' }); break;
                    case 'g': ghost = new Character({ position: { x, y }, velocity: { x: 0, y: 0 }, radius: charRadius, color: 'red' }); break;
                }
            });
        });
        originalPelletsCount = pellets.length;
        pilulasDisplay.textContent = `0 / ${originalPelletsCount}`;
        desenharEstadoInicial();
    }

    function gameStep() {
        if (isGameOver) return;
        executarLogicaUsuario();
        moverJogador();
        moverFantasma();
        desenharCenario();
        verificarFimDeJogo();
    }

    function moverJogador() {
        const proximaPos = { ...player, position: { x: player.position.x + player.velocity.x, y: player.position.y + player.velocity.y } };
        if (!colideComParede(proximaPos)) {
            player.position.x += player.velocity.x;
            player.position.y += player.velocity.y;
        } else if (player.velocity.x !== 0 || player.velocity.y !== 0) {
            gameOver("Você colidiu com uma parede!");
        }
    }

    function moverFantasma() {
        const sensoresFantasma = {
            podeCima: () => !colideComParede({ ...ghost, position: { x: ghost.position.x, y: ghost.position.y - ghostSpeed } }),
            podeBaixo: () => !colideComParede({ ...ghost, position: { x: ghost.position.x, y: ghost.position.y + ghostSpeed } }),
            podeEsquerda: () => !colideComParede({ ...ghost, position: { x: ghost.position.x - ghostSpeed, y: ghost.position.y } }),
            podeDireita: () => !colideComParede({ ...ghost, position: { x: ghost.position.x + ghostSpeed, y: ghost.position.y } })
        };

        // Calcula a próxima posição com base na velocidade ATUAL do fantasma.
        const proximaPos = { ...ghost, position: { x: ghost.position.x + ghost.velocity.x, y: ghost.position.y + ghost.velocity.y } };

        // O fantasma só muda de direção se estiver parado OU se for bater numa parede.
        if (colideComParede(proximaPos) || (ghost.velocity.x === 0 && ghost.velocity.y === 0)) {

            // 1. Cria uma lista de todos os movimentos possíveis.
            const movimentosPossiveis = [];
            if (sensoresFantasma.podeCima()) {
                movimentosPossiveis.push({ x: 0, y: -ghostSpeed });
            }
            if (sensoresFantasma.podeBaixo()) {
                movimentosPossiveis.push({ x: 0, y: ghostSpeed });
            }
            if (sensoresFantasma.podeEsquerda()) {
                movimentosPossiveis.push({ x: -ghostSpeed, y: 0 });
            }
            if (sensoresFantasma.podeDireita()) {
                movimentosPossiveis.push({ x: ghostSpeed, y: 0 });
            }

            // 2. Tenta não voltar pelo mesmo caminho, para parecer mais natural.
            const movimentosSemReversao = movimentosPossiveis.filter(
                move => move.x !== -ghost.velocity.x || move.y !== -ghost.velocity.y
            );

            // 3. Escolhe a lista de onde vai tirar o movimento aleatório.
            //    (Prefere não voltar, mas se for a única opção, ele volta).
            const listaDeEscolha = movimentosSemReversao.length > 0 ? movimentosSemReversao : movimentosPossiveis;

            // 4. Escolhe uma nova velocidade aleatória da lista.
            if (listaDeEscolha.length > 0) {
                ghost.velocity = listaDeEscolha[Math.floor(Math.random() * listaDeEscolha.length)];
            }
        }

        // Aplica o movimento (seja o novo ou o antigo).
        ghost.position.x += ghost.velocity.x;
        ghost.position.y += ghost.velocity.y;
    }

    function desenharCenario() {
        c.clearRect(0, 0, canvas.width, canvas.height);
        boundaries.forEach(b => b.draw());
        for (let i = pellets.length - 1; i >= 0; i--) {
            const p = pellets[i];
            p.draw();
            if (Math.hypot(player.position.x - p.position.x, player.position.y - p.position.y) < player.radius + p.radius) {
                pellets.splice(i, 1);
                pilulasDisplay.textContent = `${originalPelletsCount - pellets.length} / ${originalPelletsCount}`;
            }
        }
        player.draw();
        ghost.draw();
    }

    function verificarFimDeJogo() {
        if (pellets.length === 0) {
            vitoria();
        }
        if (Math.hypot(player.position.x - ghost.position.x, player.position.y - ghost.position.y) < player.radius + ghost.radius) {
            gameOver("O fantasma te pegou!");
        }
    }

    function executarLogicaUsuario() {
        if (!userLogicFunction) return;
        player.velocity = { x: 0, y: 0 };
        const labirinto = {
            podeMoverParaCima: () => !colideComParede({ ...player, position: { x: player.position.x, y: player.position.y - playerSpeed } }),
            podeMoverParaBaixo: () => !colideComParede({ ...player, position: { x: player.position.x, y: player.position.y + playerSpeed } }),
            podeMoverParaEsquerda: () => !colideComParede({ ...player, position: { x: player.position.x - playerSpeed, y: player.position.y } }),
            podeMoverParaDireita: () => !colideComParede({ ...player, position: { x: player.position.x + playerSpeed, y: player.position.y } })
        };
        const elementos = {
            pacman: { posicaoX: player.position.x, posicaoY: player.position.y },
            powerups: pellets.map(p => ({ posicaoX: p.position.x, posicaoY: p.position.y })),
        };
        const acoes = {
            moverParaCima: () => player.velocity = { x: 0, y: -playerSpeed },
            moverParaBaixo: () => player.velocity = { x: 0, y: playerSpeed },
            moverParaEsquerda: () => player.velocity = { x: -playerSpeed, y: 0 },
            moverParaDireita: () => player.velocity = { x: playerSpeed, y: 0 }
        };
        try {
            userLogicFunction(elementos, acoes, labirinto);
        } catch (e) {
            console.error("Erro no código do usuário:", e);
            gameOver("Erro no seu código!");
        }
    }

    function aplicarCodigoDoUsuario() {
        if (primeiraExecucao) {
            tentativas = 0;
            primeiraExecucao = false;
        }
        tentativas++;
        tentativasDisplay.textContent = tentativas;

        try {
            const codigoDoUsuario = editor.getValue();
            let codigoFinal;

            if (codigoDoUsuario.trim() === CODIGO_PADRAO_EDITOR.trim()) {
                codigoFinal = 'acoes.moverParaDireita();';
            } else {
                codigoFinal = `
                    if (elementos.powerups.length === 0) { return; }
                    const alvo = elementos.powerups[0];
                    const pacman = elementos.pacman;
                    const irParaDireita = alvo.posicaoX > pacman.posicaoX;
                    const irParaEsquerda = alvo.posicaoX < pacman.posicaoX;
                    const irParaBaixo = alvo.posicaoY > pacman.posicaoY;
                    const irParaCima = alvo.posicaoY < pacman.posicaoY;
                    ${codigoDoUsuario}
                `;
            }
            userLogicFunction = new Function('elementos', 'acoes', 'labirinto', codigoFinal);
        } catch (error) {
            alert("Erro de sintaxe no seu código: " + error.message);
            return;
        }
        inicializarJogo();
        gameIntervalId = setInterval(gameStep, 200);
    }

    function desenharEstadoInicial() { c.clearRect(0, 0, canvas.width, canvas.height); boundaries.forEach(b => b.draw()); pellets.forEach(p => p.draw()); player.draw(); ghost.draw(); }
    function colideComParede(entidade) { return boundaries.some(parede => circleCollidesWithRectangle(entidade, parede)); }
    function circleCollidesWithRectangle(circle, rectangle) { const closestX = Math.max(rectangle.position.x, Math.min(circle.position.x, rectangle.position.x + rectangle.width)); const closestY = Math.max(rectangle.position.y, Math.min(circle.position.y, rectangle.position.y + rectangle.height)); const dX = circle.position.x - closestX; const dY = circle.position.y - closestY; return (dX * dX + dY * dY) < (circle.radius * circle.radius); }
    function gameOver(message) { if (isGameOver) return; isGameOver = true; clearInterval(gameIntervalId); pauseButton.textContent = 'Tentar Novamente'; pauseButton.style.display = 'block'; }
    function vitoria() { if (isGameOver) return; isGameOver = true; clearInterval(gameIntervalId); vitoriaContainer.style.display = 'flex'; }

    // ===== PONTO DE ENTRADA DO SCRIPT =====
    function iniciarDemonstracao() {
        tentativasDisplay.textContent = '0';
        userLogicFunction = new Function('elementos', 'acoes', 'labirinto', 'acoes.moverParaDireita();');
        inicializarJogo();
        gameIntervalId = setInterval(gameStep, 200);
    }

    pauseButton.addEventListener('click', aplicarCodigoDoUsuario);
    document.getElementById('botao-dica').addEventListener('click', () => {
        document.getElementById('texto-dica').style.display = 'block';
    });

    iniciarDemonstracao();
});