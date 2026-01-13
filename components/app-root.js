import './welcome-screen.js';
import './chat-interface.js';
import './drawing-canvas.js';
import './color-palette.js';
import './end-screen.js';
import './audio-player.js';

class AppRoot extends HTMLElement {
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
    this.addEventListener('update-theme-colors', this.handleThemeColors.bind(this));
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

  handleThemeColors(e) {
    const { colors } = e.detail;
    if (colors && colors.length >= 4) {
      const container = this.shadowRoot.getElementById('app-container');
      // Apply colors to CSS variables
      container.style.setProperty('--primary-color', colors[0]);
      container.style.setProperty('--bg-color-1', colors[1]);
      container.style.setProperty('--bg-color-2', colors[2]);
      container.style.setProperty('--accent-color', colors[3]);
    }
  }

  handleShowCanvas(e) {
    const { colors, guide } = e.detail;
    const content = this.shadowRoot.querySelector('.main-content');
    const chatInterface = this.shadowRoot.querySelector('chat-interface');

    // 0. Auto-play Audio
    const audioPlayer = this.shadowRoot.querySelector('audio-player');
    if (audioPlayer && !audioPlayer.isPlaying) {
      audioPlayer.togglePlay();
    }

    // 1. Change Layout
    content.classList.add('with-canvas');

    // 2. Hide Chat completely
    chatInterface.style.display = 'none';

    // 3. Create Columns
    const leftCol = document.createElement('div');
    leftCol.className = 'left-col tools-sidebar';
    leftCol.innerHTML = `
        <h3>Herramientas</h3>
        <div class="tools-grid">
            <button id="brushBtn" class="tool-btn active" title="Pincel">🖌️</button>
            <button id="eraserBtn" class="tool-btn" title="Borrador">🧹</button>
            <button id="fillBtn" class="tool-btn" title="Relleno">🪣</button>
            <button id="clearBtn" class="tool-btn" title="Limpiar">🗑️</button>
        </div>
        <div class="slider-container">
            <label>Tamaño</label>
            <input type="range" id="sizeSlider" min="1" max="20" value="3">
        </div>
        <div id="palette-container"></div>
        <button id="finishBtn" class="finish-btn">Terminar Dibujo</button>
    `;

    const rightCol = document.createElement('div');
    rightCol.className = 'right-col canvas-area';

    // Create Canvas and add to right col
    const canvas = document.createElement('drawing-canvas');
    rightCol.appendChild(canvas);

    // Create Palette and add to left col container
    const palette = document.createElement('color-palette');
    if (colors && colors.length > 0) {
      palette.setAttribute('colors', JSON.stringify(colors));
    }
    leftCol.querySelector('#palette-container').appendChild(palette);

    // Append new cols to main content
    content.appendChild(leftCol);
    content.appendChild(rightCol);

    // Wire up events
    palette.addEventListener('color-selected', (evt) => {
      canvas.setColor(evt.detail.color);
      canvas.setTool('brush'); // Switch back to brush on color select
      this.updateActiveTool(leftCol, 'brushBtn');
    });

    // Tool Buttons Logic
    const tools = ['brush', 'eraser', 'fill'];
    tools.forEach(tool => {
      leftCol.querySelector(`#${tool}Btn`).addEventListener('click', () => {
        canvas.setTool(tool);
        this.updateActiveTool(leftCol, `${tool}Btn`);
      });
    });

    leftCol.querySelector('#clearBtn').addEventListener('click', () => canvas.clear());

    leftCol.querySelector('#sizeSlider').addEventListener('input', (e) => {
      canvas.setSize(parseInt(e.target.value));
    });

    // Handle Finish Drawing
    leftCol.querySelector('#finishBtn').addEventListener('click', () => {
      // Remove Sidebar and Canvas
      leftCol.remove();
      rightCol.remove();
      content.classList.remove('with-canvas');

      // Restore Chat
      chatInterface.style.display = 'flex';
      chatInterface.classList.remove('minimized'); // Ensure it's full size

      // Trigger Test Phase
      chatInterface.sendSystemMessage("[SISTEMA: El usuario ha presionado 'Terminar Dibujo'. Inicia la Fase 2: Test.]");
    });

    // Render guide if exists
    if (guide) {
      setTimeout(() => {
        canvas.renderGuide(guide);
      }, 100);
    }
  }

