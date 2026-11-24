// Dibuja en un <canvas> la "pantalla" de cada proyecto:
//  - con URL  -> maqueta de navegador
//  - sin URL  -> maqueta de teléfono (app móvil)
// Todo el texto sale del objeto del proyecto (js/data.js).

export const SCREEN_W = 1280;
export const SCREEN_H = 720;

// Pares de color decorativos por proyecto (el primero usa el acento del tema).
const PALETTES = [
    [null, "#ffb070"],
    ["#6c8cff", "#78e0ff"],
    ["#3ddc97", "#b6f5d4"],
    ["#b57cff", "#ff8fd0"]
];

export function createScreenCanvas() {
    const c = document.createElement("canvas");
    c.width = SCREEN_W;
    c.height = SCREEN_H;
    return c;
}

// Rectángulo redondeado (sin depender de ctx.roundRect).
function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function wrap(ctx, text, maxW) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > maxW && line) {
            lines.push(line);
            line = w;
        } else line = test;
    }
    if (line) lines.push(line);
    return lines;
}

function hexA(hex, a) {
    const n = parseInt(hex.replace("#", ""), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// Bloque de texto izquierdo: título, fecha, etiquetas.
function drawInfo(ctx, p, a, b, x, y, maxW) {
    let size = 66;
    let lines;
    do {
        ctx.font = `700 ${size}px Sora, Inter, sans-serif`;
        lines = wrap(ctx, p.title, maxW);
        size -= 4;
    } while (lines.length > 3 && size > 34);
    size += 4;

    ctx.textBaseline = "top";
    ctx.fillStyle = "#f2f5fa";
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * 1.12));
    let cy = y + lines.length * size * 1.12 + 14;

    if (p.period) {
        ctx.font = "500 28px Inter, sans-serif";
        ctx.fillStyle = b;
        ctx.fillText(p.period, x, cy);
        cy += 54;
    }

    ctx.font = "600 22px Inter, sans-serif";
    let tx = x;
    (p.tags || []).forEach((t) => {
        const w = ctx.measureText(t).width + 36;
        rr(ctx, tx, cy, w, 40, 20);
        ctx.fillStyle = hexA(a, 0.16);
        ctx.fill();
        ctx.strokeStyle = hexA(a, 0.7);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#f2f5fa";
        ctx.textBaseline = "middle";
        ctx.fillText(t, tx + 18, cy + 21);
        ctx.textBaseline = "top";
        tx += w + 12;
    });
}

