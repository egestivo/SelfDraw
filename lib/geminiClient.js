// ES module wrapper for calling the Gemini API through a server-side proxy.
// IMPORTANT: Do NOT place API keys in client-side code. This module expects
// a secure server endpoint at `/api/gemini` that forwards requests to Gemini
// using a server-side API key.

// Usage:
// import { sendMessages } from '../lib/geminiClient.js';
// const resp = await sendMessages([{role: 'user', content: 'Hola'}]);

export async function sendMessages(messages, opts = {}) {
  // messages: array of {role: 'system'|'user'|'assistant', content: string}
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, opts }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini proxy error ${res.status}: ${text}`);
  }

  // Expect server to return JSON { reply: string, raw?: any }
  return res.json();
}

export default { sendMessages };
