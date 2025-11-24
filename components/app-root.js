import './chat-interface.js';
// We can import drawing-canvas here later when we refactor it

export class AppRoot extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.addEventListener('state-change', this.handleStateChange.bind(this));
    }

    handleStateChange(e) {
        const { state } = e.detail;
        const container = this.shadowRoot.getElementById('app-container');

        // Reset classes
        container.classList.remove('state-anxiety', 'state-motivation');

        if (state === 'anxiety') {
            container.classList.add('state-anxiety');
            // Set CSS variables for anxiety (calm blues/greens)
            container.style.setProperty('--primary-color', '#4a90e2');
            container.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #e0f7fa 0%, #e8eaf6 100%)');
        } else if (state === 'motivation') {
            container.classList.add('state-motivation');
            // Set CSS variables for motivation (warm oranges/yellows)
            container.style.setProperty('--primary-color', '#ff9800');
            container.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)');
        }
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
        }
        #app-container {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--bg-gradient, linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%));
          transition: background 1s ease;
          --primary-color: #007bff;
        }
        .main-content {
          width: 100%;
          max-width: 800px;
          height: 80vh;
          display: grid;
          grid-template-columns: 1fr; /* Initially just chat centered */
          gap: 20px;
          padding: 20px;
        }
        
        /* When we add canvas later, we can change this grid */
        @media (min-width: 1000px) {
           /* Future layout for chat + canvas */
        }
      </style>
      <div id="app-container">
        <div class="main-content">
          <chat-interface></chat-interface>
        </div>
      </div>
    `;
    }
}

customElements.define('app-root', AppRoot);
