// Escena 3D: personaje, escritorio, monitores, luces y cámara.
// No sabe nada del scroll: expone `state` (valores que anima js/scroll.js)
// y métodos update/render/resize.
import * as THREE from "three";
import { createScreenCanvas, drawProjectScreen } from "./mockups.js";

const TAU = Math.PI * 2;
const DESK_Y = 0.75;

// Posiciones de cámara por etapa (las usa js/scroll.js).
export const CAMERA_KEYS = {
    hero: { px: 5.2, py: 2.5, pz: 4.9, tx: 0.2, ty: 1.0, tz: 0.1 },
    shoulder: { px: 0.95, py: 1.9, pz: 2.5, tx: -0.1, ty: 1.15, tz: -0.5 },
    ring: { px: 0, py: 3.0, pz: 3.4, tx: 0, ty: 2.6, tz: -2.2 },
    outro: { px: 0, py: 7.5, pz: 12.5, tx: 0, ty: 2.4, tz: -2 }
};

// Carrusel circular de monitores.
export const RING = { center: new THREE.Vector3(0, 2.6, -2.2), radius: 2.6, scale: 1.9 };

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function cssColor(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
}

const std = (color, o = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, flatShading: true, ...o });

function box(w, h, d, mat, { cast = true, receive = false } = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.castShadow = cast;
    m.receiveShadow = receive;
    return m;
}

function cyl(rt, rb, h, seg, mat, { cast = true } = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.castShadow = cast;
    return m;
}

// Cilindro entre dos puntos.
function rod(a, b, r, mat) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const m = cyl(r, r, dir.length(), 8, mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return m;
}

