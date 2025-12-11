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
                    display: flex;
                    width: 100%;
                    height: 100%;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    box-sizing: border-box;
                }
                .container {
                    display: flex;
                    width: 100%;
                    max-width: 1200px;
                    gap: 60px;
                    align-items: center;
                }
                .left-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .right-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                }
                h1 {
                    font-size: 3rem;
                    font-weight: 700;
                    margin: 0;
                    color: #333;
                    line-height: 1.2;
                }
                .subtitle {
                    font-size: 1.25rem;
                    color: #555;
                    margin: 0;
                }
                .input-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                label {
                    font-size: 1rem;
                    color: #666;
                    line-height: 1.5;
                }
                input {
                    padding: 14px 18px;
                    font-size: 1rem;
                    border: 2px solid #ddd;
                    border-radius: 12px;
                    outline: none;
                    transition: border-color 0.2s;
                    font-family: inherit;
                }
                input:focus {
                    border-color: var(--current-primary, #007bff);
                }
                .disclaimer {
                    font-size: 0.85rem;
                    color: #888;
                    line-height: 1.4;
                    font-style: italic;
                }
                .image-placeholder {
                    width: 100%;
                    max-width: 400px;
                    aspect-ratio: 1;
                    background: #f0f0f0;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    font-size: 0.9rem;
                }
                img {
                    width: 100%;
                    max-width: 400px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                button {
                    padding: 16px 48px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    background: var(--current-primary, #007bff);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: transform 0.2s, background 0.2s;
                    font-family: inherit;
                }
                button:hover {
                    transform: translateY(-2px);
                    background: var(--primary-anxiety, #0056b3);
                }
                button:active {
                    transform: translateY(0);
                }
            </style>
            <div class="container">
                <div class="left-content">
                    <h1>¿Pasando por un mal momento?</h1>
                    <p class="subtitle">Tranquilo, a todos nos pasa, pero estás en un lugar seguro :)</p>
                    
                    <div class="input-section">
                        <label>
                            ¿Cómo te gustaría que te registremos? Tranquilo, puedes usar un apodo con el que te sientas seguro, y si no, se te pondrá un apodo aleatorio :D
                        </label>
                        <input type="text" id="aliasInput" placeholder="Tu apodo (opcional)" maxlength="30">
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
