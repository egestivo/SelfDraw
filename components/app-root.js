import './chat-interface.js';
import './drawing-canvas.js';
import './color-palette.js';

export class AppRoot extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.addEventListener('state-change', this.handleStateChange.bind(this));
        this.addEventListener('show-canvas', this.handleShowCanvas.bind(this));
    }

    handleStateChange(e) {
        const { state } = e.detail;
        const container = this.shadowRoot.getElementById('app-container');

        // Remove existing state classes
        container.classList.remove('state-anxiety', 'state-motivation');

        if (state === 'anxiety') {
            container.classList.add('state-anxiety');
            this.updateColors('#4a90e2', '#e0f7fa', '#e8eaf6');
        } else if (state === 'motivation') {
            container.classList.add('state-motivation');
            this.updateColors('#ff9800', '#fff3e0', '#ffe0b2');
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
          --primary-color: #007bff;
          --bg-color-1: #f5f7fa;
          --bg-color-2: #c3cfe2;
        }
        #app-container {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, var(--bg-color-1) 0%, var(--bg-color-2) 100%);
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
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        
        <div class="main-content">
          <chat-interface></chat-interface>
        </div>
      </div>
    `;
    }
}

customElements.define('app-root', AppRoot);
