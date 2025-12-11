import './chat-interface.js';
import './drawing-canvas.js';
import './color-palette.js';
import './ambient-background.js';
import './welcome-screen.js';
import './end-screen.js';
import './audio-player.js';

export class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentScreen = 'welcome';
    this.userAlias = '';
  }

  connectedCallback() {
    this.render();
    this.addEventListener('state-change', this.handleStateChange.bind(this));
    this.addEventListener('show-canvas', this.handleShowCanvas.bind(this));
    this.addEventListener('start-session', this.handleStartSession.bind(this));
    this.addEventListener('finish-session', this.handleFinishSession.bind(this));
    this.addEventListener('new-session', this.handleNewSession.bind(this));
  }

  handleStartSession(e) {
    this.userAlias = e.detail.alias;
    this.currentScreen = 'chat';
    this.updateScreen();
  }

  handleFinishSession() {
    // Close the window or redirect
    window.close();
  }

  handleNewSession() {
    this.currentScreen = 'welcome';
    this.userAlias = '';
    this.updateScreen();
  }

  updateScreen() {
    const mainContent = this.shadowRoot.querySelector('.main-content');
    mainContent.innerHTML = '';

    if (this.currentScreen === 'welcome') {
      const welcomeScreen = document.createElement('welcome-screen');
      mainContent.appendChild(welcomeScreen);
    } else if (this.currentScreen === 'chat') {
      const chatInterface = document.createElement('chat-interface');
      chatInterface.userAlias = this.userAlias; // Pass the alias
      mainContent.appendChild(chatInterface);

      // Listen for session end from chat
      chatInterface.addEventListener('session-complete', () => {
        this.currentScreen = 'end';
        this.updateScreen();
      });
    } else if (this.currentScreen === 'end') {
      const endScreen = document.createElement('end-screen');
      mainContent.appendChild(endScreen);
    }
  }

  handleStateChange(e) {
    const { state } = e.detail;
    const container = this.shadowRoot.getElementById('app-container');

    // Remove existing state classes
    container.classList.remove('theme-anxiety', 'theme-motivation', 'theme-neutral');

    if (state === 'anxiety') {
      container.classList.add('theme-anxiety');
    } else if (state === 'motivation') {
      container.classList.add('theme-motivation');
    } else {
      container.classList.add('theme-neutral');
    }
  }

  handleShowCanvas(e) {
    const { colors, guide } = e.detail;
    const content = this.shadowRoot.querySelector('.main-content');
    const chatInterface = this.shadowRoot.querySelector('chat-interface');

    // 1. Change Layout
    content.classList.add('with-canvas');

    // 2. Minimize Chat
    chatInterface.classList.add('minimized');

    // 3. Create Left Column Container (for Chat + Palette)
    // We need to restructure the DOM slightly. 
    // Current: .main-content > chat-interface
    // Target: .main-content > .left-col (chat + palette) + .right-col (canvas)

    // Create containers
    const leftCol = document.createElement('div');
    leftCol.className = 'left-col';

    const rightCol = document.createElement('div');
    rightCol.className = 'right-col';

    // Move chat to left col
    chatInterface.remove();
    leftCol.appendChild(chatInterface);

    // Create Palette and add to left col
    const palette = document.createElement('color-palette');
    if (colors && colors.length > 0) {
      palette.setAttribute('colors', JSON.stringify(colors));
    }
    leftCol.appendChild(palette);

    // Create Canvas and add to right col
    const canvas = document.createElement('drawing-canvas');
    rightCol.appendChild(canvas);

    // Append new cols to main content
    content.appendChild(leftCol);
    content.appendChild(rightCol);

    // Wire up events
    palette.addEventListener('color-selected', (evt) => {
      canvas.setColor(evt.detail.color);
    });

    // Handle Finish Drawing
    canvas.addEventListener('finish-drawing', () => {
      const chat = this.shadowRoot.querySelector('chat-interface');
      if (chat) {
        chat.sendSystemMessage("[SISTEMA: El usuario ha presionado 'Terminar Dibujo'. Inicia la Fase 4: Checkout.]");
        // Restore chat size
        chat.classList.remove('minimized');
      }

      // Remove Palette
      const palette = this.shadowRoot.querySelector('color-palette');
      if (palette) palette.remove();

      // Set Canvas to ReadOnly
      canvas.setReadOnly(true);

      // Adjust Layout to 50/50
      const leftCol = this.shadowRoot.querySelector('.left-col');
      const rightCol = this.shadowRoot.querySelector('.right-col');
      if (leftCol && rightCol) {
        leftCol.style.flex = '1';
        rightCol.style.flex = '1';
      }
    });

    // Render guide if exists
    // We need to wait for canvas to be connected and resized
    if (guide) {
      setTimeout(() => {
        canvas.renderGuide(guide);
      }, 100);
    }
  }

  updateColors(primary, bg1, bg2) {
    const container = this.shadowRoot.getElementById('app-container');
    container.style.setProperty('--primary-color', primary);
    container.style.setProperty('--bg-color-1', bg1);
    container.style.setProperty('--bg-color-2', bg2);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100vh;
          width: 100vw;
          margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
          --primary-color: var(--current-primary, #007bff);
          --bg-color-1: #f5f7fa;
          --bg-color-2: #c3cfe2;
        }
        @import url('assets/css/themes.css');

        #app-container {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--bg-gradient-neutral); /* Default */
          transition: background 2s ease;
          position: relative;
          overflow: hidden;
        }
        
        /* NeuroArchitecture Background Blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          z-index: 0;
          transition: background 2s ease, transform 10s ease;
          animation: float 20s infinite alternate;
        }
        
        .blob-1 {
          top: -10%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: var(--bg-color-2);
          animation-delay: 0s;
        }
        
        .blob-2 {
          bottom: -10%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          background: var(--primary-color);
          opacity: 0.2;
          animation-delay: -5s;
          animation-direction: alternate-reverse;
        }

        /* State specific animations */
        .state-anxiety .blob {
          animation-duration: 30s;
        }
        .state-motivation .blob {
          animation-duration: 10s;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 50px) scale(1.1); }
        }

        .main-content {
          width: 100%;
          max-width: 800px;
          height: 80vh;
          display: flex; /* Default flex for single column */
          flex-direction: column;
          gap: 20px;
          padding: 20px;
          z-index: 1;
          transition: all 0.5s ease;
        }
        
        /* Canvas Layout (Split Screen) */
        .main-content.with-canvas {
           max-width: 1200px;
           flex-direction: row; /* Switch to row */
        }
        
        .left-col {
          flex: 4; /* col-4 */
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .right-col {
          flex: 8; /* col-8 */
          display: flex;
          flex-direction: column;
        }
        
        chat-interface {
           flex: 1;
        }
        
        /* Ensure canvas fills right col */
        drawing-canvas {
          flex: 1;
        }
      </style>
      <div id="app-container">
        <ambient-background></ambient-background>
        <audio-player></audio-player>
        
        <div class="main-content">
        </div>
      </div>
    `;
    this.updateScreen();
  }
}

customElements.define('app-root', AppRoot);
