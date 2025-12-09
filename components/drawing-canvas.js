export class DrawingCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isDrawing = false;
        this.color = '#000000';
        this.lineWidth = 3;
    }

    connectedCallback() {
        this.render();
        this.canvas = this.shadowRoot.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        // Restore context settings after resize
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
    }

    setupEvents() {
        // Mouse
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // Finish Button
        this.shadowRoot.getElementById('finishBtn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('finish-drawing', {
                bubbles: true,
                composed: true
            }));
        });
    }

    setReadOnly(readOnly) {
        this.isReadOnly = readOnly;
        if (readOnly) {
            this.canvas.style.cursor = 'default';
            const btn = this.shadowRoot.getElementById('finishBtn');
            if (btn) btn.style.display = 'none';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }

    getPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDrawing(e) {
        if (this.isReadOnly) return;
        this.isDrawing = true;
        const { x, y } = this.getPoint(e);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        const { x, y } = this.getPoint(e);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    setColor(color) {
        this.color = color;
        this.ctx.strokeStyle = color;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderGuide(guide) {
        if (!guide || !guide.shapes) return;

        // Save current state
        this.ctx.save();
        this.ctx.strokeStyle = '#cccccc'; // Light gray for guide
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]); // Dashed line

        guide.shapes.forEach(shape => {
            this.ctx.beginPath();
            if (shape.type === 'circle') {
                // Scale coordinates to canvas size if needed, for now assume absolute or percent
                // Let's assume percent for responsiveness
                const x = (shape.x / 100) * this.canvas.width;
                const y = (shape.y / 100) * this.canvas.height;
                const r = (shape.r / 100) * Math.min(this.canvas.width, this.canvas.height);
                this.ctx.arc(x, y, r, 0, Math.PI * 2);
            } else if (shape.type === 'rect') {
                const x = (shape.x / 100) * this.canvas.width;
                const y = (shape.y / 100) * this.canvas.height;
                const w = (shape.w / 100) * this.canvas.width;
                const h = (shape.h / 100) * this.canvas.height;
                this.ctx.rect(x, y, w, h);
            }
            this.ctx.stroke();
        });

        // Restore state
        this.ctx.restore();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        canvas {
          display: block;
          width: 100%;
          height: 100%;
          cursor: crosshair;
        }
      </style>
      <canvas id="canvas"></canvas>
      <button id="finishBtn">Terminar Dibujo</button>
      <style>
        #finishBtn {
            position: absolute;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            background: var(--primary-color, #007bff);
            color: white;
            border: none;
            border-radius: 24px;
            font-family: inherit;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform 0.2s, background 0.2s;
        }
        #finishBtn:hover {
            transform: translateY(-2px);
            background: var(--primary-color-dark, #0056b3);
        }
        #finishBtn:active {
            transform: translateY(0);
        }
      </style>
    `;
    }
}

customElements.define('drawing-canvas', DrawingCanvas);
