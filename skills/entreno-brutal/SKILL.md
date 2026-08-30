---
name: entreno-brutal
description: "PWA de rutinas de gimnasio (repo guillesrl/gym, servida en GitHub Pages). Usar cuando se toque js/app.js, index.html, sw.js o el workflow n8n de backup, o cuando algo falle: historial vacío al cargar, backup que no llega, Service Worker que no actualiza."
---

# /entreno-brutal

Playbook de "Entreno Brutal" (`/opt/proyectos/entreno-brutal`, repo `guillesrl/gym`, servido en `https://guillesrl.github.io/gym/`). App vanilla HTML/CSS/JS sin build ni frameworks, un único `js/app.js` con toda la lógica.

## Arquitectura

- Todo el estado vive en `localStorage` del navegador, no hay backend propio.
- Dos programas (Mujer 5 días / Hombre 3 días) definidos en `data/routines.json`, con progresión de 4 semanas que se deduce de `selectedDate`, no se elige a mano.
- Backup en dos capas, ninguna bloquea la UI:
  - Copia espejo local: `entreno-brutal` (principal) se duplica en `entreno-brutal-mirror`; si la principal aparece vacía, `loadState()` restaura desde el espejo.
  - Backup remoto a n8n: `sendBackup()` hace POST con `keepalive: true` al webhook definido en `n8n/backup-workflow.json`. El workflow activo persiste un payload JSON por usuario y fecha en PostgreSQL; se dispara al registrar un entreno y, si pasaron 7+ días, al abrir la app (`autoBackupIfNeeded()`). Un fallo de red nunca debe interrumpir el registro del entreno.
  - Restauración: el botón "Restaurar desde servidor" hace GET al mismo webhook con `?user=<nombre>` y aplica el JSON recibido con `applyBackup()` (compartida con la importación manual de archivo).
- PWA con Service Worker network-first (`sw.js`, `cache: no-store` para HTML/CSS/JS/JSON) para esquivar el `max-age=600` de GitHub Pages; cache-first solo para imágenes/GIFs.

## Identidad y acceso al backup

`getBackupUserName()` conserva el nombre introducido salvo `.trim()`. El POST y el GET deben usar la misma identidad sin normalizaciones divergentes, porque PostgreSQL la usa como `user_id`. El token que viaja en la PWA es público por diseño; no debe tratarse como una barrera de seguridad ni imprimirse en informes.

## Orden de inicialización de app.js

`js/app.js` ejecuta código de módulo de arriba a abajo apenas se carga el script — no hay un `init()` que se llame al final. Eso significa que **toda variable `let`/`const` que use `loadState()` (directa o transitivamente) tiene que estar declarada ANTES de `let state = loadState();`**, o revienta por temporal dead zone (TDZ): `ReferenceError: Cannot access 'x' before initialization`, con el historial viéndose vacío y sin ningún error visible en la UI (solo en consola).

Hoy eso es `selectedDate`, `stripMonth`, `STATE_KEY`, `STATE_MIRROR_KEY` — ya hay un comentario en el propio archivo (arriba de `selectedDate`) recordándolo. Si se añade una variable module-level nueva y `loadState()`/`normalizeState()`/`getCurrentWeekCount()` empieza a usarla, verificar que quede declarada por encima de esa línea. Ante cualquier cambio en la zona de inicialización, probar recargando con datos reales en `localStorage` (no solo vacío) — el bug solo se manifiesta cuando ya hay historial que cargar.

## Bump de versión en cada cambio de HTML/CSS/JS

GitHub Pages cachea con `max-age=600`; el Service Worker es network-first así que en teoría no depende del query string, pero el query string sigue siendo lo que fuerza a navegadores/CDNs intermedios a no servir una copia vieja. En cada commit que toque `index.html`, `css/style.css` o `js/app.js`:

- `?v=N` en `index.html` para el asset que cambió (`style.css?v=N`, `app.js?v=N`)
- Si cambia `data/routines.json`, el `?v=N` de su `fetch(...)` dentro de `js/app.js`
- `CACHE_NAME` en `sw.js` (formato `entreno-brutal-vNN`) — si no se sube, el Service Worker no se reactiva y algunos clientes quedan pegados a la versión anterior

## Workflow de backup en n8n

`n8n/backup-workflow.json` es la definición versionada del workflow activo. El webhook usa métodos `POST`, `GET` y `OPTIONS`: POST guarda en PostgreSQL, GET lee el último backup y OPTIONS responde el preflight CORS. Tras modificarlo, importar o actualizar el workflow existente, activarlo y comprobar las tres respuestas: éxito, 404 sin backup y preflight CORS. No crear un workflow duplicado.

## Ayudas visuales de ejercicios

`exerciseImageMap` contiene los GIFs principales de ExerciseDB; `exerciseDirectImageMap` tiene prioridad y solo debe usarse si el movimiento coincide exactamente. `getExerciseImageCandidates()` prueba imagen personalizada, GIF directo, GIF de ExerciseDB y JPG de respaldo. Antes de cambiar un mapeo, verificar la URL y que el gesto, el agarre y el equipamiento sean correctos; añadir una foto solo como fallback cuando no exista un GIF fiable.

## No registrar el Service Worker más de una vez

Ya hay una nota en `index.html` sobre esto: no desregistrar/registrar el SW en cada carga — provoca un bucle infinito (`unregister` → `register` → `claim` → `controllerchange` → `reload`). El registro vive en `js/app.js` y solo ahí.
