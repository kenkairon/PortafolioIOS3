export const perfil = {
  nombre: "Carlos Enrique Vásquez Colimilla",
  rol: "Desarrollador Web Full Stack",
  objetivo:
    "Desarrollador Full Stack con experiencia en JavaScript, Ruby on Rails y Python (Django), especializado en aplicaciones web escalables y de alto rendimiento. Dominio de front-end (HTML5, CSS, JavaScript) y back-end (Node.js, Ruby on Rails, Django), además de bases de datos MySQL y PostgreSQL. Formado en tres bootcamps de Talento Digital, con experiencia en proyectos colaborativos aplicando control de versiones (GitHub) y metodologías ágiles.",
  sobreMi:
    "Desarrollador Full Stack enfocado en la optimización de bases de datos y el equilibrio entre front-end y back-end para crear aplicaciones funcionales y atractivas. Busco un entorno donde crecer profesionalmente, asumir nuevos retos y aportar valor con mi trabajo.",
  intereses: [
    "Fútbol",
    "Ping pong",
    "Gastronomía chilena y asiática",
    "Anime",
    "Música clásica y rock progresivo",
    "Bailar",
    "Cantar",
  ],
};

export const habilidades = [
  { nombre: "HTML5", nivel: 90 },
  { nombre: "CSS3", nivel: 85 },
  { nombre: "JavaScript", nivel: 85 },
  { nombre: "Bootstrap", nivel: 80 },
  { nombre: "Ruby on Rails", nivel: 75 },
  { nombre: "Node.js", nivel: 75 },
  { nombre: "Python", nivel: 80 },
  { nombre: "Django", nivel: 78 },
  { nombre: "Selenium", nivel: 70 },
  { nombre: "JUnit & Mockito", nivel: 65 },
  { nombre: "Cucumber & Gherkin", nivel: 65 },
  { nombre: "Postman & Newman", nivel: 72 },
  { nombre: "JMeter", nivel: 60 },
];

export const proyectos = [
  {
    titulo: "Portafolio Profesional Online",
    descripcion:
      "Facilita la creación de un CV profesional, permitiendo ingresar datos en tiempo real y generar automáticamente un formato listo para impresión.",
    stack: ["Django", "JavaScript", "SQLite3"],
  },
  {
    titulo: "Home Specialist",
    descripcion:
      "Plataforma que conecta personas con especialistas técnicos por área, con filtros de búsqueda y contacto directo con profesionales.",
    stack: ["JavaScript", "Bootstrap"],
  },
  {
    titulo: "Cuadro de Mando Integral",
    descripcion:
      "Aplicación web responsiva para visualizar métricas e indicadores estratégicos, con diseño optimizado para dispositivos móviles.",
    stack: ["JavaScript", "Bootstrap"],
  },
  {
    titulo: "Automatización de Pruebas",
    descripcion:
      "Especialización en pruebas funcionales, BDD, API y de rendimiento, integrando frameworks de testing y CI/CD para garantizar calidad de software.",
    stack: ["Selenium", "JUnit/Mockito", "Cucumber/Gherkin", "Postman/Newman", "JMeter", "CI/CD"],
  },
];

export const certificaciones = [
  {
    titulo: "Emprendimientos de tipo Startup — Inteligencia Humana",
    entidad: "Talento Digital",
  },
  {
    titulo: "Full Stack JavaScript — Trainee",
    entidad: "Talento Digital",
  },
  {
    titulo: "Full Stack Python — Trainee",
    entidad: "Talento Digital",
  },
];

export const contacto = {
  portafolio: "https://portafoliodevcevasquez.netlify.app",
};

// Usuario de GitHub del que el chatbot lee los repositorios públicos.
// Cámbialo por tu usuario real.
export const githubConfig = {
  username: "TU_USUARIO_GITHUB",
};

// Fondos de escritorio: imágenes reales (SVG) en /public/wallpapers.
// Para usar tus propias fotos: coloca un .jpg/.png en public/wallpapers/
// y cambia el nombre de archivo abajo, ej: "mi-foto.jpg"
// BASE_PATH se antepone automáticamente para que funcione en GitHub Pages
// (donde el sitio vive en /PortafolioIOS) y en localhost (donde está vacío).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const wallpaperPath = (file: string) => `${BASE_PATH}/wallpapers/${file}`;

export const wallpapers = [
  { id: "bloom", nombre: "Aurora azul", src: wallpaperPath("aurora-azul.svg") },
  { id: "nocturno", nombre: "Nocturno", src: wallpaperPath("nocturno.svg") },
  { id: "aurora", nombre: "Violeta", src: wallpaperPath("violeta.svg") },
  { id: "atardecer", nombre: "Atardecer", src: wallpaperPath("atardecer.svg") },
  { id: "bosque", nombre: "Menta", src: wallpaperPath("menta.svg") },
];

// Colores de íconos tipo iOS (fondo degradado de cada "app")
export const appColors: Record<string, string> = {
  sobreMi: "linear-gradient(160deg, #34AADC, #007AFF)",
  habilidades: "linear-gradient(160deg, #34C759, #248A3D)",
  proyectos: "linear-gradient(160deg, #AF52DE, #5E5CE6)",
  certificaciones: "linear-gradient(160deg, #FFD60A, #FF9500)",
  contacto: "linear-gradient(160deg, #5AC8FA, #007AFF)",
  ajustes: "linear-gradient(160deg, #8E8E93, #636366)",
  chat: "linear-gradient(160deg, #4285F4, #9B72CB, #D96570)",
  dejavoo: "linear-gradient(160deg, #F97316, #DB2777)",
  rag: "linear-gradient(160deg, #14B8A6, #0EA5E9)",
};

// Frases del gato asistente
export const catTips = [
  "¡Miau! Prueba a escribir “Python” o “Django” en el buscador 🐾",
  "Puedes tocar cualquier ícono para abrir esa sección.",
  "En Ajustes puedes cambiar el fondo de pantalla y el modo oscuro.",
  "¿Buscas contratarlo? Toca el ícono de Contacto ✉️",
];
