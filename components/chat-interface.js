export class ChatInterface extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.history = [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = this.shadowRoot.getElementById('inputForm');
        const input = this.shadowRoot.getElementById('textIn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            this.addMessage('user', text);
            input.value = '';

            this.setLoading(true);
            try {
                const responseText = await this.sendMessageToBackend(text);
                this.handleResponse(responseText);
            } catch (error) {
                this.addMessage('assistant', 'Error de conexión.');
            } finally {
                this.setLoading(false);
            }
        });
    }

    async sendMessageToBackend(message) {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                history: this.history,
                message: message
            })
        });
        const data = await response.json();
        return data.response;
    }

    handleResponse(responseText) {
        let cleanResponse = responseText;

        // Check for state tags
        if (responseText.includes('[ESTADO: ALTA_ANSIEDAD]')) {
            this.dispatchEvent(new CustomEvent('state-change', {
                detail: { state: 'anxiety' }, bubbles: true, composed: true
            }));
            cleanResponse = cleanResponse.replace('[ESTADO: ALTA_ANSIEDAD]', '');
        } else if (responseText.includes('[ESTADO: BAJA_MOTIVACION]')) {
            this.dispatchEvent(new CustomEvent('state-change', {
                detail: { state: 'motivation' }, bubbles: true, composed: true
            }));
            cleanResponse = cleanResponse.replace('[ESTADO: BAJA_MOTIVACION]', '');
        }

        // Check for canvas action
        if (responseText.includes('[ACCION: MOSTRAR_CANVAS]')) {
            let colors = [];
            let guide = null;

            // Extract colors
            const colorMatch = responseText.match(/\[COLORES: (.*?)\]/);
            if (colorMatch) {
                try {
                    colors = JSON.parse(colorMatch[1]);
                } catch (e) { console.error('Error parsing colors', e); }
                cleanResponse = cleanResponse.replace(colorMatch[0], '');
            }

            // Extract guide
            const guideMatch = responseText.match(/\[GUIA: (.*?)\]/);
            if (guideMatch) {
                try {
                    guide = JSON.parse(guideMatch[1]);
                } catch (e) { console.error('Error parsing guide', e); }
                cleanResponse = cleanResponse.replace(guideMatch[0], '');
            }

            this.dispatchEvent(new CustomEvent('show-canvas', {
                detail: { colors, guide },
                bubbles: true, composed: true
            }));
            cleanResponse = cleanResponse.replace('[ACCION: MOSTRAR_CANVAS]', '');
        }

        this.addMessage('assistant', cleanResponse.trim());

        // Update history
        this.history.push({ role: 'user', parts: [{ text: this.lastUserMessage }] });
        this.history.push({ role: 'model', parts: [{ text: responseText }] });
    }

    addMessage(role, text) {
        if (role === 'user') this.lastUserMessage = text;

        const chatContainer = this.shadowRoot.getElementById('chat');
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${role}`;
        msgDiv.innerText = text;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    setLoading(isLoading) {
        const chatContainer = this.shadowRoot.getElementById('chat');
        if (isLoading) {
            const loader = document.createElement('div');
            loader.id = 'loader';
            loader.className = 'msg assistant';
            loader.innerText = '...';
            chatContainer.appendChild(loader);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        } else {
            const loader = this.shadowRoot.getElementById('loader');
            if (loader) loader.remove();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transition: all 0.5s ease;
        }
        :host(.minimized) {
          height: 300px; /* Fixed height when minimized */
        }
        :host(.minimized) form {
          display: none; /* Hide input when minimized */
        }
        #chat {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .msg {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 12px;
          line-height: 1.5;
          animation: fadeIn 0.3s ease;
        }
        .msg.user {
          align-self: flex-end;
          background: var(--primary-color, #007bff);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .msg.assistant {
          align-self: flex-start;
          background: var(--bg-secondary, #f1f3f5);
          color: #333;
          border-bottom-left-radius: 4px;
        }
        form {
          padding: 16px;
          display: flex;
          gap: 10px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        input {
          flex: 1;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 24px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        input:focus {
          border-color: var(--primary-color, #007bff);
        }
        button {
          padding: 0 20px;
          background: var(--primary-color, #007bff);
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.1s;
        }
        button:active {
          transform: scale(0.95);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
      <div id="chat">
        <div class="msg assistant">Hola. Soy tu asistente de apoyo emocional. ¿Cómo te sientes hoy?</div>
      </div>
      <form id="inputForm">
        <input id="textIn" placeholder="Escribe aquí..." autocomplete="off" />
        <button type="submit">Enviar</button>
      </form>
    `;
    }
}

customElements.define('chat-interface', ChatInterface);
