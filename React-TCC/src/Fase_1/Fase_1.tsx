import { useEffect, useRef, useState } from 'react';
import './Fase_1.css';

// Import all assets at the top
import Chao from './assets/tiles.png';
import BandeiraImg from './assets/bandeira.png';
import Cano from './assets/pipe.png';
import PlayerGif from './assets/playerT.gif';
import PlayerStatic from './assets/playerT.png'; // <-- Import added
import PlayerVictory from './assets/playerV.png'; // <-- Import added
import CloudsImg from './assets/clouds.png'; // <-- Import added
// import type { EditorView as Editor } from 'codemirror';

// Import CodeMirror properly instead of relying on window object
// npm install react-codemirror2 codemirror
// import { Controlled as CodeMirror } from 'react-codemirror2';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/dracula.css';
// import 'codemirror/mode/javascript/javascript';

export default function Fase1() {
    const editorRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<HTMLImageElement>(null);
    const paredeRef = useRef<HTMLImageElement>(null);
    const bandeiraRef = useRef<HTMLImageElement>(null);
    const vitoriaBotaoRef = useRef<HTMLDivElement>(null);
    const gameOverButtonsRef = useRef<HTMLDivElement>(null); // Ref for container of pause/home buttons
    const nuvensContainerRef = useRef<HTMLDivElement>(null);

    const [tentativas, setTentativas] = useState(0);
    const [dicaVisivel, setDicaVisivel] = useState(false);
    const [editor, setEditor] = useState<any>(null); // For CodeMirror instance
    const [isGameOver, setIsGameOver] = useState(false);
    
    // Use a ref for the game loop to avoid stale state issues
    const isGameOverRef = useRef(isGameOver);
    useEffect(() => {
        isGameOverRef.current = isGameOver;
    }, [isGameOver]);

    // ============= CodeMirror Editor (Initialization) =============
    useEffect(() => {
        // Initialize CodeMirror only once
        if (editorRef.current && !editor) {
            const CodeMirror = window.CodeMirror;
            if (CodeMirror) {
                const cm = CodeMirror(editorRef.current, {
                    value: `// Objetivo: Fazer o jogador pular o cano!
// Dica: Altere a posição 'bottom' do jogador.

// Exemplo:
// elementos.jogador.style.bottom = '150px';
`,
                    mode: "javascript",
                    theme: "dracula",
                    lineNumbers: true,
                });
                setEditor(cm);
            }
        }
        // Run only on mount
    }, [editor]); // <-- Added 'editor' to dependency array

    // ============= Game Logic Functions =============
    const gameOver = () => {
        if (isGameOverRef.current) return; // Prevent running multiple times
        setIsGameOver(true);
        setTentativas((t) => t + 1);

        const player = playerRef.current;
        if (player) {
            player.style.animation = 'none';
            player.style.left = `${player.offsetLeft}px`;
            // Trigger game over animation
            player.style.animation = 'game-over 1s ease-out forwards';
            player.src = PlayerStatic; // <-- Use imported asset
            player.style.width = '100px';
        }
        if (gameOverButtonsRef.current) gameOverButtonsRef.current.style.display = 'block';
    };

    const vitoria = () => {
        if (isGameOverRef.current) return; // Prevent running multiple times
        setIsGameOver(true);
        
        const player = playerRef.current;
        const bandeira = bandeiraRef.current;
        if (player && bandeira) {
            player.style.animation = 'none';
            // Ensure player.width is not undefined
            const playerWidth = player.width || player.getBoundingClientRect().width || 0;
            player.style.left = `${bandeira.offsetLeft - playerWidth + 70}px`;
            player.src = PlayerVictory; // <-- Use imported asset
            player.style.width = '100px';
        }
        if (vitoriaBotaoRef.current) vitoriaBotaoRef.current.style.display = 'block';
        setTentativas(0); // Reset on victory
    };

    const resetGame = () => {
        setIsGameOver(false);
        const player = playerRef.current;
        if (player) {
            player.style.opacity = '1';
            player.style.left = '-3%';
            player.style.bottom = '72px';
            player.style.width = '80px';
            player.style.animation = '';
            player.src = PlayerGif; // <-- Use imported asset
        }
        if (gameOverButtonsRef.current) gameOverButtonsRef.current.style.display = 'none';
        if (vitoriaBotaoRef.current) vitoriaBotaoRef.current.style.display = 'none';
    };
    
    // ============= Main Game Loop =============
    useEffect(() => {
        const loop = setInterval(() => {
            if (isGameOverRef.current) {
                return; // <-- Use ref to check for game over status
            }

            const player = playerRef.current;
            const parede = paredeRef.current;
            const bandeira = bandeiraRef.current;
            if (!player || !parede || !bandeira) return;

            const playerRect = player.getBoundingClientRect();
            const paredeRect = parede.getBoundingClientRect();
            const bandeiraRect = bandeira.getBoundingClientRect();

            // Collision with obstacle
            const colidiu = 
                playerRect.right > paredeRect.left + 30 &&
                playerRect.left < paredeRect.right - 30 &&
                playerRect.bottom > paredeRect.top;
                
            if (colidiu) gameOver();

            // Reached the flag
            if (playerRect.right > bandeiraRect.left + 20) {
                 vitoria();
            }
        }, 10);

        return () => clearInterval(loop); // Cleanup on unmount
    }, []); // <-- Run only once on component mount

    // ============= Cloud Generation =============
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        function criarNuvem() {
            if (!nuvensContainerRef.current) return;
            const nuvem = document.createElement('img');
            nuvem.src = CloudsImg; // <-- Use imported asset
            nuvem.classList.add('nuvem');
            nuvem.style.width = `${Math.floor(Math.random() * 251) + 350}px`;
            nuvem.style.top = `${Math.random() * 50}%`;
            if (Math.random() < 0.4) nuvem.classList.add('nuvem-invertida');
            nuvensContainerRef.current.appendChild(nuvem);

            nuvem.addEventListener('animationend', () => nuvem.remove());
        }

        function gerarNuvensAleatoriamente() {
            criarNuvem();
            timeoutId = setTimeout(gerarNuvensAleatoriamente, Math.random() * 5000 + 1000);
        }

        gerarNuvensAleatoriamente();
        return () => clearTimeout(timeoutId);
    }, []);

    // ============= Editor Code Execution =============
    function executeUserCode() {
        if (!editor) return;
        const codigo = editor.getValue();
        try {
            const elementos = {
                jogador: playerRef.current,
                obstaculo: paredeRef.current,
                meta: bandeiraRef.current
            };
            const acoes = {
                reiniciar: resetGame,
                perder: gameOver
            };

            const funcaoDoUsuario = new Function('elementos', 'acoes', `'use strict';\n${codigo}`);
            funcaoDoUsuario(elementos, acoes);
        } catch (error) {
            if (error instanceof Error) {
                alert("Erro no seu código: " + error.message);
            }
            
        }
    }

    function handleTryAgain() {
        resetGame();
        setTimeout(() => {
            executeUserCode();
        }, 50);
    }
    
    // ============= Render JSX =============
    return (
        <div className="container-geral">
            <aside className="aba-lateral-esquerda">
                <h2 id="titulo-jogo">AVENTURA DO CÓDIGO</h2>
                <h3 id="titulo-fase">Fase 1/4:<br />O primeiro Run</h3>
                <div className="botoesNav">
                    <button className="nav-btn" id="btn-prev" disabled title="Fase anterior">&lt;</button>
                    {/* For navigation, use React Router's <Link> or a state change */}
                    <button className="nav-btn" id="btn-home" title="Home" onClick={() => {/* Navigate Home */}}></button>
                    <button className="nav-btn" id="btn-next" title="Próxima fase">&gt;</button>
                </div>
                <p id="info-fase-descricao">Use o editor abaixo para mover o jogador e ajudá-lo a chegar na bandeira, desviando do cano!</p>
                <ul>
                    <li><strong>Jogador:</strong> <code>elementos.jogador</code></li>
                    <li><strong>Obstáculo:</strong> <code>elementos.obstaculo</code></li>
                    <li><strong>Bandeira:</strong> <code>elementos.meta</code></li>
                </ul>
                <p>No editor, você pode alterar propriedades como <code>elementos.jogador.style.bottom</code>.</p>
                <button id="botao-dica" onClick={() => setDicaVisivel((v) => !v)}>
                    {dicaVisivel ? 'Esconder Dica' : 'Ver Dica'}
                </button>
                {/* FIX: Correctly show/hide hint text inside the paragraph */}
                {dicaVisivel && (
                    <p id="texto-dica">
                        Tente alterar a posição vertical do jogador usando 'style.bottom'. Um valor como '150px' pode ser o suficiente para pular o cano.
                    </p>
                )}
            </aside>
            
            <main className="conteudo-principal">
                <div className='box'>
                    <div id="nuvens-container" ref={nuvensContainerRef}></div>
                    <div id="chao">
                        <img src={Chao} className="tiles" alt="Chão" />
                    </div>
                    <img src={Cano} className="desafio" id="desafioCano" ref={paredeRef} alt="Obstáculo"/>
                    <img src={BandeiraImg} className="bandeira" ref={bandeiraRef} alt="Meta"/>
                    <div className="divPlayer">
                        <img src={PlayerGif} className="player" id="playerT" ref={playerRef} alt="Jogador"/>
                    </div>
                    <div className="vitoria-conteiner" ref={vitoriaBotaoRef} style={{ display: 'none' }}>
                        <h1 className="mensagemV">Você conseguiu!!</h1>
                        {/* FIX: This should navigate using React Router or state, not a direct href to a .html file */}
                        <button className="Pfase" onClick={() => alert("Navegando para a próxima fase!")}>
                            Próxima fase!!!
                        </button>
                    </div>
                    {/* Grouped game over buttons for easier management */}
                    <div className="game-over-buttons" ref={gameOverButtonsRef} style={{display: 'none'}}>
                        <button className="pause" id="pause" onClick={handleTryAgain}>Tentar Novamente</button>
                    </div>
                </div>
                <div id="meu-editor-codigo" ref={editorRef}></div>
            </main>

            <aside className="aba-lateral-direita">
                <h2>Progresso</h2>
                <h3>Tentativas Realizadas</h3>
                {/* FIX: Directly render state instead of using a ref and manual updates */}
                <p>Número de Tentativas: <span id="tentativas-jogador">{tentativas}</span></p>
                <h3>Como funciona?</h3>
                <p>O código que você digita no editor é executado quando o jogo reinicia. Use JavaScript para interagir com os elementos do jogo!</p>
                <button onClick={handleTryAgain}>Executar e Reiniciar</button>
            </aside>

            <footer>
                <p>
                    Desenvolvido por: <a href="https://github.com/Ferhsx" target="_blank" rel="noopener noreferrer">Ferculos</a>
                    &amp; <a href="https://github.com/Elitinho123456" target="_blank" rel="noopener noreferrer">Elitinho123456</a> -
                    <a href="https://github.com/Elitinho123456/TCC-Programacao-Para-Todos" target="_blank" rel="noopener noreferrer">GitHub</a>
                </p>
            </footer>
        </div>
    );
}