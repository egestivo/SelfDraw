import ConversationManager from './conversationManager.js';

/*
 High-level integration helper for the Neuro UI.
 - Initializes a ConversationManager instance
 - Exposes methods the UI can call (start, sendMessage, getState)
 - Keeps the module small: UI-specific wiring (DOM) should live in app.js
*/

const managers = new Map();

export function createSession(sessionId = null) {
  const cm = new ConversationManager(sessionId);
  managers.set(cm.sessionId, cm);
  return cm;
}

export function getManager(sessionId) {
  return managers.get(sessionId) || null;
}

export async function startNewSession() {
  const cm = createSession();
  const prompt = await cm.startCheckIn();
  return { sessionId: cm.sessionId, prompt };
}

export default { createSession, getManager, startNewSession };
