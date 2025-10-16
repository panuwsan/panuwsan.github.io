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

    // Helpers
    function randomIn(min, max) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }

    // Multi-greenhouse state (10)
    const GH_COUNT = 10;
    const SERIES_LEN = 30;
    const ghStates = Array.from({ length: GH_COUNT }, () => ({
      labels: Array.from({ length: SERIES_LEN }, (_, i) => `${i - (SERIES_LEN - 1)}m`),
      tempSeries: Array.from({ length: SERIES_LEN }, () => randomIn(24, 29)),
      tiles: {
        temp: randomIn(23, 30),
        hum: randomIn(50, 75),
        soil: randomIn(30, 60),
        light: Math.round(randomIn(8000, 20000)),
      }
    }));

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

    function renderTiles(gh) {
      const tempEl = document.getElementById('tempValue');
      const humEl = document.getElementById('humValue');
      const soilEl = document.getElementById('soilValue');
      const lightEl = document.getElementById('lightValue');
      if (tempEl) tempEl.textContent = String(gh.tiles.temp);
      if (humEl) humEl.textContent = String(gh.tiles.hum);
      if (soilEl) soilEl.textContent = String(gh.tiles.soil);
      if (lightEl) lightEl.textContent = String(gh.tiles.light);
    }

    // Chart.js with gradient based on temperature range
    const canvas = document.getElementById('tempChart');
    let tempChart = null;
    function createGradient(ctx, chartArea) {
      if (!chartArea) return '#10b981';
      const { top, bottom } = chartArea;
      const g = ctx.createLinearGradient(0, bottom, 0, top);
      // soft-eye green gradient (light -> rich)
      g.addColorStop(0.00, '#d1fae5'); // emerald-100
      g.addColorStop(0.30, '#a7f3d0'); // emerald-200
      g.addColorStop(0.60, '#6ee7b7'); // emerald-300
      g.addColorStop(0.85, '#34d399'); // emerald-400
      g.addColorStop(1.00, '#10b981'); // emerald-500
      return g;
    }

    function ensureChart() {
      if (!canvas || !canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      if (tempChart) return tempChart;
      tempChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ghStates[currentGh].labels,
          datasets: [{
            label: 'Temp °C',
            data: ghStates[currentGh].tempSeries,
            borderColor: '#4b5563',
            backgroundColor: 'rgba(75,85,99,0.15)',
            tension: 0.3,
            pointRadius: 0,
            fill: true,
          }]
        },
        options: {
          animation: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: false, suggestedMin: 20, suggestedMax: 35 }
          },
          responsive: true,
          maintainAspectRatio: false,
          events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        }
      });

      // Apply gradient once chart has layout
      const apply = () => {
        if (!tempChart) return;
        const g = createGradient(ctx, tempChart.chartArea);
        tempChart.data.datasets[0].borderColor = g;
        tempChart.data.datasets[0].backgroundColor = g;
        tempChart.update('none');
      };
      setTimeout(apply, 0);
      return tempChart;
    }

    function updateChartSeries() {
      if (!tempChart) return;
      const ctx = tempChart.ctx;
      tempChart.data.labels = ghStates[currentGh].labels;
      tempChart.data.datasets[0].data = ghStates[currentGh].tempSeries;
      const g = createGradient(ctx, tempChart.chartArea);
      tempChart.data.datasets[0].borderColor = g;
      tempChart.data.datasets[0].backgroundColor = g;
      tempChart.update('none');
    }

    function renderFromState() {
      const gh = ghStates[currentGh];
      renderTiles(gh);
      ensureChart();
      updateChartSeries();
    }

    // Mock update loop: update all greenhouses every 3s
    function tickAll() {
      const nowLabel = `${new Date().toLocaleTimeString().slice(0, 5)}`;
      ghStates.forEach((gh) => {
        // push label
        gh.labels.push(nowLabel);
        gh.labels.shift();
        // temp series drift
        const last = gh.tempSeries[gh.tempSeries.length - 1];
        const next = Math.max(18, Math.min(40, (last + randomIn(-0.6, 0.8))));
        gh.tempSeries.push(Math.round(next * 10) / 10);
        gh.tempSeries.shift();
        // tiles
        gh.tiles.temp = gh.tempSeries[gh.tempSeries.length - 1];
        gh.tiles.hum = Math.round(randomIn(50, 75));
        gh.tiles.soil = Math.round(randomIn(30, 60));
        gh.tiles.light = Math.round(randomIn(8000, 20000));
      });
      // Re-render current greenhouse only
      renderFromState();
    }
    renderFromState();
    setInterval(tickAll, 3000);

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
    window.addEventListener('resize', () => {
      updateHeaderOnScroll();
      // Recompute chart gradient and layout on resize for responsive PCs
      if (tempChart) updateChartSeries();
    });
    updateHeaderOnScroll();

    // Mock control handlers (replace with MQTT publish later)
    const btns = [
      { id: 'btnPump', topic: 'greenhouse/krapow/cmd/pump' },
      { id: 'btnFan', topic: 'greenhouse/krapow/cmd/fan' },
      { id: 'btnLight', topic: 'greenhouse/krapow/cmd/light' },
      { id: 'btnMist', topic: 'greenhouse/krapow/cmd/mist' },
    ];

    const modeEl = document.getElementById('modeSelect');
    const durEl = document.getElementById('durationInput');
    const delayEl = document.getElementById('delayInput');

    function getControlParams() {
      const mode = (modeEl && modeEl.value) || 'pulse';
      const duration = Math.max(1, parseInt(durEl && durEl.value, 10) || 10);
      const delay = Math.max(0, parseInt(delayEl && delayEl.value, 10) || 0);
      return { mode, duration, delay };
    }

    function performAction(topic, mode, duration, cb) {
      // Simulate publish + ack
      if (mode === 'on') {
        log(`Publish → ${topic} { on: true, gh: ${currentGh + 1} }`);
      } else if (mode === 'off') {
        log(`Publish → ${topic} { on: false, gh: ${currentGh + 1} }`);
      } else {
        log(`Publish → ${topic} { pulse: true, duration: ${duration}s, gh: ${currentGh + 1} }`);
      }
      setTimeout(() => {
        log(`Ack ← ${topic} ok`);
        if (typeof cb === 'function') cb();
      }, 700);
    }

    btns.forEach(({ id, topic }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', () => {
        const { mode, duration, delay } = getControlParams();
        const label = id.replace('btn', '');
        const summary = mode === 'pulse' ? `${label} – pulse ${duration}s` : `${label} – turn ${mode}`;
        const ok = confirm(`${summary}${delay ? ` after ${delay}s` : ''}?`);
        if (!ok) return;
        el.disabled = true;
        if (delay > 0) {
          log(`Scheduled ${summary} in ${delay}s`);
          setTimeout(() => {
            performAction(topic, mode, duration, () => { el.disabled = false; });
          }, delay * 1000);
        } else {
          performAction(topic, mode, duration, () => { el.disabled = false; });
        }
      });
    });
  });
})();

