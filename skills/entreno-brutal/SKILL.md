---
name: entreno-brutal
description: "PWA de rutinas de gimnasio (repo guillesrl/gym, servida en GitHub Pages). Usar cuando se toque js/app.js, index.html, sw.js o el workflow n8n de backup, o cuando algo falle: historial vacío al cargar, backup que no llega, Service Worker que no actualiza."
trigger: /entreno-brutal
---

# /entreno-brutal

Playbook de "Entreno Brutal" (`/opt/proyectos/entreno-brutal`, repo `guillesrl/gym`, servido en `https://guillesrl.github.io/gym/`). App vanilla HTML/CSS/JS sin build ni frameworks. Cada trampa de abajo costó una ronda de debugging real.

## Arquitectura

- Todo el estado vive en `localStorage` del navegador, no hay backend propio. `js/app.js` es un único archivo con toda la lógica (~1200 líneas).
- Dos programas (Mujer 5 días / Hombre 3 días) definidos en `data/routines.json`, con progresión de 4 semanas que se deduce de `selectedDate`, no se elige a mano.
- Backup en dos capas, ninguna bloquea la UI:
  - Copia espejo local: `entreno-brutal` (principal) se duplica en `entreno-brutal-mirror`; si la principal aparece vacía, `loadState()` restaura desde el espejo.
  - Backup remoto a n8n: `sendBackup()` hace POST con `keepalive: true` a `AUTO_BACKUP_BASE_URL` (webhook en `n8n.guillers.es`, definido en `n8n/backup-workflow.json`). El servidor guarda un archivo JSON en disco por usuario (`backup-<usuario-saneado>.json`, no Postgres — el mensaje de un commit viejo decía Postgres pero nunca fue así). Se dispara al registrar un entreno y, si pasaron 7+ días, al abrir la app (`autoBackupIfNeeded()`). Si falla (sin red, servidor caído), se traga el error y se reintenta la próxima vez — nunca debe interrumpir el registro del entreno.
  - Restauración: el botón "Restaurar desde servidor" hace GET al mismo webhook con `?user=<nombre>` y aplica el JSON recibido con `applyBackup()` (compartida con la importación manual de archivo). El nombre de usuario se sanea igual en el cliente y en n8n (solo alfanumérico/espacio/guion, máx. 50 chars) — si algún día cambia esa lógica de saneo, tiene que cambiar en los dos lados a la vez o un usuario deja de encontrar su propio backup.
- PWA con Service Worker network-first (`sw.js`, `cache: no-store` para HTML/CSS/JS/JSON) para esquivar el `max-age=600` de GitHub Pages; cache-first solo para imágenes/GIFs.

## Orden de inicialización de app.js (la trampa que más ha costado)

`js/app.js` ejecuta código de módulo de arriba a abajo apenas se carga el script — no hay un `init()` que se llame al final, las primeras líneas del archivo corren inmediatamente. Eso significa que **toda variable `let`/`const` que se use en esas primeras líneas (directa o indirectamente) tiene que estar declarada ANTES**, o revienta por temporal dead zone (TDZ): `ReferenceError: Cannot access 'x' before initialization`.

Esto pasó de verdad (commit `71ebee3`, "Fix crítico: orden de inicialización rompía el historial en cada carga"): `let state = loadState();` estaba en la línea 2. `loadState()` llama a `normalizeState()` que llama a `getCurrentWeekCount()`, la cual lee `selectedDate` — pero `selectedDate` se declaraba varias líneas más abajo. Cada carga de página lanzaba el `ReferenceError` en mitad de `loadState()`, el historial se veía vacío, y no había ningún mensaje de error visible en la UI (solo en la consola del navegador). Se coló porque el commit anterior (`f14ca31`, la copia espejo) añadió `STATE_KEY`/`STATE_MIRROR_KEY` usadas dentro de `loadState()` pero declaradas después de la llamada, mismo problema.

Regla para no reintroducirlo: **todo lo que `loadState()` toca — directa o transitivamente — va declarado antes de la línea `let state = loadState();`**. Hoy eso es `selectedDate`, `stripMonth`, `STATE_KEY`, `STATE_MIRROR_KEY`. Si se añade una variable module-level nueva y `loadState()`/`normalizeState()`/`getCurrentWeekCount()` empieza a usarla, revisar que quede por encima de esa línea. Ante cualquier cambio en la zona de inicialización, probar recargando con datos reales en `localStorage` (no solo con `localStorage` vacío) — el bug solo se manifestaba cuando ya había historial que cargar.

## Bump de versión en cada cambio de HTML/CSS/JS

GitHub Pages cachea con `max-age=600`; el Service Worker es network-first así que en teoría no depende del query string, pero el query string sigue siendo lo que fuerza a los navegadores/CDNs intermedios a no servir una copia vieja. En cada commit que toque `index.html`, `css/style.css` o `js/app.js`:

- `?v=N` en `index.html` para el asset que cambió (`style.css?v=N`, `app.js?v=N`)
- Si cambia `data/routines.json`, el `?v=N` de su `fetch(...)` dentro de `js/app.js`
- `CACHE_NAME` en `sw.js` (ej. `entreno-brutal-v64`) — si no se sube, el Service Worker no se reactiva y algunos clientes quedan pegados a la versión anterior

Los tres commits recientes de backup (`4fcbe79`, `ef49d1f`, `f14ca31`) y el fix del TDZ (`71ebee3`) tocan estos tres archivos en cada uno precisamente por esto — es el patrón esperado, no ruido.

## Desplegar cambios en n8n/backup-workflow.json

Ese archivo es solo la definición versionada; el workflow real corre en `n8n.guillers.es` y hay que reimportarlo ahí a mano tras cada cambio (el MCP de n8n de este entorno no autentica contra esa instancia — `n8n_list_workflows` devuelve `AUTHENTICATION_ERROR` aunque el health check diga `connected: true`). Verificar tras importar que el nombre del workflow coincide (para no duplicarlo) y que sigue activo.

## No registrar el Service Worker más de una vez

Ya hay una nota en `index.html` sobre esto: no desregistrar/registrar el SW en cada carga — provoca un bucle infinito (`unregister` → `register` → `claim` → `controllerchange` → `reload`). El registro vive en `js/app.js` y solo ahí.
