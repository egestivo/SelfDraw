// App UI glue (ES Module)
// Connects the minimal HTML UI with the ConversationManager and Canvas component

import { startNewSession, getManager } from './components/neuro.js';
import { createCanvas } from './components/canvas.js';

let currentSessionId = null;
let cm = null;
let canvasComp = null;

const el = {
  startBtn: document.getElementById('startBtn'),
  detectStateBtn: document.getElementById('detectStateBtn'),
  chat: document.getElementById('chat'),
  inputForm: document.getElementById('inputForm'),
  textIn: document.getElementById('textIn'),
  sessionId: document.getElementById('sessionId'),
  canvasContainer: document.getElementById('canvasContainer'),
  startDrawBtn: document.getElementById('startDrawBtn'),
  clearBtn: document.getElementById('clearBtn'),
  finishDrawBtn: document.getElementById('finishDrawBtn'),
  stateTag: document.getElementById('stateTag'),
};

function addMessage(role, text) {
  const d = document.createElement('div');
  d.className = 'msg ' + (role === 'user' ? 'user' : 'assistant');
  d.textContent = text;
  el.chat.appendChild(d);
  el.chat.scrollTop = el.chat.scrollHeight;
}

el.startBtn.addEventListener('click', async () => {
  const { sessionId, prompt } = await startNewSession();
  currentSessionId = sessionId;
  cm = getManager(sessionId);
  el.sessionId.textContent = `session: ${sessionId}`;
  addMessage('assistant', prompt);
});

el.inputForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cm) { addMessage('assistant', 'Inicia la sesión primero.'); return; }
  const text = el.textIn.value.trim();
  if (!text) return;
  addMessage('user', text);
  el.textIn.value = '';
  try {
    const reply = await cm.handleUserMessage(text);
    addMessage('assistant', reply);
  } catch (err) {
    addMessage('assistant', 'Error al comunicarse con el servidor: ' + String(err));
  }
});

el.detectStateBtn.addEventListener('click', async () => {
  if (!cm) { addMessage('assistant', 'Inicia la sesión primero.'); return; }
  addMessage('assistant', 'Detectando estado...');
  try {
    const tag = await cm.requestStateTag();
    if (tag) {
      el.stateTag.textContent = tag;
      addMessage('assistant', `Estado detectado: ${tag}`);
    } else {
      addMessage('assistant', 'No se pudo detectar el estado.');
    }
  } catch (err) {
    addMessage('assistant', 'Error: ' + String(err));
  }
});

el.startDrawBtn.addEventListener('click', () => {
  if (!canvasComp) {
    canvasComp = createCanvas(el.canvasContainer, { width: 380, height: 420 });
  }
});

el.clearBtn.addEventListener('click', () => {
  if (canvasComp) canvasComp.clear();
});

el.finishDrawBtn.addEventListener('click', async () => {
  if (!cm) { addMessage('assistant', 'Inicia la sesión primero.'); return; }
  // In a real flow, we would upload image data and let the model guide reflection.
  const dataUrl = canvasComp ? canvasComp.toDataURL() : null;
  addMessage('assistant', 'Gracias — cuando termines, ¿qué te gustaría decir sobre tu dibujo?');
  // For this demo we just notify the model that drawing finished.
  try {
    const reply = await cm.handleUserMessage('He terminado de dibujar.');
    addMessage('assistant', reply);
  } catch (err) {
    addMessage('assistant', 'Error al enviar dibujo: ' + String(err));
  }
});

// Expose for debugging
window._selfdraw = { addMessage, getManager };
