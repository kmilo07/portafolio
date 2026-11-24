// Timeline GSAP atado al scroll con ScrollTrigger (scrub = suavizado).
// Las "unidades" del timeline son arbitrarias; el scroll total se reparte proporcionalmente.
//
//  u     fase
//  0.0   hero (cámara 3/4, el personaje teclea)
//  0.8   cámara -> sobre el hombro
//  2.0   tarjeta "Sobre mí"
//  3.6   monitores se despegan (desfase 0.35 c/u), suben, giran 360° y forman el carrusel
//  6.8   proyectos: 1.6 u por proyecto (0.9 quieto + 0.7 rotando)
//  ...   cámara se aleja y sube; el HTML sólido sube por encima del canvas

const TAU = Math.PI * 2;

export const T = {
    heroEnd: 1.3,
    aboutIn: 2.0,
    aboutOut: 3.5,
    detach: 3.6,
    detachStagger: 0.35,
    detachDur: 2.0,
    projects: 6.8,
    step: 1.6,
    hold: 0.9,
    turn: 0.7
};

export function createScroll(api, { reducedMotion = false, onUpdate } = {}) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const { state, monitors, carousel, ring, keys } = api;
    const N = monitors.length;
    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

    const camTo = (key, at, dur) => tl.to(state.cam, { ...keys[key], duration: dur, ease: "power2.inOut" }, at);

    // --- 1. Hero -> sobre el hombro + tarjeta "Sobre mí" ---
    camTo("shoulder", 0.8, 1.4);
    tl.to(state.w, { hero: 0, duration: 1.0, ease: "power2.inOut" }, 0.8);
    tl.to(state.w, { about: 1, duration: 1.0, ease: "power2.inOut" }, 1.4);

    // --- 2. Monitores: despegar, subir, girar 360° y acomodarse en el carrusel ---
    tl.addLabel("monitors", T.detach);
    monitors.forEach((m, i) => {
        const at = T.detach + i * T.detachStagger;
        tl.to(
            m.obj.position,
            {
                keyframes: [
                    { y: m.desk.pos.y + 0.9, duration: 0.9, ease: "power2.out" },
                    { x: m.ring.pos.x, y: m.ring.pos.y, z: m.ring.pos.z, duration: T.detachDur - 0.9, ease: "power2.inOut" }
                ]
            },
            at
        );
        tl.to(m.obj.rotation, { y: m.ring.rotY + TAU, duration: T.detachDur, ease: "power2.inOut" }, at);
        tl.to(m.obj.scale, { x: ring.scale, y: ring.scale, z: ring.scale, duration: T.detachDur, ease: "power2.inOut" }, at);
        // los soportes se esconden
        tl.to(m.stand.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.6, ease: "back.in(1.5)" }, at);
    });
    const detachEnd = T.detach + (N - 1) * T.detachStagger + T.detachDur;

    camTo("ring", T.detach, detachEnd - T.detach);
    tl.to(state.w, { about: 0, duration: 0.6, ease: "power2.inOut" }, T.detach - 0.1);
    tl.to(state.w, { proj: 1, duration: 1.2, ease: "power2.inOut" }, detachEnd - 1.4);
    tl.to(state.dim, { v: 1, duration: 1.0, ease: "power1.inOut" }, detachEnd - 1.0);

    // --- 3. Proyectos: cada paso rota el carrusel y deja un monitor de frente ---
    for (let k = 0; k < N; k++) {
        tl.addLabel(`project${k}`, T.projects + k * T.step);
        if (k < N - 1) {
            tl.to(
                carousel.rotation,
                { y: (-(k + 1) * TAU) / N, duration: T.turn, ease: "power2.inOut" },
                T.projects + k * T.step + T.hold
            );
        }
    }
    const projectsEnd = T.projects + (N - 1) * T.step + T.hold;
    tl.addLabel("projectsEnd", projectsEnd);

    // --- 4. Salida: la cámara se aleja y sube ---
    const outroAt = projectsEnd + 0.2;
    camTo("outro", outroAt, 2.0);
    tl.to(state.w, { proj: 0, duration: 1.2, ease: "power2.inOut" }, outroAt);
    tl.to(state.fog, { near: 5, far: 20, duration: 2.0, ease: "power1.inOut" }, outroAt);
    tl.addLabel("outro", outroAt);
    tl.to({}, { duration: 0.3 }, outroAt + 2.0); // cola para que el HTML llegue sin saltos

    const D = tl.duration();

    // Altura de la pista de scroll proporcional a la duración (1 unidad ≈ 55% de pantalla).
    const journey = document.getElementById("journey");
    const unitVh = window.innerWidth < 760 ? 0.62 : 0.55;
    journey.style.height = `${(1 + D * unitVh) * 100}vh`;

    tl.eventCallback("onUpdate", () => {
        api.dirty = true;
        if (onUpdate) onUpdate();
    });

    const st = ScrollTrigger.create({
        trigger: journey,
        start: "top top",
        end: "bottom bottom",
        animation: tl,
        scrub: reducedMotion ? true : 1.1 // lerp del scroll; sin retardo si el usuario pide menos movimiento
    });

    // Cuando el HTML tapa por completo el canvas se deja de renderizar.
    const covered = ScrollTrigger.create({
        trigger: "#content",
        start: "top top",
        onEnter: () => (api.paused = true),
        onLeaveBack: () => {
            api.paused = false;
            api.dirty = true;
        }
    });

    const labelTime = (name) => (name in tl.labels ? tl.labels[name] : 0);

    return {
        tl,
        st,
        covered,
        duration: D,
        labelTime,
        phaseAt(t) {
            if (t < T.heroEnd) return "hero";
            if (t >= T.aboutIn && t < T.aboutOut) return "about";
            if (t >= T.projects - 0.5 && t <= projectsEnd + 0.2) return "projects";
            return "none";
        },
        projectIndex() {
            const i = Math.round(-carousel.rotation.y / (TAU / N));
            return Math.min(N - 1, Math.max(0, i));
        },
        // Avanza a la siguiente "parada": Sobre mí -> proyecto 1 -> ... -> proyecto N -> contenido
        next() {
            const stops = [T.aboutIn + 0.4, ...Array.from({ length: N }, (_, k) => labelTime(`project${k}`)), D];
            const now = tl.time();
            const time = stops.find((t) => t > now + 0.25) ?? D;
            const y = st.start + (time / D) * (st.end - st.start);
            window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
        },
        // Lleva el scroll hasta una etiqueta del timeline ("about", "projects", "project2"…)
        goTo(name) {
            const label = name === "projects" ? "project0" : name === "about" ? "about" : name;
            const time = label === "about" ? (T.aboutIn + 0.4) : labelTime(label);
            const y = st.start + (time / D) * (st.end - st.start);
            window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
        }
    };
}
