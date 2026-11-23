// UI: pinta TODO el contenido desde PORTFOLIO (js/data.js) y controla los textos superpuestos.
// Sin dependencias de Three/GSAP: sirve igual cuando WebGL falla.

const $ = (id) => document.getElementById(id);
const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const chips = (arr) => arr.map((t) => `<span class="chip">${esc(t)}</span>`).join("");

export function renderContent(d) {
    // Hero
    const years = new Date().getFullYear() - d.careerStart;
    $("hero-name").textContent = d.name;
    $("hero-role").textContent = `${d.role} · ${d.headline}`;
    $("hero-meta").textContent = `${d.location} · +${years} años de experiencia`;

    // Sobre mí: tarjeta 3D = primer párrafo; versión HTML = todos
    $("about-text").textContent = d.about[0];
    $("about-body").innerHTML = d.about.map((p) => `<p>${esc(p)}</p>`).join("");

    // Proyectos (versión HTML, usada si no hay WebGL)
    $("projects-grid").innerHTML = d.projects
        .map((p) => {
            const inner = `
                <h3>${esc(p.title)}</h3>
                ${p.period ? `<p class="period">${esc(p.period)}</p>` : ""}
                <p>${esc(p.description)}</p>
                <div class="chips">${chips(p.tags)}</div>
                <span class="btn ${p.url ? "primary" : "disabled"}">${p.url ? "Ver sitio ↗" : "Próximamente"}</span>`;
            return p.url
                ? `<a class="card link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
                : `<article class="card">${inner}</article>`;
        })
        .join("");

    // Experiencia con niveles internos (Staff II / III)
    $("timeline").innerHTML = d.experience
        .map(
            (e) => `
        <li class="tl-item${e.current ? " current" : ""}">
            <article class="tl-card">
                <h3>${esc(e.role)} <span class="at">@ ${esc(e.company)}</span></h3>
                <p class="tl-meta">${esc(e.period)} · ${esc(e.type)} · ${esc(e.location)}</p>
                ${
                    e.levels
                        ? `<ol class="levels" aria-label="Progresión de cargo">${e.levels
                              .map(
                                  (l, i) =>
                                      `<li class="${i === 0 && e.current ? "now" : ""}"><strong>${esc(l.title)}</strong><span>${esc(l.period)}</span></li>`
                              )
                              .join("")}</ol>`
                        : ""
                }
                <ul class="bullets">${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
            </article>
        </li>`
        )
        .join("");

    // Skills por categoría
    $("skills-grid").innerHTML = Object.entries(d.skills)
        .map(([group, items]) => `<div class="skill-group"><h3>${esc(group)}</h3><div class="chips">${chips(items)}</div></div>`)
        .join("");

    // Educación
    $("education-list").innerHTML = d.education
        .map(
            (e) => `<article class="card flat"><h3>${esc(e.school)}</h3><p>${esc(e.degree)}</p><p class="period">${esc(e.period)}</p></article>`
        )
        .join("");

    // Cursos
    $("courses-list").innerHTML = d.courses
        .map(
            (c) =>
                `<li><span class="c-title">${esc(c.title)}</span><span class="c-meta">${esc(c.provider)} · ${esc(c.date)}</span></li>`
        )
        .join("");

    // Idiomas / pasatiempos
    $("languages-list").innerHTML = d.languages
        .map((l) => `<li><strong>${esc(l.name)}</strong><span>${esc(l.level)}</span></li>`)
        .join("");
    $("hobbies-list").innerHTML = chips(d.hobbies || []);

    // Contacto
    const links = [];
    if (d.contact.linkedin) links.push({ label: "LinkedIn", href: d.contact.linkedin });
    if (d.contact.github) links.push({ label: "GitHub", href: d.contact.github });
    $("contact-cta").innerHTML = links
        .map(
            (l, i) =>
                `<a class="btn ${i === 0 ? "primary" : ""}" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`
        )
        .join("");

    $("year").textContent = new Date().getFullYear();
}

// Menú móvil
export function initNav() {
    const toggle = $("nav-toggle");
    const nav = $("nav");
    const set = (open) => {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };
    toggle.addEventListener("click", () => set(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => e.target.closest("a") && set(false));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("open")) {
            set(false);
            toggle.focus();
        }
    });
}

// Textos superpuestos de la parte 3D (hero, tarjeta Sobre mí, tarjeta de proyecto, puntos)
export function createHud(d, { onSelectProject } = {}) {
    const hud = $("hud");
    const projects = d.projects;
    const N = projects.length;
    let current = -1;

    // puntos de progreso (botones de 44 px de área táctil)
    $("pc-dots").innerHTML = projects
        .map(
            (p, i) =>
                `<button type="button" class="dot" data-i="${i}" aria-label="Proyecto ${i + 1}: ${esc(p.title)}"><span></span></button>`
        )
        .join("");
    $("pc-dots").addEventListener("click", (e) => {
        const b = e.target.closest(".dot");
        if (b && onSelectProject) onSelectProject(Number(b.dataset.i));
    });

    function setProject(i) {
        if (i === current) return;
        current = i;
        const p = projects[i];
        $("pc-count").textContent = `Proyecto ${i + 1} de ${N}`;
        $("pc-title").textContent = p.title;
        $("pc-period").textContent = p.period || "";
        $("pc-desc").textContent = p.description;
        $("pc-tags").innerHTML = chips(p.tags);
        const link = $("pc-link");
        if (p.url) {
            link.href = p.url;
            link.textContent = "Ver sitio ↗";
            link.classList.remove("disabled");
            link.removeAttribute("aria-disabled");
            link.removeAttribute("tabindex");
            link.target = "_blank";
        } else {
            link.removeAttribute("href");
            link.removeAttribute("target");
            link.textContent = "Próximamente";
            link.classList.add("disabled");
            link.setAttribute("aria-disabled", "true");
            link.tabIndex = -1;
        }
        document.querySelectorAll("#pc-dots .dot").forEach((b, k) => {
            b.classList.toggle("active", k === i);
            if (k === i) b.setAttribute("aria-current", "true");
            else b.removeAttribute("aria-current");
        });
        const live = $("pc-live");
        live.classList.remove("swap");
        void live.offsetWidth; // reinicia la animación
        live.classList.add("swap");
    }

    return {
        setPhase(phase) {
            hud.dataset.phase = phase;
        },
        setProject
    };
}
