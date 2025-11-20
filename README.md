# SelfDraw — NeuroArquitectura aumentada (prototipo)

Proyecto cliente ligero con scaffolding para integrar un agente conversacional (Gemini) y un canvas de expresión artística.

Objetivos de este commit:
- Añadir módulos ES reusables en `components/`.
- Añadir wrapper cliente en `lib/geminiClient.js` que llama a un proxy seguro `/api/gemini`.
- Añadir un servidor de desarrollo mínimo en `server/server.js` que actúa como proxy (plantilla).

Arquitectura y buenas prácticas:
- Módulos ES (import/export) para facilitar composición y testing.
- No incluir claves en el cliente: el cliente llama a `/api/gemini` y la lógica con la API key se ejecuta en el servidor.
- `components/dbService.js` es una abstracción para persistencia (actualmente usa localStorage, sustituible por backend).

Fases del flujo (implementadas en ConversationManager):
1. Check-in y detección (GAD-7 / SMS-6)
2. Diagnóstico y salida técnica (etiqueta de estado)
3. Intervención con canvas (Protocolo A / B)
4. Check-out y re-evaluación

Qué falta / próximos pasos recomendados:
- Implementar UI en `index.html` y `app.js` usando los módulos creados.
- Conectar eventos del canvas con la conversación (cuando termine el dibujo, invocar check-out).
- Subir el proxy a un entorno seguro y configurar `GEMINI_API_KEY` en `.env` del servidor.
- Añadir tests unitarios y e2e para flujo.

Cómo ejecutar el proxy (local dev):

1. Copia `.env.example` a `.env` y añade `GEMINI_API_KEY` si tienes uno.
2. Instala dependencias (Node.js 18+ recomendado):

```powershell
npm install
npm run dev
```

3. Abre `index.html` en el navegador (puede ser servido estáticamente), y el cliente enviará peticiones a `http://localhost:3000/api/gemini`.

Seguridad y DevOps:
- No subir `.env` con claves a repositorio.
- Usar un entorno seguro (secreto en hosting) para la clave.
- Añadir monitorización y límites (rate-limits) y saneamiento de inputs en el proxy.

Netlify deployment notes
------------------------

Este proyecto está preparado para desplegarse en Netlify como sitio estático. Contiene una función Netlify (serverless) que actúa como proxy seguro para Gemini:

- `netlify/functions/gemini-proxy.js` — función serverless que lee `GEMINI_API_KEY` y (opcionalmente) `GEMINI_API_URL` desde las variables de entorno.

Pasos para desplegar en Netlify:

1. Sube este repositorio a Git (GitHub/GitLab).
2. En la consola de Netlify crea un nuevo sitio y conecta tu repo.
3. En Site settings -> Build & deploy -> Environment, añade:
	- `GEMINI_API_KEY` (tu clave de servidor)
	- Opcional: `GEMINI_API_URL` (si quieres que la función reenvíe a un endpoint concreto)
4. Build command: `npm run build`
5. Publish directory: `/` (raíz)

Pruebas locales con Netlify CLI:

```powershell
npm install -g netlify-cli
npm run netlify-dev
```

Esto arrancará un servidor de desarrollo local y ejecutará las funciones desde `netlify/functions`.

Recordatorio de seguridad: almacena las claves como Netlify Environment Variables (no en el código). La función devuelve una respuesta mock si no existe la clave para facilitar el desarrollo local seguro.
