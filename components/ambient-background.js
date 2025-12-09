export class AmbientBackground extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.particles = [];
        this.animationFrame = null;
    }

    connectedCallback() {
        this.render();
        this.canvas = this.shadowRoot.getElementById('bgCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.initParticles();
        this.animate();
    }

    disconnectedCallback() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        this.particles = [];
        const particleCount = 6;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                // Increase base velocity (was 0.5)
                vx: (Math.random() - 0.5) * 2.5,
                vy: (Math.random() - 0.5) * 2.5,
                // Add variable speed factor for dynamic movement
                speed: Math.random() * 0.02 + 0.01,
                radius: Math.random() * 200 + 150, // Slightly larger
                color: this.getRandomColor(),
                angle: Math.random() * Math.PI * 2 // For sinusoidal movement
            });
        }
    }

    getRandomColor() {
        // Get colors from CSS variables if available, otherwise fallback
        const style = getComputedStyle(this);
        const primary = style.getPropertyValue('--current-primary').trim() || '#607d8b';
        // We can generate variations or use other variables
        return primary;
    }

    updateParticles() {
        // Get current theme colors dynamically
        const style = getComputedStyle(this);
        const primary = style.getPropertyValue('--current-primary').trim() || '#607d8b';

        this.particles.forEach(p => {
            // Add sinusoidal movement for organic feel
            p.angle += p.speed;
            p.x += p.vx + Math.sin(p.angle) * 0.5;
            p.y += p.vy + Math.cos(p.angle) * 0.5;

            // Bounce off edges with damping? No, wrap around is better for ambient
            // But let's stick to bounce to keep them on screen
            if (p.x < -p.radius) { p.x = -p.radius; p.vx *= -1; }
            if (p.x > this.canvas.width + p.radius) { p.x = this.canvas.width + p.radius; p.vx *= -1; }
            if (p.y < -p.radius) { p.y = -p.radius; p.vy *= -1; }
            if (p.y > this.canvas.height + p.radius) { p.y = this.canvas.height + p.radius; p.vy *= -1; }

            // Wrap around logic (smoother)
            if (p.x < -p.radius * 2) p.x = this.canvas.width + p.radius;
            if (p.x > this.canvas.width + p.radius * 2) p.x = -p.radius;
            if (p.y < -p.radius * 2) p.y = this.canvas.height + p.radius;
            if (p.y > this.canvas.height + p.radius * 2) p.y = -p.radius;

            // Update color (slow transition could be added here, for now direct)
            p.color = primary;
        });
    }

    draw() {
        // Clear with a base transparency to create trails? No, just clear.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Use composite operation for blending
        this.ctx.globalCompositeOperation = 'screen'; // or 'overlay' or 'soft-light'

        this.particles.forEach(p => {
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);

            // Convert hex to rgba for transparency
            // Simple hack: assume hex is 7 chars #RRGGBB
            let c = p.color;
            if (c.startsWith('#')) {
                const r = parseInt(c.substr(1, 2), 16);
                const g = parseInt(c.substr(3, 2), 16);
                const b = parseInt(c.substr(5, 2), 16);
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            } else {
                gradient.addColorStop(0, p.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
            }

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        this.updateParticles();
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                    overflow: hidden;
                }
                canvas {
                    width: 100%;
                    height: 100%;
                    filter: blur(60px); /* Heavy blur for ambient effect */
                }
            </style>
            <canvas id="bgCanvas"></canvas>
        `;
    }
}

customElements.define('ambient-background', AmbientBackground);
