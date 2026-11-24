// Punto de entrada. Contenido (siempre) -> escena 3D + scroll (si WebGL y librerías funcionan).
import { renderContent, initNav, createHud } from "./ui.js";

const data = PORTFOLIO; // global definido por js/data.js
const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useFallback(reason) {
    console.warn("[portafolio] Modo HTML sin 3D:", reason);
    root.classList.remove("is-loading", "has-3d");
    root.classList.add("no-3d");
}

// 1) El contenido HTML siempre se pinta: es la versión de respaldo y las secciones finales.
renderContent(data);
initNav();

// 2) Intenta levantar la experiencia 3D.
async function start3D() {
    if (!window.gsap || !window.ScrollTrigger) throw new Error("GSAP/ScrollTrigger no cargaron");
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("WebGL no disponible");

    const { createScene } = await import("./scene.js");
    const { createScroll } = await import("./scroll.js");
    const { loadModels } = await import("./models.js");

    const sceneApi = createScene(document.getElementById("scene"), { projects: data.projects, reducedMotion });
    sceneApi.paused = false;

    const hud = createHud(data, { onSelectProject: (i) => scroll.goTo(`project${i}`) });
    const scroll = createScroll(sceneApi, { reducedMotion });
    hud.setProject(0);

    // Anclas: "Proyectos" y el cue "Desliza" navegan dentro del timeline.
    document.addEventListener("click", (e) => {
        const a = e.target.closest('a[href="#projects"], [data-goto]');
        if (!a) return;
        e.preventDefault();
        scroll.goTo(a.dataset.goto || "projects");
    });
    if (location.hash === "#projects") setTimeout(() => scroll.goTo("projects"), 50);

    // Si se pierde el contexto WebGL, vuelve a la versión HTML.
    sceneApi.renderer.domElement.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        sceneApi.paused = true;
        useFallback("contexto WebGL perdido");
    });

    // Bucle: el ticker de GSAP va en sincronía con el scroll suavizado.
    let lastPhase = "";
    window.gsap.ticker.add((time, deltaMs) => {
        if (sceneApi.paused) return;
        sceneApi.update(time, Math.min(deltaMs, 100) / 1000);
        if (!reducedMotion || sceneApi.dirty) sceneApi.render();

        const phase = scroll.phaseAt(scroll.tl.time());
        if (phase !== lastPhase) {
            lastPhase = phase;
            hud.setPhase(phase);
        }
        hud.setProject(scroll.projectIndex());
    });

    // Indicador "Desliza": siempre visible hasta que el contenido sólido cubre el canvas.
    const hint = document.getElementById("scroll-hint");
    const content = document.getElementById("content");
    const updateHint = () => hint.classList.toggle("hide", content.getBoundingClientRect().top < window.innerHeight * 0.6);
    hint.addEventListener("click", () => scroll.next());
    window.addEventListener("scroll", updateHint, { passive: true });
    updateHint();

    // Modelos .glb opcionales (no hace nada si no hay urls en js/models.js).
    loadModels(sceneApi);

    root.classList.remove("is-loading");
    root.classList.add("has-3d");
    window.ScrollTrigger.refresh();
    // Expuesto para depuración desde la consola
    window.__scene = { sceneApi, scroll };
}

const failSafe = setTimeout(() => root.classList.contains("is-loading") && useFallback("tiempo de espera"), 10000);
start3D()
    .catch((err) => useFallback(err && err.message ? err.message : err))
    .finally(() => clearTimeout(failSafe));
