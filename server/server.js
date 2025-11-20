// Minimal Express server to act as a secure proxy to Gemini (server-side)
// This is a template: you MUST fill GEMINI_API_KEY in environment and adapt the
// forwarding code to your chosen Gemini/Google Generative API client.

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post('/api/gemini', async (req, res) => {
  const messages = req.body.messages || [];

  // In production, use the official client or a well-tested HTTP flow.
  // Here we show a simple placeholder: if GEMINI_API_KEY is missing, return a
  // mock reply to enable frontend development without an API key.

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      reply: 'Respuesta simulada (no hay API key configurada). Aquí iría la respuesta del modelo.',
      raw: { mocked: true },
    });
  }

  try {
    // TODO: Replace the following block with actual call to Gemini/Google Generative API.
    // Example (pseudo):
    // const gResp = await googleClient.generateMessage({ model: 'gemini-x', messages });
    // return res.json({ reply: gResp.content, raw: gResp });

    // For now, echo last user message as a safe default.
    const lastUser = messages.slice().reverse().find((m) => m.role === 'user');
    const reply = lastUser ? `Entendido: "${lastUser.content}"` : 'Hola — dime cómo te sientes.';
    return res.json({ reply, raw: { echoed: true } });
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(500).json({ error: 'proxy_error', detail: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Dev proxy server listening on http://localhost:${PORT}`);
});
