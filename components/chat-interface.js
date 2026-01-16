import { TESTS } from './tests/test-library.js';
import './test-form.js';

export class ChatInterface extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.history = [];
    this.userAlias = '';
    this.lastUserMessage = '';
    this.accumulatedEmotions = {};
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  setupEvents() {
    const form = this.shadowRoot.getElementById('inputForm');
    const input = this.shadowRoot.getElementById('textIn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      // Add user message
      this.addMessage('user', text);
      input.value = '';
      this.setLoading(true);

      try {
        // Call Netlify Function
        const response = await fetch('/.netlify/functions/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: this.history,
            message: text,
            alias: this.userAlias
          })
        });

        const data = await response.json();
        this.setLoading(false);

        if (data.error) {
          this.addMessage('assistant', 'Error: ' + data.error);
        } else {
          this.handleResponse(data.response);
        }

      } catch (err) {
        this.setLoading(false);
        this.addMessage('assistant', 'Error de conexión.');
        console.error(err);
      }
    });

    // Listen for test submission from test-form
    this.addEventListener('test-submit', (e) => {
      const { testId, answers } = e.detail;

      // Calculate Score
      let score = 0;
      Object.values(answers).forEach(val => {
        score += parseInt(val) || 0;
      });

      // Interpret Score
      let interpretation = 'N/A';
      if (testId === 'gad-7') {
        if (score <= 4) interpretation = 'Ansiedad Mínima';
        else if (score <= 9) interpretation = 'Ansiedad Leve';
        else if (score <= 14) interpretation = 'Ansiedad Moderada';
        else interpretation = 'Ansiedad Severa';
      } else if (testId === 'phq-9') {
        if (score <= 4) interpretation = 'Depresión Mínima';
        else if (score <= 9) interpretation = 'Depresión Leve';
        else if (score <= 14) interpretation = 'Depresión Moderada';
        else if (score <= 19) interpretation = 'Depresión Moderadamente Severa';
        else interpretation = 'Depresión Severa';
      }

      // Remove test form
      const testForm = this.shadowRoot.querySelector('test-form');
      if (testForm) {
        testForm.remove();
      }
      this.toggleInput(true);

      // Save to database
      fetch('/.netlify/functions/save_test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, answers })
      }).catch(err => console.error('Error saving test:', err));

      // Send system message to AI with results
      const systemMsg = `[SISTEMA: El usuario ha completado el test ${testId}. Puntaje: ${score}. Interpretación: ${interpretation}. Respuestas: ${JSON.stringify(answers)}]`;

      // We don't show this to user, just send to AI
      this.sendSystemMessage(systemMsg);
    });
  }

  async sendSystemMessage(msg) {
    this.setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: this.history,
          message: msg,
          alias: this.userAlias
        })
      });
      const data = await response.json();
      this.setLoading(false);
      if (!data.error) {
        this.handleResponse(data.response);
      }
    } catch (err) {
      console.error(err);
      this.setLoading(false);
    }
  }

  handleResponse(responseText) {
    let cleanResponse = responseText;
    let testToRender = null;

    // Remove [TAG: ...] artifacts
    cleanResponse = cleanResponse.replace(/\[TAG:.*?\]/g, '');
    // Remove [ESTADO: ...] artifacts
    cleanResponse = cleanResponse.replace(/\[ESTADO:.*?\]/g, '');
    // Remove [CORRECCIÓN: ...] artifacts
    cleanResponse = cleanResponse.replace(/\[CORRECCIÓN:.*?\]/g, '');
    // Remove XML tags like <response>
    cleanResponse = cleanResponse.replace(/<[^>]+>/g, '');

    // Check for emotion analysis
    if (cleanResponse.includes('[ANALISIS:')) {
      const analysisMatch = cleanResponse.match(/\[ANALISIS: (\{.*?\})\]/);
      if (analysisMatch) {
        try {
          const emotions = JSON.parse(analysisMatch[1]);
          this.accumulateEmotions(emotions);
          // Remove tag from display
          cleanResponse = cleanResponse.replace(analysisMatch[0], '');
        } catch (e) {
          console.error('Error parsing emotion analysis:', e);
        }
      }
    }

    // Check for audio trigger
    if (cleanResponse.includes('[AUDIO:')) {
      const audioMatch = cleanResponse.match(/\[AUDIO: (\w+)\]/);
      if (audioMatch && audioMatch[1]) {
        const audioTrack = audioMatch[1];
        this.dispatchEvent(new CustomEvent('play-audio', {
          detail: { track: audioTrack },
          bubbles: true,
          composed: true
        }));
        // Remove tag from display
        cleanResponse = cleanResponse.replace(audioMatch[0], '');
      }
    }

    // Check for canvas action
    if (cleanResponse.includes('[ACCION: MOSTRAR_CANVAS]')) {
      let colors = [];
      let guide = null;

      // Extract colors
      const colorMatch = cleanResponse.match(/\[COLORES: (\[.*?\])\]/);
      if (colorMatch) {
        try {
          colors = JSON.parse(colorMatch[1]);
          // Dispatch event for UI theming
          this.dispatchEvent(new CustomEvent('update-theme-colors', {
            detail: { colors },
            bubbles: true,
            composed: true
          }));
        } catch (e) { console.error('Error parsing colors', e); }
        cleanResponse = cleanResponse.replace(colorMatch[0], '');
      }

      // Extract guide
      const guideMatch = cleanResponse.match(/\[GUIA: (.*?)\]/);
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

    // Check for session end
    if (cleanResponse.includes('[ACCION: FINALIZAR_SESION]')) {
      cleanResponse = cleanResponse.replace('[ACCION: FINALIZAR_SESION]', '');
      // Save final emotions before ending
      this.saveEmotionsToBackend();

      // Dispatch event to end session with 10s delay
      setTimeout(() => {
        this.dispatchEvent(new CustomEvent('session-complete', {
          bubbles: true,
          composed: true
        }));
      }, 10000); // 10 seconds delay
    }

    // Check for session restart
    if (cleanResponse.includes('[ACCION: REINICIAR_SESION]')) {
      cleanResponse = cleanResponse.replace('[ACCION: REINICIAR_SESION]', '');
      // Save emotions before restarting
      this.saveEmotionsToBackend();
      this.dispatchEvent(new CustomEvent('new-session', {
        bubbles: true,
        composed: true
      }));
    }

    // Check for test action
    if (cleanResponse.includes('[ACCION: MOSTRAR_TEST]')) {
      const testMatch = cleanResponse.match(/\[TEST: ([\s\S]*?)\]/);
      if (testMatch) {
        const testContent = testMatch[1].trim();
        if (TESTS[testContent.toLowerCase()]) {
          testToRender = TESTS[testContent.toLowerCase()];
        }
        cleanResponse = cleanResponse.replace(testMatch[0], '');
      }
      cleanResponse = cleanResponse.replace('[ACCION: MOSTRAR_TEST]', '');
    }

    // Add the cleaned text message FIRST
    if (cleanResponse.trim()) {
      this.addMessage('assistant', cleanResponse.trim());
    }

    // THEN render the test if needed
    if (testToRender) {
      this.showTestForm(testToRender);
    }

    // Update history
    this.history.push({ role: 'user', parts: [{ text: this.lastUserMessage }] });
    this.history.push({ role: 'model', parts: [{ text: responseText }] });
  }

  accumulateEmotions(newEmotions) {
    // Initialize if empty
    if (Object.keys(this.accumulatedEmotions).length === 0) {
      this.accumulatedEmotions = newEmotions;
    } else {
      // Average out the emotions
      for (const [emotion, value] of Object.entries(newEmotions)) {
        if (this.accumulatedEmotions[emotion]) {
          this.accumulatedEmotions[emotion] = Math.round((this.accumulatedEmotions[emotion] + value) / 2);
        } else {
          this.accumulatedEmotions[emotion] = value;
        }
      }
    }
  }

  async saveEmotionsToBackend() {
    if (!this.userAlias) return;

    // Filter to keep only 4 emotions: Ansiedad, Motivacion, and the top 2 others
    const allEmotions = { ...this.accumulatedEmotions };
    const finalEmotions = {};

    // 1. Mandatory
    finalEmotions['Ansiedad'] = allEmotions['Ansiedad'] || 0;
    finalEmotions['Motivacion'] = allEmotions['Motivacion'] || 0;

    // 2. Get others and sort by value to find the top 2
    const others = Object.entries(allEmotions)
      .filter(([key]) => key !== 'Ansiedad' && key !== 'Motivacion')
      .sort((a, b) => b[1] - a[1]); // Sort descending

    // 3. Take top 2 dynamic emotions
    if (others[0]) finalEmotions[others[0][0]] = others[0][1];
    if (others[1]) finalEmotions[others[1][0]] = others[1][1];

    try {
      await fetch('/.netlify/functions/save_emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: this.userAlias,
          emotions: finalEmotions
        })
      });
    } catch (error) {
      console.error('Error saving emotions:', error);
    }
  }

  addMessage(role, text) {
    if (role === 'user') this.lastUserMessage = text;

    const chatContainer = this.shadowRoot.getElementById('chat');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.innerText = text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  showTestForm(testData) {
    const chatContainer = this.shadowRoot.getElementById('chat');
    const testForm = document.createElement('test-form');
    testForm.data = testData;
    chatContainer.appendChild(testForm);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Disable main input
    this.toggleInput(false);
  }

  toggleInput(enabled) {
    const input = this.shadowRoot.getElementById('textIn');
    const btn = this.shadowRoot.querySelector('form button');
    input.disabled = !enabled;
    btn.disabled = !enabled;
    if (!enabled) {
      input.placeholder = "Completa el formulario para continuar...";
    } else {
      input.placeholder = "Escribe aquí...";
      input.focus();
    }
  }

  setLoading(isLoading) {
    const chatContainer = this.shadowRoot.getElementById('chat');
    if (isLoading) {
      const loader = document.createElement('div');
      loader.id = 'loader';
      loader.className = 'message assistant typing-indicator';
      loader.innerText = 'Escribiendo...';
      loader.style.display = 'block';
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
                    background: rgba(255, 255, 255, 0.95); /* Higher opacity */
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    font-family: 'Outfit', sans-serif;
                }

                .chat-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                }

                #chat {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    scroll-behavior: smooth;
                }

                .message {
                    max-width: 85%;
                    padding: 16px 20px;
                    border-radius: 20px;
                    line-height: 1.6;
                    font-size: 1.05rem;
                    position: relative;
                    animation: fadeIn 0.3s ease;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .message.user {
                    align-self: flex-end;
                    background: var(--primary-color, #007bff);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message.assistant {
                    align-self: flex-start;
                    background: #f0f2f5;
                    color: #1a1a1a; /* High contrast */
                    border-bottom-left-radius: 4px;
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .input-area {
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.9);
                    border-top: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                input {
                    flex: 1;
                    padding: 16px 20px;
                    border: 2px solid #e0e0e0;
                    border-radius: 16px;
                    outline: none;
                    font-size: 1rem;
                    transition: all 0.2s;
                    font-family: inherit;
                    background: white;
                    color: #1a1a1a;
                }

                input:focus {
                    border-color: var(--primary-color, #007bff);
                    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
                }

                button {
                    padding: 16px 24px;
                    background: var(--primary-color, #007bff);
                    color: white;
                    border: none;
                    border-radius: 16px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: inherit;
                }

                button:hover {
                    background: var(--primary-dark, #0056b3);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                }

                button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .typing-indicator {
                    padding: 12px 20px;
                    background: #f0f2f5;
                    border-radius: 20px;
                    align-self: flex-start;
                    font-size: 0.9rem;
                    color: #666;
                    display: none;
                    font-style: italic;
                    animation: pulse 1.5s infinite;
                }
                
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
            </style>
            <div id="chat">
                <div class="message assistant">Hola. Soy tu asistente de apoyo emocional. ¿Cómo te sientes hoy?</div>
            </div>
            <form id="inputForm" class="input-area">
                <input id="textIn" placeholder="Escribe aquí..." autocomplete="off" />
                <button type="submit">Enviar</button>
            </form>
    `;
  }
}

customElements.define('chat-interface', ChatInterface);
