export class TestForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set data(testData) {
        this._data = this.normalizeData(testData);
        this.render();
    }

    normalizeData(data) {
        // Handle different schemas (Gemini hallucination fallback)
        const questions = data.questions || data.preguntas || [];
        return {
            id: data.id || 'test_' + Date.now(),
            title: data.title || data.titulo || 'Cuestionario',
            questions: questions.map((q, i) => ({
                id: q.id || `q${i}`,
                text: q.text || q.texto || q.pregunta,
                type: (q.type || q.tipo) === 'radio' ? 'choice' : (q.type || q.tipo || 'text'),
                options: (q.options || q.opciones || []).map(opt => {
                    if (typeof opt === 'object') {
                        return { label: opt.label || opt.texto || opt.text, value: opt.value || opt.valor || opt.id };
                    }
                    return { label: opt, value: opt };
                })
            }))
        };
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (!this._data) return;

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin: 10px 0;
                animation: slideIn 0.3s ease;
            }
            h3 {
                margin: 0 0 15px 0;
                color: #333;
                font-size: 1.1rem;
            }
            .question {
                margin-bottom: 15px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                color: #555;
                font-weight: 500;
            }
            .options {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .option-btn {
                padding: 8px 16px;
                border: 1px solid #ddd;
                border-radius: 20px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.9rem;
            }
            .option-btn:hover {
                background: #f5f5f5;
            }
            .option-btn.selected {
                background: var(--primary-color, #007bff);
                color: white;
                border-color: var(--primary-color, #007bff);
            }
            button.submit-btn {
                width: 100%;
                padding: 12px;
                background: var(--primary-color, #007bff);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 10px;
            }
            button.submit-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
        <form id="testForm">
            <h3>${this._data.title || 'Cuestionario'}</h3>
            ${this._data.questions.map((q, index) => `
                <div class="question" data-id="${q.id}">
                    <label>${index + 1}. ${q.text}</label>
                    <div class="options">
                        ${this.renderOptions(q)}
                    </div>
                    <input type="hidden" name="${q.id}" required>
                </div>
            `).join('')}
            <button type="submit" class="submit-btn" disabled>Enviar Respuestas</button>
        </form>
        `;

        this.setupEventListeners();
    }

    renderOptions(question) {
        if (question.type === 'scale' || question.type === 'choice') {
            return question.options.map(opt => `
                <button type="button" class="option-btn" data-value="${opt.value || opt}">${opt.label || opt}</button>
            `).join('');
        }
        return `<input type="text" name="${question.id}" placeholder="Tu respuesta...">`;
    }

    setupEventListeners() {
        const form = this.shadowRoot.getElementById('testForm');
        const submitBtn = form.querySelector('.submit-btn');
        const questions = form.querySelectorAll('.question');

        // Handle option selection
        this.shadowRoot.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parent = e.target.closest('.question');
                const input = parent.querySelector('input[type="hidden"]');

                // Deselect others in same group
                parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));

                // Select clicked
                e.target.classList.add('selected');
                input.value = e.target.dataset.value;

                this.checkValidity();
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const answers = {};

            // Manually collect data because FormData might miss hidden inputs if not handled correctly or just to be safe
            questions.forEach(q => {
                const id = q.dataset.id;
                const input = q.querySelector('input[type="hidden"]') || q.querySelector('input[type="text"]');
                answers[id] = input.value;
            });

            this.dispatchEvent(new CustomEvent('test-submit', {
                detail: {
                    testId: this._data.id,
                    answers: answers
                },
                bubbles: true,
                composed: true
            }));
        });
    }

    checkValidity() {
        const form = this.shadowRoot.getElementById('testForm');
        const inputs = form.querySelectorAll('input');
        const submitBtn = form.querySelector('.submit-btn');

        let allFilled = true;
        inputs.forEach(input => {
            if (!input.value) allFilled = false;
        });

        submitBtn.disabled = !allFilled;
    }
}

customElements.define('test-form', TestForm);
