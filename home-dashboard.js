(function () {
  'use strict';

  const get = (id) => document.getElementById(id);
  const WORKBENCH_BASE = 'pipe-home-workbench';
  let state;
  let captureTimer = null;

  function profileId() {
    return window.PipeTrainerApp?.getActiveProfileId?.() || 'default';
  }

  function storageKey() {
    return `${WORKBENCH_BASE}:${profileId()}`;
  }

  function defaultState() {
    return {
      projects: [{ id: 'default', name: '我的现场' }],
      activeProjectId: 'default',
      recents: [],
      searchHistory: []
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey()) || 'null');
      state = parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.recents) && Array.isArray(parsed.searchHistory) ? parsed : defaultState();
    } catch (error) {
      state = defaultState();
    }
    if (!state.projects.length) state.projects = defaultState().projects;
    if (!state.projects.some((project) => project.id === state.activeProjectId)) state.activeProjectId = state.projects[0].id;
  }

  function saveState() {
    try { localStorage.setItem(storageKey(), JSON.stringify(state)); } catch (error) { /* non-critical local history */ }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function activeProject() {
    return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0];
  }

  function projectRecents() {
    return state.recents.filter((entry) => entry.projectId === state.activeProjectId);
  }

  function relativeTime(timestamp) {
    const diff = Math.max(0, Date.now() - timestamp);
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return new Date(timestamp).toLocaleDateString('zh-CN');
  }

  function renderProjects() {
    get('homeProjectSelect').innerHTML = state.projects.map((project) => `<option value="${escapeHtml(project.id)}"${project.id === state.activeProjectId ? ' selected' : ''}>${escapeHtml(project.name)}</option>`).join('');
  }

  function renderRecents() {
    const recents = projectRecents().slice(0, 12);
    const list = get('homeRecentList');
    list.innerHTML = recents.length ? recents.map((entry) => `<button class="home-recent-row" type="button" data-home-recent="${escapeHtml(entry.id)}"><div><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.summary)}</span></div><code>${escapeHtml(entry.modeLabel)}</code><small>${relativeTime(entry.time)}</small></button>`).join('') : '<div class="home-empty">当前项目还没有计算记录。</div>';
    const latest = recents[0];
    get('homeResumeTitle').textContent = latest ? latest.title : '还没有计算记录';
    get('homeResumeMeta').textContent = latest ? `${latest.summary} · ${relativeTime(latest.time)}` : '选择下方工具开始';
    get('homeResumeBtn').disabled = !latest;
    get('homeResumeBtn').dataset.mode = latest?.mode || '';
    get('homeResumeBtn').dataset.recentId = latest?.id || '';
  }

  function renderReferenceHistory() {
    const container = get('homeReferenceHistory');
    container.innerHTML = state.searchHistory.length ? state.searchHistory.slice(0, 8).map((entry, index) => `<button class="home-recent-row" type="button" data-home-search-history="${index}"><div><strong>${escapeHtml(entry.code || entry.title)}</strong><span>${escapeHtml(entry.title)}</span></div><code>${escapeHtml(entry.category)}</code><small>${relativeTime(entry.time)}</small></button>`).join('') : '<div class="home-empty">还没有搜索记录。</div>';
  }

  function renderLearningProgress() {
    const id = profileId();
    let spatial = { completed: {}, wrong: [] }, micro = [], modules = [], route = [];
    try { spatial = JSON.parse(localStorage.getItem(`pipe-spatial-training-v1:${id}`) || '{"completed":{},"wrong":[]}'); } catch (error) { /* defaults */ }
    try { micro = JSON.parse(localStorage.getItem(`pipe-micro-lessons:${id}`) || '[]'); } catch (error) { /* defaults */ }
    try { modules = JSON.parse(localStorage.getItem(`pipe-module-progress:${id}`) || '[]'); } catch (error) { /* defaults */ }
    try { route = JSON.parse(localStorage.getItem(`pipe-route-progress:${id}`) || '[]'); } catch (error) { /* defaults */ }
    const spatialCount = Object.keys(spatial.completed || {}).length;
    const microCount = Array.isArray(micro) ? micro.length : 0;
    const moduleCount = Array.isArray(modules) ? modules.length : 0;
    const routeCount = Array.isArray(route) ? route.length : 0;
    get('homeMicroProgress').textContent = `${microCount} / 5`;
    get('homeSpatialProgress').textContent = `${spatialCount} / 36`;
    get('homeModuleProgress').textContent = `${moduleCount} / 20`;
    get('homeRouteProgress').textContent = `${routeCount} / 16`;
    get('homeMicroBar').style.width = `${microCount / 5 * 100}%`;
    get('homeSpatialBar').style.width = `${spatialCount / 36 * 100}%`;
    get('homeModuleBar').style.width = `${moduleCount / 20 * 100}%`;
    get('homeRouteBar').style.width = `${routeCount / 16 * 100}%`;
    get('homeSpatialWrong').textContent = `错题 ${(spatial.wrong || []).length}`;
    renderCoachSummary();
  }

  function renderCoachSummary() {
    const target = get('homeCoachSummary');
    if (!target) return;
    const summary = window.PipeLearningCoach?.getSummary?.();
    target.textContent = summary?.assessed ? `掌握度 ${summary.average}% · 补强${summary.weakestLabel}` : '首次测评生成路线';
  }

  function renderAll() {
    renderProjects();
    renderRecents();
    renderReferenceHistory();
    renderLearningProgress();
  }

  function navigatePage(page) {
    if (window.PipeTrainerApp?.navigate) {
      window.PipeTrainerApp.navigate(page);
      return;
    }
    const tab = document.querySelector(`[data-page="${page}"]`);
    if (tab) tab.click();
    else {
      document.querySelectorAll('.top-tab').forEach((item) => item.classList.remove('is-active'));
      document.querySelectorAll('.page').forEach((item) => {
        const active = item.id === `page-${page}`;
        item.classList.toggle('is-active', active);
        item.hidden = !active;
      });
    }
    window.scrollTo(0, 0);
  }

  function restoreCalculatorSnapshot(snapshot) {
    if (!snapshot?.fields || typeof snapshot.fields !== 'object') return;
    Object.entries(snapshot.fields).forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (!field) return;
      if (field.type === 'checkbox' || field.type === 'radio') field.checked = Boolean(value);
      else field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function openCalculator(mode, snapshot = null) {
    navigatePage('calc');
    document.querySelector(`[data-calc-mode="${mode}"]`)?.click();
    if (snapshot) requestAnimationFrame(() => restoreCalculatorSnapshot(snapshot));
  }

  function addProject() {
    const input = get('homeProjectName');
    const name = input.value.trim();
    if (!name) return;
    const project = { id: `project-${Date.now()}`, name };
    state.projects.push(project);
    state.activeProjectId = project.id;
    input.value = '';
    saveState();
    renderAll();
    window.dispatchEvent(new CustomEvent('pipe-project-change', { detail: { project: activeProject() } }));
  }

  function captureCalculatorResult() {
    const page = get('page-calc');
    if (page.hidden || !page.classList.contains('is-active')) return;
    const panel = page.querySelector('.calc-panel.is-active:not([hidden])');
    if (!panel) return;
    const mode = panel.id.replace('calc-', '');
    const title = panel.querySelector('h3')?.textContent?.trim() || '工程计算';
    const modeLabel = document.querySelector(`[data-calc-mode="${mode}"]`)?.textContent?.trim() || '计算';
    const values = Array.from(panel.querySelectorAll('.calc-results div')).map((row) => {
      const label = row.querySelector('dt')?.textContent?.trim();
      const value = row.querySelector('dd')?.textContent?.trim();
      return label && value && value !== '-' && value !== '—' ? `${label} ${value}` : '';
    }).filter(Boolean).slice(0, 3);
    if (!values.length) return;
    const summary = values.join(' · ');
    const fields = {};
    panel.querySelectorAll('input[id], select[id], textarea[id]').forEach((field) => {
      fields[field.id] = field.type === 'checkbox' || field.type === 'radio' ? field.checked : field.value;
    });
    const snapshot = { version: 1, fields };
    const latest = state.recents[0];
    if (latest && latest.projectId === state.activeProjectId && latest.mode === mode && latest.summary === summary && JSON.stringify(latest.snapshot || null) === JSON.stringify(snapshot)) return;
    state.recents.unshift({ id: `recent-${Date.now()}`, projectId: state.activeProjectId, mode, modeLabel, title, summary, snapshot, time: Date.now() });
    state.recents = state.recents.slice(0, 60);
    saveState();
    renderRecents();
  }

  function scheduleCapture() {
    clearTimeout(captureTimer);
    captureTimer = setTimeout(captureCalculatorResult, 650);
  }

  function reportLabel(field) {
    const label = field.labels?.[0];
    if (!label) return field.id;
    return Array.from(label.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent.trim()).filter(Boolean).join(' ') || field.id;
  }

  function downloadHtml(filename, title, body) {
    const documentHtml = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,'Microsoft YaHei',sans-serif;max-width:920px;margin:36px auto;color:#172026;line-height:1.55}h1{font-size:24px}h2{font-size:17px;margin-top:28px;border-bottom:1px solid #ccd3d8;padding-bottom:7px}table{width:100%;border-collapse:collapse}th,td{padding:8px 9px;border:1px solid #ccd3d8;text-align:left}th{background:#eef1f3}.meta{color:#65717a}.warning{padding:10px;border-left:4px solid #d46b2a;background:#fff5eb}@media print{body{margin:0}.no-print{display:none}}</style></head><body><h1>${escapeHtml(title)}</h1>${body}<p class="warning">本报告用于学习和现场复核记录，不能替代设计文件、施工方案或质量验收记录。</p></body></html>`;
    const blob = new Blob([documentHtml], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 500);
  }

  function exportActiveCalculationReport() {
    const panel = get('page-calc').querySelector('.calc-panel.is-active:not([hidden])');
    if (!panel) return;
    const title = panel.querySelector('h3')?.textContent?.trim() || '工程计算报告';
    const inputs = Array.from(panel.querySelectorAll('input[id], select[id], textarea[id]')).map((field) => `<tr><th>${escapeHtml(reportLabel(field))}</th><td>${escapeHtml(field.type === 'checkbox' ? (field.checked ? '是' : '否') : field.value || '-')}</td></tr>`).join('');
    const results = Array.from(panel.querySelectorAll('.calc-results div')).map((row) => `<tr><th>${escapeHtml(row.querySelector('dt')?.textContent?.trim() || '')}</th><td>${escapeHtml(row.querySelector('dd')?.textContent?.trim() || '-')}</td></tr>`).join('');
    const formula = Array.from(panel.querySelectorAll('.calc-formula, .calc-explanation, .calculation-steps')).map((element) => element.textContent.trim()).filter(Boolean).join('；');
    const project = activeProject();
    const body = `<p class="meta">项目：${escapeHtml(project.name)}<br>生成时间：${new Date().toLocaleString('zh-CN')}</p><h2>已知条件</h2><table>${inputs || '<tr><td>无输入参数</td></tr>'}</table><h2>计算结果</h2><table>${results || '<tr><td>当前页面没有可导出的结果</td></tr>'}</table>${formula ? `<h2>公式与说明</h2><p>${escapeHtml(formula)}</p>` : ''}`;
    downloadHtml(`管工计算-${title}-${new Date().toISOString().slice(0, 10)}.html`, `${title} · 计算报告`, body);
  }

  function saveSearchHistory(detail) {
    if (!detail) return;
    const key = `${detail.category}:${detail.code || detail.title}`;
    state.searchHistory = [{ ...detail, key, time: Date.now() }, ...state.searchHistory.filter((entry) => entry.key !== key)].slice(0, 20);
    saveState();
    renderReferenceHistory();
  }

  function setMode(mode) {
    document.querySelectorAll('[data-home-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.homeMode === mode));
    document.querySelectorAll('[data-home-panel]').forEach((panel) => {
      const active = panel.dataset.homePanel === mode;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    localStorage.setItem('pipe-home-mode', mode);
    if (mode === 'learn') renderLearningProgress();
  }

  async function testWorkerResource() {
    if (!window.Worker) return false;
    return new Promise((resolve) => {
      let settled = false;
      let worker;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        worker?.terminate();
        resolve(value);
      };
      try {
        worker = new Worker('vendor/tesseract-worker.min.js');
        worker.onerror = () => finish(false);
        setTimeout(() => finish(true), 450);
      } catch (error) { finish(false); }
    });
  }

  async function resourceExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      return response.ok;
    } catch (error) { return false; }
  }

  async function runHealthCheck() {
    const button = get('homeHealthCheckBtn');
    button.disabled = true;
    button.textContent = '检查中…';
    get('homeHealthResults').innerHTML = '<span>正在检查本地资源…</span>';
    await Promise.allSettled([
      window.PipeResources.ensureThree(),
      window.PipeResources.ensurePdf(),
      window.PipeResources.ensureOcr()
    ]);
    let storageOk = false;
    try { localStorage.setItem('pipe-health-test', '1'); storageOk = localStorage.getItem('pipe-health-test') === '1'; localStorage.removeItem('pipe-health-test'); } catch (error) { storageOk = false; }
    let webglOk = false;
    try { const canvas = document.createElement('canvas'); webglOk = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')); } catch (error) { webglOk = false; }
    const [workerOk, chineseOk, englishOk, wasmOk] = await Promise.all([
      testWorkerResource(),
      resourceExists('vendor/tessdata/chi_sim.traineddata.gz'),
      resourceExists('vendor/tessdata/eng.traineddata.gz'),
      resourceExists('vendor/tesseract-core/tesseract-core.wasm')
    ]);
    const checks = [
      ['Three.js', !!window.THREE], ['WebGL', webglOk], ['PDF.js', !!window.pdfjsLib],
      ['OCR入口', !!window.Tesseract], ['OCR Worker', workerOk], ['中文模型', chineseOk],
      ['英文模型', englishOk], ['WASM核心', wasmOk], ['本地存储', storageOk]
    ];
    get('homeHealthResults').innerHTML = checks.map(([label, ok]) => `<span class="${ok ? 'is-ok' : 'is-error'}">${ok ? '正常' : '失败'} · ${label}</span>`).join('');
    button.disabled = false;
    button.textContent = '重新检查';
  }

  function bindEvents() {
    document.querySelectorAll('[data-home-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.homeMode)));
    document.querySelectorAll('[data-home-page]').forEach((button) => button.addEventListener('click', () => navigatePage(button.dataset.homePage)));
    document.querySelectorAll('[data-home-calc]').forEach((button) => button.addEventListener('click', () => openCalculator(button.dataset.homeCalc)));
    document.querySelectorAll('[data-home-reference]').forEach((button) => button.addEventListener('click', () => {
      const category = button.dataset.homeReference;
      navigatePage('glossary');
      if (category === 'size') setTimeout(() => get('nominalSizeBody')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40);
      else setTimeout(() => document.querySelector(`[data-reference-category="${category}"]`)?.click(), 20);
    }));
    document.querySelector('[data-home-action="wire"]').addEventListener('click', () => {
      navigatePage('trainer');
      setTimeout(() => get('wirePracticeBtn').click(), 30);
    });
    get('homeProjectSelect').addEventListener('change', (event) => { state.activeProjectId = event.target.value; saveState(); renderRecents(); window.dispatchEvent(new CustomEvent('pipe-project-change', { detail: { project: activeProject() } })); });
    get('homeAddProjectBtn').addEventListener('click', addProject);
    get('homeProjectName').addEventListener('keydown', (event) => { if (event.key === 'Enter') addProject(); });
    get('homeClearRecentBtn').addEventListener('click', () => { state.recents = state.recents.filter((entry) => entry.projectId !== state.activeProjectId); saveState(); renderRecents(); });
    get('homeRecentList').addEventListener('click', (event) => { const button = event.target.closest('[data-home-recent]'); const entry = state.recents.find((item) => item.id === button?.dataset.homeRecent); if (entry) openCalculator(entry.mode, entry.snapshot); });
    get('homeResumeBtn').addEventListener('click', () => { const entry = state.recents.find((item) => item.id === get('homeResumeBtn').dataset.recentId); if (entry) openCalculator(entry.mode, entry.snapshot); });
    get('homeReferenceSearchBtn').addEventListener('click', () => window.PipeGlobalSearch?.open(get('homeReferenceSearch').value.trim()));
    get('homeReferenceSearch').addEventListener('keydown', (event) => { if (event.key === 'Enter') window.PipeGlobalSearch?.open(event.target.value.trim()); });
    get('homeReferenceHistory').addEventListener('click', (event) => { const button = event.target.closest('[data-home-search-history]'); const entry = state.searchHistory[Number(button?.dataset.homeSearchHistory)]; if (entry) window.PipeGlobalSearch?.open(entry.code || entry.title); });
    get('homeHealthCheckBtn').addEventListener('click', runHealthCheck);
    get('exportCalcReportBtn').addEventListener('click', exportActiveCalculationReport);
    get('homeGloveToggle').addEventListener('change', (event) => { document.body.classList.toggle('glove-mode', event.target.checked); localStorage.setItem('pipe-glove-mode', event.target.checked ? '1' : '0'); });
    get('page-calc').addEventListener('input', scheduleCapture);
    get('page-calc').addEventListener('change', scheduleCapture);
    window.addEventListener('pipe-search-used', (event) => saveSearchHistory(event.detail));
    window.addEventListener('pipe-micro-progress', renderLearningProgress);
    window.addEventListener('pipe-coach-ready', renderCoachSummary);
    window.addEventListener('pipe-coach-updated', renderCoachSummary);
    window.addEventListener('pipe-profile-change', () => { loadState(); renderAll(); });
    document.querySelector('[data-page="home"]').addEventListener('click', renderAll);
  }

  loadState();
  bindEvents();
  const gloveMode = localStorage.getItem('pipe-glove-mode') === '1';
  get('homeGloveToggle').checked = gloveMode;
  document.body.classList.toggle('glove-mode', gloveMode);
  setMode(localStorage.getItem('pipe-home-mode') || 'field');
  renderAll();
  window.PipeHomeWorkbench = {
    getProjects: () => state.projects.map((project) => ({ ...project })),
    getActiveProject: () => ({ ...activeProject() }),
    selectProject(projectId) {
      if (!state.projects.some((project) => project.id === projectId)) return false;
      state.activeProjectId = projectId;
      saveState();
      renderAll();
      window.dispatchEvent(new CustomEvent('pipe-project-change', { detail: { project: activeProject() } }));
      return true;
    },
    exportActiveCalculationReport
  };
  window.dispatchEvent(new CustomEvent('pipe-workbench-ready', { detail: { project: activeProject() } }));
})();
