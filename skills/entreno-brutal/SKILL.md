---
name: entreno-brutal
description: "PWA de rutinas de gimnasio (repo guillesrl/gym, servida en GitHub Pages). Usar cuando se toque js/app.js, index.html, sw.js o el workflow n8n de backup, o cuando algo falle: historial vacío al cargar, backup que no llega, Service Worker que no actualiza."
trigger: /entreno-brutal
---

# /entreno-brutal

Playbook de "Entreno Brutal" (`/opt/proyectos/entreno-brutal`, repo `guillesrl/gym`, servido en `https://guillesrl.github.io/gym/`). App vanilla HTML/CSS/JS sin build ni frameworks, un único `js/app.js` con toda la lógica.

## Arquitectura

- Todo el estado vive en `localStorage` del navegador, no hay backend propio.
- Dos programas (Mujer 5 días / Hombre 3 días) definidos en `data/routines.json`, con progresión de 4 semanas que se deduce de `selectedDate`, no se elige a mano.
- Backup en dos capas, ninguna bloquea la UI:
  - Copia espejo local: `entreno-brutal` (principal) se duplica en `entreno-brutal-mirror`; si la principal aparece vacía, `loadState()` restaura desde el espejo.
  - Backup remoto a n8n: `sendBackup()` hace POST con `keepalive: true` a `AUTO_BACKUP_BASE_URL` (webhook en `n8n.guillers.es`, definido en `n8n/backup-workflow.json`). El servidor guarda un archivo JSON en disco por usuario (`backup-<usuario-saneado>.json`). Se dispara al registrar un entreno y, si pasaron 7+ días, al abrir la app (`autoBackupIfNeeded()`). Si falla (sin red, servidor caído), se traga el error y se reintenta la próxima vez — nunca debe interrumpir el registro del entreno.
  - Restauración: el botón "Restaurar desde servidor" hace GET al mismo webhook con `?user=<nombre>` y aplica el JSON recibido con `applyBackup()` (compartida con la importación manual de archivo).
- PWA con Service Worker network-first (`sw.js`, `cache: no-store` para HTML/CSS/JS/JSON) para esquivar el `max-age=600` de GitHub Pages; cache-first solo para imágenes/GIFs.

## El nombre de usuario NO se sanea en el cliente — solo en n8n

`getBackupUserName()` solo hace `.trim()` sobre lo que el usuario escribe en el prompt; no quita tildes, símbolos ni nada raro. El que sanea (a alfanumérico/espacio/guion, máx. 50 chars) es siempre el workflow de n8n, tanto al guardar como al leer — por eso el POST y el GET siguen encontrando el mismo archivo aunque el nombre crudo tenga caracteres especiales. **Si se cambia la lógica de saneo, solo hay que tocarla en `n8n/backup-workflow.json`, en los dos nodos (guardar y leer) a la vez** — no hace falta ni conviene replicarla en `app.js`.

## El webhook de backup pide un token hardcodeado, visible para cualquiera

`AUTO_BACKUP_TOKEN` (`f9f6ec0a924a28a4497df6d789dd6f53` en `js/app.js`) se manda como `?token=...` en cada POST/GET, y el workflow de n8n lo valida antes de tocar el archivo (nodo `Token válido`, si no coincide responde 401). Como el sitio es una PWA estática en GitHub Pages, **ese token es público** — cualquiera puede verlo con "ver código fuente" y llamar al webhook directamente. No es una medida de seguridad real, es solo un filtro contra bots/escaneos automáticos que prueban URLs al azar. No tratar este token como secreto ni asumir que protege los backups de otra persona: cualquiera que lo tenga puede leer o sobrescribir el backup de cualquier nombre de usuario.

## Orden de inicialización de app.js

`js/app.js` ejecuta código de módulo de arriba a abajo apenas se carga el script — no hay un `init()` que se llame al final. Eso significa que **toda variable `let`/`const` que use `loadState()` (directa o transitivamente) tiene que estar declarada ANTES de `let state = loadState();`**, o revienta por temporal dead zone (TDZ): `ReferenceError: Cannot access 'x' before initialization`, con el historial viéndose vacío y sin ningún error visible en la UI (solo en consola).

Hoy eso es `selectedDate`, `stripMonth`, `STATE_KEY`, `STATE_MIRROR_KEY` — ya hay un comentario en el propio archivo (arriba de `selectedDate`) recordándolo. Si se añade una variable module-level nueva y `loadState()`/`normalizeState()`/`getCurrentWeekCount()` empieza a usarla, verificar que quede declarada por encima de esa línea. Ante cualquier cambio en la zona de inicialización, probar recargando con datos reales en `localStorage` (no solo vacío) — el bug solo se manifiesta cuando ya hay historial que cargar.

## Bump de versión en cada cambio de HTML/CSS/JS

GitHub Pages cachea con `max-age=600`; el Service Worker es network-first así que en teoría no depende del query string, pero el query string sigue siendo lo que fuerza a navegadores/CDNs intermedios a no servir una copia vieja. En cada commit que toque `index.html`, `css/style.css` o `js/app.js`:

- `?v=N` en `index.html` para el asset que cambió (`style.css?v=N`, `app.js?v=N`)
- Si cambia `data/routines.json`, el `?v=N` de su `fetch(...)` dentro de `js/app.js`
- `CACHE_NAME` en `sw.js` (formato `entreno-brutal-vNN`) — si no se sube, el Service Worker no se reactiva y algunos clientes quedan pegados a la versión anterior

## Desplegar cambios en n8n/backup-workflow.json

Ese archivo es solo la definición versionada; el workflow real corre en `n8n.guillers.es` y hay que reimportarlo ahí a mano tras cada cambio (el MCP de n8n de este entorno no autentica contra esa instancia — `n8n_list_workflows` devuelve `AUTHENTICATION_ERROR` aunque el health check diga `connected: true`). Verificar tras importar que el nombre del workflow coincide (para no duplicarlo) y que sigue activo.

## No registrar el Service Worker más de una vez

Ya hay una nota en `index.html` sobre esto: no desregistrar/registrar el SW en cada carga — provoca un bucle infinito (`unregister` → `register` → `claim` → `controllerchange` → `reload`). El registro vive en `js/app.js` y solo ahí.
