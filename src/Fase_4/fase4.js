document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.querySelector('canvas');
    const c = canvas.getContext('2d');

    const box = document.getElementById('box');
    canvas.width = box.clientWidth;
    canvas.height = box.clientHeight;

    class limitesLevel {

        static width = 30;
        static height = 30;

        constructor({ position }) {
            this.position = position;
            this.width = limitesLevel.width;
            this.height = limitesLevel.height;
        }

        desenhaBloco() {
            c.fillStyle = 'blue';
            c.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    const mapa = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
    ];

    const limitesMapa = [];

    mapa.forEach((row, i) => {
        row.forEach((parede, j) => {
            switch (parede) {
                case 1:
                    limitesMapa.push(new limitesLevel({
                        position: {
                            x: limitesLevel.width * j,
                            y: limitesLevel.height * i
                        }
                    }));
                    break;
            }
        });
    });

    limitesMapa.forEach(limite => {
        limite.desenhaBloco();
    });

    // Seu código do CodeMirror
    const editor = CodeMirror(document.getElementById('meu-editor-codigo'), {
        value: `// Pac-Man?
// Ele está meio diferente, mas a lógica é a mesma! ajude-o a coletar os powerups e evitar o fantasma!
// === OBJETOS DISPONÍVEIS: ===
// === AÇÕES DISPONÍVEIS: ===
// Exemplo:
`,
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true
    });

});