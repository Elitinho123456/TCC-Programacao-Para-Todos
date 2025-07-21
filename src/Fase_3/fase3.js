document.addEventListener('DOMContentLoaded', () => {

    const code = document.getElementById('meu-editor-codigo');

    const editor = CodeMirror(code, {
        value: `// Bem-vindo à Fase 3: O Labirinto da Lógica\n// Use os sensores e comandos abaixo para guiar o Pac-Man:\n\n// Sensores disponíveis:\n// - elementos.sensor.frente\n// - elementos.sensor.direita\n// - elementos.sensor.esquerda\n\n// Ações disponíveis:\n// - acoes.virarDireita()\n// - acoes.virarEsquerda()\n// - acoes.continuarReto()\n\n// Exemplo:\nif (elementos.sensor.frente === 'parede') {\n    acoes.virarDireita();\n} else {\n    acoes.continuarReto();\n}\n`,
        mode: "javascript", // Linguagem (css, htmlmixed, javascript)
        theme: "dracula", // Tema
        lineNumbers: true, // Mostrar números das linhas
    });

    // Guardar a referência ao editor para usar depois
    window.meuEditor = editor;

    // ==================== VARIAVEIS E ESTADO =====================
    let labirinto = [
        ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
        ['#', '.', ' ', 'F', ' ', '#', ' ', '.', ' ', '#'],
        ['#', ' ', '#', '#', ' ', '#', ' ', '#', ' ', '#'],
        ['#', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', '#'],
        ['#', '#', '#', '#', '#', '#', '#', '#', '.', '#']
    ];

    const DIRECOES = ['cima', 'direita', 'baixo', 'esquerda'];
    let direcaoAtual = 1; // Começa indo para a direita
    let posPacman = { x: 1, y: 1 };
    let sensores = { frente: '', direita: '', esquerda: '' };

    let elementos = {
        sensor: sensores
    };

    let acoes = {
        virarDireita: () => direcaoAtual = (direcaoAtual + 1) % 4,
        virarEsquerda: () => direcaoAtual = (direcaoAtual + 3) % 4,
        continuarReto: () => moverPacman()
    };

    let intervaloMovimento;
    let mapaDiv, pacmanEl;

    // =================== FUNÇÕES DE JOGO =====================
    function iniciarLabirinto() {
        mapaDiv = document.getElementById("labirinto");
        mapaDiv.innerHTML = '';
        mapaDiv.style.display = 'grid';
        mapaDiv.style.gridTemplateColumns = `repeat(${labirinto[0].length}, 40px)`;

        labirinto.forEach((linha, y) => {
            linha.forEach((celula, x) => {
                const div = document.createElement('div');
                div.classList.add('tile');
                if (celula === '#') div.classList.add('parede');
                else if (celula === '.') div.classList.add('pilula');
                else if (celula === 'F') div.classList.add('fantasma');
                else div.classList.add('caminho');
                div.dataset.x = x;
                div.dataset.y = y;
                mapaDiv.appendChild(div);
            });
        });

        pacmanEl = document.createElement('div');
        pacmanEl.id = 'pacman';
        mapaDiv.appendChild(pacmanEl);
        atualizarPacman();
        atualizarSensores();
    }

    function atualizarPacman() {
        pacmanEl.style.gridColumnStart = posPacman.x + 1;
        pacmanEl.style.gridRowStart = posPacman.y + 1;
        pacmanEl.style.transform = `rotate(${direcaoAtual * 90}deg)`;
    }

    function moverPacman() {
        const prox = calcularProximaPosicao();
        const celula = labirinto[prox.y]?.[prox.x];

        if (!celula || celula === '#') return;

        if (celula === 'F') return perder();
        if (celula === '.') {
            labirinto[prox.y][prox.x] = ' ';
            // Pode adicionar pontuação aqui
        }

        posPacman = prox;
        atualizarPacman();
        atualizarSensores();
    }

    function calcularProximaPosicao(offset = 1, direcao = direcaoAtual) {
        let dx = [0, 1, 0, -1];
        let dy = [-1, 0, 1, 0];
        return {
            x: posPacman.x + dx[direcao] * offset,
            y: posPacman.y + dy[direcao] * offset
        };
    }

    function atualizarSensores() {
        const frente = calcularProximaPosicao(1);
        const direita = calcularProximaPosicao(1, (direcaoAtual + 1) % 4);
        const esquerda = calcularProximaPosicao(1, (direcaoAtual + 3) % 4);

        sensores.frente = valorSensor(frente);
        sensores.direita = valorSensor(direita);
        sensores.esquerda = valorSensor(esquerda);
    }

    function valorSensor(pos) {
        const val = labirinto[pos.y]?.[pos.x];
        if (!val || val === '#') return 'parede';
        if (val === '.') return 'pilula';
        if (val === 'F') return 'fantasma';
        return 'livre';
    }

    function perder() {
        clearInterval(intervaloMovimento);
        alert("Game Over! Você encontrou um fantasma.");
        incrementarTentativas();
    }

    function resetarJogo() {
        labirinto = [
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '.', ' ', 'F', ' ', '#', ' ', '.', ' ', '#'],
            ['#', ' ', '#', '#', ' ', '#', ' ', '#', ' ', '#'],
            ['#', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '.', '#']
        ];
        posPacman = { x: 1, y: 1 };
        direcaoAtual = 1;
        iniciarLabirinto();
        executarCodigoJogador();
    }

    // ================ EXECUÇÃO DO CÓDIGO DO JOGADOR ===================
    function executarCodigoJogador() {
        const editor = window.meuEditor;
        if (!editor) return;

        const codigo = editor.getValue();

        try {
            const func = new Function('elementos', 'acoes', `'use strict';\n${codigo}`);

            intervaloMovimento = setInterval(() => {
                func(elementos, acoes);
            }, 700);

        } catch (e) {
            alert("Erro no seu código: " + e.message);
        }
    }

    // ================= INICIALIZAÇÃO GLOBAL ==================

        iniciarLabirinto();

        const btnReset = document.getElementById('pause');
        const reiniciar = document.getElementById('reiniciar');

        if (btnReset) btnReset.addEventListener('click', resetarJogo);
        if (reiniciar) reiniciar.addEventListener('click', resetarJogo);

    // ================= CONTAGEM DE TENTATIVAS ==================
    let tentativas = 0;
    function incrementarTentativas() {
        tentativas++;
        const display = document.getElementById('tentativas-jogador');
        if (display) display.textContent = tentativas;
    }


})