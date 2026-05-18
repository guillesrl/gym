# 💪 ENTRENO BRUTAL

> *El dolor es temporal, el orgullo es eterno.*

App web brutalista para registrar rutinas de gimnasio, hacer seguimiento de progreso y mantener la racha de entrenamiento. Funciona como PWA instalable en móvil.

---

## Características

- **Rutina de 4 días** — Lunes (Espalda), Miércoles (Glúteos y Piernas), Viernes (Hombro y Brazos), Domingo (Cuádriceps)
- **Progresión en 4 semanas** — series y repeticiones suben progresivamente, semana detectada automáticamente desde la fecha de inicio
- **Series y reps editables** — cada ejercicio tiene inputs `series x reps` con el valor sugerido como placeholder; tu personalización se guarda por ejercicio + semana
- **GIFs 720p de referencia** — animación HD del movimiento para cada ejercicio (fitcron.com + fallbacks)
- **Registro de entrenos** — guarda duración por día directamente desde la rutina
- **Records personales** — detecta automáticamente cada vez que superas tu peso máximo en un ejercicio
- **Estadísticas en tiempo real** — racha de días consecutivos, entrenos de la semana y total histórico
- **Gráfica de evolución de peso** — canvas con histórico por ejercicio
- **Historial editable** — edita duración o elimina cualquier entreno registrado
- **Backup completo** — exporta/importa JSON con state, PRs, históricos, series/reps y preferencias
- **Exportar historial** — descarga un `.html` con tabla completa y resumen de stats
- **Frase motivacional diaria** — pool de 49 frases (7 por día) que rotan por semana del año
- **Modo oscuro** — toggle persistente con detección automática de preferencia del sistema
- **PWA offline-first** — Service Worker con cache de imágenes; HTML/CSS/JS siempre desde red para actualizaciones instantáneas
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

## Rutina

Las 4 semanas siguen una progresión: Semana 1 baseline (3 series, reps bajas), Semana 2 sube reps, Semana 3 sube a 4 series, Semana 4 pico.

### Lunes — Espalda
Remo, Jalón al pecho, Pullover en polea, Face pull, Extensiones de columna en banco, ABC Abdominales, Pájaros con mancuernas

### Miércoles — Glúteos y Piernas
Hip Thrust, Peso muerto, Zancadas, Sentadilla rumana, Abducciones, Isquios en máquina

### Viernes — Hombro y Brazos
Vuelos frontales, Vuelos laterales, Press de hombro, Pecho en máquina, Bíceps en polea, Tríceps en polea, ABC Abdominales

### Domingo — Pierna (Cuádriceps)
Hip Thrust, Peso muerto, Sentadilla, Zancadas, Aducciones, Cuádriceps en máquina

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
| `peso-history:<Ejercicio>` | Histórico para gráfica de evolución |
| `pr:<Ejercicio>` / `pr-date:<Ejercicio>` | Récord personal + fecha |
| `series:w<N>:<Ejercicio>` / `reps:w<N>:<Ejercicio>` | Personalización por semana |
| `program-start-date` | Fecha de inicio (para calcular semana actual) |
| `dark-mode` | Preferencia de tema |

Usá los botones **Exportar / Importar backup** para sincronizar entre dispositivos con un JSON.

---

## Actualizar la versión

Al cambiar HTML/CSS/JS conviene bumpear:
- `?v=N` en `index.html` para los assets
- `CACHE_NAME` en `sw.js` para forzar la activación del nuevo Service Worker

---

## Licencia

MIT
