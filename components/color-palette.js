export class ColorPalette extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.colors = ['#92467fff', '#c54949ff', '#00FF00', '#0000FF']; // Default
    }

    static get observedAttributes() {
        return ['colors'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'colors' && newValue) {
            try {
                this.colors = JSON.parse(newValue);
                this.render();
            } catch (e) {
                console.error('Invalid colors attribute', e);
            }
        }
    }

    setColors(colors) {
        this.colors = colors;
        this.render();
    }

    connectedCallback() {
        this.render();
        this.setupEvents();
    }

    setupEvents() {
        this.shadowRoot.addEventListener('click', (e) => {
            if (e.target.classList.contains('swatch')) {
                const color = e.target.dataset.color;
                this.emitColor(color);
            }
        });

        const picker = this.shadowRoot.getElementById('picker');
        if (picker) {
            picker.addEventListener('input', (e) => {
                this.emitColor(e.target.value);
            });
        }
    }

    emitColor(color) {
        this.dispatchEvent(new CustomEvent('color-selected', {
            detail: { color },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: #666; }
        .palette {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .swatch {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.1s;
        }
        .swatch:active { transform: scale(0.9); }
        input[type="color"] {
          width: 100%;
          height: 40px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
      </style>
      <h4>Colores Recomendados</h4>
      <div class="palette">
        ${this.colors.map(c => `<div class="swatch" style="background-color: ${c}" data-color="${c}"></div>`).join('')}
      </div>
      <h4>Personalizado</h4>
      <input type="color" id="picker" value="#000000">
    `;
        this.setupEvents(); // Re-attach events after render
    }
}

customElements.define('color-palette', ColorPalette);
