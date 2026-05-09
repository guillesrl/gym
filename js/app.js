// --- State ---
let currentWeek = 1, currentTab = 'tonificar';
let state = loadState();

function getAutoWeek() {
    const startDate = localStorage.getItem('program-start-date');
    if (!startDate) return 1;
    const start = new Date(startDate + 'T12:00:00');
    const now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(4, Math.floor(diffDays / 7) + 1));
}

const GIF_CDN = 'https://static.exercisedb.dev/media/';
const exerciseImageMap = {
    'Hip Thrust':                'SNFfUff',
    'Peso muerto rumano':        'ila4NZS',
    'Sentadilla':                'qXTaZnJ',
    'Abducciones en maquina':    'CHpahtl',
    'Curl femoral':              'Zg3XY7P',
    'Patada de gluteo':          'Kpajagk',
    'Jalon al pecho':            'eYnzaCm',
    'Remo sentado':              'fUBheHs',
    'Pullover en polea':         'PskORrA',
    'Vuelos laterales':          'DsgkuIt',
    'Press hombro maquina':      'CggQhII',
    'Plancha':                   'VBAWRPG',
    'Press pecho maquina':       'T0yTjgW',
    'Aperturas en peck deck':    'xLYSdtg',
    'Curl biceps polea':         'G08RZcQ',
    'Extension triceps polea':   '3ZflifB',
    'Abdominales en maquina':    'Wgaz7pm',
    'Cinta inclinada':           'rjiM4L3',
    'Cinta suave':               'rjiM4L3',
    'Prensa de piernas':         'V07qpXy',
    'Bicicleta estatica':        'H1PESYI',
    'Eliptica':                  'rjtuP6X',
    'Curl biceps mancuernas':    'NbVPDMW',
};

function defaultState() {
    return { streak: 0, weekCount: 0, total: 0, workouts: [], lastDate: null };
}

function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getWeekStartKey(date = new Date()) {
    const weekStart = new Date(date);
    const day = weekStart.getDay() || 7;
    weekStart.setDate(weekStart.getDate() - day + 1);
    return getLocalDateKey(weekStart);
}

function getYesterdayKey() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getLocalDateKey(yesterday);
}

