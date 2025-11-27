# SelfDraw - Asistente de IA para Regulación Emocional

Aplicación web que utiliza Google Gemini para proporcionar apoyo emocional mediante diálogo y terapia de arte digital.

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Windows)

1. **Doble clic en `start.bat`**
2. Sigue las instrucciones en pantalla
3. Abre tu navegador en `http://localhost:8888`

### Opción 2: Manual

```powershell
# 1. Instalar Node.js (si no lo tienes)
# Descarga desde: https://nodejs.org/

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Copia .env.example a .env y completa los valores
copy .env.example .env

# 4. Ejecutar servidor local
npm run dev
```

## 📋 Requisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **MongoDB** (local o Atlas)
  - Local: [Descargar MongoDB Community](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas (Gratis)](https://www.mongodb.com/cloud/atlas/register)
- **API Key de Gemini** ([Obtener aquí](https://aistudio.google.com/app/apikey))

## ⚙️ Configuración

### 1. Variables de Entorno (`.env`)

```env
GEMINI_API_KEY=tu_api_key_aqui
MONGO_URL=mongodb://localhost:27017/selfdraw
```

### 2. MongoDB Local

Si usas MongoDB local, asegúrate de que esté corriendo:

```powershell
# Verificar si MongoDB está activo
# Busca "Services" en Windows y verifica "MongoDB Server"
```

## 🧪 Probar la Aplicación

1. Abre `http://localhost:8888`
2. Inicia una conversación con "Hola"
3. Responde las 3 preguntas de anamnesis
4. La IA enviará un test psicológico (GAD-7, PHQ-9 o SMS-6)
5. Completa el test
6. La IA te guiará a la fase de dibujo

## 📁 Estructura del Proyecto

```
SelfDraw/
├── components/              # Web Components del frontend
│   ├── chat-interface.js   # Interfaz de chat principal
│   ├── test-form.js        # Formulario de tests
│   ├── drawing-canvas.js   # Canvas de dibujo
│   └── tests/
│       └── test-library.js # Tests psicológicos (GAD-7, PHQ-9, SMS-6)
├── lib/
│   ├── geminiClient.js     # Cliente de Google Gemini
│   └── db.js               # Conexión a MongoDB
├── netlify/functions/      # Serverless functions
│   ├── chat.js             # Endpoint de chat
│   └── save_test.js        # Guardar resultados de tests
├── index.html              # Página principal
├── app.js                  # Entry point del frontend
├── .env                    # Variables de entorno (crear desde .env.example)
├── package.json            # Dependencias
├── start.bat               # Script de inicio automático (Windows)
└── SETUP.md                # Guía detallada de configuración
```

## 🔧 Comandos Disponibles

```powershell
npm run dev      # Iniciar servidor de desarrollo
npm start        # Alias de npm run dev
npm install      # Instalar dependencias
```

## 🧠 Tests Psicológicos Incluidos

- **GAD-7**: Cuestionario de Ansiedad Generalizada (7 preguntas)
- **PHQ-9**: Cuestionario sobre la Salud del Paciente (9 preguntas)
- **SMS-6**: Escala de Motivación Situacional (6 preguntas)

Todos los tests son instrumentos validados científicamente.

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```powershell
npm install
```

### Error: "GEMINI_API_KEY is not defined"
- Verifica que `.env` existe y tiene la API key correcta
- Reinicia el servidor

### Error: "MongoDB connection failed"
- Verifica que MongoDB esté corriendo
- Verifica la URL en `.env`

### Puerto 8888 ya en uso
```powershell
npx netlify dev --port 3000
```

## 📚 Documentación Adicional

- [SETUP.md](./SETUP.md) - Guía detallada de configuración
- [implementation_plan.md](./.gemini/antigravity/brain/.../implementation_plan.md) - Plan de implementación técnico

## 🚀 Deploy a Producción

Cuando estés listo para deployar:

```powershell
# 1. Instalar Netlify CLI globalmente
npm install -g netlify-cli

# 2. Login a Netlify
netlify login

# 3. Deploy
netlify deploy --prod
```

## 📝 Licencia

ISC

## 👤 Autor

Proyecto de investigación - Lectura y Escritura
