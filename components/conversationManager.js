import { sendMessages } from '../lib/geminiClient.js';
import * as db from './dbService.js';

/*
 ConversationManager
 - Orquesta las 4 fases (check-in, diagnóstico/modulación, intervención con canvas, check-out)
 - Mantiene un historial mínimo y guarda sesiones usando `dbService`
 - Usa el cliente `sendMessages` para comunicarse con el modelo via proxy

 Diseño/contrato (resumen):
 - Entrada: mensajes del usuario (texto) y eventos desde UI (p. ej. "canvasFinished")
 - Salida: objetos con { assistantText, stateTag? } donde stateTag es
   '[ESTADO: ALTA_ANSIEDAD]' o '[ESTADO: BAJA_MOTIVACION]' para que la UI cambie la NeuroArquitectura
 - Errores: lanza excepciones en problemas de red o validación.

 Buenas prácticas:
 - Métodos pequeños y comentados
 - JSON-serializable para persistencia
 - Pide al modelo respuestas en formato JSON cuando precise salidas técnicas
*/

// System prompt con rol y reglas (según requisitos del usuario)
const SYSTEM_PROMPT = `
Eres un asistente de IA empático y profesional integrado en una interfaz de NeuroArquitectura.
Objetivo: ayudar al usuario en la regulación emocional (ansiedad o motivación) mediante el diálogo y la terapia de arte digital.

NO eres un terapeuta humano. NO haces diagnósticos médicos (DSM-5). Eres soporte y acompañamiento.

Reglas:
1. Tono: empático, calmado, no juzgador, paciente.
2. Mantente dentro del contexto de gestión emocional (ansiedad/motivación). Si el usuario deriva, redirígelo.
3. Seguridad: ante riesgo de autolesión, sugiere ayuda profesional y líneas genéricas.
4. Privacidad: no pidas datos identificables.
5. No interpretes el arte por el usuario; facilita que el usuario reflexione sobre su propio dibujo.

Cuando se te solicite asignar un estado para la interfaz, devuelve exactamente al final del mensaje la etiqueta:
[ESTADO: ALTA_ANSIEDAD] o [ESTADO: BAJA_MOTIVACION]

Cuando necesites que la aplicación lea una señal técnica (p.ej. severidad), devuelve un bloque de salida JSON en una sola línea entre marcas <JSON>... </JSON> con keys: { state: 'Alta_Ansiedad'|'Baja_Motivacion', severity: 'low'|'moderate'|'high' }
`;

export class ConversationManager {
  constructor(sessionId = null) {
    this.sessionId = sessionId || `sess_${Date.now()}`;
    this.phase = 1; // 1..4
    this.history = []; // mensajes intercambiados
    this.meta = {
      baselineScore: null,
      postScore: null,
      diagnosis: null, // 'ANSIEDAD' | 'BAJA_MOTIVACION'
    };
  }

  // Persist current session state (lightweight)
  async persist() {
    const session = {
      id: this.sessionId,
      phase: this.phase,
      history: this.history,
      meta: this.meta,
      updatedAt: new Date().toISOString(),
    };
    await db.saveSession(session);
  }

  // Low-level wrapper to call the model. Always prepends system prompt.
  async askModel(userContent, opts = {}) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...this.history,
      { role: 'user', content: userContent },
    ];

    const resp = await sendMessages(messages, opts);
    // Expecting server to return { reply: string, raw?: any }
    const assistantText = resp.reply || '';

    // Append to local history
    this.history.push({ role: 'user', content: userContent });
    this.history.push({ role: 'assistant', content: assistantText });
    await this.persist();

    return { assistantText, raw: resp.raw };
  }

  // Phase 1: Check-in (start the conversational check-in; returns assistant prompt)
  async startCheckIn() {
    this.phase = 1;
    await this.persist();
    // Minimal prompt to begin
    const prompt = 'Hola — antes de empezar, ¿cómo te sientes hoy? Puedes describir en pocas palabras.';
    // We do not call the model yet; UI should show prompt and then call handleUserMessage
    return prompt;
  }

  // Generic handler for user messages. The flow controller decides next steps.
  // For a first iteration, this method sends the message to the model and returns the assistant reply.
  async handleUserMessage(text) {
    // Simple stateful flow: delegate to model
    const { assistantText } = await this.askModel(text);
    return assistantText;
  }

  /*
   Utilities to score brief scales. These functions expect an array of numeric answers
   (0..3) for GAD-7 and SMS-6 style scale for motivation. Implementations are simple
   but can be adapted to match exact scoring rules.
  */
  scoreGAD7(answers = []) {
    // answers: length 7, values 0..3
    if (answers.length !== 7) return null;
    const total = answers.reduce((a, b) => a + b, 0);
    let severity = 'low';
    if (total >= 10 && total <= 14) severity = 'moderate';
    else if (total >= 15) severity = 'high';
    return { total, severity };
  }

  scoreSMS6(answers = []) {
    // SMS-6 style: 6 items 0..4 for motivation; adapt thresholds as needed
    if (answers.length !== 6) return null;
    const total = answers.reduce((a, b) => a + b, 0);
    let severity = 'low';n
    if (total <= 9) severity = 'high'; // low score => high problem
    else if (total <= 15) severity = 'moderate';
    return { total, severity };
  }

  // Parse assistant reply for technical JSON block between <JSON>...</JSON>
  static parseJSONBlock(text) {
    const m = text.match(/<JSON>([\s\S]*?)<\/JSON>/);
    if (!m) return null;
    try {
      return JSON.parse(m[1]);
    } catch (e) {
      return null;
    }
  }

  // Helper to request from model that it returns a state tag for UI
  async requestStateTag(summary) {
    // Ask model to return exactly the tag at the end of its response
    const userContent = `Basado en lo anterior, decide el estado para la interfaz (solo una etiqueta al final): [ESTADO: ALTA_ANSIEDAD] o [ESTADO: BAJA_MOTIVACION]. Responde concisamente.`;
    const { assistantText } = await this.askModel(userContent);
    const tagMatch = assistantText.match(/\[ESTADO:\s*(ALTA_ANSIEDAD|BAJA_MOTIVACION)\]/i);
    return tagMatch ? tagMatch[0] : null;
  }

}

export default ConversationManager;