function getDownloadDateLabel(date = new Date()) {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function normalizeState(saved) {
    const base = defaultState();
    const next = { ...base, ...(saved || {}) };
    next.workouts = Array.isArray(next.workouts) ? next.workouts : [];
    next.total = next.workouts.length;
    next.weekCount = getCurrentWeekCount(next.workouts);
    const today = getLocalDateKey();
    const yesterday = getYesterdayKey();
    if (next.lastDate && next.lastDate !== today && next.lastDate !== yesterday) {
        next.streak = 0;
    }
    return next;
}

function getCurrentWeekCount(workouts = state.workouts) {
    const currentWeekStart = getWeekStartKey();
    return workouts.filter(workout => getWeekStartKey(new Date(`${workout.date}T12:00:00`)) === currentWeekStart).length;
}

function loadState() {
    try {
        const s = JSON.parse(localStorage.getItem('entreno-brutal'));
        return normalizeState(s);
    } catch { return defaultState(); }
}

function saveState() {
    localStorage.setItem('entreno-brutal', JSON.stringify(state));
}

function updateUI() {
    state.total = state.workouts.length;
    state.weekCount = getCurrentWeekCount();
    document.getElementById('streak-days').textContent = state.streak;
    document.getElementById('week-count').textContent = state.weekCount;
    document.getElementById('total-workouts').textContent = state.total;
    updateWeekProgress();
}

function updateWeekProgress() {
    const el = document.getElementById('week-progress');
    if (!el) return;
    const totalDays = 3;
    const done = Math.min(state.weekCount, totalDays);
    let dots = '';
    for (let i = 0; i < totalDays; i++) {
        dots += `<div class="week-dot${i < done ? ' filled' : ''}"></div>`;
    }
    el.innerHTML = `<span class="week-progress-label">${done}/${totalDays}</span><div class="week-dots">${dots}</div>`;
}

function buildHistoryHtml() {
    const downloadDate = getDownloadDateLabel();
    const workouts = [...state.workouts].reverse();
    const rows = workouts.length
        ? workouts.map((w, index) => `
            <tr>
                <td>${workouts.length - index}</td>
                <td>${escapeHtml(w.date)}</td>
                <td>${w.type === 'tonificar' ? 'Tonificar' : 'Quemar Grasa'}</td>
                <td>${escapeHtml(w.duration)} min</td>
                <td>${escapeHtml(w.intensity)}</td>
                <td>${escapeHtml(w.notes || '-')}</td>
            </tr>
        `).join('')
        : '<tr><td colspan="6" class="empty">No hay entrenos registrados todavia.</td></tr>';

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial ${downloadDate}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 32px 18px; background: #fafaf7; color: #000; font-family: Inter, Arial, sans-serif; }
        main { max-width: 920px; margin: 0 auto; }
        header { border-bottom: 4px solid #000; padding-bottom: 18px; margin-bottom: 24px; }
        h1 { margin: 0 0 8px; font-size: 30px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
        .date { color: #6b6b62; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
        .card { background: #fff; border: 2px solid #000; box-shadow: 6px 6px 0 #000; padding: 16px; }
        .value { font-size: 30px; font-weight: 900; }
        .label { font-size: 11px; font-weight: 800; color: #6b6b62; letter-spacing: 1px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; background: #fff; border: 2px solid #000; box-shadow: 6px 6px 0 #000; }
        th, td { border-bottom: 1px solid #d8d6cc; padding: 12px; text-align: left; vertical-align: top; font-size: 14px; }
        th { background: #ffee00; border-bottom: 2px solid #000; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
        tr:last-child td { border-bottom: none; }
        .empty { text-align: center; color: #6b6b62; padding: 28px; }
        @media (max-width: 720px) {
            .summary { grid-template-columns: 1fr; }
            table { display: block; overflow-x: auto; white-space: nowrap; }
        }
    </style>
</head>
<body>
    <main>
        <header>
            <h1>Historial de Entrenamiento</h1>
            <div class="date">Descargado el ${downloadDate}</div>
        </header>
        <section class="summary">
            <div class="card"><div class="value">${state.streak}</div><div class="label">Dias racha</div></div>
            <div class="card"><div class="value">${state.weekCount}</div><div class="label">Esta semana</div></div>
            <div class="card"><div class="value">${state.total}</div><div class="label">Total entrenos</div></div>
        </section>
        <table>
            <thead>
                <tr><th>#</th><th>Fecha</th><th>Tipo</th><th>Duracion</th><th>Intensidad</th><th>Notas</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </main>
</body>
</html>`;
}

function downloadHistory() {
    updateUI();
    const html = buildHistoryHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Historial-${getDownloadDateLabel()}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

// --- Utils ---
function hasTodayWorkout() {
    const today = getLocalDateKey();
    return state.workouts.some(w => w.date === today);
}

function getExplosionRoot() {
    let r = document.getElementById('explosion-root');
    if (!r) {
        r = document.createElement('div');
        r.id = 'explosion-root';
        r.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';
        document.body.appendChild(r);
    }
    return r;
}

// --- Haptics & Explosion ---
window.toggleCheck = function(el) {
    el.classList.toggle('done');
    if (el.classList.contains('done')) {
        el.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else {
        el.innerHTML = '';
    }
    if (navigator.vibrate) navigator.vibrate([50]);
};

function triggerWorkoutExplosion(originEl) {
    if (navigator.vibrate) navigator.vibrate([80, 40, 120, 40, 80]);

    const container = document.querySelector('.app-container');
    container.classList.remove('shake');
    void container.offsetWidth;
    container.classList.add('shake');
    container.addEventListener('animationend', () => container.classList.remove('shake'), { once: true });

    const root = getExplosionRoot();

    const flash = document.createElement('div');
    flash.className = 'flash-burst';
    flash.style.position = 'absolute';
    root.appendChild(flash);
    flash.addEventListener('animationend', () => flash.remove());

    const colors = ['#ffd700','#ff2d00','#f9c4d2','#00a859','#000','#fff','#ffd700','#ff2d00'];
    const rect = originEl ? originEl.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0 };
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-particle';
        p.style.position = 'absolute';
        const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 70 + Math.random() * 110;
        p.style.cssText += `left:${cx}px;top:${cy}px;background:${colors[i % colors.length]};border-radius:${Math.random()>.5?'50%':'2px'};`;
        p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        p.style.animationDelay = (Math.random() * 60) + 'ms';
        root.appendChild(p);
        p.addEventListener('animationend', () => p.remove());
    }
}

// --- Personal Records ---
function getPR(name) {
    const val = parseFloat(localStorage.getItem('pr:' + name));
    return isNaN(val) ? null : val;
}
function getPRDate(name) { return localStorage.getItem('pr-date:' + name) || ''; }
function checkAndSetPR(name, weight) {
    weight = parseFloat(weight);
    if (!weight || weight <= 0) return false;
    const current = getPR(name);
    if (current === null || weight > current) {
        localStorage.setItem('pr:' + name, weight);
        localStorage.setItem('pr-date:' + name, getLocalDateKey());
        return true;
    }
    return false;
}
window.handleWeightChange = function(input) {
    const name = input.dataset.exercise;
    const weight = parseFloat(input.value);
    localStorage.setItem('peso:' + name, input.value);
    const isNewPR = checkAndSetPR(name, weight);
    const badge = input.closest('.exercise-weight').querySelector('.pr-badge');
    if (!badge) return;
    const pr = getPR(name);
    if (pr !== null) {
        badge.style.display = '';
        badge.textContent = isNewPR ? '🏆 NUEVO PR!' : 'PR: ' + pr + 'kg';
        if (isNewPR) {
            badge.classList.add('pr-new');
            setTimeout(() => { badge.classList.remove('pr-new'); badge.textContent = 'PR: ' + pr + 'kg'; }, 2500);
        }
    }
};
function getAllExerciseNames() {
    const names = new Set();
    Object.values(routines).forEach(prog => Object.values(prog).forEach(week =>
        Object.values(week).forEach(exs => exs.forEach(ex => names.add(ex.name)))
    ));
    return [...names];
}

// --- Tabs ---
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        document.getElementById('program-name').textContent = currentTab === 'tonificar' ? 'Tonificar' : 'Quemar Grasa';
        updateTodayBanner();
    });
});

// --- Week ---
document.getElementById('prev-week').addEventListener('click', () => {
    if (currentWeek > 1) { currentWeek--; updateWeek(); }
});
document.getElementById('next-week').addEventListener('click', () => {
    if (currentWeek < 4) { currentWeek++; updateWeek(); }
});
function updateWeek() {
    document.getElementById('week-number').textContent = currentWeek;
    document.querySelectorAll('.week-ref').forEach(el => el.textContent = currentWeek);
}

// --- Routines Data ---
let routines = {};
async function loadRoutines() {
    try {
        const res = await fetch('./data/routines.json');
        routines = await res.json();
    } catch (e) {
        console.warn('No se pudo cargar routines.json', e);
    }
    if (!localStorage.getItem('program-start-date')) {
        localStorage.setItem('program-start-date', getLocalDateKey());
    }
    currentWeek = getAutoWeek();
    updateWeek();
    updateUI();
    updateTodayBanner();
}
loadRoutines();

function getRoutines() {
    return routines[currentTab]?.[currentWeek] || routines[currentTab]?.['1'] || routines[currentTab]?.[1] || { Lunes: [] };
}

// --- Modal helpers ---
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function openExercisePreview(name) {
    const hash = exerciseImageMap[name];
    const anim = document.getElementById('exercise-anim');
    document.getElementById('exercise-modal-title').textContent = name;
    anim.src = hash ? `${GIF_CDN}${hash}.gif` : 'assets/exercise-demo.webp';
    anim.alt = `Animación de ${name}`;
    openModal('modal-exercise');
}

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

// --- Action: Rutina ---
document.getElementById('btn-routine').addEventListener('click', () => {
    document.getElementById('routine-week').textContent = currentWeek;
    const body = document.getElementById('routine-body');
    const days = getRoutines();
    const dayMap = { 1: 'Lunes', 2: 'Martes', 3: 'Miercoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sabado', 0: 'Domingo' };
    const todayName = dayMap[new Date().getDay()];
    const alreadyDone = hasTodayWorkout();
    body.innerHTML = Object.entries(days).map(([day, exercises]) => {
        const isToday = day === todayName;
        return `
        <div class="routine-day">
            <div class="routine-day-header${isToday ? ' open' : ''}" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('open')">
                <span>${day}${isToday ? ' (Hoy)' : ''}</span>
                <span class="arrow">&#8250;</span>
            </div>
            <div class="routine-day-content${isToday ? ' open' : ''}">
                ${exercises.map(ex => `
                    <div class="exercise-item">
                        <div class="exercise-check" onclick="toggleCheck(this)"></div>
                        <span class="exercise-name">${ex.name}</span>
                        <span class="exercise-detail">${ex.detail}</span>
                        <div class="exercise-weight">
                            <input type="number" min="0" step="0.5" placeholder="0" title="Peso en kg"
                                data-exercise="${escapeHtml(ex.name)}"
                                value="${localStorage.getItem('peso:' + ex.name) || ''}"
                                onchange="handleWeightChange(this)">
                            <span>kg</span>
                            <span class="pr-badge"${getPR(ex.name) === null ? ' style="display:none"' : ''}>${getPR(ex.name) !== null ? 'PR: ' + getPR(ex.name) + 'kg' : ''}</span>
                        </div>
                        <button class="exercise-preview-btn" type="button" data-exercise="${escapeHtml(ex.name)}"><span class="btn-label-desktop">Ver ejercicio</span><span class="btn-label-mobile">Ejemplo</span></button>
                    </div>
                `).join('')}
                <div class="day-register-row">
                    <input type="number" class="day-duration-input" placeholder="Minutos" min="5" max="180" data-day="${day}"${alreadyDone ? ' disabled' : ''}>
                    <button class="day-register-btn${alreadyDone ? ' done' : ''}" data-day="${day}"${alreadyDone ? ' disabled' : ''}>${alreadyDone ? '&#10003; Entrenado hoy' : '&#10003; Registrar entreno'}</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
    openModal('modal-routine');
});

document.getElementById('routine-body').addEventListener('click', (e) => {
    const btn = e.target.closest('.exercise-preview-btn');
    if (btn) { openExercisePreview(btn.dataset.exercise); return; }

    const regBtn = e.target.closest('.day-register-btn');
    if (regBtn) {
        const day = regBtn.dataset.day;
        const input = document.querySelector(`.day-duration-input[data-day="${day}"]`);
        const duration = parseInt(input.value);
        if (!duration || duration < 5) { input.focus(); input.style.borderColor = 'red'; return; }
        input.style.borderColor = '';

        const today = getLocalDateKey();
        const prev = state.workouts.length > 0 ? state.workouts[state.workouts.length - 1] : null;
        if (state.lastDate !== today) {
            state.streak = (state.lastDate === getYesterdayKey()) ? state.streak + 1 : 1;
            state.lastDate = today;
        }
        document.querySelectorAll('.exercise-weight input').forEach(inp => {
            const name = inp.dataset.exercise;
            const weight = parseFloat(inp.value);
            if (weight && weight > 0) {
                let history = JSON.parse(localStorage.getItem('peso-history:' + name) || '[]');
                history.push({ date: today, weight });
                localStorage.setItem('peso-history:' + name, JSON.stringify(history));
            }
        });
        state.workouts.push({ date: today, type: currentTab, duration, intensity: 'media', notes: day });
        state.total = state.workouts.length;
        state.weekCount = getCurrentWeekCount();
        saveState();
        updateUI();
        triggerWorkoutExplosion(regBtn);

        regBtn.textContent = '✓ Registrado!';
        regBtn.disabled = true;
        input.disabled = true;
        setTimeout(() => {
            document.querySelectorAll('.day-register-btn').forEach(b => {
                b.textContent = '✓ Entrenado hoy'; b.disabled = true; b.classList.add('done');
            });
            document.querySelectorAll('.day-duration-input').forEach(i => { i.disabled = true; i.value = ''; });
        }, 1200);
    }
});

// --- Action: Progreso ---
function renderProgress() {
    const body = document.getElementById('progress-body');
    const weekGoal = 3;
    const pct = Math.min(100, Math.round((state.weekCount / weekGoal) * 100));
    const prs = getAllExerciseNames()
        .map(name => ({ name, weight: getPR(name), date: getPRDate(name) }))
        .filter(e => e.weight !== null)
        .sort((a, b) => b.weight - a.weight);

    let html = `
        <div class="section-label">Objetivo semanal</div>
        <div class="progress-bar-container">
            <div class="progress-bar-label">
                <span>${state.weekCount} / ${weekGoal} entrenos</span>
                <span>${pct}%</span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width:${pct}%"></div>
            </div>
        </div>
    `;

    if (prs.length > 0) {
        html += `<div class="section-label" style="margin-top:20px">Records Personales</div><div style="margin-bottom:20px">`;
        prs.forEach(pr => {
            html += `<div class="pr-item"><span class="pr-item-name">${escapeHtml(pr.name)}</span><span class="pr-item-weight">${pr.weight} kg</span><span class="pr-item-date">${pr.date}</span></div>`;
        });
        html += '</div>';
    }

    const allExercises = getAllExerciseNames();
    const exercisesWithHistory = allExercises.filter(name => {
        const history = JSON.parse(localStorage.getItem('peso-history:' + name) || '[]');
        return history.length > 0;
    });

    if (exercisesWithHistory.length > 0) {
        html += `<div class="section-label" style="margin-top:20px">Evolucion de Peso</div><div class="weight-chart-section">`;
        exercisesWithHistory.forEach((name, i) => {
            html += `
            <div class="weight-chart-exercise">
                <div class="weight-chart-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('open')">
                    <span>${escapeHtml(name)}</span>
                    <span class="arrow">&#8250;</span>
                </div>
                <div class="weight-chart-body">
                    <canvas class="weight-chart-canvas" id="chart-${i}" data-exercise="${escapeHtml(name)}"></canvas>
                    <div class="weight-chart-stats" id="chart-stats-${i}"></div>
                </div>
            </div>`;
        });
        html += '</div>';
    }

    body.innerHTML = html;

    exercisesWithHistory.forEach((name, i) => {
        drawWeightChart(i, name);
    });
}

function drawWeightChart(index, exerciseName) {
    const canvas = document.getElementById('chart-' + index);
    if (!canvas) return;
    const history = JSON.parse(localStorage.getItem('peso-history:' + exerciseName) || '[]');
    if (history.length < 2) {
        const stats = document.getElementById('chart-stats-' + index);
        if (stats) stats.textContent = 'Registra al menos 2 sesiones para ver la evolucion.';
        return;
    }

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width, h = rect.height;
    const padding = { top: 10, right: 10, bottom: 24, left: 36 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const weights = history.map(h => h.weight);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const range = maxW - minW || 1;

    const isDark = document.body.classList.contains('dark');
    const gridColor = isDark ? '#3a3a3a' : '#e8e6dd';
    const textColor = isDark ? '#9a9a92' : '#6b6b62';
    const lineColor = isDark ? '#f9c4d2' : '#000';
    const dotColor = isDark ? '#00d470' : '#00a859';

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        const val = maxW - (range / 4) * i;
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
        ctx.fillStyle = textColor;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(1), padding.left - 4, y + 3);
    }

    const points = history.map((h, i) => ({
        x: padding.left + (chartW / (history.length - 1)) * i,
        y: padding.top + chartH - ((h.weight - minW) / range) * chartH
    }));

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    points.forEach(p => {
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    const firstDate = history[0].date.slice(5);
    const lastDate = history[history.length - 1].date.slice(5);
    const diff = weights[weights.length - 1] - weights[0];
    const diffStr = diff > 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`;
    const statsEl = document.getElementById('chart-stats-' + index);
    if (statsEl) {
        statsEl.innerHTML = `<span>${firstDate} - ${lastDate}</span><span>${history.length} registros</span><span style="color:${diff >= 0 ? 'var(--sprout)' : 'var(--destructive)'}">${diffStr}</span>`;
    }
}

function renderHistory() {
    const body = document.getElementById('history-body');
    if (!body) return;
    if (state.workouts.length === 0) {
        body.innerHTML = '<div class="empty-state">No hay entrenos registrados todavia.</div>';
        return;
    }
    const allReversed = [...state.workouts].reverse();
    body.innerHTML = allReversed.map((w, ri) => {
        const realIdx = state.workouts.length - 1 - ri;
        return `
        <div class="history-item" data-idx="${realIdx}">
            <span class="history-date">${w.date}</span>
            <span class="history-type">${w.type === 'tonificar' ? 'Tonif.' : 'Quemar'}</span>
            <span class="history-duration">${w.duration}min · ${escapeHtml(w.intensity)}${w.notes ? ' · ' + escapeHtml(w.notes) : ''}</span>
            <div class="history-item-actions">
                <button class="btn-edit-workout" data-idx="${realIdx}">✏ Editar</button>
                <button class="btn-del-workout" data-idx="${realIdx}">✕</button>
            </div>
            <div class="history-edit-row" id="edit-row-${realIdx}" style="display:none">
                <input type="number" id="edit-dur-${realIdx}" value="${w.duration}" min="5" max="180" placeholder="min">
                <span style="font-size:12px">min</span>
                <button onclick="saveEditWorkout(${realIdx})">Guardar</button>
                <button onclick="document.getElementById('edit-row-${realIdx}').style.display='none'" style="background:var(--card);color:var(--foreground)">Cancelar</button>
            </div>
        </div>`;
    }).join('');

    body.querySelectorAll('.btn-del-workout').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            if (!confirm('¿Eliminar este entreno?')) return;
            state.workouts.splice(idx, 1);
            state.total = state.workouts.length;
            state.weekCount = getCurrentWeekCount();
            saveState(); updateUI(); renderHistory();
        });
    });

    body.querySelectorAll('.btn-edit-workout').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.dataset.idx;
            const row = document.getElementById(`edit-row-${idx}`);
            row.style.display = row.style.display === 'none' ? 'flex' : 'none';
        });
    });
}

window.saveEditWorkout = (idx) => {
    const val = parseInt(document.getElementById(`edit-dur-${idx}`).value);
    if (!val || val < 5) return;
    state.workouts[idx].duration = val;
    state.weekCount = getCurrentWeekCount();
    saveState(); updateUI(); renderHistory();
};

document.getElementById('btn-progress').addEventListener('click', () => {
    renderProgress();
    openModal('modal-progress');
});

document.getElementById('btn-historial').addEventListener('click', () => {
    renderHistory();
    openModal('modal-historial');
});

document.getElementById('btn-export-history').addEventListener('click', downloadHistory);

document.getElementById('btn-backup-export').addEventListener('click', () => {
    const backup = {
        version: 1,
        date: getLocalDateKey(),
        state: state,
        prs: {},
        prDates: {},
        pesoHistory: {},
        pesoCurrent: {},
        programStartDate: localStorage.getItem('program-start-date'),
        darkMode: localStorage.getItem('dark-mode')
    };
    getAllExerciseNames().forEach(name => {
        const pr = localStorage.getItem('pr:' + name);
        if (pr) backup.prs[name] = pr;
        const prd = localStorage.getItem('pr-date:' + name);
        if (prd) backup.prDates[name] = prd;
        const ph = localStorage.getItem('peso-history:' + name);
        if (ph) backup.pesoHistory[name] = ph;
        const pc = localStorage.getItem('peso:' + name);
        if (pc) backup.pesoCurrent[name] = pc;
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entreno-brutal-backup-${getLocalDateKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
});

document.getElementById('btn-backup-import').addEventListener('click', () => {
    document.getElementById('backup-file-input').click();
});

document.getElementById('backup-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const backup = JSON.parse(ev.target.result);
            if (!backup.state || !backup.state.workouts) throw new Error('Invalid backup');
            if (!confirm('Esto reemplazara todos tus datos actuales. ¿Continuar?')) return;
            localStorage.setItem('entreno-brutal', JSON.stringify(backup.state));
            state = loadState();
            updateUI();
            if (backup.programStartDate) localStorage.setItem('program-start-date', backup.programStartDate);
            if (backup.darkMode !== null) localStorage.setItem('dark-mode', backup.darkMode);
            Object.entries(backup.prs || {}).forEach(([name, val]) => localStorage.setItem('pr:' + name, val));
            Object.entries(backup.prDates || {}).forEach(([name, val]) => localStorage.setItem('pr-date:' + name, val));
            Object.entries(backup.pesoHistory || {}).forEach(([name, val]) => localStorage.setItem('peso-history:' + name, val));
            Object.entries(backup.pesoCurrent || {}).forEach(([name, val]) => localStorage.setItem('peso:' + name, val));
            alert('Backup restaurado correctamente.');
            location.reload();
        } catch (err) {
            alert('Error: archivo de backup invalido.');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

if ('serviceWorker' in navigator && ['http:', 'https:'].includes(window.location.protocol)) {
    navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(r => r.unregister());
    });
}

// Cartel del día — dinámico por programa
function updateTodayBanner() {
    const dayMap = { 1: 'Lunes', 3: 'Miercoles', 5: 'Viernes' };
    const day = new Date().getDay();
    const dayName = dayMap[day];
    const banner = document.getElementById('today-banner');
    if (!banner) return;
    if (!dayName) { banner.textContent = ''; return; }
    const label = routines.labels?.[currentTab]?.[dayName];
    banner.textContent = label ? `Hoy toca ${label}` : '';
}

// Init
updateUI();

(function initDark() {
    const saved = localStorage.getItem('dark-mode');
    if (saved === '1' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark');
    }
    const btn = document.getElementById('dark-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('dark-mode', document.body.classList.contains('dark') ? '1' : '0');
        });
    }
})();
