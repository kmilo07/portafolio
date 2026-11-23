// Cargador GLTF opcional.
//
// Por defecto (url: null) la escena usa el personaje y el escritorio hechos con primitivas.
// Para cambiarlos por un .glb:
//   1. Copia el archivo a assets/models/ (por ejemplo assets/models/personaje.glb).
//   2. Pon su ruta en `url` del slot correspondiente y ajusta position/rotation/scale.
//   3. Recarga. Si el archivo falla al cargar, se conserva la versión procedural.
//
// Slots:
//   character -> reemplaza al personaje. Origen en el suelo, mirando hacia -Z, sentado frente al
//                escritorio (la silla procedural NO se quita: viene en "furniture").
//                Si el .glb trae animaciones se reproduce la primera en bucle (p. ej. teclear).
//   furniture -> reemplaza escritorio, silla, torre, lámpara, teclado y taza.
//                Los monitores NO forman parte de este slot: son los proyectos y los controla el scroll.
//
// Tips de exportación (Blender): glTF Binary (.glb), +Y arriba, aplicar transformaciones (Ctrl+A),
// escala en metros (el escritorio mide ~0.75 m de alto; la escena está en esa escala).

export const MODELS = {
    character: {
        url: null, // ej. "assets/models/personaje.glb"
        position: [0, 0, 0.9],
        rotation: [0, 0, 0],
        scale: 1
    },
    furniture: {
        url: null, // ej. "assets/models/escritorio.glb"
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1
    }
};

export async function loadModels(sceneApi, config = MODELS) {
    const entries = Object.entries(config).filter(([, c]) => c && c.url);
    if (!entries.length) return; // nada que cargar: no se descarga ni el GLTFLoader

    // Import dinámico: solo se descarga el loader si de verdad hay modelos.
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const loader = new GLTFLoader();
    // Si tu .glb usa compresión Draco/Meshopt, registra aquí DRACOLoader / MeshoptDecoder.

    await Promise.all(
        entries.map(async ([slot, cfg]) => {
            try {
                const gltf = await loader.loadAsync(cfg.url);
                sceneApi.mountModel(slot, gltf, cfg);
            } catch (err) {
                console.warn(`[models] No se pudo cargar "${cfg.url}" (${slot}). Se usa el modelo procedural.`, err);
            }
        })
    );
}
