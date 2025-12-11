export class AudioPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentTrack = 'idle';
        this.audio = new Audio();
        this.audio.loop = true;
        this.isPlaying = false;

        this.tracks = {
            'idle': 'assets/audio/IdleAudio.mp3',
            'ansiedad': 'assets/audio/AnxietyAudio.mp3',
            'depresion': 'assets/audio/DepressionAudio.mp3',
            'estres': 'assets/audio/StressAudio.mp3'
        };
    }

    connectedCallback() {
        this.render();
        this.setupEvents();

        // Start playing default track on first user interaction if possible, 
        // but browsers block autoplay. We'll rely on the toggle button.
    }

    setupEvents() {
        const toggleBtn = this.shadowRoot.getElementById('toggleBtn');
        toggleBtn.addEventListener('click', () => {
            this.togglePlay();
        });

        const volumeSlider = this.shadowRoot.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value;
        });

        // Initialize volume
        this.audio.volume = volumeSlider.value;

        // Listen for track change events from parent
        window.addEventListener('play-audio', (e) => {
            const trackName = e.detail.track.toLowerCase();
            if (this.tracks[trackName]) {
                this.changeTrack(trackName);
            }
        });
    }

    async togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            this.updateIcon(false);
        } else {
            // Ensure source is set
            if (!this.audio.src) {
                this.audio.src = this.tracks[this.currentTrack];
            }
            try {
                await this.audio.play();
                this.isPlaying = true;
                this.updateIcon(true);
            } catch (e) {
                console.error("Audio play failed:", e);
            }
        }
    }

    changeTrack(trackName) {
        if (this.currentTrack === trackName) return;

        this.currentTrack = trackName;
        const wasPlaying = this.isPlaying;

        // Fade out? For now just switch
        this.audio.src = this.tracks[trackName];

        if (wasPlaying) {
            this.audio.play().catch(e => console.error(e));
        }
    }

    updateIcon(isPlaying) {
        const btn = this.shadowRoot.getElementById('toggleBtn');
        btn.innerHTML = isPlaying ? '🔊' : '🔇';
        btn.title = isPlaying ? 'Silenciar música' : 'Activar música';
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                .volume-control {
                    width: 48px;
                    height: 100px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    position: absolute;
                    bottom: 60px; /* Position above the button */
                }
                .container:hover .volume-control {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                /* Vertical Slider */
                input[type=range] {
                    writing-mode: bt-lr; /* IE */
                    -webkit-appearance: slider-vertical; /* WebKit */
                    width: 8px;
                    height: 80px;
                    padding: 0 5px;
                }
                button {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(5px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    cursor: pointer;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, background 0.2s;
                }
                button:hover {
                    transform: scale(1.1);
                    background: white;
                }
                button:active {
                    transform: scale(0.95);
                }
            </style>
            <div class="container">
                <div class="volume-control">
                    <input type="range" id="volumeSlider" min="0" max="1" step="0.01" value="0.5" orient="vertical">
                </div>
                <button id="toggleBtn" title="Activar música">🔇</button>
            </div>
        `;
    }
}

customElements.define('audio-player', AudioPlayer);
