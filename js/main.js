(function () {
    const d = PORTFOLIO;
    const $ = (id) => document.getElementById(id);

    const esc = (s) =>
        String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    // Hero
    const years = new Date().getFullYear() - d.careerStart;
    $("hero-name").textContent = d.name;
    $("hero-role").textContent = `${d.role} · ${d.headline}`;
    $("hero-meta").textContent = `${d.location} · +${years} años de experiencia`;

    const links = [];
    if (d.contact.linkedin) links.push({ label: "LinkedIn", href: d.contact.linkedin });
    if (d.contact.github) links.push({ label: "GitHub", href: d.contact.github });

    const linkBtns = links
        .map((l) => `<a class="btn" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`)
        .join("");

    $("hero-cta").innerHTML = `<a class="btn primary" href="#experience">Ver experiencia</a>${linkBtns}`;
    $("contact-cta").innerHTML = linkBtns || "<p>Agrega tus enlaces en js/data.js</p>";

    // About
    $("about-body").innerHTML = d.about.map((p) => `<p>${esc(p)}</p>`).join("");

    // Experience
    $("timeline").innerHTML = d.experience
        .map(
            (e) => `
        <li class="tl-item${e.current ? " current" : ""}">
            <article class="tl-card">
                <h3>${esc(e.role)} <span class="at">@ ${esc(e.company)}</span></h3>
                <p class="tl-meta">${esc(e.period)} · ${esc(e.type)} · ${esc(e.location)}</p>
                ${
                    e.levels
                        ? `<ul class="levels">${e.levels
                              .map((l) => `<li><strong>${esc(l.title)}</strong> <span>${esc(l.period)}</span></li>`)
                              .join("")}</ul>`
                        : ""
                }
                <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
            </article>
        </li>`
        )
        .join("");

    // Skills
    $("skills-grid").innerHTML = Object.entries(d.skills)
        .map(
            ([group, items]) => `
        <div class="skill-group">
            <h3>${esc(group)}</h3>
            <div class="chips">${items.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>
        </div>`
        )
        .join("");

    // Projects
    $("projects-grid").innerHTML = d.projects
        .map((p) => {
            const inner = `
            <h3>${esc(p.title)}</h3>
            ${p.period ? `<p class="period">${esc(p.period)}</p>` : ""}
            <p>${esc(p.description)}</p>
            <div class="chips">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>`;
            return p.url
                ? `<a class="card link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
                : `<article class="card">${inner}</article>`;
        })
        .join("");

    // Education
    $("education-list").innerHTML = d.education
        .map(
            (e) => `
        <article class="card">
            <h3>${esc(e.school)}</h3>
            <p>${esc(e.degree)}</p>
            <p class="period">${esc(e.period)}</p>
        </article>`
        )
        .join("");

    // Courses
    $("courses-list").innerHTML = d.courses
        .map(
            (c) => `
        <li class="tl-item">
            <article class="tl-card">
                <h3>${esc(c.title)}</h3>
                <p class="tl-meta">${esc(c.provider)} · ${esc(c.date)}</p>
            </article>
        </li>`
        )
        .join("");

    // Languages + hobbies
    $("languages-list").innerHTML = d.languages
        .map((l) => `<li><span>${esc(l.name)}</span><span class="level">${esc(l.level)}</span></li>`)
        .join("");
    $("hobbies-list").innerHTML = d.hobbies.map((h) => `<span class="chip">${esc(h)}</span>`).join("");

    // Aviso en consola de TODOs pendientes
    const pending = JSON.stringify(d).match(/TODO[^"]*/g);
    if (pending) console.info(`Portafolio: ${pending.length} TODO pendientes en js/data.js`, pending);

    // Footer
    $("year").textContent = new Date().getFullYear();

    // Menú móvil
    const toggle = document.querySelector(".nav-toggle");
    const nav = $("nav");
    toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            nav.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        }
    });

    // Reveal + link activo
    const reveals = document.querySelectorAll(".reveal");
    const links2 = document.querySelectorAll(".nav a");

    if (!("IntersectionObserver" in window)) {
        reveals.forEach((r) => r.classList.add("visible"));
        return;
    }

    const revealObs = new IntersectionObserver(
        (entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add("visible"), revealObs.unobserve(en.target))),
        { threshold: 0.1 }
    );
    reveals.forEach((r) => revealObs.observe(r));

    const activeObs = new IntersectionObserver(
        (entries) =>
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    links2.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
                }
            }),
        { rootMargin: "-40% 0px -55% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((s) => activeObs.observe(s));
})();
