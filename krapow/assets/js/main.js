(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  onReady(() => {
    const logBox = document.getElementById('log');
    function log(msg) {
      if (!logBox) return;
      const time = new Date().toLocaleTimeString();
      const line = document.createElement('div');
      line.textContent = `[${time}] ${msg}`;
      logBox.prepend(line);
    }

    function renderTogglesFromState() {
      const st = ghStates[currentGh] && ghStates[currentGh].controls;
      if (!st) return;
      const set = (id, on) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.setAttribute('aria-pressed', String(on));
        el.classList.toggle('is-on', !!on);
      };
      set('tglPump', st.pump);
      set('tglFan', st.fan);
      set('tglLight', st.light);
      set('tglMist', st.mist);
    }

    // No randomness; fixed mock data

    // Multi-greenhouse state (10) with 24h time-series per metric
    const GH_COUNT = 10;
    const STEP_MIN = 5;                 // data point every 5 minutes
    const WINDOW_MIN = 24 * 60;         // 24h window
    const POINTS = Math.floor(WINDOW_MIN / STEP_MIN) + 1; // include now

    function wave(now, base, amp, phase = 0) {
      // diurnal cosine-like curve in [base-amp, base+amp]
      const t = (now.getHours() + now.getMinutes() / 60);
      const rad = ((t + phase) / 24) * Math.PI * 2;
      return base + amp * (1 - Math.cos(rad)) / 2;
    }

    function buildDaySeries(idx) {
      const now = new Date();
      const start = new Date(now.getTime() - WINDOW_MIN * 60 * 1000);
      const arr = { temp: [], hum: [], soil: [], light: [] };
      for (let i = 0; i < POINTS; i++) {
        const ts = new Date(start.getTime() + i * STEP_MIN * 60 * 1000);
        const temp = Math.round(wave(ts, 22 + idx * 0.3, 8, 6) * 10) / 10;   // °C
        const hum = Math.round(wave(ts, 75 + idx, 20, 0));                   // %
        const soil = Math.round(wave(ts, 35 + idx, 10, 10));                 // %
        const light = Math.max(0, Math.round(20000 * Math.max(0, Math.sin(((ts.getHours()-6)/12)*Math.PI)))); // lux
        arr.temp.push({ x: ts, y: temp });
        arr.hum.push({ x: ts, y: hum });
        arr.soil.push({ x: ts, y: soil });
        arr.light.push({ x: ts, y: light });
      }
      return arr;
    }

    const ghSeries = Array.from({ length: GH_COUNT }, (_, idx) => buildDaySeries(idx));

    const ghStates = Array.from({ length: GH_COUNT }, (_, idx) => {
      const s = ghSeries[idx];
      const last = {
        temp: s.temp[s.temp.length - 1].y,
        hum: s.hum[s.hum.length - 1].y,
        soil: s.soil[s.soil.length - 1].y,
        light: s.light[s.light.length - 1].y,
      };
      return {
        tiles: last,
        controls: { pump: false, fan: false, light: false, mist: false }
      };
    });

    let currentGh = 0;
    const ghTabs = Array.from(document.querySelectorAll('.tab[data-gh]'));

    function updateActiveTabs() {
      ghTabs.forEach((btn) => {
        const idx = parseInt(btn.getAttribute('data-gh'), 10) || 0;
        if (idx === currentGh) btn.classList.add('tab--active');
        else btn.classList.remove('tab--active');
      });
    }

    function setActiveGreenhouse(idx) {
      currentGh = Math.max(0, Math.min(GH_COUNT - 1, idx));
      updateActiveTabs();
      renderFromState();
    }

    ghTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-gh'), 10) || 0;
        setActiveGreenhouse(idx);
      });
    });

    function renderCamera() {
      const img = document.getElementById('cameraImg');
      if (!img) return;
      const idx = currentGh + 1;
      img.src = `./assets/tmp/mockup/KP${idx}.png`;
      img.alt = `Greenhouse ${idx} camera mockup`;
    }

    // Small sparkline charts for 4 metrics
    const sparkCharts = { temp: null, hum: null, soil: null, light: null };
    // Centralized per-metric config
    const METRIC_CONFIG = {
      temp: { label: 'Temperature', unit: '°C', color: '#10b981', gauge: { min: 0, max: 40, thresholds: [ { to: 28, color: '#10b981' }, { to: 35, color: '#6b7280' }, { to: 40, color: '#ef4444' } ] } },
      hum:  { label: 'Humidity',    unit: '%',  color: '#2563eb', gauge: { min: 0, max: 100, thresholds: [ { to: 60, color: '#2563eb' }, { to: 80, color: '#6b7280' }, { to: 100, color: '#ef4444' } ] } },
      soil: { label: 'Soil Moisture',unit: '%', color: '#d97706', gauge: { min: 0, max: 100, thresholds: [ { to: 50, color: '#d97706' }, { to: 70, color: '#6b7280' }, { to: 100, color: '#ef4444' } ] } },
      light:{ label: 'Light',        unit: 'lux',color: '#6b7280', gauge: { min: 0, max: 20000, thresholds: [ { to: 12000, color: '#6b7280' }, { to: 17000, color: '#9ca3af' }, { to: 20000, color: '#ef4444' } ] } }
    };
    function makeSparkConfig(label, data, color, unit) {
      const now = new Date();
      const min12h = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      return {
        type: 'line',
        data: { datasets: [{ label, data, borderColor: color, backgroundColor: color + '22', tension: 0.3, pointRadius: 0, fill: true }] },
        options: {
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              callbacks: {
                title(items) {
                  if (!items || !items.length) return '';
                  const ts = items[0].parsed.x;
                  const d = new Date(ts);
                  return d.toLocaleString(); // date + time
                },
                label(ctx) {
                  const y = ctx.parsed.y;
                  const name = ctx.dataset.label || label || '';
                  const u = unit ? ` ${unit}` : '';
                  return `${name}: ${y}${u}`;
                }
              }
            }
          },
          scales: {
            x: { 
              type: 'time', 
              min: min12h,
              max: now,
              time: { unit: 'hour', stepSize: 3, displayFormats: { hour: 'HH:mm' } },
              ticks: { source: 'auto', maxRotation: 0, autoSkip: false },
              grid: { display: false }
            },
            y: { beginAtZero: false, grid: { color: '#eef2f7' } }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      };
    }

    function ensureSpark(id, key) {
      const el = document.getElementById(id);
      if (!el) return null;
      const series = ghSeries[currentGh];
      const dataset = key === 'temp' ? series.temp : key === 'hum' ? series.hum : key === 'soil' ? series.soil : series.light;
      const meta = METRIC_CONFIG[key];
      const cfg = makeSparkConfig(meta.label, dataset, meta.color, meta.unit);
      if (sparkCharts[key]) { sparkCharts[key].destroy(); }
      sparkCharts[key] = new Chart(el.getContext('2d'), cfg);
      return sparkCharts[key];
    }

    function renderSparks() {
      ensureSpark('sparkTemp', 'temp');
      ensureSpark('sparkHum', 'hum');
      ensureSpark('sparkSoil', 'soil');
      ensureSpark('sparkLight', 'light');
    }

    // ----- Mini Gauges (Temp, Humidity, Soil, Light) -----
    const gaugeCharts = {};

    function renderGauge(id, value, cfg) {
      const el = document.getElementById(id);
      if (!el) return;
      const { min, max, thresholds, unit } = cfg;
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const total = Math.max(1, max - min);
      const pct = clamp(((value - min) / total) * 100, 0, 100);

      let prevPct = 0;
      const segVals = [];
      const segColors = [];
      thresholds.forEach((t) => {
        const tPct = clamp(((t.to - min) / total) * 100, 0, 100);
        const len = clamp(Math.min(pct, tPct) - prevPct, 0, 100);
        if (len > 0) { segVals.push(len); segColors.push(t.color); }
        prevPct = tPct;
      });
      const rem = clamp(100 - segVals.reduce((a, b) => a + b, 0), 0, 100);
      if (rem > 0) { segVals.push(rem); segColors.push('#e5e7eb'); }

      const data = { labels: segVals.map(() => ''), datasets: [{ data: segVals, backgroundColor: segColors, borderWidth: 0 }] };
      // Per-chart inline plugin to avoid shared state across charts
      const inlineCenterText = {
        id: 'inlineCenterText',
        afterDraw(chart) {
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          ctx.save();
          ctx.font = '700 14px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
          ctx.fillStyle = '#065f46';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const cx = (chartArea.left + chartArea.right) / 2;
          const cy = chartArea.bottom - 10;
          ctx.fillText(`${value} ${unit || ''}`.trim(), cx, cy);
          ctx.restore();
        }
      };

      const chartCfg = {
        type: 'doughnut',
        data,
        options: { responsive: true, maintainAspectRatio: false, rotation: -90, circumference: 180, cutout: '70%', plugins: { legend: { display: false }, tooltip: { enabled: false } } },
        plugins: [inlineCenterText]
      };

      if (gaugeCharts[id]) gaugeCharts[id].destroy();
      const chart = new Chart(el.getContext('2d'), chartCfg);
      chart.update();
      gaugeCharts[id] = chart;
    }

    function renderAllGauges() {
      const s = ghStates[currentGh];
      renderGauge('gaugeTemp',  s.tiles.temp,  { ...METRIC_CONFIG.temp.gauge,  unit: METRIC_CONFIG.temp.unit });
      renderGauge('gaugeHum',   s.tiles.hum,   { ...METRIC_CONFIG.hum.gauge,   unit: METRIC_CONFIG.hum.unit });
      renderGauge('gaugeSoil',  s.tiles.soil,  { ...METRIC_CONFIG.soil.gauge,  unit: METRIC_CONFIG.soil.unit });
      renderGauge('gaugeLight', s.tiles.light, { ...METRIC_CONFIG.light.gauge, unit: METRIC_CONFIG.light.unit });
    }

    function renderFromState() {
      const gh = ghStates[currentGh];
      renderSparks();
      renderAllGauges();
      renderCamera();
      renderTogglesFromState();
    }

    // Real-time updates: append a point every STEP_MIN minutes (accelerated: every 10s for demo)
    renderFromState();
    setInterval(() => {
      const now = new Date();
      for (let gi = 0; gi < GH_COUNT; gi++) {
        const s = ghSeries[gi];
        // push new computed values and trim window
        const t = now;
        const temp = Math.round(wave(t, 22 + gi * 0.3, 8, 6) * 10) / 10;
        const hum = Math.round(wave(t, 75 + gi, 20, 0));
        const soil = Math.round(wave(t, 35 + gi, 10, 10));
        const light = Math.max(0, Math.round(20000 * Math.max(0, Math.sin(((t.getHours()-6)/12)*Math.PI))));
        s.temp.push({ x: t, y: temp }); if (s.temp.length > POINTS) s.temp.shift();
        s.hum.push({ x: t, y: hum }); if (s.hum.length > POINTS) s.hum.shift();
        s.soil.push({ x: t, y: soil }); if (s.soil.length > POINTS) s.soil.shift();
        s.light.push({ x: t, y: light }); if (s.light.length > POINTS) s.light.shift();
        // update tiles for current selection
        ghStates[gi].tiles = { temp, hum, soil, light };
      }
      // refresh current GH charts without re-creating
      const s = ghSeries[currentGh];
      const min12h = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      const updateWin = (chart, data) => {
        if (!chart) return;
        chart.options.scales.x.min = min12h;
        chart.options.scales.x.max = now;
        chart.data.datasets[0].data = data;
        chart.update('none');
      };
      updateWin(sparkCharts.temp, s.temp);
      updateWin(sparkCharts.hum, s.hum);
      updateWin(sparkCharts.soil, s.soil);
      updateWin(sparkCharts.light, s.light);
      renderAllGauges();
    }, 10000);

    const appBar = document.querySelector('.app-bar');
    function updateHeaderOnScroll() {
      if (!appBar) return;
      const isMobile = window.matchMedia('(max-width: 640px)').matches;
      if (!isMobile) { appBar.classList.remove('app-bar--collapsed'); return; }
      const y = window.scrollY || window.pageYOffset || 0;
      if (y <= 0) appBar.classList.remove('app-bar--collapsed');
      else appBar.classList.add('app-bar--collapsed');
    }
    window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
    window.addEventListener('resize', () => { updateHeaderOnScroll(); });
    updateHeaderOnScroll();

    // Toggle buttons with ON/OFF state
    const toggles = [
      { id: 'tglPump', key: 'pump', topic: 'cmd/pump' },
      { id: 'tglFan', key: 'fan', topic: 'cmd/fan' },
      { id: 'tglLight', key: 'light', topic: 'cmd/light' },
      { id: 'tglMist', key: 'mist', topic: 'cmd/mist' },
    ];
    toggles.forEach(({ id, key, topic }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', () => {
        const isOn = el.getAttribute('aria-pressed') === 'true';
        const next = !isOn;
        el.setAttribute('aria-pressed', String(next));
        el.classList.toggle('is-on', next);
        if (ghStates[currentGh] && ghStates[currentGh].controls) {
          ghStates[currentGh].controls[key] = next;
        }
        log(`Toggle → ${topic} { on: ${next}, gh: ${currentGh + 1} }`);
      });
    });
  });
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .catch((err) => console.warn('SW registration failed', err));
  });
}
