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

## 😼 Gato Dejavoo (chat con Grok, sobre hobbies/programación/humor)

Un tercer agente, con su propia personalidad: **habla de hobbies, programación y humor de programación**, con un tono simpático y didáctico. Usa la API de **Grok (xAI)**.

### Por qué esto necesita un paso extra (a diferencia de Gemini)

Con Gemini pudimos llamar a la API directo desde el navegador, protegiendo la key con una restricción por dominio. Con **Grok no se puede hacer eso**: la API de xAI (`api.x.ai`) **bloquea las peticiones hechas directo desde el navegador** (CORS) y **tampoco ofrece una forma de restringir la key por dominio** como Google. Por eso este chat necesita un pequeño intermediario: un **Cloudflare Worker gratuito** que:
1. Guarda tu API key de xAI de forma segura (nunca llega al navegador del visitante).
2. Le agrega a la respuesta los headers CORS que a xAI le faltan.

Es la única forma de que esto funcione de verdad en tu sitio público sin exponer la key a cualquiera que abra las herramientas de desarrollador del navegador.

### Paso a paso

**1. Consigue tu API key de xAI**
1. Entra a [console.x.ai](https://console.x.ai) y crea una cuenta / equipo.
2. Ve a **"API Keys"** → crea una nueva key.
3. **Importante:** en el equipo/team donde crees la key, configura un **límite de crédito prepago bajo** (unos pocos dólares) en la sección de facturación. Como esta key no se puede restringir por dominio, ponerle un techo de gasto es tu principal protección si alguien llegara a copiarla.

**2. Instala Wrangler (CLI de Cloudflare) y crea una cuenta gratis**
```bash
npm install -g wrangler
wrangler login
```
(Te abre el navegador para loguearte/crear tu cuenta gratuita de Cloudflare.)

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
wrangler secret put XAI_API_KEY
```
Te va a pedir que pegues la key — queda guardada de forma segura en Cloudflare, nunca en tu repositorio.

**5. Despliega el Worker**
```bash
wrangler deploy

```
Al terminar te da una URL parecida a:
```
https://grok-dejavoo-proxy.tu-subdominio.workers.dev
```

**6. Conecta tu app a esa URL**
En `lib/grok.ts`, reemplaza:
```ts
const WORKER_URL = "https://kenkairon.workers.dev";
```
por la URL real que te dio `wrangler deploy`. (No es información sensible — es solo la dirección pública de tu proxy; la key de verdad sigue escondida adentro del Worker.)

**7. Prueba local y luego despliega tu app normalmente**
```bash
npm run dev
```
Abre el ícono **"Gato Dejavoo"** — si todo quedó bien conectado, ya puedes chatear. Luego haz el commit/push de siempre para desplegar tu portafolio.

### Personalidad y tema del agente
El "carácter" de Dejavoo (qué temas toca, su tono) está en `components/DejavooChat.tsx`, en la constante `SYSTEM_PROMPT` — edítala ahí si quieres ajustar cómo habla o de qué más temas conversa.

### Si el modelo deja de estar disponible
Igual que con Gemini, xAI también retira modelos de Grok con el tiempo. Si en el futuro el chat falla con un error de "modelo no disponible", revisa la [lista de modelos vigentes](https://docs.x.ai/docs/models) y actualiza la constante `MODEL` en `worker/grok-proxy.js` (y vuelve a correr `wrangler deploy`).

### Archivos involucrados
- `worker/grok-proxy.js` + `worker/wrangler.toml` — el proxy (se despliega aparte, con Wrangler, no con tu build de Next.js).
- `lib/grok.ts` — cliente que llama al Worker.
- `components/DejavooChat.tsx` — la interfaz de chat y la personalidad del agente.

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
