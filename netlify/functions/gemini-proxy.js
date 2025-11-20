// Netlify Function: gemini-proxy
// ESM-compatible handler for Netlify Functions (Node 18+).
// This function forwards client messages to a generative API using a server-side key
// stored in Netlify environment variables (GEMINI_API_KEY, optional GEMINI_API_URL).

export const handler = async (event, context) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const messages = body.messages || [];

    // If no API key is configured, return a mocked reply to enable frontend dev.
    if (!process.env.GEMINI_API_KEY) {
      const lastUser = messages.slice().reverse().find((m) => m.role === 'user');
      const reply = lastUser ? `Respuesta simulada: "${lastUser.content}"` : 'Respuesta simulada: Hola, ¿cómo te sientes?';
      return {
        statusCode: 200,
        body: JSON.stringify({ reply, raw: { mocked: true } }),
      };
    }

    // If a provider URL is given, forward the request. Otherwise, echo as fallback.
    const apiUrl = process.env.GEMINI_API_URL;
    if (!apiUrl) {
      const lastUser = messages.slice().reverse().find((m) => m.role === 'user');
      const reply = lastUser ? `Entendido: "${lastUser.content}"` : 'Hola — dime cómo te sientes.';
      return { statusCode: 200, body: JSON.stringify({ reply, raw: { echoed: true } }) };
    }

    // Forward to configured API (this is generic; adapt to your provider's contract)
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    const data = await resp.json();
    const reply = data.reply || data.output || JSON.stringify(data);
    return { statusCode: resp.ok ? 200 : 500, body: JSON.stringify({ reply, raw: data }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