  updateActiveTool(container, activeId) {
    container.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    const btn = container.querySelector(`#${activeId}`);
    if (btn) btn.classList.add('active');
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
          --accent-color: var(--current-accent, #00d2ff);
          --bg-color-1: #f5f7fa;
          --bg-color-2: #c3cfe2;
          --glow-color: rgba(0, 123, 255, 0.5);
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
        
        /* NeuroArchitecture Background Blobs - Vivid & Animated */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.8;
          z-index: 0;
          transition: background 2s ease, transform 10s ease;
          animation: float 20s infinite alternate;
          mix-blend-mode: multiply;
        }
        
        .blob-1 {
          top: -10%;
          left: -10%;
          width: 60vw;
          height: 60vw;
          background: var(--bg-color-2);
          animation-delay: 0s;
        }
        
        .blob-2 {
          bottom: -10%;
          right: -10%;
          width: 70vw;
          height: 70vw;
          background: var(--primary-color);
          opacity: 0.4;
          animation-delay: -5s;
          animation-direction: alternate-reverse;
        }

        /* State specific animations */
        .state-anxiety .blob {
          animation-duration: 30s;
          filter: blur(40px); /* Sharper blobs for anxiety */
        }
        .state-motivation .blob {
          animation-duration: 8s;
          filter: blur(80px); /* Softer blobs for motivation */
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(30px, 50px) scale(1.1) rotate(10deg); }
          100% { transform: translate(-20px, 20px) scale(0.9) rotate(-5deg); }
        }

        .main-content {
          width: 100%;
          max-width: 900px;
          height: 85vh;
          display: flex; /* Default flex for single column */
          flex-direction: column;
          gap: 20px;
          padding: 20px;
          z-index: 1;
          transition: all 0.5s ease;
        }
        
        /* Canvas Layout (Split Screen) */
        .main-content.with-canvas {
           max-width: 1600px; /* Wider for canvas */
           flex-direction: row; /* Switch to row */
           height: 95vh;
        }
        
        .left-col {
          flex: 3; /* col-3 */
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(15px);
          padding: 20px;
          border-radius: 20px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.18);
          /* Glow Effect */
          box-shadow: 0 0 15px var(--glow-color);
          transition: box-shadow 0.5s ease;
        }
        
        .right-col {
          flex: 9; /* col-9 */
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          overflow: hidden;
          /* Glow Effect */
          box-shadow: 0 0 20px var(--glow-color);
          transition: box-shadow 0.5s ease;
        }
        
        chat-interface {
           flex: 1;
           border-radius: 20px;
           /* Glow Effect for Chat */
           box-shadow: 0 0 15px var(--glow-color);
        }
        
        /* Ensure canvas fills right col */
        drawing-canvas {
          flex: 1;
        }

        /* Tool Sidebar Styles */
        .tools-sidebar h3 { margin-top: 0; color: #333; }
        .tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .tool-btn {
            padding: 12px; border: none; border-radius: 12px; background: #f0f0f0; cursor: pointer; font-size: 1.8rem;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .tool-btn:hover { transform: translateY(-2px); }
        .tool-btn.active { 
            background: var(--primary-color); 
            color: white; 
            box-shadow: 0 4px 10px var(--glow-color);
        }
        .slider-container { margin-bottom: 20px; }
        .slider-container input { width: 100%; accent-color: var(--primary-color); }
        .finish-btn {
            margin-top: auto; padding: 16px; background: #28a745; color: white; border: none; border-radius: 16px;
            font-weight: 800; cursor: pointer; font-size: 1.1rem; letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
            transition: all 0.3s;
        }
        .finish-btn:hover { 
            background: #218838; 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6);
        }
      </style>
      <div id="app-container">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="main-content">
          <welcome-screen></welcome-screen>
        </div>
        <audio-player></audio-player>
      </div>
    `;
  }
}

customElements.define('app-root', AppRoot);
