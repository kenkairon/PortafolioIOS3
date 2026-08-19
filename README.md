# CV estilo iOS 26 (Liquid Glass) — Carlos Vásquez

Portafolio/CV interactivo hecho con **Next.js 14 (App Router)**, **TypeScript** y **Tailwind CSS**, con una interfaz que imita el **Home Screen de iOS 26**: barra de estado con Dynamic Island, cuadrícula de apps tipo squircle, Dock inferior, "sheets" (hojas) que se deslizan desde abajo al abrir cada sección con el material **Liquid Glass**, y un **gato asistente** flotante que ayuda a navegar el portafolio.

## 📁 Estructura del proyecto

```
cv-win11/
├── app/
│   ├── layout.tsx        → layout raíz (metadata, fuente)
│   ├── page.tsx           → home screen: cuadrícula + dock + sheets + gato
│   └── globals.css        → material Liquid Glass, squircle, animaciones
├── components/
│   ├── StatusBar.tsx        → hora, Dynamic Island, señal/batería
│   ├── AppIcon.tsx            → ícono squircle con gradiente tipo iOS
│   ├── Dock.tsx                → dock inferior + home indicator
│   ├── AppSheet.tsx             → hoja modal que se desliza al abrir una app
│   ├── CatGuide.tsx              → gato asistente flotante + buscador
│   └── SkillBar.tsx               → barra de progreso de habilidades
├── lib/
│   ├── data.ts                     → TODA tu info del CV (edítala aquí)
│   └── storage.ts                    → persistencia en localStorage
├── tailwind.config.ts               → paleta de colores iOS
└── package.json
```

## 🚀 Paso a paso para correrlo

