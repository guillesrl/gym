# 💪 ENTRENO BRUTAL

> *El dolor es temporal, el orgullo es eterno.*

App web brutalista para registrar rutinas de gimnasio, hacer seguimiento de progreso y mantener la racha de entrenamiento. Funciona como PWA instalable en móvil.

---

## Características

- **Dos programas con switch Mujer / Hombre** — la rutina Mujer (5 días, Lun–Vie) o la Hombre (3 días, Lun/Mié/Vie); la selección se guarda y persiste
- **Paleta por género** — Mujer usa la paleta rosa/negro original; Hombre cambia a azul sobre blanco (claro) y verde sobre negro (oscuro), vía clase `body.hombre` en CSS
- **Encabezados con día + grupo muscular** — cada día muestra el día de la semana y el grupo trabajado (ej. `Lunes · Glúteos y Piernas 🦵`)
- **Selector de fecha con calendario** — tira de días navegable por mes (reemplaza al antiguo selector "Semana N"); arranca en hoy y permite registrar entrenos en cualquier fecha pasada, el futuro queda bloqueado
- **Progresión en 4 semanas** — series y repeticiones suben progresivamente; la semana del programa (1-4) se deduce internamente de la fecha seleccionada, aunque en pantalla ya no se numera
- **Series y reps editables** — cada ejercicio tiene inputs `series x reps` con el valor sugerido como placeholder; tu personalización se guarda por ejercicio + semana
- **GIFs 720p de referencia** — animación HD del movimiento para cada ejercicio (fitcron.com + fallbacks)
- **Registro de entrenos por día** — guarda duración por día directamente desde la rutina; el bloqueo de re-registro es por día (no global)
- **Modificar entrenos registrados** — edita fecha, duración y día de cualquier entreno del historial
- **Records personales** — detecta automáticamente cada vez que superas tu peso máximo en un ejercicio
- **Semáforo de progreso** — indicador 🟢/🟠/🔴 en la misma fila que cada récord (🟢 superaste tu marca; 🟠 sin cambios; 🔴 4 semanas estancado), ordenado igual que la lista de récords
- **Estadísticas en tiempo real** — racha de días consecutivos, entrenos de la semana y total histórico
- **Backup completo** — exporta/importa JSON con state, PRs, históricos, series/reps y preferencias
- **Exportar historial** — descarga un `.html` con tabla completa y resumen de stats
- **Frase motivacional diaria** — pool de 49 frases (7 por día) que rotan por semana del año
- **Modo oscuro** — toggle persistente con detección automática de preferencia del sistema
- **PWA con actualización instantánea** — Service Worker network-first (`cache: no-store`) para HTML/CSS/JS/JSON, así los cambios se ven al instante; cache-first solo para imágenes/GIFs (offline)
- **Diseño brutalista** — tipografía pesada, bordes duros, sombras offset, paleta negro/crema/rosa

---

## Stack

| Pieza | Detalle |
|---|---|
| Frontend | HTML + CSS + JS vanilla (sin frameworks) |
| Fuente | Inter via Google Fonts |
| Persistencia | `localStorage` |
| GIFs ejercicios | `fitcron.com` (720p) + `static.exercisedb.dev` + `raw.githubusercontent.com/yuhonas/free-exercise-db` (fallback JPG) |
| PWA | Service Worker + Web App Manifest |
| Iconos | SVG inline (Lucide) |

---

## Estructura

```
gym/
├── index.html              # Markup principal
├── css/style.css           # Estilos brutalistas
├── js/app.js               # Toda la lógica de la app
├── data/routines.json      # Definición de rutinas (4 semanas)
├── icon.svg                # Icono PWA
├── manifest.webmanifest    # Configuración PWA
├── sw.js                   # Service Worker
├── MEMORY.md               # Notas internas
└── README.md
```

---

## Rutinas

Ambos programas siguen una progresión de 4 semanas: series y repeticiones suben progresivamente y la semana se deduce automáticamente desde la fecha de inicio del programa.

### Mujer — 5 días (Lun–Vie)

- **Lunes · Glúteos y Piernas 🦵** — Hip Thrust, Zancadas, Prensa de piernas, Abducciones, Plancha
- **Martes · Espalda y Hombros 💪** — Jalón al pecho, Remo, Face pull, Pullover en polea, Plancha
- **Miércoles · Piernas y Glúteos 🍑** — Sentadilla, Peso muerto, Patada de glúteo, Isquios en máquina, Cuádriceps en máquina, Plancha
- **Jueves · Hombros y Brazos 🔥** — Press de hombro, Vuelos frontales, Vuelos laterales, Bíceps en polea, Tríceps en polea, Cardio
- **Viernes · Glúteos y Piernas 🦵** — Hip Thrust, Zancadas, Prensa de piernas, Abducciones, Plancha

### Hombre — 3 días (Lun/Mié/Vie)

- **Lunes · Pecho y Bíceps 💪** — Press de banca, Press inclinado mancuernas, Pecho en máquina, Curl con barra, Bíceps en polea, Curl de muñeca
- **Miércoles · Espalda y Tríceps 🔙** — Jalón al pecho, Remo, Pullover en polea, Tríceps en polea
- **Viernes · Pierna, Hombro y ABS 🦵** — Sentadilla, Prensa de piernas, Peso muerto, Gemelos, Press de hombro, Vuelos laterales, Vuelos frontales, Plancha

---

## Uso local

No requiere build ni dependencias. Sirve directamente con cualquier servidor estático:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .
```

Abre `http://localhost:8080` en el navegador. Para que el Service Worker funcione correctamente necesita `http://` o `https://` (no `file://`).

---

## Instalación como PWA

1. Abre la app en Chrome/Safari desde móvil
2. Menú del navegador → **"Añadir a pantalla de inicio"**
3. La app funciona offline tras la primera carga

---

## Persistencia de datos

Todo se guarda en `localStorage`:

| Clave | Contenido |
|---|---|
| `entreno-brutal` | Estado principal (workouts, racha, totales) |
| `peso:<Ejercicio>` | Peso actual en kg |
| `peso-history:<Ejercicio>` | Histórico de pesos (alimenta el semáforo de progreso) |
| `pr:<Ejercicio>` / `pr-date:<Ejercicio>` | Récord personal + fecha |
| `series:w<N>:<Ejercicio>` / `reps:w<N>:<Ejercicio>` | Personalización por semana |
| `program-start-date` | Fecha de inicio (para calcular la semana 1-4 del programa) |
| `rutina-genero` | Programa activo (`tonificar` = Mujer / `hombre`) |
| `dark-mode` | Preferencia de tema |

Usá los botones **Exportar / Importar backup** para sincronizar entre dispositivos con un JSON.

---

## Actualizar la versión

Al cambiar HTML/CSS/JS conviene bumpear:
- `?v=N` en `index.html` para los assets (actualmente `style.css?v=37`, `app.js?v=61`)
- `?v=N` en la llamada a `fetch('./data/routines.json?v=N', ...)` dentro de `js/app.js` si cambia `routines.json`
- `CACHE_NAME` en `sw.js` para forzar la activación del nuevo Service Worker (actualmente `entreno-brutal-v57`)

> La app se sirve en GitHub Pages (`https://guillesrl.github.io/gym/`), que cachea con `max-age=600`. El Service Worker network-first con `cache: no-store` evita ese retardo y sirve siempre la última versión.

---

## Licencia

MIT
