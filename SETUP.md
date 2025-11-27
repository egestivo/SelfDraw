# Guía de Configuración - Entorno Local de Desarrollo

## 1. Instalar Node.js

1. Ve a https://nodejs.org/
2. Descarga la versión LTS (recomendada)
3. Ejecuta el instalador
4. Verifica la instalación abriendo PowerShell y ejecutando:
   ```powershell
   node --version
   npm --version
   ```

## 2. Instalar Dependencias del Proyecto

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd "c:\Users\Estivo\Documents\6TO Semestre\Lectura y Escritura\SelfDraw"
npm install
```

Esto instalará:
- `@google/generative-ai` (para Gemini)
- `mongodb` (para la base de datos)
- `netlify-cli` (para el servidor local)

## 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
GEMINI_API_KEY=tu_api_key_aqui
MONGO_URL=mongodb://localhost:27017/selfdraw
```

### Obtener GEMINI_API_KEY:
1. Ve a https://aistudio.google.com/app/apikey
2. Crea una nueva API key
3. Cópiala al archivo `.env`

### Configurar MongoDB Local:

**Opción A: MongoDB Local (Recomendado para desarrollo)**
1. Descarga MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Instala con las opciones por defecto
3. MongoDB se ejecutará automáticamente en `mongodb://localhost:27017`

**Opción B: MongoDB Atlas (Gratis en la nube)**
1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea un cluster gratuito
3. Obtén la connection string
4. Úsala en `MONGO_URL`

## 4. Ejecutar el Servidor Local

```powershell
npm run dev
```

O si prefieres usar Netlify CLI directamente:

```powershell
npx netlify dev
```

Esto iniciará:
- Frontend en `http://localhost:8888`
- Functions en `http://localhost:8888/.netlify/functions/`

## 5. Probar la Aplicación

1. Abre tu navegador en `http://localhost:8888`
2. Abre la consola del navegador (F12)
3. Inicia una conversación
4. Verifica que no haya errores en la consola

## 6. Verificar que Todo Funciona

### Test 1: Verificar Frontend
- La página debe cargar sin errores
- Debe aparecer el mensaje inicial del asistente

### Test 2: Verificar Backend
- Envía un mensaje "Hola"
- Debe responder la IA (verifica en la consola de PowerShell los logs)

### Test 3: Verificar MongoDB
- Completa el flujo hasta el test
- Verifica que se guarden los resultados en MongoDB

## Solución de Problemas Comunes

### Error: "Cannot find module"
```powershell
npm install
```

### Error: "GEMINI_API_KEY is not defined"
- Verifica que el archivo `.env` existe
- Verifica que la API key es correcta
- Reinicia el servidor

### Error: "MongoDB connection failed"
- Verifica que MongoDB esté corriendo
- En Windows, busca "Services" y verifica que "MongoDB Server" esté activo

### Puerto 8888 ya en uso
```powershell
npx netlify dev --port 3000
```

## Comandos Útiles

```powershell
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ver logs detallados
npx netlify dev --debug

# Limpiar caché
rm -r node_modules
npm install
```

## Estructura del Proyecto

```
SelfDraw/
├── components/           # Web Components
│   ├── chat-interface.js
│   ├── test-form.js
│   └── tests/
│       └── test-library.js
├── lib/                  # Utilidades
│   ├── geminiClient.js
│   └── db.js
├── netlify/
│   └── functions/        # Serverless functions
│       ├── chat.js
│       └── save_test.js
├── index.html
├── app.js
├── package.json
└── .env                  # Variables de entorno (crear)
```

## Próximos Pasos

Una vez que todo funcione localmente:
1. Prueba el flujo completo de conversación
2. Verifica que los tests se muestren correctamente
3. Confirma que los datos se guarden en MongoDB
4. Cuando estés listo, puedes deployar a Netlify con `netlify deploy`
