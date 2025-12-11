export class EndScreen extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEvents();
    }

    setupEvents() {
        const finishBtn = this.shadowRoot.getElementById('finishBtn');
        const newSessionBtn = this.shadowRoot.getElementById('newSessionBtn');

        finishBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('finish-session', {
                bubbles: true,
                composed: true
            }));
        });

        newSessionBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('new-session', {
                bubbles: true,
                composed: true
            }));
        });
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
                    align-items: center;
                    gap: 24px;
                }
                .right-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                h1 {
                    font-size: 3rem;
                    font-weight: 700;
                    margin: 0;
                    color: #333;
                    line-height: 1.2;
                }
                .message {
                    font-size: 1.25rem;
                    color: #555;
                    margin: 0;
                    line-height: 1.6;
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
                .button-group {
                    display: flex;
                    gap: 16px;
                    margin-top: 12px;
                }
                button {
                    padding: 16px 32px;
                    font-size: 1rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: transform 0.2s, background 0.2s;
                    font-family: inherit;
                }
                #finishBtn {
                    background: #6c757d;
                    color: white;
                }
                #finishBtn:hover {
                    background: #5a6268;
                    transform: translateY(-2px);
                }
                #newSessionBtn {
                    background: var(--current-primary, #007bff);
                    color: white;
                }
                #newSessionBtn:hover {
                    background: var(--primary-anxiety, #0056b3);
                    transform: translateY(-2px);
                }
                button:active {
                    transform: translateY(0);
                }
            </style>
            <div class="container">
                <div class="left-content">
                    <img src="assets/img/Leaving.png" alt="Fin de sesión" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-placeholder" style="display: none;">Imagen de cierre</div>
                    <div class="button-group">
                        <button id="finishBtn">Finalizar Sesión</button>
                        <button id="newSessionBtn">Iniciar Nueva Conversación</button>
                    </div>
                </div>
                
                <div class="right-content">
                    <h1>Sesión terminada</h1>
                    <p class="message">
                        A veces solo se necesita un respiro para recargar.
                        Si tuviste un mal día recuerda que es un mal día, ¡no una mala vida!
                    </p>
                    <p class="disclaimer">
                        ** Recuerda que este es un recurso de apoyo emocional, no reemplaza de ningún modo a un profesional, si realmente tienes problemas emocionales severos busca ayuda inmediatamente
                    </p>
                </div>
            </div>
        `;
    }
}

customElements.define('end-screen', EndScreen);
