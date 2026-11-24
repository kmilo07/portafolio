# Portafolio 3D controlado por scroll

Three.js (0.170.0, CDN con importmap) + GSAP/ScrollTrigger (3.12.5, CDN). Sin build, sin frameworks.
Se publica tal cual en GitHub Pages.

## Ejecutar en local

Los módulos ES no funcionan con `file://`; usa un servidor estático:

```bash
python3 -m http.server 8000     # o: npx serve
# abre http://localhost:8000
```

## Estructura

| Archivo | Qué hace |
|---|---|
| `index.html` | Importmap, canvas fijo, textos superpuestos, secciones finales |
| `js/data.js` | **Única fuente de contenido** (`PORTFOLIO`) |
| `js/scene.js` | Escena 3D: personaje, escritorio, monitores, luces, cámara responsive |
| `js/mockups.js` | Dibuja la maqueta de navegador/teléfono (CanvasTexture) |
| `js/scroll.js` | Timeline GSAP + ScrollTrigger (`scrub`) |
| `js/ui.js` | Pinta el contenido, tarjetas y puntos de progreso |
| `js/models.js` | Cargador GLTF opcional |
| `js/main.js` | Orquestación y fallback sin WebGL |

## Timeline (N = 4 proyectos, ≈15 unidades)

| Scroll | Evento |
|---|---|
| 0–5 % | Hero 3/4: el personaje teclea |
| 5–15 % | Cámara sobre el hombro |
| 13–23 % | Tarjeta "Sobre mí" |
| 24–44 % | Monitores se despegan escalonados, giran 360° y forman el carrusel |
| 45–83 % | Un proyecto de frente por paso + tarjeta + puntos |
| 85–100 % | Cámara se aleja y sube; el HTML sólido sube encima |

Los tiempos están en el objeto `T` de `js/scroll.js`. Cada proyecto dura `T.step` unidades.

## Cambiar proyectos

Edita `PORTFOLIO.projects` en `js/data.js`. Cada proyecto = un monitor.

- Con `url`: maqueta de navegador y botón "Ver sitio ↗".
- Sin `url`: maqueta de teléfono y "Próximamente".
- Funciona bien con 3–6 proyectos (el escritorio y el carrusel se ajustan solos).

Experiencia, skills, cursos, idiomas y contacto también salen de `data.js`.

## Cambiar colores

En `css/style.css` (`:root`): `--bg`, `--accent` (coral), `--lamp` (luz cálida), `--cool` (luz de pantallas).
La escena 3D lee esas variables, así que se cambian en un solo sitio. Los degradados de las maquetas
por proyecto están en `PALETTES` de `js/mockups.js`.

## Cambiar el modelo 3D (.glb)

1. Crea o descarga un `.glb` (Blender, Spline, Sketchfab). Exporta glTF Binary, +Y arriba, aplica transformaciones, escala en metros.
2. Cópialo a `assets/models/`.
3. En `js/models.js` pon la ruta en `url`:

```js
export const MODELS = {
  character: { url: "assets/models/personaje.glb", position: [0, 0, 0.9], rotation: [0, 0, 0], scale: 1 },
  furniture: { url: "assets/models/escritorio.glb", position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
};
```

- `character` reemplaza al personaje procedural (mirando hacia −Z, origen en el suelo). Si trae animaciones, se reproduce la primera en bucle.
- `furniture` reemplaza escritorio, silla, torre, lámpara, teclado y taza. **Los monitores no**: son los proyectos.
- Si el archivo falla, se conserva el modelo procedural y se avisa en consola.
- Con compresión Draco/Meshopt, registra el decoder en `loadModels`.
- Ajusta `position`/`scale` probando; el escritorio mide 0.75 m de alto.

## Accesibilidad y rendimiento

- `prefers-reduced-motion`: sin bucles (teclear, LED, flotación); el scroll sigue moviendo la escena sin suavizado.
- Foco visible, botones/enlaces de 44 px, enlaces de anclas (Proyectos, Experiencia, Skills, Contacto).
- Si WebGL o las librerías fallan, se muestra todo el contenido como HTML normal.
- `pixelRatio` máx. 2, sombras solo de la lámpara, el render se pausa cuando el HTML cubre el canvas.