function drawBrowser(ctx, p, a, b) {
    const X = 40, Y = 40, W = SCREEN_W - 80, H = SCREEN_H - 80;

    // ventana
    rr(ctx, X, Y, W, H, 22);
    ctx.fillStyle = "#131a2b";
    ctx.fill();
    ctx.save();
    rr(ctx, X, Y, W, H, 22);
    ctx.clip();

    // barra superior
    ctx.fillStyle = "#0e1424";
    ctx.fillRect(X, Y, W, 72);
    [["#ff5f57", 36], ["#febc2e", 64], ["#28c840", 92]].forEach(([c, dx]) => {
        ctx.beginPath();
        ctx.arc(X + dx, Y + 36, 9, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.fill();
    });
    rr(ctx, X + 150, Y + 16, 720, 40, 20);
    ctx.fillStyle = "#1a2236";
    ctx.fill();
    let host = "";
    try { host = new URL(p.url).hostname.replace(/^www\./, ""); } catch (e) { host = p.url; }
    ctx.font = "500 21px Inter, sans-serif";
    ctx.fillStyle = "#9aa7bd";
    ctx.textBaseline = "middle";
    ctx.fillText(host, X + 200, Y + 37);
    // candado
    rr(ctx, X + 170, Y + 33, 16, 12, 3);
    ctx.fillStyle = "#9aa7bd";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(X + 178, Y + 33, 5, Math.PI, 0);
    ctx.strokeStyle = "#9aa7bd";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // fondo del contenido con degradado suave
    const g = ctx.createLinearGradient(X, Y + 72, X + W, Y + H);
    g.addColorStop(0, hexA(a, 0.16));
    g.addColorStop(1, hexA(b, 0.03));
    ctx.fillStyle = g;
    ctx.fillRect(X, Y + 72, W, H - 72);

    drawInfo(ctx, p, a, b, X + 64, Y + 150, 620);

    // bloques decorativos a la derecha
    const bg = ctx.createLinearGradient(X + 740, Y + 130, X + 1130, Y + 430);
    bg.addColorStop(0, a);
    bg.addColorStop(1, b);
    rr(ctx, X + 740, Y + 130, 390, 290, 28);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(X + 1010, Y + 230, 60, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fill();
    [[740, 450, 390], [740, 484, 300], [740, 518, 340]].forEach(([dx, dy, w]) => {
        rr(ctx, X + dx, Y + dy, w, 16, 8);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fill();
    });
    ctx.restore();

    rr(ctx, X, Y, W, H, 22);
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawPhone(ctx, p, a, b) {
    const g = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
    g.addColorStop(0, hexA(a, 0.18));
    g.addColorStop(1, "#0b0f17");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    drawInfo(ctx, p, a, b, 90, 190, 600);

    // teléfono
    const PX = 850, PY = 50, PW = 300, PH = 620;
    rr(ctx, PX, PY, PW, PH, 48);
    ctx.fillStyle = "#06090f";
    ctx.fill();
    ctx.strokeStyle = "#2c3550";
    ctx.lineWidth = 4;
    ctx.stroke();

    const sx = PX + 14, sy = PY + 14, sw = PW - 28, sh = PH - 28;
    ctx.save();
    rr(ctx, sx, sy, sw, sh, 36);
    ctx.clip();
    const sg = ctx.createLinearGradient(sx, sy, sx, sy + sh);
    sg.addColorStop(0, "#182036");
    sg.addColorStop(1, "#0e1424");
    ctx.fillStyle = sg;
    ctx.fillRect(sx, sy, sw, sh);

    // cabecera con color de acento
    const hg = ctx.createLinearGradient(sx, sy, sx + sw, sy + 150);
    hg.addColorStop(0, a);
    hg.addColorStop(1, b);
    ctx.fillStyle = hg;
    ctx.fillRect(sx, sy, sw, 170);
    ctx.font = "700 28px Sora, Inter, sans-serif";
    ctx.fillStyle = "#0b0f17";
    ctx.textBaseline = "top";
    wrap(ctx, p.title, sw - 48).slice(0, 2).forEach((l, i) => ctx.fillText(l, sx + 24, sy + 70 + i * 34));

    // tarjetas esqueleto
    for (let i = 0; i < 3; i++) {
        rr(ctx, sx + 20, sy + 190 + i * 100, sw - 40, 84, 18);
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx + 58, sy + 232 + i * 100, 22, 0, Math.PI * 2);
        ctx.fillStyle = hexA(i % 2 ? b : a, 0.8);
        ctx.fill();
        rr(ctx, sx + 94, sy + 216 + i * 100, 120, 12, 6);
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fill();
        rr(ctx, sx + 94, sy + 240 + i * 100, 84, 10, 5);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fill();
    }
    // barra de pestañas
    ctx.fillStyle = "#0a0e18";
    ctx.fillRect(sx, sy + sh - 74, sw, 74);
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(sx + 42 + i * ((sw - 84) / 3), sy + sh - 37, 10, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? a : "rgba(255,255,255,0.25)";
        ctx.fill();
    }
    ctx.restore();

    // notch
    rr(ctx, PX + PW / 2 - 46, PY + 24, 92, 24, 12);
    ctx.fillStyle = "#06090f";
    ctx.fill();
}

export function drawProjectScreen(canvas, project, index, theme = {}) {
    const ctx = canvas.getContext("2d");
    const pal = PALETTES[index % PALETTES.length];
    const a = pal[0] || theme.accent || "#ff6b4a";
    const b = pal[1];

    ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = theme.bg || "#0b0f17";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    if (project.url) drawBrowser(ctx, project, a, b);
    else drawPhone(ctx, project, a, b);
}
