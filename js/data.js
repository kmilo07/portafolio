// Todo el contenido del portafolio vive aquí. Edita solo este archivo.
// Textos que empiezan con "TODO:" son huecos por completar.

const PORTFOLIO = {
  name: "Juan Camilo Gil",
  role: "Desarrollador Full Stack",
  headline: "Angular · Java · Spring Boot",
  location: "Rionegro, Antioquia, Colombia",
  careerStart: 2021, // año de inicio, para calcular años de experiencia

  about: [
    "Ingeniero de Sistemas y Desarrollador Full Stack con más de 4 años de experiencia, especializado en backend. Diseño y construyo aplicaciones web y APIs REST escalables y de alto rendimiento para entornos empresariales.",
    "Stack principal: Java, Spring Boot, Spring Data JPA y Spring Security en backend, con arquitectura de microservicios y pruebas con JUnit y Mockito; Angular, TypeScript, Bootstrap y SCSS en frontend; y Oracle SQL y PL/SQL en bases de datos relacionales. Experiencia con Git, GitLab y GitFlow, y formación continua en DevOps (Docker, Jenkins, CI/CD, Kubernetes) y AWS.",
    "Trabajo bien en equipos ágiles (Scrum), aporto ideas y mantengo un aprendizaje constante como autodidacta. Actualmente Analista de Desarrollo Staff III en Quipux, donde además integro IA (agentes y desarrollo asistido) en el flujo de trabajo."
  ],

  experience: [
    {
      role: "Analista de Desarrollo",
      company: "Quipux",
      type: "Jornada completa",
      period: "mar. 2024 – actualidad",
      location: "Medellín, Antioquia",
      current: true,
      // Progresión de cargos dentro de la empresa (más reciente primero)
      levels: [
        { title: "Staff III", period: "abr. 2026 – actualidad" },
        { title: "Staff II", period: "mar. 2024 – mar. 2026" }
      ],
      bullets: [
        "Desarrollo full stack con Java, Angular y Oracle: backend con Spring Boot, Spring Data JPA y Spring Security; frontend con Angular, Bootstrap, HTML y SCSS.",
        "Diseño y exposición de APIs REST, implementando nuevas funcionalidades bajo buenas prácticas de desarrollo.",
        "Migración de proyectos y despliegue de aplicaciones.",
        "Soporte de productos y resolución de problemas en producción.",
        "Uso de IA en el ciclo de desarrollo: vibe coding, creación de skills y agentes, desarrollo de funcionalidades y generación de planes de trabajo con su ejecución."
      ]
    },
    {
      role: "Desarrollador Full Stack",
      company: "SAIMYR S.A.S",
      type: "Jornada completa",
      period: "sept. 2021 – sept. 2023",
      location: "Colombia",
      bullets: [
        "Front-end: aplicaciones web modernas con Angular, Bootstrap, HTML y SCSS.",
        "API REST con Spring Framework: creación y exposición con Spring Boot, Spring Data JPA y Spring Security.",
        "Generación de reportes con JasperReports y manejo de microservicios.",
        "Bases de datos relacionales: consultas personalizadas con Oracle SQL y uso de PL/SQL.",
        "Despliegue de aplicaciones en servidores."
      ]
    },
    {
      role: "Desarrollador",
      company: "IES S.A.S",
      type: "Jornada completa",
      period: "feb. 2021 – sept. 2021",
      location: "Colombia · Presencial",
      bullets: [
        "Desarrollo de aplicaciones con C++ y el framework Qt.",
        "Desarrollo de página web con JHipster: Java en backend y Angular en frontend.",
        "Optimización de la instalación de máquinas mediante scripts, reduciendo 40% el tiempo de elaboración."
      ]
    }
  ],

  skills: {
    Backend: ["Java", "Spring Boot", "Spring Data JPA", "Spring Security", "APIs REST", "Microservicios", "JUnit", "Mockito", "JasperReports", "JHipster", "C++"],
    Frontend: ["Angular", "Bootstrap", "HTML", "SCSS", "Ionic", "Figma"],
    Datos: ["Oracle", "Oracle SQL", "PL/SQL"],
    "DevOps y nube": ["Docker", "Jenkins", "Kubernetes", "AWS", "Azure DevOps", "CI/CD"],
    "IA aplicada": ["Vibe coding", "Agentes de IA", "Skills", "Desarrollo asistido por IA"],
    Herramientas: ["Git", "GitLab", "GitFlow", "Linux", "Scrum"]
  },

  projects: [
    {
      title: "Red House Furniture | Inspiration",
      period: "nov. 2023",
      description: "Sitio web.",
      tags: ["Web"],
      url: "" // TODO: pon el enlace si está publicado
    },
    {
      title: "World Transport Solutions",
      period: "dic. 2023",
      description: "Sitio web.",
      tags: ["Web"],
      url: ""
    },
    {
      title: "SBR fit",
      period: "En desarrollo",
      description: "Aplicación móvil.",
      tags: ["Móvil", "Ionic"],
      url: ""
    }
  ],

  education: [
    {
      school: "Universidad Católica de Oriente (UCO)",
      degree: "Ingeniero de Sistemas",
      period: "2015 – 2022"
    }
  ],

  courses: [
    { title: "DevOps: CI/CD, Jenkins y Cloud", provider: "Galaxy Training", date: "abr. 2024" },
    { title: "DevOps con Docker, Jenkins, Kubernetes, Git, GitFlow, CI y CD", provider: "Udemy", date: "ene. 2024" },
    { title: "Guía completa de JUnit y Mockito", provider: "Udemy", date: "dic. 2023" },
    { title: "Java Spring Data JPA: base de datos", provider: "Platzi", date: "jun. 2023" },
    { title: "Bootcamp DevOps", provider: "Code Woman y Perficient", date: "mar. 2023" },
    { title: "AWS Cloud Computing 101", provider: "AWS", date: "jun. 2022" },
    { title: "Curso completo de Oracle PL/SQL «De cero a avanzado»", provider: "Udemy", date: "mar. 2022" },
    { title: "Angular Forms: creación y optimización de formularios web", provider: "Platzi", date: "oct. 2021" },
    { title: "Curso de Java Spring", provider: "Platzi", date: "ago. 2021" }
  ],

  languages: [
    { name: "Español", level: "Nativo" },
    { name: "Inglés", level: "A2" }
  ],

  hobbies: ["Caminar", "Nadar", "Escuchar música", "Jugar videojuegos", "Aprender cosas nuevas", "Conocer lugares nuevos"],

  contact: {
    linkedin: "https://www.linkedin.com/in/juan-camilo-gil-40147721b",
    github: "" // TODO: pon tu URL, ej. "https://github.com/tu-usuario"
  }
};
