# 💪 ENTRENO BRUTAL

> *El dolor es temporal, el orgullo es eterno.*

App web brutalista para registrar rutinas de gimnasio, hacer seguimiento de progreso y mantener la racha de entrenamiento. Funciona como PWA instalable en móvil.

---

## Características

- **Dos programas de entrenamiento** — Tonificar y Quemar Grasa, cada uno con su rutina semanal
- **Rutina semanal interactiva** — visualiza ejercicios por día, marca como completados, apunta el peso usado y navega entre semanas
- **GIFs de referencia** — cada ejercicio muestra una animación del movimiento vía ExerciseDB CDN
- **Registro de entrenos** — guarda duración por día directamente desde la rutina
- **Estadísticas en tiempo real** — racha de días consecutivos, entrenos esta semana y total histórico
- **Historial editable** — edita duración o elimina cualquier entreno registrado
- **Exportar historial** — descarga un `.html` con tabla completa y resumen de stats
- **PWA offline-first** — Service Worker con cache de todos los assets; instalable en Android/iOS
- **Diseño brutalista** — tipografía pesada, bordes duros, sombras offset, paleta negro/crema/rosa

---

## Stack

| Pieza | Detalle |
|---|---|
| Frontend | HTML + CSS + JS vanilla (sin frameworks) |
| Fuente | Inter via Google Fonts |
| Persistencia | `localStorage` |
| GIFs ejercicios | `static.exercisedb.dev/media/` |
| PWA | Service Worker + Web App Manifest |
| Iconos | SVG inline (Lucide) |

---

## Estructura

```
entreno-brutal/
├── index.html           # App completa (markup + estilos + lógica)
├── icon.svg             # Icono principal (mancuerna rosa sobre fondo negro)
├── icon-maskable.svg    # Icono con safe area para Android
├── manifest.webmanifest # Configuración PWA
├── sw.js                # Service Worker — cache offline-first
└── assets/
    ├── exercise-demo.webp          # Fallback imagen ejercicio
    └── exercises/                  # JPGs locales (dos poses por ejercicio)
        ├── Barbell_Hip_Thrust-0.jpg
        ├── Barbell_Hip_Thrust-1.jpg
        └── ...
```

---

## Rutinas incluidas

### Tonificar — Semana 1

| Día | Ejercicios |
|---|---|
| Lunes | Hip Thrust, Peso muerto rumano, Sentadilla, Abducciones, Curl femoral, Patada de glúteo |
| Miércoles | Jalón al pecho, Remo sentado, Pullover en polea, Vuelos laterales, Press hombro máquina, Plancha |
| Viernes | Press pecho máquina, Aperturas peck deck, Curl bíceps polea, Extensión tríceps polea, Abdominales máquina |

### Quemar Grasa — Semana 1

| Día | Ejercicios |
|---|---|
| Lunes | Cinta inclinada, Prensa de piernas, Curl femoral, Abducciones, Bicicleta estática |
| Miércoles | Elíptica, Jalón al pecho, Remo sentado, Press pecho máquina, Vuelos laterales, Plancha |
| Viernes | Hip Thrust, Peso muerto rumano, Curl bíceps mancuernas, Extensión tríceps polea, Cinta suave |

---

## Uso local

No requiere build ni dependencias. Sirve directamente con cualquier servidor estático:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .

# VS Code
# Live Server extension → Open with Live Server
```

Abre `http://localhost:8080` en el navegador. Para que el Service Worker funcione correctamente necesita `http://` o `https://` (no `file://`).

---

## Instalación como PWA

1. Abre la app en Chrome/Safari desde móvil
2. Menú del navegador → **"Añadir a pantalla de inicio"**
3. La app funciona offline tras la primera carga

---

## Persistencia de datos

Todos los datos se guardan en `localStorage` bajo la clave `entreno-brutal`. El peso por ejercicio se guarda individualmente como `peso:<NombreEjercicio>`.

Para exportar o hacer backup, usa el botón **"Descargar historial"** que genera un HTML con toda la información.

---

## Roadmap / Ideas futuras

- [ ] Semanas 2–4 en ambos programas
- [ ] Editar intensidad y notas al registrar
- [ ] Gráficas de progreso de peso por ejercicio
- [ ] Timer de descanso entre series
- [ ] Sync/backup vía JSON import-export
- [ ] Modo oscuro

---

## Licencia

MIT
