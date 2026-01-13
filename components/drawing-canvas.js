export class DrawingCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isDrawing = false;
        this.color = '#000000';
        this.lineWidth = 3;
        this.tool = 'brush'; // brush, eraser, fill
    }

    connectedCallback() {
        this.render();
        this.canvas = this.shadowRoot.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.setupEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.getBoundingClientRect();
        // Save content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            tempCtx.drawImage(this.canvas, 0, 0);
        }

        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        // Restore content
        this.ctx.drawImage(tempCanvas, 0, 0);

        // Restore context settings
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
    }

    setupEvents() {
        // Mouse
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // Tools
        this.shadowRoot.getElementById('brushBtn').addEventListener('click', () => this.setTool('brush'));
        this.shadowRoot.getElementById('eraserBtn').addEventListener('click', () => this.setTool('eraser'));
        this.shadowRoot.getElementById('fillBtn').addEventListener('click', () => this.setTool('fill'));

        // Size Slider
        const slider = this.shadowRoot.getElementById('sizeSlider');
        slider.addEventListener('input', (e) => {
            this.lineWidth = parseInt(e.target.value);
            this.ctx.lineWidth = this.lineWidth;
        });

        // Finish Button
        this.shadowRoot.getElementById('finishBtn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('finish-drawing', {
                bubbles: true,
                composed: true
            }));
        });
    }

    setTool(tool) {
        this.tool = tool;
        // Update UI
        const buttons = this.shadowRoot.querySelectorAll('.tool-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        this.shadowRoot.getElementById(`${tool}Btn`).classList.add('active');
    }

    setReadOnly(readOnly) {
        this.isReadOnly = readOnly;
        if (readOnly) {
            this.canvas.style.cursor = 'default';
            this.shadowRoot.querySelector('.toolbar').style.display = 'none';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }

    getPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: Math.floor((e.clientX - rect.left) * scaleX),
            y: Math.floor((e.clientY - rect.top) * scaleY)
        };
    }

    handleStart(e) {
        if (this.isReadOnly) return;
        const { x, y } = this.getPoint(e);

        if (this.tool === 'fill') {
            this.floodFill(x, y, this.color);
        } else {
            this.isDrawing = true;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            if (this.tool === 'eraser') {
                this.ctx.globalCompositeOperation = 'destination-out';
            } else {
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.strokeStyle = this.color;
            }
        }
    }

    handleMove(e) {
        if (!this.isDrawing) return;
        const { x, y } = this.getPoint(e);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.globalCompositeOperation = 'source-over'; // Reset
    }

    setColor(color) {
        this.color = color;
        if (this.tool !== 'eraser') {
            this.ctx.strokeStyle = color;
        }
    }

    // Simple Flood Fill Algorithm
    floodFill(startX, startY, fillColor) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        // Convert hex to rgba
        const r = parseInt(fillColor.slice(1, 3), 16);
        const g = parseInt(fillColor.slice(3, 5), 16);
        const b = parseInt(fillColor.slice(5, 7), 16);
        const a = 255;

        const startPos = (startY * this.canvas.width + startX) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        if (startR === r && startG === g && startB === b && startA === a) return;

        const stack = [[startX, startY]];

        while (stack.length) {
            const [x, y] = stack.pop();
            const pos = (y * this.canvas.width + x) * 4;

            if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) continue;

            if (data[pos] === startR && data[pos + 1] === startG && data[pos + 2] === startB && data[pos + 3] === startA) {
                data[pos] = r;
                data[pos + 1] = g;
                data[pos + 2] = b;
                data[pos + 3] = a;

                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    renderGuide(guide) {
        if (!guide || !guide.shapes) return;
        this.ctx.save();
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        guide.shapes.forEach(shape => {
            this.ctx.beginPath();
            if (shape.type === 'circle') {
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
          position: relative;
        }
        canvas {
          display: block;
          width: 100%;
          height: 100%;
          cursor: crosshair;
        }
      </style>
      <canvas id="canvas"></canvas>
    `;
    }

    // Public API for external controls
    setTool(tool) {
        this.tool = tool;
    }

    setSize(size) {
        this.lineWidth = size;
        this.ctx.lineWidth = size;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    finish() {
        this.dispatchEvent(new CustomEvent('finish-drawing', {
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('drawing-canvas', DrawingCanvas);