### 1. Requisitos
Node.js 18 o superior (https://nodejs.org).

### 2. Instalar y correr
```bash
npm install
npm run dev
```
Abre **http://localhost:3000**. Toca cualquier ícono de la cuadrícula o del dock inferior para abrir su "app". Toca al **gato** 🐱 (abajo a la izquierda) para buscar habilidades/proyectos o recibir consejos.

### 3. Editar tu información
Todo el contenido vive en `lib/data.ts` (perfil, habilidades, proyectos, certificaciones, contacto, wallpapers y colores de cada ícono).

### 4. Producción
```bash
npm run build
npm start
```

### 5. Publicarlo gratis (Vercel)
1. Sube el proyecto a GitHub.
2. Entra a https://vercel.com → conecta GitHub → importa el repo.
3. Vercel detecta Next.js automáticamente → "Deploy". En minutos tendrás una URL pública.

## ✨ Funciones incluidas

- **Home screen tipo iOS**: cuadrícula de 6 apps (Sobre mí, Habilidades, Proyectos, Certificados, Contacto, Ajustes) con íconos squircle degradados, más una barra de estado con Dynamic Island simulada.
- **Dock inferior** con las 4 apps principales, estilo "glass" translúcido con blur real, más el home indicator.
- **Sheets estilo iOS**: al tocar un ícono, la sección se desliza desde abajo con el material Liquid Glass (blur + saturación), barra de navegación con ícono/título y botón de cerrar (flecha hacia abajo).
- **Gato asistente ("Miu")** 🐱: personaje flotante con animación de rebote suave. Al tocarlo despliega una burbuja con:
  - Consejos rotativos sobre cómo usar el portafolio.
  - Un **buscador funcional** de habilidades y proyectos: escribe "Python" o "Django" y te muestra resultados; al elegir uno, abre la app correspondiente y hace scroll con un resaltado animado hasta el ítem.
- **App de Ajustes**: cambia el **fondo de pantalla** (5 wallpapers) y el **modo oscuro/claro**, con un botón para "Restablecer valores predeterminados".
- **Persistencia real con localStorage**: el fondo de pantalla y el modo oscuro elegidos se guardan en el navegador del visitante y se recuerdan en su próxima visita — esto funciona porque es una app real que corre en su navegador (no un artifact embebido), a diferencia de la vista previa dentro del chat de Claude.

## 🤖 Chatbot con Gemini (Miu responde sobre tus proyectos de GitHub)

Agregué una app nueva, **"Pregúntale a Miu"**, que:
1. Trae tus repositorios públicos desde la API de GitHub (sin necesidad de token).
2. Le pasa esa lista como contexto a **Gemini** y deja que el visitante haga preguntas ("¿qué tecnología usa tu proyecto X?", "¿cuál es tu repo más reciente?", etc.).

### Por qué se hace así (y su límite de seguridad)

Este sitio es **100% estático** (se exporta con `output: "export"` para GitHub Pages), así que no hay backend propio donde esconder una API key. Por eso el chat llama a Gemini **directamente desde el navegador**. Esto significa que la key queda visible en el código fuente del sitio — la forma de mitigarlo es **restringir la key para que solo funcione desde tu dominio**, como se explica abajo. No es 100% inviolable (nada que corra en el navegador lo es), pero sí evita que cualquiera la copie y la use en otro sitio.

Si en algún momento quieres una solución más robusta (key completamente oculta), la alternativa es mover esta llamada a una función serverless (ej. Vercel/Cloudflare Workers) en vez de GitHub Pages — pero para un portafolio personal con la key restringida, esto es suficiente.

### Paso a paso

**1. Configura tu usuario de GitHub**
En `lib/data.ts`, cambia:
```ts
export const githubConfig = {
  username: "TU_USUARIO_GITHUB", // ← pon tu usuario real
};
```

**2. Crea la API key de Gemini**
1. Entra a [Google AI Studio](https://aistudio.google.com/apikey) con tu cuenta de Google.
2. Clic en **"Create API key"** (puedes usar un proyecto nuevo de Google Cloud o uno existente).
3. Copia la key generada.

**3. Restringe la key a tu dominio (importante)**
1. Ve a [Google Cloud Console → APIs y servicios → Credenciales](https://console.cloud.google.com/apis/credentials) (mismo proyecto donde se creó la key).
2. Abre la key que acabas de crear.
3. En **"Restricciones de la aplicación"** elige **"Referentes HTTP (sitios web)"**.
4. Agrega tu dominio de GitHub Pages, por ejemplo:
   ```
   https://tuusuario.github.io/PortafolioIOS/*
   ```
5. En **"Restricciones de API"**, limita la key solo a **"Generative Language API"**.
6. Guarda.

**4. Prueba localmente (opcional)**
Crea un archivo `.env.local` en la raíz del proyecto (no lo subas a git, ya está en `.gitignore`):
```
NEXT_PUBLIC_GEMINI_API_KEY=tu_api_key_aqui
```
Como la restricción por referrer de Google a veces bloquea `localhost`, durante pruebas locales puedes usar temporalmente una key sin restricción, y solo restringir la que subes a producción.

**5. Agrega la key como secreto en GitHub (para el deploy automático)**
1. En tu repositorio de GitHub → **Settings → Secrets and variables → Actions**.
2. **New repository secret**.
3. Nombre: `GEMINI_API_KEY`. Valor: tu API key.
4. Guarda. El workflow (`.github/workflows/deploy.yml`) ya está configurado para inyectarla como `NEXT_PUBLIC_GEMINI_API_KEY` durante el build:
   ```yaml
   - run: npm run build
     env:
       NEXT_PUBLIC_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
   ```

**6. Haz commit y push** — el siguiente deploy ya incluirá el chatbot funcionando.

### Archivos involucrados
- `lib/github.ts` — trae tus repos públicos desde la API de GitHub.
- `lib/gemini.ts` — llama a la API REST de Gemini (`gemini-3.6-flash`) desde el navegador.

> **Nota:** Google retira modelos de Gemini con el tiempo (ej. `gemini-2.0-flash` dejó de estar disponible). Si en el futuro el chat te da un error `404 ... is no longer available`, entra a la [lista de modelos vigentes](https://ai.google.dev/gemini-api/docs/models) y actualiza la constante `GEMINI_MODEL` en `lib/gemini.ts` por el nombre del modelo "flash" más reciente.
- `components/ChatBot.tsx` — la interfaz de conversación.
- `lib/data.ts` → `githubConfig.username` y `appColors.chat`.

## 😼 Gato Dejavoo (chat con Groq, sobre hobbies/programación/humor)

Un tercer agente, con su propia personalidad: **habla de hobbies, programación y humor de programación**, con un tono simpático y didáctico. Usa la API de **Groq** (empresa de inferencia rápida, no confundir con "Grok" de xAI — el nombre se parece pero son compañías distintas).

### Por qué esto necesita un paso extra (a diferencia de Gemini)

Con Gemini pudimos llamar a la API directo desde el navegador, protegiendo la key con una restricción por dominio. Con **Groq no se puede hacer eso**: verificamos que su API bloquea las peticiones hechas directo desde el navegador (CORS) — no expone el header `access-control-allow-origin`. Por eso este chat necesita un pequeño intermediario: un **Cloudflare Worker gratuito** que:
1. Guarda tu API key de Groq de forma segura (nunca llega al navegador del visitante).
2. Le agrega a la respuesta los headers CORS que a Groq le faltan.

### Paso a paso

**1. Consigue tu API key de Groq (gratis, sin tarjeta)**
1. Entra a [console.groq.com](https://console.groq.com) y crea una cuenta.
2. Ve a **"API Keys"** → **"Create API Key"**.
3. Cópiala (empieza con `gsk_...`).

**2. Instala Wrangler (CLI de Cloudflare) y crea una cuenta gratis**
```bash
npm install -g wrangler
wrangler login
```

**3. Configura el Worker**
En `worker/grok-proxy.js`, cambia esta línea con tu dominio real de GitHub Pages:
```js
const ALLOWED_ORIGINS = [
  "https://tuusuario.github.io", // ← tu dominio real
  "http://localhost:3000",
];
```

**4. Guarda tu API key como secreto del Worker (no en el código)**
```bash
cd worker
wrangler secret put GROQ_API_KEY
```
Pega la key pelada, sin comillas ni espacios.

**5. Despliega el Worker**
```bash
wrangler deploy
```
Te da una URL parecida a:
```
https://grok-dejavoo-proxy.tu-subdominio.workers.dev
```

**6. Conecta tu app a esa URL**
En `lib/grok.ts`, reemplaza:
```ts
const WORKER_URL = "https://grok-dejavoo-proxy.TU-SUBDOMINIO.workers.dev";
```
por la URL real que te dio `wrangler deploy`.

**7. Probá**
```bash
npm run dev
```
Abre el ícono **"Gato Dejavoo"** y chatea. Como Groq no pide tarjeta para el tier gratis, no debería haber sorpresas de facturación.

### Personalidad y tema del agente
Está en `components/DejavooChat.tsx`, en la constante `SYSTEM_PROMPT`.

### Si el modelo deja de estar disponible
Revisa la [lista de modelos vigentes de Groq](https://console.groq.com/docs/models) y actualiza la constante `MODEL` en `worker/grok-proxy.js` (y corre `wrangler deploy` de nuevo).

### Archivos involucrados
- `worker/grok-proxy.js` + `worker/wrangler.toml` — el proxy (se despliega aparte, con Wrangler).
- `lib/grok.ts` — cliente que llama al Worker.
- `components/DejavooChat.tsx` — la interfaz de chat y la personalidad del agente.

## 📄 Pregunta un archivo (RAG con Gemini + Grok)

Una cuarta app: subís un archivo (`.txt`, `.md` o `.pdf`) y le hacés preguntas sobre su contenido. Es un **RAG** (Retrieval-Augmented Generation) simple, corriendo 100% en el navegador — no hay base de datos ni backend propio.

### Cómo funciona (sin infraestructura nueva)

1. **Extracción**: el archivo se lee en el navegador (`.txt`/`.md` directo, `.pdf` con `pdfjs-dist`). El archivo nunca se sube a ningún servidor.
2. **Chunking**: el texto se corta en fragmentos de ~900 caracteres con superposición, para no perder contexto entre fragmentos.
3. **Embeddings**: cada fragmento se convierte en un vector numérico con `gemini-embedding-001` (una sola llamada por archivo, vía `batchEmbedContents`). **Esto siempre usa Gemini** — Grok/Groq no ofrecen un endpoint de embeddings público todavía.
4. **Retrieval**: al hacer una pregunta, se calcula su embedding y se comparan (similitud coseno, calculada en JS) contra todos los fragmentos, para encontrar los 4 más relevantes.
5. **Generation**: esos 4 fragmentos + tu pregunta se mandan a **quien vos elijas responder** — Miu (Gemini) o el Gato Dejavoo (Grok, vía el Worker que ya tenés desplegado) — con la instrucción de responder solo en base a ese contexto.

### Requisitos
Ninguno nuevo — reutiliza exactamente las mismas credenciales que ya configuraste:
- `NEXT_PUBLIC_GEMINI_API_KEY` (para embeddings, y si elegís que responda Miu).
- El Worker de Groq (`lib/grok.ts` → `WORKER_URL`) si elegís que responda Dejavoo.

### Límites a tener en cuenta
- Archivos de hasta 8 MB (ajustable en `lib/fileExtract.ts` → `MAX_FILE_SIZE`).
- PDFs escaneados como imagen (sin texto seleccionable) no se pueden indexar — hace falta OCR, que no está incluido.
- El índice de embeddings vive solo en memoria del navegador: si recargás la página, hay que volver a subir el archivo.
- Si en el futuro `gemini-embedding-001` se retira, revisa los [modelos de embeddings vigentes](https://ai.google.dev/gemini-api/docs/embeddings) y actualiza la constante `EMBEDDING_MODEL` en `lib/embeddings.ts`.

### Archivos involucrados
- `lib/fileExtract.ts` — extrae texto de `.txt`/`.md`/`.pdf`.
- `lib/embeddings.ts` — chunking, embeddings (Gemini) y similitud coseno.
- `components/RagChat.tsx` — la interfaz: subida de archivo, selector Gemini/Grok, y el chat.

## 🧩 Cómo agregar una nueva "app" (sección)

1. Agrega los datos en `lib/data.ts` (y un color en `appColors` si quieres un ícono nuevo).
2. Agrega la key al tipo `AppKey` en `app/page.tsx`.
3. Copia un bloque `<AppSheet>...</AppSheet>` existente, cámbiale el ícono/gradiente y el contenido.
4. Agrégalo al arreglo `grid` (cuadrícula) y, si quieres, a `dockApps` (dock inferior).

## 🐾 Ideas para seguir extendiendo
- Reemplazar el emoji del gato por una ilustración SVG personalizada o animada (Lottie).
- Agregar más "personajes" de presentación (ej. un compañero que muestre certificaciones).
- Simular "swipe" entre páginas del home screen si agregas más apps.
- Sonidos sutiles tipo iOS al abrir/cerrar sheets.

## 📦 Dependencias principales
- `next` 14.2.35 · `react` 18 · `tailwindcss` 3 · `lucide-react` (íconos)
