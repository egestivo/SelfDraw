export class WelcomeScreen extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEvents();
    }

    setupEvents() {
        const startBtn = this.shadowRoot.getElementById('startBtn');
        const aliasInput = this.shadowRoot.getElementById('aliasInput');

        startBtn.addEventListener('click', () => {
            const alias = aliasInput.value.trim() || this.generateRandomAlias();
            this.dispatchEvent(new CustomEvent('start-session', {
                detail: { alias },
                bubbles: true,
                composed: true
            }));
        });

        // Allow Enter key to start
        aliasInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                startBtn.click();
            }
        });
    }

    generateRandomAlias() {
        const adjectives = ['Valiente', 'Fuerte', 'Brillante', 'Sereno', 'Creativo', 'Audaz'];
        const nouns = ['Estrella', 'Árbol', 'Río', 'Montaña', 'Viento', 'Luna'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adj}${noun}${Math.floor(Math.random() * 100)}`;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-family: 'Outfit', sans-serif;
                    text-align: center;
                }
                .container {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    gap: 40px;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .left-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    justify-content: center;
                    max-width: 600px;
                }
                .right-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    max-width: 500px;
                }
                h1 {
                    font-size: clamp(1.5rem, 5vw, 3rem);
                    font-weight: 700;
                    margin: 0;
                    color: #1a1a1a;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                }
                .subtitle {
                    font-size: clamp(1.1rem, 2vw, 1.4rem);
                    color: #444;
                    margin: 0;
                    font-weight: 400;
                    line-height: 1.5;
                }
                .input-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: rgba(255,255,255,0.6);
                    padding: 20px;
                    border-radius: 20px;
                    border: 1px solid rgba(0,0,0,0.05);
                    backdrop-filter: blur(5px);
                }
                label {
                    font-size: 1rem;
                    color: #333;
                    line-height: 1.4;
                    font-weight: 500;
                }
                input {
                    padding: 14px 18px;
                    font-size: 1.1rem;
                    border: 2px solid #ccc;
                    border-radius: 16px;
                    outline: none;
                    transition: all 0.2s;
                    font-family: inherit;
                    background: rgba(255,255,255,0.9);
                    color: #1a1a1a;
                }
                input:focus {
                    border-color: var(--current-primary, #007bff);
                    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
                }
                .disclaimer {
                    font-size: 0.85rem;
                    color: #666;
                    line-height: 1.3;
                    font-style: italic;
                    background: rgba(0,0,0,0.03);
                    padding: 10px;
                    border-radius: 12px;
                }
                .image-placeholder {
                    width: 100%;
                    max-width: 400px;
                    aspect-ratio: 1;
                    background: #f0f0f0;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    font-size: 0.9rem;
                }
                img {
                    width: 100%;
                    max-width: 100%;
                    height: auto;
                    max-height: 50vh;
                    object-fit: contain;
                    border-radius: 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    transition: transform 0.3s ease;
                }
                img:hover {
                    transform: scale(1.02);
                }
                button {
                    padding: 16px 48px;
                    font-size: 1.2rem;
                    font-weight: 700;
                    background: var(--current-primary, #007bff);
                    color: white;
                    border: none;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                    box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
                    width: 100%;
                }
                button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 25px rgba(0, 123, 255, 0.4);
                    background: var(--primary-anxiety, #0056b3);
                }
                button:active {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
                }
                
                @media (max-width: 900px) {
                    .container {
                        flex-direction: column-reverse;
                        gap: 20px;
                        overflow-y: auto; /* Only scroll on mobile if needed */
                        display: block; /* Allow block flow for scrolling */
                    }
                    .left-content, .right-content {
                        max-width: 100%;
                        width: 100%;
                    }
                    h1 { text-align: center; margin-top: 20px; }
                    .subtitle { text-align: center; }
                    img { max-height: 30vh; margin: 0 auto; display: block; }
                }
            </style>
            <div class="container">
                <div class="left-content">
                    <h1>¿Pasando por un mal momento?</h1>
                    <p class="subtitle">Tranquilo, a todos nos pasa, pero estás en un lugar seguro</p>
                    
                    <div class="input-section">
                        <label>
                            ¿Cómo te gustaría que te registremos?<br/>
                        </label>
                        <input type="text" id="aliasInput" placeholder="Tu apodo (opcional)" maxlength="30">
                        <label>
                            Tranquilo, puedes usar un apodo con el que te sientas seguro, y si no, se te pondrá un apodo aleatorio :)
                        </label>
                    </div>
                    
                    <p class="disclaimer">
                        ** Recuerda que este es un recurso de apoyo emocional, no reemplaza de ningún modo a un profesional, si realmente tienes problemas emocionales severos busca ayuda inmediatamente
                    </p>
                </div>
                
                <div class="right-content">
                    <img src="assets/img/Principal.png" alt="Bienvenida" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-placeholder" style="display: none;">Imagen de bienvenida</div>
                    <button id="startBtn">Iniciar</button>
                </div>
            </div>
        `;
    }
}

customElements.define('welcome-screen', WelcomeScreen);
