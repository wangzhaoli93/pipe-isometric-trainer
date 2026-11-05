(function () {
  'use strict';

  const get = (id) => document.getElementById(id);
  const categoryLabels = { abbr: '缩写', reference: '图鉴', calculator: '计算', size: '管径', page: '页面' };
  let activeFilter = 'all';
  let activeResultIndex = -1;
  let currentResults = [];
  let previousFocus = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[\s&./_\-()·:,，：]+/g, '');
  }

  function searchIndex() {
    const entries = [];
    (window.PipeAbbreviationData || []).forEach((item) => entries.push({
      id: `abbr-${item.code}`, category: 'abbr', code: item.code, title: item.english, description: item.chinese,
      keywords: `${item.code} ${item.english} ${item.chinese}`
    }));
    (window.PipeReferenceLibrary?.items || []).forEach((item, index) => entries.push({
      id: `reference-${index}`, category: 'reference', code: item.code, title: item.name, description: `${item.description} ${item.identify}`,
      keywords: [item.code, item.name, item.description, item.identify, item.standard, item.note, ...(item.tags || [])].join(' ')
    }));
    document.querySelectorAll('.calc-tab').forEach((tab) => {
      const mode = tab.dataset.calcMode;
      const panel = document.getElementById(`calc-${mode}`);
      const title = panel?.querySelector('h3')?.textContent || tab.textContent.trim();
      const description = panel?.querySelector('.calc-controls > p')?.textContent || `${tab.textContent.trim()}计算工具`;
      entries.push({ id: `calculator-${mode}`, category: 'calculator', code: '', title, description, keywords: `${tab.textContent} ${title} ${description}`, mode });
    });
    (window.PipeFieldTools?.pipeCatalog || []).forEach((item) => entries.push({
      id: `size-${item.dn}`, category: 'size', code: `DN${item.dn} / NPS ${item.nps}`, title: `${item.inch}管径`,
      description: `常用OD ${item.od} mm，90° LR ${item.lr} mm，90° SR ${item.sr === null ? '无参考' : `${item.sr} mm`}`,
      keywords: `DN${item.dn} NPS${item.nps} ${item.inch} OD${item.od} LR${item.lr} SR${item.sr || ''}`, dn: item.dn
    }));
    document.querySelectorAll('.top-tab').forEach((tab) => entries.push({
      id: `page-${tab.dataset.page}`, category: 'page', code: '', title: tab.textContent.trim(), description: `打开${tab.textContent.trim()}页面`, keywords: tab.textContent.trim(), page: tab.dataset.page
    }));
    entries.push({ id: 'page-lessons', category: 'page', code: '', title: '图文动画课', description: '方向坐标、单线图变3D、管件方向、下料和考试图拆解', keywords: '微课 图文 动画 示例 教程 学习', page: 'lessons' });
    return entries;
  }

  function scoreEntry(entry, query) {
    const raw = query.toLowerCase();
    const compact = normalize(query);
    const code = entry.code.toLowerCase();
    const title = entry.title.toLowerCase();
    const haystack = `${entry.code} ${entry.title} ${entry.description} ${entry.keywords || ''}`.toLowerCase();
    const normalizedHaystack = normalize(haystack);
    if (code === raw || normalize(code) === compact) return 120;
    if (code.startsWith(raw) || normalize(code).startsWith(compact)) return 105;
    if (title === raw || normalize(title) === compact) return 100;
    if (title.startsWith(raw) || normalize(title).startsWith(compact)) return 90;
    if (/^[a-z]{1,3}$/i.test(query)) {
      const tokens = haystack.split(/[^a-z0-9]+/).filter(Boolean);
      return tokens.includes(raw) ? 80 : 0;
    }
    if (haystack.includes(raw)) return 75;
    if (compact && normalizedHaystack.includes(compact)) return 60;
    return 0;
  }

  function highlighted(value, query) {
    const text = String(value || '');
    if (!query) return escapeHtml(text);
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index < 0) return escapeHtml(text);
    return `${escapeHtml(text.slice(0, index))}<mark>${escapeHtml(text.slice(index, index + query.length))}</mark>${escapeHtml(text.slice(index + query.length))}`;
  }

  function renderSearchResults() {
    const query = get('globalSearchInput').value.trim();
    const entries = searchIndex();
    let results;
    if (!query) {
      const commonCodes = ['ISO', 'P&ID', 'DN', 'NPS', 'OD', 'SCH', 'EL', 'BOP', 'TOP', 'WN', 'SO', 'SW'];
      results = commonCodes.map((code) => entries.find((entry) => entry.category === 'abbr' && entry.code === code)).filter(Boolean);
    } else {
      results = entries.map((entry) => ({ entry, score: scoreEntry(entry, query) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'zh-CN')).map((item) => item.entry);
    }
    if (activeFilter !== 'all') results = results.filter((entry) => entry.category === activeFilter);
    currentResults = results.slice(0, 50);
    activeResultIndex = currentResults.length ? 0 : -1;
    get('globalSearchCount').textContent = query ? `找到 ${results.length} 项${results.length > 50 ? '，显示前50项' : ''}` : '常用缩写';
    get('globalSearchEmpty').hidden = currentResults.length > 0;
    get('globalSearchResults').innerHTML = currentResults.map((entry, index) => `<button class="global-search-result${index === activeResultIndex ? ' is-active' : ''}" type="button" data-global-result="${index}">
      <span>${categoryLabels[entry.category]}</span><div><strong>${highlighted(entry.title, query)}</strong><p>${highlighted(entry.description, query)}</p></div>${entry.code ? `<code>${highlighted(entry.code, query)}</code>` : ''}
    </button>`).join('');
  }

  function updateActiveResult(nextIndex) {
    if (!currentResults.length) return;
    activeResultIndex = (nextIndex + currentResults.length) % currentResults.length;
    document.querySelectorAll('[data-global-result]').forEach((button, index) => button.classList.toggle('is-active', index === activeResultIndex));
    document.querySelector(`[data-global-result="${activeResultIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  function showGlossaryDetail(entry) {
    document.querySelector('[data-page="glossary"]')?.click();
    const detail = get('glossarySearchDetail');
    detail.hidden = false;
    get('glossarySearchKind').textContent = categoryLabels[entry.category];
    get('glossarySearchCode').textContent = entry.code || entry.title;
    get('glossarySearchEnglish').textContent = entry.title;
    get('glossarySearchChinese').textContent = entry.description;
    setTimeout(() => {
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
      detail.classList.add('global-search-target');
      setTimeout(() => detail.classList.remove('global-search-target'), 1700);
    }, 40);
  }

  function openCalculator(entry) {
    document.querySelector('[data-page="calc"]')?.click();
    const tab = document.querySelector(`[data-calc-mode="${entry.mode}"]`);
    tab?.click();
    setTimeout(() => {
      const panel = document.getElementById(`calc-${entry.mode}`);
      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      panel?.classList.add('global-search-target');
      setTimeout(() => panel?.classList.remove('global-search-target'), 1700);
    }, 40);
  }

  function openSize(entry) {
    document.querySelector('[data-page="glossary"]')?.click();
    setTimeout(() => {
      const row = Array.from(document.querySelectorAll('#nominalSizeBody tr')).find((item) => item.cells[0]?.textContent === String(entry.dn));
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row?.classList.add('global-search-target');
      setTimeout(() => row?.classList.remove('global-search-target'), 1700);
    }, 40);
  }

  function activateResult(index) {
    const entry = currentResults[index];
    if (!entry) return;
    window.dispatchEvent(new CustomEvent('pipe-search-used', { detail: { category: entry.category, code: entry.code, title: entry.title, description: entry.description } }));
    closeSearch();
    if (entry.category === 'abbr') showGlossaryDetail(entry);
    else if (entry.category === 'reference') window.PipeReferenceLibrary?.showItem(entry.code);
    else if (entry.category === 'calculator') openCalculator(entry);
    else if (entry.category === 'size') openSize(entry);
    else if (entry.category === 'page') {
      const tab = document.querySelector(`[data-page="${entry.page}"]`);
      if (tab) tab.click();
      else document.querySelector(`[data-home-page="${entry.page}"]`)?.click();
    }
  }

  function openSearch(initialValue = '') {
    previousFocus = document.activeElement;
    get('globalSearchOverlay').hidden = false;
    document.body.classList.add('global-search-open');
    get('globalSearchInput').value = initialValue;
    activeFilter = 'all';
    document.querySelectorAll('[data-global-filter]').forEach((button) => button.classList.toggle('is-active', button.dataset.globalFilter === 'all'));
    renderSearchResults();
    setTimeout(() => get('globalSearchInput').focus(), 0);
  }

  function closeSearch() {
    get('globalSearchOverlay').hidden = true;
    document.body.classList.remove('global-search-open');
    previousFocus?.focus?.();
  }

  get('globalSearchBtn').addEventListener('click', () => openSearch());
  get('globalSearchCloseBtn').addEventListener('click', closeSearch);
  get('globalSearchOverlay').addEventListener('click', (event) => { if (event.target === get('globalSearchOverlay')) closeSearch(); });
  get('globalSearchInput').addEventListener('input', renderSearchResults);
  get('globalSearchFilters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-global-filter]');
    if (!button) return;
    activeFilter = button.dataset.globalFilter;
    document.querySelectorAll('[data-global-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
    renderSearchResults();
  });
  get('globalSearchResults').addEventListener('click', (event) => {
    const button = event.target.closest('[data-global-result]');
    if (button) activateResult(Number(button.dataset.globalResult));
  });
  get('globalSearchInput').addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); updateActiveResult(activeResultIndex + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); updateActiveResult(activeResultIndex - 1); }
    else if (event.key === 'Enter' && activeResultIndex >= 0) { event.preventDefault(); activateResult(activeResultIndex); }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      if (get('globalSearchOverlay').hidden) openSearch();
      else get('globalSearchInput').focus();
    } else if (event.key === 'Escape' && !get('globalSearchOverlay').hidden) {
      event.preventDefault();
      closeSearch();
    }
  });
  window.PipeGlobalSearch = { open: openSearch, close: closeSearch };
})();
