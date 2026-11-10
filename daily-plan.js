(function () {
  'use strict';

  const STORAGE_BASE = 'pipe-daily-plan';
  const stages = [
    { id: 1, name: '看懂方向', range: [1, 7], goal: '能快速说出管线走向' },
    { id: 2, name: '认识管件与测量', range: [8, 14], goal: '知道认什么、从哪里量' },
    { id: 3, name: '下料与计算', range: [15, 21], goal: '完成常用尺寸和偏移计算' },
    { id: 4, name: '现场综合', range: [22, 30], goal: '把图纸、材料和安装顺序连起来' }
  ];
  const items = [
    { day: 1, stage: 1, title: '方向与坐标正负号', objective: '说清E增加向东、N增加向北、EL降低向下。', practice: '微课01', target: { type: 'micro', lesson: 'directions' } },
    { day: 2, stage: 1, title: '六个基本方向', objective: '熟练判断东、西、南、北、上、下。', practice: '空间闯关第1级', target: { type: 'spatial', level: 1 } },
    { day: 3, stage: 1, title: '真实管线与辅助线', objective: '分清粗实线、尺寸线、投影虚线和阴影。', practice: '微课02', target: { type: 'micro', lesson: 'iso3d' } },
    { day: 4, stage: 1, title: '从P0追踪管线', objective: '只在真实方向变化时新增转折点。', practice: '空间闯关第2级', target: { type: 'spatial', level: 2 } },
    { day: 5, stage: 1, title: '弯头和三通方向', objective: '判断弯头与三通支口向上、向下、向北或向南。', practice: '微课03', target: { type: 'micro', lesson: 'fitting-direction' } },
    { day: 6, stage: 1, title: '方向符号对照', objective: '把常见图纸符号与空间外形对应。', practice: '资料基础识图', target: { type: 'reference', category: 'basics' } },
    { day: 7, stage: 1, title: '第一阶段复习', objective: '看简单单线图，完整说出方向顺序。', practice: '空间闯关第1～2级', target: { type: 'spatial', level: 2 } },

    { day: 8, stage: 2, title: 'DN、NPS、OD和SCH', objective: '理解公称尺寸、外径和壁厚系列的区别。', practice: '材料与规格术语', target: { type: 'reference', category: 'term', termCategory: 'material' } },
    { day: 9, stage: 2, title: '常用管件识别', objective: '认识弯头、三通、大小头、管帽和管箍。', practice: '管件图鉴', target: { type: 'reference', category: 'fitting' } },
    { day: 10, stage: 2, title: '常用法兰识别', objective: '区分WN、SO、SW、LJ和盲法兰。', practice: '法兰图鉴', target: { type: 'reference', category: 'flange' } },
    { day: 11, stage: 2, title: 'TOP、COP和BOP', objective: '理解管顶、管中心和管底三个标高基准。', practice: '标高关系图', target: { type: 'reference', category: 'basics' } },
    { day: 12, stage: 2, title: '现场测量基准', objective: '区分中心线、法兰密封面、端面和结构基准。', practice: '现场工作台', target: { type: 'page', page: 'field' } },
    { day: 13, stage: 2, title: '中心距与面到面', objective: '分清中心距、端到端和法兰面到面。', practice: '直管下料工具', target: { type: 'calc', mode: 'fabrication' } },
    { day: 14, stage: 2, title: '简单管路实测', objective: '在图中找起点、终点、管径和三个坐标。', practice: '立管转向案例', target: { type: 'trainer', preset: 'rise' } },

    { day: 15, stage: 3, title: '勾股定理', objective: '用3-4-5三角形计算斜边。', practice: '勾股与三角', target: { type: 'calc', mode: 'triangle-lab' } },
    { day: 16, stage: 3, title: '45度来回弯', objective: '理解偏移、斜长和水平占用。', practice: '来回弯计算', target: { type: 'calc', mode: 'return' } },
    { day: 17, stage: 3, title: '双平面空间偏移', objective: '合成两个平面偏移并求滚转角。', practice: '复合偏移计算', target: { type: 'calc', mode: 'compound' } },
    { day: 18, stage: 3, title: '坡度与标高', objective: '根据距离和坡度计算终点标高。', practice: '坡度标高工具', target: { type: 'calc', mode: 'slope' } },
    { day: 19, stage: 3, title: '直管下料与焊口间隙', objective: '从中心距扣除管件占用和焊口间隙。', practice: '微课04', target: { type: 'micro', lesson: 'cut-length' } },
    { day: 20, stage: 3, title: '死口与活口', objective: '理解闭合管段、调整量和复测时机。', practice: '闭合管段计算', target: { type: 'calc', mode: 'closure' } },
    { day: 21, stage: 3, title: '第三阶段复习', objective: '独立完成一道偏移和一道直管下料题。', practice: '下料工具复习', target: { type: 'calc', mode: 'fabrication' } },

    { day: 22, stage: 4, title: 'Spool图和预制口', objective: '区分预制焊口、现场焊口和拆分位置。', practice: '管道预制模块', target: { type: 'module', track: 'prefab', lesson: 'fab-spool' } },
    { day: 23, stage: 4, title: '材料表与图纸文件', objective: '认识BOM、MTO、Spool、图号和版本。', practice: '图纸与文件术语', target: { type: 'reference', category: 'term', termCategory: 'drawing' } },
    { day: 24, stage: 4, title: '阀门、支架和设备口', objective: '理解安装方向、操作空间和设备口保护。', practice: '石油管线安装课', target: { type: 'module', track: 'petroleum', lesson: 'oil-install' } },
    { day: 25, stage: 4, title: '动火、吊装和受控开管', objective: '知道哪些情况必须停止并重新确认许可和隔离。', practice: '改造与切割模块', target: { type: 'module', track: 'retrofit', lesson: 'retro-isolation' } },
    { day: 26, stage: 4, title: '铁丝弯制', objective: '只按真实转折点弯出完整管路。', practice: '铁丝实操', target: { type: 'wire' } },
    { day: 27, stage: 4, title: '真实考试图拆解', objective: '从复杂图中排除尺寸线和投影干扰。', practice: '空间闯关第6级', target: { type: 'spatial', level: 6 } },
    { day: 28, stage: 4, title: '综合模拟考试', objective: '完成识图、方向、符号和尺寸四项练习。', practice: '改造闭合案例', target: { type: 'trainer', preset: 'advanced' } },
    { day: 29, stage: 4, title: '薄弱项复习', objective: '只复习错误最多的三个知识点。', practice: '学习教练', target: { type: 'page', page: 'coach' } },
    { day: 30, stage: 4, title: '重新测评与总结', objective: '完成能力测评，对比第1天并确定下一阶段。', practice: '能力测评', target: { type: 'coach-assessment' } }
  ];

  let completed = new Set();
  const get = (id) => document.getElementById(id);
  const profileId = () => window.PipeTrainerApp?.getActiveProfileId?.() || 'default';
  const storageKey = () => `${STORAGE_BASE}:${profileId()}`;

  function loadProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey()) || '[]');
      completed = new Set(Array.isArray(stored) ? stored.map(Number).filter((day) => day >= 1 && day <= 30) : []);
    } catch (error) { completed = new Set(); }
  }

  function saveProgress() {
    const value = Array.from(completed).sort((a, b) => a - b);
    let saved = false;
    if (window.PipeTrainerApp?.saveProfileData) saved = window.PipeTrainerApp.saveProfileData(STORAGE_BASE, value);
    else {
      try { localStorage.setItem(storageKey(), JSON.stringify(value)); saved = true; } catch (error) { console.error('30天计划进度保存失败:', error); }
    }
    if (!saved) return false;
    const detail = getProgress();
    window.dispatchEvent(new CustomEvent('pipe-daily-plan-progress', { detail }));
    return true;
  }

  function getProgress() {
    const next = items.find((item) => !completed.has(item.day)) || null;
    return { completed: completed.size, total: items.length, nextDay: next?.day || null, nextTitle: next?.title || '30天计划已完成' };
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function renderStageSummary(nextDay) {
    get('dailyPlanStageSummary').innerHTML = stages.map((stage) => {
      const total = stage.range[1] - stage.range[0] + 1;
      const done = items.filter((item) => item.stage === stage.id && completed.has(item.day)).length;
      const current = nextDay && nextDay >= stage.range[0] && nextDay <= stage.range[1];
      return `<div class="daily-stage-stat${done === total ? ' is-complete' : current ? ' is-current' : ''}"><span>阶段${stage.id} · 第${stage.range[0]}～${stage.range[1]}天</span><strong>${escapeHtml(stage.name)}</strong><small>${done} / ${total} · ${escapeHtml(stage.goal)}</small></div>`;
    }).join('');
  }

  function render() {
    const progress = getProgress();
    const next = items.find((item) => item.day === progress.nextDay) || null;
    get('dailyPlanProgressText').textContent = `${progress.completed} / ${progress.total}`;
    get('dailyPlanProgressBar').style.width = `${progress.completed / progress.total * 100}%`;
    get('dailyPlanNextTitle').textContent = next ? `第${next.day}天 · ${next.title}` : '30天计划已完成';
    get('dailyPlanNextMeta').textContent = next ? `第${next.stage}阶段 · ${stages[next.stage - 1].name}` : '可以重新测评并制定下一阶段';
    get('dailyPlanContinueBtn').textContent = next ? `开始第${next.day}天` : '重新能力测评';
    get('dailyPlanContinueBtn').dataset.day = next?.day || '30';
    renderStageSummary(next?.day || null);
    get('dailyPlanStages').innerHTML = stages.map((stage) => {
      const stageItems = items.filter((item) => item.stage === stage.id);
      const done = stageItems.filter((item) => completed.has(item.day)).length;
      const current = next && next.stage === stage.id;
      return `<details class="daily-stage"${current || (!next && stage.id === 4) ? ' open' : ''}><summary><b>${String(stage.id).padStart(2, '0')}</b><span><strong>${escapeHtml(stage.name)}</strong><small>${escapeHtml(stage.goal)}</small></span><em>${done} / ${stageItems.length}</em></summary><div class="daily-stage-list">${stageItems.map((item) => {
        const complete = completed.has(item.day);
        const isNext = next?.day === item.day;
        return `<article class="daily-plan-row${complete ? ' is-complete' : ''}${isNext ? ' is-next' : ''}" data-plan-day="${item.day}"><div class="daily-day-badge">${complete ? '✓' : `D${item.day}`}</div><div class="daily-plan-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.objective)}</span><small>${escapeHtml(item.practice)}</small></div><div class="daily-plan-actions"><button class="daily-start-btn" type="button" data-plan-start="${item.day}">${complete ? '再练一次' : '开始学习'}</button><button class="daily-complete-btn" type="button" data-plan-complete="${item.day}" aria-pressed="${complete}">${complete ? '已完成' : '完成当天'}</button></div></article>`;
      }).join('')}</div></details>`;
    }).join('');
  }

  function startDay(day) {
    const item = items.find((entry) => entry.day === Number(day));
    if (!item) return;
    const target = item.target;
    if (target.type === 'micro') window.PipeMicroLessons?.openLesson?.(target.lesson);
    else if (target.type === 'spatial') window.PipeSpatialTraining?.openLevel?.(target.level);
    else if (target.type === 'reference') window.PipeReferenceLibrary?.openCategory?.(target.category, { termCategory: target.termCategory, query: target.query || '' });
    else if (target.type === 'calc') window.PipeTrainerApp?.openCalculator?.(target.mode);
    else if (target.type === 'trainer') window.PipeTrainerApp?.openPreset?.(target.preset);
    else if (target.type === 'module') window.PipeTrainerApp?.openModule?.(target.track, target.lesson);
    else if (target.type === 'wire') {
      window.PipeTrainerApp?.navigate?.('trainer');
      setTimeout(() => document.getElementById('wirePracticeBtn')?.click(), 50);
    } else if (target.type === 'coach-assessment') {
      window.PipeTrainerApp?.navigate?.('coach');
      setTimeout(() => document.getElementById('coachStartBtn')?.click(), 40);
    } else if (target.type === 'page') window.PipeTrainerApp?.navigate?.(target.page);
  }

  function toggleComplete(day) {
    const value = Number(day);
    const wasComplete = completed.has(value);
    if (wasComplete) completed.delete(value);
    else completed.add(value);
    if (!saveProgress()) {
      if (wasComplete) completed.add(value);
      else completed.delete(value);
    }
    render();
  }

  function bindEvents() {
    get('dailyPlanContinueBtn').addEventListener('click', (event) => startDay(event.currentTarget.dataset.day));
    get('dailyPlanStages').addEventListener('click', (event) => {
      const start = event.target.closest('[data-plan-start]');
      const complete = event.target.closest('[data-plan-complete]');
      if (start) startDay(start.dataset.planStart);
      if (complete) toggleComplete(complete.dataset.planComplete);
    });
    window.addEventListener('pipe-profile-change', () => { loadProgress(); render(); });
    window.addEventListener('pipe-page-change', (event) => { if (event.detail.page === 'route') render(); });
  }

  loadProgress();
  bindEvents();
  render();
  window.PipeDailyPlan = { items: items.map((item) => ({ ...item, target: { ...item.target } })), getProgress, startDay, render };
  window.dispatchEvent(new CustomEvent('pipe-daily-plan-progress', { detail: getProgress() }));
})();
