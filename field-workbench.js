(function () {
  'use strict';

  const BASE = 'pipe-field-records';
  const get = (id) => document.getElementById(id);
  let records = [];
  let activeFilter = 'all';

  const profileId = () => window.PipeTrainerApp?.getActiveProfileId?.() || 'default';
  const storageKey = () => `${BASE}:${profileId()}`;
  const projects = () => window.PipeHomeWorkbench?.getProjects?.() || [{ id: 'default', name: '我的现场' }];
  const activeProject = () => window.PipeHomeWorkbench?.getActiveProject?.() || projects()[0];

  function loadRecords() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey()) || '[]');
      records = Array.isArray(parsed) ? parsed : [];
    } catch (error) { records = []; }
  }

  function saveRecords() {
    try { localStorage.setItem(storageKey(), JSON.stringify(records)); } catch (error) {
      get('fieldFormMessage').textContent = '保存失败，请先导出备份并清理本机存储。';
      get('fieldFormMessage').className = 'status-line is-error';
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function readNumber(id) {
    const value = get(id).value.trim();
    return value === '' ? null : Number(value);
  }

  function recordStatus(record) {
    if (!Number.isFinite(record.design) || !Number.isFinite(record.actual)) return { key: 'record', label: '已记录' };
    const deviation = record.actual - record.design;
    const tolerance = Number.isFinite(record.tolerance) ? Math.abs(record.tolerance) : 0;
    return Math.abs(deviation) <= tolerance ? { key: 'ok', label: '合格' } : { key: 'out', label: '超差' };
  }

  function recordDeviation(record) {
    return Number.isFinite(record.design) && Number.isFinite(record.actual) ? record.actual - record.design : null;
  }

  function renderProjects() {
    const current = activeProject();
    get('fieldProjectSelect').innerHTML = projects().map((project) => `<option value="${escapeHtml(project.id)}"${project.id === current.id ? ' selected' : ''}>${escapeHtml(project.name)}</option>`).join('');
  }

  function currentRecords() {
    const id = activeProject().id;
    return records.filter((record) => record.projectId === id);
  }

  function filteredRecords() {
    const list = currentRecords();
    if (activeFilter === 'out') return list.filter((record) => recordStatus(record).key === 'out');
    if (activeFilter === 'recheck') return list.filter((record) => record.recheck);
    return list;
  }

  function renderRecords() {
    renderProjects();
    const all = currentRecords();
    const out = all.filter((record) => recordStatus(record).key === 'out').length;
    const recheck = all.filter((record) => record.recheck).length;
    get('fieldProjectStats').textContent = `${all.length}条 · ${out}条超差 · ${recheck}条待复测`;
    const list = filteredRecords();
    get('fieldRecordList').innerHTML = list.length ? list.map((record) => {
      const status = recordStatus(record);
      const deviation = recordDeviation(record);
      const values = [];
      if (Number.isFinite(record.design)) values.push(`设计 ${record.design}${record.unit}`);
      if (Number.isFinite(record.actual)) values.push(`实测 ${record.actual}${record.unit}`);
      if (Number.isFinite(deviation)) values.push(`偏差 ${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}${record.unit}`);
      if ([record.e, record.n, record.el].some(Number.isFinite)) values.push(`E ${record.e ?? '-'} · N ${record.n ?? '-'} · EL ${record.el ?? '-'}`);
      return `<article class="field-record-row" data-field-record="${escapeHtml(record.id)}"><div class="field-record-main"><div class="field-record-title"><strong>${escapeHtml(record.type)} · ${escapeHtml(record.tag)}</strong><span class="field-status is-${status.key}">${status.label}</span>${record.recheck ? '<span class="field-status is-recheck">待复测</span>' : ''}</div><div class="field-record-values">${values.map((value) => `<span>${escapeHtml(value)}</span>`).join('')}</div>${record.note ? `<div class="field-record-note">${escapeHtml(record.note)}</div>` : ''}<small>${new Date(record.createdAt).toLocaleString('zh-CN')}</small></div><div class="field-record-actions"><button type="button" data-field-recheck="${escapeHtml(record.id)}">${record.recheck ? '完成复测' : '标记复测'}</button><button type="button" data-field-delete="${escapeHtml(record.id)}" aria-label="删除记录">×</button></div></article>`;
    }).join('') : '<div class="field-record-empty">当前筛选下没有记录。</div>';
  }

  function clearForm() {
    ['fieldRecordTag', 'fieldDesignValue', 'fieldActualValue', 'fieldRecordE', 'fieldRecordN', 'fieldRecordEL', 'fieldRecordNote'].forEach((id) => { get(id).value = ''; });
    get('fieldTolerance').value = '3';
    get('fieldNeedsRecheck').checked = false;
  }

  function saveRecord() {
    const tag = get('fieldRecordTag').value.trim();
    const note = get('fieldRecordNote').value.trim();
    const design = readNumber('fieldDesignValue');
    const actual = readNumber('fieldActualValue');
    const e = readNumber('fieldRecordE');
    const n = readNumber('fieldRecordN');
    const el = readNumber('fieldRecordEL');
    if (!tag) {
      get('fieldFormMessage').textContent = '请填写位号或点号。';
      get('fieldFormMessage').className = 'status-line is-error';
      return;
    }
    if (![design, actual, e, n, el].some(Number.isFinite) && !note) {
      get('fieldFormMessage').textContent = '请至少填写一项测量值、坐标或备注。';
      get('fieldFormMessage').className = 'status-line is-error';
      return;
    }
    const record = {
      id: `field-${Date.now()}`,
      projectId: activeProject().id,
      type: get('fieldRecordType').value,
      tag,
      design,
      actual,
      tolerance: Math.max(0, readNumber('fieldTolerance') ?? 0),
      unit: get('fieldRecordUnit').value,
      e, n, el, note,
      recheck: get('fieldNeedsRecheck').checked,
      createdAt: new Date().toISOString(),
      reviewedAt: null
    };
    records.unshift(record);
    records = records.slice(0, 500);
    saveRecords();
    clearForm();
    renderRecords();
    const status = recordStatus(record);
    get('fieldFormMessage').textContent = `已保存：${record.type} ${record.tag}，状态${status.label}${record.recheck ? '，待复测' : ''}。`;
    get('fieldFormMessage').className = `status-line ${status.key === 'out' ? 'is-error' : 'is-success'}`;
  }

  function toggleRecheck(id) {
    const record = records.find((item) => item.id === id);
    if (!record) return;
    record.recheck = !record.recheck;
    record.reviewedAt = record.recheck ? null : new Date().toISOString();
    saveRecords();
    renderRecords();
  }

  function deleteRecord(id) {
    records = records.filter((item) => item.id !== id);
    saveRecords();
    renderRecords();
  }

  function reportRows(list) {
    return list.map((record, index) => {
      const status = recordStatus(record);
      const deviation = recordDeviation(record);
      const coords = [record.e, record.n, record.el].some(Number.isFinite) ? `E ${record.e ?? '-'} / N ${record.n ?? '-'} / EL ${record.el ?? '-'}` : '-';
      return `<tr><td>${index + 1}</td><td>${escapeHtml(record.type)}</td><td>${escapeHtml(record.tag)}</td><td>${record.design ?? '-'}</td><td>${record.actual ?? '-'}</td><td>${Number.isFinite(deviation) ? `${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}` : '-'}</td><td>${escapeHtml(record.unit)}</td><td>${escapeHtml(coords)}</td><td>${escapeHtml(record.note || '-')}</td><td>${status.label}${record.recheck ? ' / 待复测' : ''}</td></tr>`;
    }).join('');
  }

  function exportReport() {
    const project = activeProject();
    const list = currentRecords();
    if (!list.length) {
      get('fieldFormMessage').textContent = '当前项目没有可导出的记录。';
      get('fieldFormMessage').className = 'status-line is-error';
      return;
    }
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(project.name)}现场测量记录</title><style>body{font-family:Arial,'Microsoft YaHei',sans-serif;margin:28px;color:#172026}h1{font-size:22px}.meta{color:#65717a}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #aeb8bf;padding:6px;text-align:left;vertical-align:top}th{background:#eef1f3}.warning{margin-top:18px;padding:9px;border-left:4px solid #d46b2a;background:#fff5eb}</style></head><body><h1>${escapeHtml(project.name)} · 现场测量记录</h1><p class="meta">生成时间：${new Date().toLocaleString('zh-CN')} · 共${list.length}条</p><table><thead><tr><th>序号</th><th>类型</th><th>位号</th><th>设计</th><th>实测</th><th>偏差</th><th>单位</th><th>坐标</th><th>备注</th><th>状态</th></tr></thead><tbody>${reportRows(list)}</tbody></table><p class="warning">本报告是现场复核草稿，正式交工、质量验收和偏差处理须使用项目批准表单并由责任人员签认。</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name}-现场记录-${new Date().toISOString().slice(0, 10)}.html`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 500);
  }

  function bindEvents() {
    get('fieldBackBtn').addEventListener('click', () => window.PipeTrainerApp?.back?.());
    get('fieldSaveRecordBtn').addEventListener('click', saveRecord);
    get('fieldProjectSelect').addEventListener('change', (event) => window.PipeHomeWorkbench?.selectProject?.(event.target.value));
    document.querySelectorAll('[data-field-page]').forEach((button) => button.addEventListener('click', () => window.PipeTrainerApp?.navigate?.(button.dataset.fieldPage)));
    document.querySelectorAll('[data-field-filter]').forEach((button) => button.addEventListener('click', () => {
      activeFilter = button.dataset.fieldFilter;
      document.querySelectorAll('[data-field-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
      renderRecords();
    }));
    get('fieldRecordList').addEventListener('click', (event) => {
      const recheck = event.target.closest('[data-field-recheck]');
      const remove = event.target.closest('[data-field-delete]');
      if (recheck) toggleRecheck(recheck.dataset.fieldRecheck);
      if (remove && confirm('确定删除这条现场记录吗？')) deleteRecord(remove.dataset.fieldDelete);
    });
    get('fieldExportBtn').addEventListener('click', exportReport);
    get('fieldClearBtn').addEventListener('click', () => {
      if (!currentRecords().length || !confirm('确定清空当前项目的全部现场记录吗？')) return;
      const projectId = activeProject().id;
      records = records.filter((record) => record.projectId !== projectId);
      saveRecords();
      renderRecords();
    });
    window.addEventListener('pipe-project-change', renderRecords);
    window.addEventListener('pipe-workbench-ready', renderRecords);
    window.addEventListener('pipe-profile-change', () => { loadRecords(); renderRecords(); });
    window.addEventListener('pipe-page-change', (event) => { if (event.detail.page === 'field') renderRecords(); });
  }

  loadRecords();
  bindEvents();
  renderRecords();
  window.PipeFieldWorkbench = { render: renderRecords, getRecords: () => records.map((record) => ({ ...record })) };
})();
