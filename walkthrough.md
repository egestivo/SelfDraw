# Walkthrough - Formulario de Tests Integrado

Se ha implementado un nuevo sistema para mostrar formularios interactivos dentro del chat cuando el asistente (Gemini) necesita realizar una evaluación (Fase 1 o Fase 4).

## Cambios Realizados

### 1. Nuevo Componente `test-form.js`
- Renderiza formularios dinámicos basados en JSON.
- Soporta preguntas de escala (botones) y texto libre.
- Valida que todas las preguntas sean respondidas antes de enviar.

### 2. Actualización de `chat-interface.js`
- Detecta la etiqueta `[ACCION: MOSTRAR_TEST]` en la respuesta de la IA.
- Muestra el componente `test-form` en el chat.
- **Deshabilita el input principal** mientras el formulario está activo.
- Al enviar el formulario:
    - Guarda los resultados en MongoDB.
    - Envía un mensaje oculto al sistema con las respuestas para que la IA continúe.
    - Reactiva el input principal.

### 3. Backend `save_test.js`
- Nueva función Netlify (`/.netlify/functions/save_test`) para guardar los resultados de los tests.
- Guarda: `testId`, `answers`, `timestamp`.

### 4. Prompt de Gemini (`geminiClient.js`)
- Se actualizó el `SYSTEM_PROMPT` para que la IA use la nueva etiqueta `[ACCION: MOSTRAR_TEST]` en lugar de hacer preguntas en texto plano durante la Fase 1.

## Cómo Probar

1.  Inicia la aplicación (`npm run dev` o `netlify dev`).
2.  Habla con el asistente: "Hola, me siento un poco ansioso".
3.  Responde las preguntas de la Fase 0 (Anamnesis).
4.  Cuando el asistente pase a la Fase 1 (Medición), debería aparecer un formulario con botones en lugar de texto.
5.  Intenta escribir en el chat principal (debería estar bloqueado).
6.  Completa el formulario y envíalo.
7.  El asistente debería recibir tus respuestas y proceder a la Fase 2 (Diagnóstico/Canvas).
8.  Verifica en MongoDB que se haya creado un documento en la colección `test_results`.