export function createScene(canvas, { projects, reducedMotion = false }) {
    const BG = cssColor("--bg", "#0b0f17");
    const LAMP = cssColor("--lamp", "#ffb070");
    const ACCENT = cssColor("--accent", "#ff6b4a");
    const COOL = cssColor("--cool", "#78a8ff");

    // ---------- Renderer ----------
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog(BG, 8, 22);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);

    // ---------- Estado animable (lo mueve scroll.js) ----------
    const state = {
        cam: { ...CAMERA_KEYS.hero },
        // pesos de desplazamiento lateral/vertical de la escena para dejar sitio a los textos
        w: { hero: 1, about: 0, proj: 0 },
        dim: { v: 0 }, // 0 = pantallas a pleno brillo, 1 = las que no están de frente se oscurecen
        fog: { near: 8, far: 22 }
    };

    // ---------- Luces ----------
    scene.add(new THREE.HemisphereLight(0x8aa2e0, 0x2a2438, 1.6));

    const lampLight = new THREE.SpotLight(LAMP, 90, 0, 1.0, 0.85, 1.6);
    lampLight.castShadow = true; // única fuente con sombras
    lampLight.shadow.mapSize.set(1024, 1024);
    lampLight.shadow.camera.near = 0.3;
    lampLight.shadow.camera.far = 9;
    lampLight.shadow.bias = -0.0004;
    lampLight.shadow.normalBias = 0.03;
    scene.add(lampLight, lampLight.target);

    const screenGlow = new THREE.PointLight(COOL, 7, 5, 1.6); // luz fría de las pantallas
    screenGlow.position.set(0, 1.45, 0.3);
    scene.add(screenGlow);

    const ledLight = new THREE.PointLight(ACCENT, 1.6, 2.6, 2);
    ledLight.position.set(2.0, 1.0, 0.3);
    scene.add(ledLight);

    // ---------- Suelo ----------
    const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 64), std(0x111726, { roughness: 1, flatShading: false }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const rug = new THREE.Mesh(new THREE.CircleGeometry(2.7, 48), std(0x1a2236, { roughness: 1, flatShading: false }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.005, 0.5);
    rug.receiveShadow = true;
    scene.add(rug);

    // ---------- Grupos intercambiables por modelos .glb ----------
    const parts = {
        furniture: new THREE.Group(), // escritorio + silla (+ lo que quieras del cuarto)
        character: new THREE.Group()
    };
    scene.add(parts.furniture, parts.character);

    // ---------- Escritorio ----------
    const deskW = Math.max(4.8, projects.length * 0.94 + 1.4);
    {
        const wood = std(0x3b2f2a);
        const metal = std(0x1c2233, { metalness: 0.3 });
        const top = box(deskW, 0.06, 1.0, wood, { receive: true });
        top.position.set(0, DESK_Y - 0.03, 0);
        parts.furniture.add(top);
        [-1, 1].forEach((s) => {
            const leg = box(0.06, DESK_Y - 0.06, 0.9, metal);
            leg.position.set(s * (deskW / 2 - 0.1), (DESK_Y - 0.06) / 2, 0);
            parts.furniture.add(leg);
        });
        const back = box(deskW - 0.3, 0.4, 0.03, metal);
        back.position.set(0, DESK_Y - 0.28, -0.45);
        parts.furniture.add(back);

        // silla
        const chairMat = std(0x232b42);
        const trim = std(ACCENT);
        const chair = new THREE.Group();
        chair.position.set(0, 0, 0.9);
        const seat = box(0.52, 0.08, 0.52, chairMat);
        seat.position.y = 0.46;
        const backrest = box(0.48, 0.58, 0.07, chairMat);
        backrest.position.set(0, 0.82, 0.27);
        backrest.rotation.x = 0.08;
        const stripe = box(0.1, 0.5, 0.075, trim);
        stripe.position.set(0, 0.82, 0.275);
        stripe.rotation.x = 0.08;
        const pole = cyl(0.04, 0.04, 0.3, 8, metal);
        pole.position.y = 0.27;
        chair.add(seat, backrest, stripe, pole);
        for (let i = 0; i < 5; i++) {
            const leg = box(0.34, 0.04, 0.05, metal);
            const a = (i / 5) * TAU;
            leg.position.set(Math.cos(a) * 0.17, 0.1, Math.sin(a) * 0.17);
            leg.rotation.y = -a;
            const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), metal);
            wheel.position.set(Math.cos(a) * 0.34, 0.05, Math.sin(a) * 0.34);
            chair.add(leg, wheel);
        }
        parts.furniture.add(chair);
    }

    // ---------- Torre de PC con LED ----------
    const led = { mats: [], hue: 0 };
    {
        const g = new THREE.Group();
        g.position.set(deskW / 2 - 0.45, DESK_Y, -0.05);
        const body = box(0.28, 0.6, 0.5, std(0x131826, { metalness: 0.4, roughness: 0.5 }));
        body.position.y = 0.3;
        g.add(body);
        // panel lateral de cristal (cara +X) con ventiladores
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(0.44, 0.54),
            new THREE.MeshStandardMaterial({ color: 0x0a0d16, roughness: 0.15, metalness: 0.6, transparent: true, opacity: 0.85 })
        );
        glass.rotation.y = Math.PI / 2;
        glass.position.set(0.145, 0.3, 0);
        g.add(glass);
        for (let i = 0; i < 3; i++) {
            const m = new THREE.MeshBasicMaterial({ color: ACCENT, toneMapped: false });
            led.mats.push(m);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 16), m);
            ring.rotation.y = Math.PI / 2;
            ring.position.set(0.15, 0.12 + i * 0.17, 0.06);
            g.add(ring);
        }
        const stripMat = new THREE.MeshBasicMaterial({ color: ACCENT, toneMapped: false });
        led.mats.push(stripMat);
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.5, 0.012), stripMat);
        strip.position.set(0.15, 0.3, -0.2);
        g.add(strip);
        const front = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.012, 0.012), stripMat);
        front.position.set(0, 0.55, 0.255);
        g.add(front);
        parts.furniture.add(g);
    }

    // ---------- Lámpara cálida ----------
    {
        const metal = std(0x20263a, { metalness: 0.5, roughness: 0.5 });
        const g = new THREE.Group();
        // Esquina delantera izquierda, por delante del plano de los monitores (z ≈ -0.1), para no atravesarlos.
        g.position.set(-deskW / 2 + 0.35, DESK_Y, 0.3);
        const base = cyl(0.13, 0.15, 0.04, 12, metal);
        base.position.y = 0.02;
        const p0 = new THREE.Vector3(0, 0.04, 0);
        const p1 = new THREE.Vector3(0.08, 0.58, 0);
        const p2 = new THREE.Vector3(0.4, 0.74, 0);
        const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), metal);
        elbow.position.copy(p1);
        g.add(base, rod(p0, p1, 0.014, metal), elbow, rod(p1, p2, 0.014, metal));

        const head = new THREE.Group();
        head.position.copy(p2);
        const shadeGeo = new THREE.CylinderGeometry(0.05, 0.14, 0.2, 12, 1, true);
        shadeGeo.rotateX(Math.PI / 2); // eje a lo largo de +Z
        shadeGeo.translate(0, 0, 0.08);
        const shade = new THREE.Mesh(shadeGeo, std(ACCENT, { side: THREE.DoubleSide, flatShading: false }));
        shade.castShadow = false;
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.045, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xffd9a8, toneMapped: false })
        );
        bulb.position.z = 0.1;
        head.add(shade, bulb);
        g.add(head);
        parts.furniture.add(g);

        // apunta la lámpara a la zona de trabajo
        scene.updateMatrixWorld(true);
        const headWorld = new THREE.Vector3();
        head.getWorldPosition(headWorld);
        const aim = new THREE.Vector3(-0.6, DESK_Y, 0.25);
        head.lookAt(aim);
        lampLight.position.copy(headWorld).add(new THREE.Vector3().subVectors(aim, headWorld).normalize().multiplyScalar(0.12));
        lampLight.target.position.copy(aim);
    }

    // ---------- Teclado, ratón y taza ----------
    {
        const kb = new THREE.Group();
        kb.position.set(0, DESK_Y + 0.015, 0.27);
        const kbBase = box(0.62, 0.03, 0.2, std(0x161b2b));
        kb.add(kbBase);
        const kc = document.createElement("canvas");
        kc.width = 256;
        kc.height = 80;
        const k = kc.getContext("2d");
        k.fillStyle = "#0e1220";
        k.fillRect(0, 0, 256, 80);
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 14; c++) {
                k.fillStyle = (r + c) % 7 === 0 ? ACCENT : "#2b3350";
                k.fillRect(6 + c * 17.6, 6 + r * 17.5, 14, 14);
            }
        }
        const kTex = new THREE.CanvasTexture(kc);
        kTex.colorSpace = THREE.SRGBColorSpace;
        const keys = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.18), new THREE.MeshBasicMaterial({ map: kTex }));
        keys.rotation.x = -Math.PI / 2;
        keys.position.y = 0.0165;
        kb.add(keys);
        parts.furniture.add(kb);

        const mouse = box(0.06, 0.03, 0.1, std(0x161b2b));
        mouse.position.set(0.5, DESK_Y + 0.015, 0.3);
        parts.furniture.add(mouse);

        const mug = new THREE.Group();
        mug.position.set(0.95, DESK_Y, 0.22);
        const cup = cyl(0.05, 0.045, 0.1, 10, std(ACCENT, { flatShading: false }));
        cup.position.y = 0.05;
        const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.043, 10), std(0x2a1a12));
        coffee.rotation.x = -Math.PI / 2;
        coffee.position.y = 0.092;
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 5, 8, Math.PI), std(ACCENT, { flatShading: false }));
        handle.position.set(0.052, 0.05, 0);
        handle.rotation.z = -Math.PI / 2;
        handle.castShadow = true;
        mug.add(cup, coffee, handle);
        parts.furniture.add(mug);
    }

    // ---------- Personaje (low-poly) ----------
    const typing = { enabled: true, L: null, R: null, head: null, torso: null };
    {
        const skin = std(0xe3ab8a);
        const hoodie = std(0x3b4566);
        const pants = std(0x1d2438);
        const hair = std(0x1b1512);
        const shoe = std(ACCENT);
        const g = parts.character;
        g.position.set(0, 0, 0.9);

        // piernas (sentado)
        [-1, 1].forEach((s) => {
            const thigh = box(0.16, 0.16, 0.5, pants);
            thigh.position.set(s * 0.1, 0.56, -0.24);
            const shin = box(0.14, 0.5, 0.14, pants);
            shin.position.set(s * 0.1, 0.3, -0.5);
            const foot = box(0.14, 0.08, 0.26, shoe);
            foot.position.set(s * 0.1, 0.04, -0.58);
            g.add(thigh, shin, foot);
        });
        const hips = box(0.4, 0.16, 0.28, pants);
        hips.position.set(0, 0.57, 0);
        g.add(hips);

        // torso
        const torso = new THREE.Group();
        torso.position.set(0, 0.62, 0);
        torso.rotation.x = -0.1;
        g.add(torso);
        const chest = box(0.44, 0.54, 0.27, hoodie);
        chest.position.y = 0.28;
        const neck = cyl(0.06, 0.07, 0.08, 6, skin);
        neck.position.y = 0.58;
        torso.add(chest, neck);

        // cabeza
        const head = new THREE.Group();
        head.position.y = 0.76;
        torso.add(head);
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), skin);
        skull.castShadow = true;
        const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.162, 8, 6, 0, TAU, 0, Math.PI * 0.58), hair);
        hairCap.rotation.x = -0.35;
        hairCap.position.set(0, 0.015, 0.012);
        hairCap.castShadow = true;
        const nose = box(0.03, 0.04, 0.04, skin);
        nose.position.set(0, -0.01, -0.15);
        const eyeMat = std(0x10131c);
        const eyeL = box(0.025, 0.03, 0.02, eyeMat);
        eyeL.position.set(-0.05, 0.02, -0.14);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.05;
        // auriculares
        const hp = std(0x252c44);
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.016, 6, 14, Math.PI), hp);
        band.rotation.z = 0;
        band.rotation.y = Math.PI / 2;
        band.position.y = 0.0;
        band.castShadow = true;
        const cupL = cyl(0.06, 0.06, 0.05, 8, std(ACCENT));
        cupL.rotation.z = Math.PI / 2;
        cupL.position.set(-0.17, 0, 0);
        const cupR = cupL.clone();
        cupR.position.x = 0.17;
        head.add(skull, hairCap, nose, eyeL, eyeR, band, cupL, cupR);

        // brazos: hombro -> antebrazo -> mano
        const makeArm = (s) => {
            const shoulder = new THREE.Group();
            shoulder.position.set(s * 0.285, 0.5, 0);
            const up = new THREE.Group();
            up.rotation.x = 0.95;
            const upMesh = box(0.11, 0.3, 0.11, hoodie);
            upMesh.position.y = -0.15;
            const fore = new THREE.Group();
            fore.position.y = -0.3;
            fore.rotation.x = 0.78;
            const foreMesh = box(0.095, 0.3, 0.095, hoodie);
            foreMesh.position.y = -0.15;
            const hand = box(0.09, 0.05, 0.11, skin);
            hand.position.y = -0.32;
            fore.add(foreMesh, hand);
            up.add(upMesh, fore);
            shoulder.add(up);
            torso.add(shoulder);
            return { up, fore, hand };
        };
        typing.L = makeArm(-1);
        typing.R = makeArm(1);
        typing.head = head;
        typing.torso = torso;
    }

    // ---------- Monitores ----------
    const MON_W = 0.86;
    const MON_H = (MON_W * 9) / 16;
    const carousel = new THREE.Group();
    carousel.position.copy(RING.center);
    scene.add(carousel);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const theme = { accent: ACCENT, bg: BG };
    const bezelMat = std(0x0e121d, { roughness: 0.4, metalness: 0.4 });
    const standMat = std(0x1c2233, { metalness: 0.5 });
    const monitors = [];
    const N = projects.length;
    const spacing = 0.94;

    projects.forEach((project, i) => {
        const canvasEl = createScreenCanvas();
        drawProjectScreen(canvasEl, project, i, theme);
        const tex = new THREE.CanvasTexture(canvasEl);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, maxAniso);

        const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
        const obj = new THREE.Group(); // posición/rotación/escala animadas por scroll.js
        const inner = new THREE.Group(); // flotación suave
        obj.add(inner);

        const bezel = new THREE.Mesh(new THREE.BoxGeometry(MON_W + 0.06, MON_H + 0.06, 0.04), bezelMat);
        bezel.castShadow = true;
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(MON_W, MON_H), screenMat);
        screen.position.z = 0.021;

        const stand = new THREE.Group();
        stand.position.y = -(MON_H / 2 + 0.03);
        const neck = box(0.05, 0.26, 0.03, standMat);
        neck.position.set(0, -0.13, -0.035);
        const foot = box(0.3, 0.015, 0.2, standMat);
        foot.position.set(0, -0.2575, -0.02);
        stand.add(neck, foot);
        inner.add(bezel, screen, stand);

        // posición sobre el escritorio (arco suave hacia el personaje)
        const c = i - (N - 1) / 2;
        const deskWorld = new THREE.Vector3(c * spacing, DESK_Y + 0.0075 + 0.26 + 0.03 + MON_H / 2, -0.22 + Math.abs(c) * 0.07);
        const deskRotY = -c * 0.16;
        const theta = (i / N) * TAU;
        const desk = { pos: deskWorld.clone().sub(RING.center), rotY: deskRotY };
        const ring = {
            pos: new THREE.Vector3(Math.sin(theta) * RING.radius, 0, Math.cos(theta) * RING.radius),
            rotY: theta
        };

        obj.position.copy(desk.pos);
        obj.rotation.y = desk.rotY;
        carousel.add(obj);
        monitors.push({ obj, inner, stand, screenMat, tex, canvasEl, project, desk, ring, theta });
    });

    // Redibuja con las fuentes ya cargadas (Sora/Inter) para que el texto no salga en fallback.
    const redrawScreens = () => {
        monitors.forEach((m, i) => {
            drawProjectScreen(m.canvasEl, m.project, i, theme);
            m.tex.needsUpdate = true;
        });
        api.dirty = true;
    };
    if (document.fonts && document.fonts.load) {
        Promise.all([
            document.fonts.load("700 56px Sora"),
            document.fonts.load("600 28px Sora"),
            document.fonts.load("500 24px Inter"),
            document.fonts.load("600 22px Inter")
        ])
            .then(redrawScreens)
            .catch(() => {});
    }

    // ---------- Cámara responsive ----------
    let W = 1, H = 1, camScale = 1;
    const tgt = new THREE.Vector3();
    const pos = new THREE.Vector3();

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(W, H, false);
        const aspect = W / H;
        camera.aspect = aspect;
        // En vertical: más FOV y más distancia para que el monitor activo quepa a lo ancho.
        const k = clamp(1 / aspect, 1, 2.2);
        camera.fov = 40 + (k - 1) * 14;
        camScale = 1 + (k - 1) * 0.55;
        camera.updateProjectionMatrix();
        api.dirty = true;
    }

    // Desplazamiento de la escena (fracción del viewport) para hacer sitio a los textos.
    function layoutShift() {
        const portrait = W / H < 0.95;
        const s = state.w;
        return portrait
            ? { x: 0, y: s.hero * 0.17 - s.about * 0.17 - s.proj * 0.19 }
            : { x: s.hero * 0.15 + s.about * 0.17 - s.proj * 0.16, y: 0 };
    }

    function updateCamera() {
        const c = state.cam;
        tgt.set(c.tx, c.ty, c.tz);
        pos.set(c.px, c.py, c.pz).sub(tgt).multiplyScalar(camScale).add(tgt);
        camera.position.copy(pos);
        camera.lookAt(tgt);
        const sh = layoutShift();
        camera.setViewOffset(W, H, -sh.x * W, -sh.y * H, W, H);
    }

    // ---------- Bucle de animación ----------
    let mixer = null;
    const tmpColor = new THREE.Color();

    function update(time, dt) {
        const t = time;

        // brillo de pantallas según cuánto miran al frente
        const rot = carousel.rotation.y;
        monitors.forEach((m, i) => {
            const f = Math.max(0, Math.cos(rot + m.theta));
            const b = 1 - state.dim.v * (1 - f * f) * 0.84;
            m.screenMat.color.setScalar(b);
            m.inner.position.y = reducedMotion ? 0 : Math.sin(t * 1.1 + i * 1.7) * 0.035 * state.dim.v;
        });

        scene.fog.near = state.fog.near;
        scene.fog.far = state.fog.far;

        if (!reducedMotion) {
            if (mixer) mixer.update(dt);
            if (typing.enabled) {
                [typing.L, typing.R].forEach((a, i) => {
                    const ph = i * 2.1;
                    a.fore.rotation.x = 0.78 + Math.sin(t * 11 + ph) * 0.05;
                    a.up.rotation.x = 0.95 + Math.sin(t * 5.3 + ph) * 0.018;
                    a.hand.position.y = -0.32 + Math.sin(t * 13 + ph * 1.7) * 0.006;
                });
                typing.head.rotation.y = Math.sin(t * 0.45) * 0.14;
                typing.head.rotation.x = Math.sin(t * 0.9) * 0.02;
                typing.torso.scale.y = 1 + Math.sin(t * 1.6) * 0.006;
            }
            // LED RGB lento y parpadeo mínimo de la lámpara
            led.hue = (t * 0.06) % 1;
            tmpColor.setHSL(led.hue, 0.9, 0.58);
            led.mats.forEach((m) => m.color.copy(tmpColor));
            ledLight.color.copy(tmpColor);
            lampLight.intensity = 90 * (1 + Math.sin(t * 2.3) * 0.012);
        }

        updateCamera();
    }

    function render() {
        renderer.render(scene, camera);
        api.dirty = false;
    }

    // ---------- Punto de entrada para modelos GLTF (ver js/models.js) ----------
    function mountModel(slot, gltf, opts = {}) {
        const holder = parts[slot];
        if (!holder) {
            console.warn(`[scene] slot de modelo desconocido: "${slot}" (usa "character" o "furniture")`);
            return;
        }
        // quita la versión procedural
        while (holder.children.length) holder.remove(holder.children[0]);
        const model = gltf.scene;
        if (opts.position) model.position.fromArray(opts.position);
        if (opts.rotation) model.rotation.set(...opts.rotation);
        if (opts.scale) model.scale.setScalar(opts.scale);
        holder.position.set(0, 0, 0);
        model.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
        holder.add(model);
        if (slot === "character") {
            typing.enabled = false;
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(model);
                mixer.clipAction(gltf.animations[0]).play();
            }
        }
        api.dirty = true;
    }

    const api = {
        renderer,
        scene,
        camera,
        state,
        monitors,
        carousel,
        ring: RING,
        keys: CAMERA_KEYS,
        dirty: true,
        resize,
        update,
        render,
        mountModel
    };

    resize();
    window.addEventListener("resize", resize);
    return api;
}
