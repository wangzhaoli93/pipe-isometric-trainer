(function () {
  'use strict';

  const BASE = 'pipe-learning-coach';
  const CATEGORIES = {
    direction: { label: '方向坐标', destination: 'spatial', note: 'E、N、EL正负号和标高变化' },
    spatial: { label: '空间识图', destination: 'spatial', note: '沿真实中心线追踪多平面走向' },
    calculation: { label: '几何计算', destination: 'calc', note: '勾股、角度、偏移与下料计算' },
    symbols: { label: '图纸符号', destination: 'glossary', note: '缩写、焊口、法兰和管件符号' },
    field: { label: '现场施工', destination: 'modules', note: '安全、质量、测量和安装顺序' }
  };
  const QUESTIONS = [
    { category: 'direction', text: 'P0的N坐标为1000，P1为1600，E和EL不变，管段方向是什么？', choices: ['向南 N-', '向北 N+', '向东 E+', '上升 EL+'], answer: 1, why: 'N增加600，所以方向为向北N+。' },
    { category: 'direction', text: '管道从EL 3200降到EL 2450，其他坐标不变，应记为什么方向？', choices: ['EL+', 'EL-', 'E-', 'N-'], answer: 1, why: '终点标高降低750，所以是下降EL-。' },
    { category: 'spatial', text: '单线图中的尺寸线、投影虚线和阴影三角形，应不应该分别算作真实管段？', choices: ['全部算', '只算阴影', '都不算，只沿中心粗实线', '只算尺寸线'], answer: 2, why: '真实管路只沿连续中心实线和实际转折点追踪。' },
    { category: 'spatial', text: '一根空间斜管同时改变E、N和EL，它在路径步骤中应该怎样填写？', choices: ['拆成三根管', '填写一个XYZ空间斜段', '只填写高差', '忽略该段'], answer: 1, why: '三个坐标分量共同描述同一根空间斜管。' },
    { category: 'calculation', text: '平面偏移为600mm，高差为800mm，斜管中心线真长是多少？', choices: ['1000mm', '1200mm', '1400mm', '200mm'], answer: 0, why: '√(600²+800²)=1000mm。' },
    { category: 'calculation', text: '中心距900mm，两端管件占用各150mm，两道焊口间隙各2mm，直管净下料是多少？', choices: ['900mm', '600mm', '596mm', '604mm'], answer: 2, why: '900-150-150-2-2=596mm。' },
    { category: 'symbols', text: '图纸中的FW通常表示什么？', choices: ['法兰重量', '现场焊口', '固定支架', '流向'], answer: 1, why: 'FW通常表示Field Weld，即现场焊口。' },
    { category: 'symbols', text: 'WN法兰通常指哪一种？', choices: ['盲板法兰', '螺纹法兰', '对焊颈法兰', '平焊法兰'], answer: 2, why: 'WN是Weld Neck Flange，对焊颈法兰。' },
    { category: 'field', text: '模块接口横向错开25mm，现场第一步应该怎么做？', choices: ['强行拉正', '复测基准和坐标并报告偏差', '直接切开', '扩大螺栓孔'], answer: 1, why: '先复测并确认偏差来源，再按批准方案处理。' },
    { category: 'field', text: '承压管道准备切割改造，最先要确认什么？', choices: ['油漆颜色', '隔离、泄压、置换和许可', '工人数量', '下班时间'], answer: 1, why: '必须先完成系统隔离、泄压置换和作业许可。' }
  ];

  let state;
  let questionIndex = 0;
  let selectedAnswer = null;
  let assessmentAnswers = [];

  const get = (id) => document.getElementById(id);
  const profileId = () => window.PipeTrainerApp?.getActiveProfileId?.() || 'default';
  const storageKey = () => `${BASE}:${profileId()}`;

  function defaultState() {
    return { version: 1, assessment: null, mistakes: [] };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey()) || 'null');
      state = parsed?.version === 1 && Array.isArray(parsed.mistakes) ? parsed : defaultState();
    } catch (error) { state = defaultState(); }
  }

  function saveState() {
    try { localStorage.setItem(storageKey(), JSON.stringify(state)); } catch (error) { /* learning history is non-critical */ }
    window.dispatchEvent(new CustomEvent('pipe-coach-updated', { detail: getSummary() }));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function inferCategory(value) {
    const text = String(value || '').toLowerCase();
    if (/缩写|法兰|wn|fw|符号|焊口|管件/.test(text)) return 'symbols';
    if (/计算|坐标累计|勾股|角度|下料|偏移|长度|坡度/.test(text)) return 'calculation';
    if (/安全|动火|吊装|隔离|许可|支架|现场|施工|改造/.test(text)) return 'field';
    if (/方向|标高|e\+|e-|n\+|n-|el/.test(text)) return 'direction';
    return 'spatial';
  }

  function legacyMistakes() {
    const result = [];
    try {
      const wrong = JSON.parse(localStorage.getItem(`pipe-wrong-questions:${profileId()}`) || '[]');
      if (Array.isArray(wrong)) wrong.forEach((item) => result.push({ id: item.id, category: inferCategory(`${item.id} ${item.label}`), label: item.label, destination: item.destination, time: item.time || new Date().toISOString() }));
    } catch (error) { /* use collected mistakes */ }
    try {
      const spatial = JSON.parse(localStorage.getItem(`pipe-spatial-training-v1:${profileId()}`) || '{}');
      (spatial.wrong || []).forEach((id) => {
        const level = Number(String(id).match(/^l(\d)/)?.[1] || 0);
        const category = level === 1 || level === 3 ? 'direction' : level === 5 ? 'calculation' : 'spatial';
        result.push({ id: `spatial-${id}`, category, label: `空间闯关错题 ${id.toUpperCase()}`, destination: 'spatial', time: new Date().toISOString() });
      });
    } catch (error) { /* use collected mistakes */ }
    return result;
  }

  function allMistakes() {
    const map = new Map();
    [...state.mistakes, ...legacyMistakes()].forEach((item) => map.set(item.id || `${item.category}-${item.label}`, item));
    return Array.from(map.values()).sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  function assessmentScores() {
    return state.assessment?.scores || Object.fromEntries(Object.keys(CATEGORIES).map((key) => [key, null]));
  }

  function effectiveScores() {
    const scores = assessmentScores();
    const counts = Object.fromEntries(Object.keys(CATEGORIES).map((key) => [key, 0]));
    allMistakes().forEach((item) => { if (counts[item.category] !== undefined) counts[item.category] += 1; });
    return Object.fromEntries(Object.keys(CATEGORIES).map((key) => {
      if (scores[key] === null || scores[key] === undefined) return [key, null];
      return [key, Math.max(0, scores[key] - Math.min(30, counts[key] * 5))];
    }));
  }

  function getSummary() {
    const scores = effectiveScores();
    const values = Object.values(scores).filter(Number.isFinite);
    const average = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    const weakest = Object.keys(scores).filter((key) => Number.isFinite(scores[key])).sort((a, b) => scores[a] - scores[b])[0] || null;
    return { assessed: Boolean(state?.assessment), average, weakest, weakestLabel: weakest ? CATEGORIES[weakest].label : '', mistakes: allMistakes().length };
  }

  function levelText(average) {
    if (!Number.isFinite(average)) return '尚未测评';
    if (average >= 85) return '进阶 · 可进入综合图';
    if (average >= 65) return '基础 · 重点补弱项';
    return '入门 · 先建立基本概念';
  }

  function renderOverview() {
    const summary = getSummary();
    const scores = effectiveScores();
    get('coachLevelText').textContent = levelText(summary.average);
    get('coachSummaryText').textContent = summary.assessed ? `综合掌握度 ${summary.average}%，当前优先补强${summary.weakestLabel}。` : '完成入门测评后生成个人训练路线。';
    get('coachStartBtn').textContent = summary.assessed ? '重新测评' : '开始能力测评';
    get('coachAssessmentTime').textContent = state.assessment ? `最近测评 ${new Date(state.assessment.completedAt).toLocaleDateString('zh-CN')}` : '等待首次测评';
    get('coachAbilityGrid').innerHTML = Object.entries(CATEGORIES).map(([key, category]) => {
      const value = scores[key];
      return `<div class="coach-ability-item"><span>${category.label}</span><strong>${Number.isFinite(value) ? `${value}%` : '待测'}</strong><div><i style="width:${Number.isFinite(value) ? value : 0}%"></i></div><small>${category.note}</small></div>`;
    }).join('');

    const mistakes = allMistakes();
    const counts = Object.fromEntries(Object.keys(CATEGORIES).map((key) => [key, 0]));
    mistakes.forEach((item) => { if (counts[item.category] !== undefined) counts[item.category] += 1; });
    const weakKeys = Object.keys(CATEGORIES).filter((key) => counts[key] || (Number.isFinite(scores[key]) && scores[key] < 75)).sort((a, b) => (scores[a] ?? 100) - (scores[b] ?? 100) || counts[b] - counts[a]);
    get('coachWeakCount').textContent = `${weakKeys.length}项`;
    get('coachWeaknessList').innerHTML = weakKeys.length ? weakKeys.map((key) => `<div class="coach-list-row"><div><span>${CATEGORIES[key].label}</span><small>${counts[key]}条相关错题 · ${Number.isFinite(scores[key]) ? `当前掌握度${scores[key]}%` : '建议先完成测评'}</small></div><button type="button" data-coach-destination="${CATEGORIES[key].destination}">专项练习</button></div>`).join('') : '<div class="coach-empty">完成测评或练习后，这里会显示需要补强的能力。</div>';

    const ordered = Object.keys(CATEGORIES).sort((a, b) => (scores[a] ?? 101) - (scores[b] ?? 101));
    get('coachRouteList').innerHTML = ordered.slice(0, 4).map((key, index) => `<div class="coach-list-row"><div><span>${index + 1}. ${CATEGORIES[key].label}</span><small>${CATEGORIES[key].note}</small></div><button type="button" data-coach-destination="${CATEGORIES[key].destination}">开始</button></div>`).join('');
    get('coachMistakeList').innerHTML = mistakes.length ? mistakes.slice(0, 12).map((item) => `<div class="coach-mistake-row"><span>${escapeHtml(CATEGORIES[item.category]?.label || '综合')}</span><strong>${escapeHtml(item.label)}</strong><small>${new Date(item.time).toLocaleDateString('zh-CN')}</small></div>`).join('') : '<div class="coach-empty">还没有错误记录。</div>';
  }

  function renderQuestion() {
    const question = QUESTIONS[questionIndex];
    selectedAnswer = assessmentAnswers[questionIndex] ?? null;
    const percent = Math.round((questionIndex + 1) / QUESTIONS.length * 100);
    get('coachQuestionCategory').textContent = CATEGORIES[question.category].label;
    get('coachQuestionCounter').textContent = `第 ${questionIndex + 1} / ${QUESTIONS.length} 题`;
    get('coachAssessmentProgress').textContent = `${percent}%`;
    get('coachAssessmentBar').style.width = `${percent}%`;
    get('coachQuestionText').textContent = question.text;
    get('coachQuestionChoices').innerHTML = question.choices.map((choice, index) => `<button type="button" data-coach-answer="${index}"${selectedAnswer !== null ? ' disabled' : ''} class="${selectedAnswer === index ? 'is-selected' : ''}">${String.fromCharCode(65 + index)}. ${choice}</button>`).join('');
    get('coachQuestionFeedback').textContent = selectedAnswer === null ? '' : `${selectedAnswer === question.answer ? '回答正确。' : '需要补强。'}${question.why}`;
    get('coachQuestionFeedback').className = `coach-feedback${selectedAnswer === null ? '' : selectedAnswer === question.answer ? ' is-success' : ' is-error'}`;
    get('coachNextQuestionBtn').disabled = selectedAnswer === null;
    get('coachNextQuestionBtn').textContent = questionIndex === QUESTIONS.length - 1 ? '完成测评' : '下一题';
  }

  function startAssessment() {
    questionIndex = 0;
    selectedAnswer = null;
    assessmentAnswers = [];
    get('coachOverview').hidden = true;
    get('coachAssessment').hidden = false;
    renderQuestion();
  }

  function answerQuestion(index) {
    if (selectedAnswer !== null) return;
    selectedAnswer = index;
    assessmentAnswers[questionIndex] = index;
    const question = QUESTIONS[questionIndex];
    document.querySelectorAll('[data-coach-answer]').forEach((button, buttonIndex) => {
      button.disabled = true;
      button.classList.toggle('is-correct', buttonIndex === question.answer);
      button.classList.toggle('is-wrong', buttonIndex === index && index !== question.answer);
    });
    if (index !== question.answer) recordMistake({ id: `assessment-${questionIndex}-${Date.now()}`, category: question.category, label: question.text, destination: CATEGORIES[question.category].destination, time: new Date().toISOString() }, false);
    get('coachQuestionFeedback').textContent = `${index === question.answer ? '回答正确。' : '需要补强。'}${question.why}`;
    get('coachQuestionFeedback').className = `coach-feedback ${index === question.answer ? 'is-success' : 'is-error'}`;
    get('coachNextQuestionBtn').disabled = false;
  }

  function finishAssessment() {
    const scores = {};
    Object.keys(CATEGORIES).forEach((category) => {
      const indexes = QUESTIONS.map((question, index) => question.category === category ? index : -1).filter((index) => index >= 0);
      scores[category] = Math.round(indexes.filter((index) => assessmentAnswers[index] === QUESTIONS[index].answer).length / indexes.length * 100);
    });
    state.assessment = { completedAt: new Date().toISOString(), scores, answers: assessmentAnswers.slice() };
    saveState();
    get('coachAssessment').hidden = true;
    get('coachOverview').hidden = false;
    renderOverview();
  }

  function nextQuestion() {
    if (selectedAnswer === null) return;
    if (questionIndex >= QUESTIONS.length - 1) return finishAssessment();
    questionIndex += 1;
    renderQuestion();
  }

  function recordMistake(detail, persist = true) {
    if (!detail) return;
    const item = { id: String(detail.id || `mistake-${Date.now()}`), category: detail.category || inferCategory(detail.label), label: String(detail.label || '未命名错题'), destination: detail.destination || CATEGORIES[detail.category]?.destination || 'coach', time: detail.time || new Date().toISOString() };
    state.mistakes = [item, ...state.mistakes.filter((entry) => entry.id !== item.id)].slice(0, 100);
    if (persist) saveState();
  }

  function navigate(page) {
    window.PipeTrainerApp?.navigate?.(page);
  }

  function bindEvents() {
    get('coachBackBtn').addEventListener('click', () => window.PipeTrainerApp?.back?.());
    get('coachStartBtn').addEventListener('click', startAssessment);
    get('coachExitAssessmentBtn').addEventListener('click', () => { get('coachAssessment').hidden = true; get('coachOverview').hidden = false; renderOverview(); });
    get('coachNextQuestionBtn').addEventListener('click', nextQuestion);
    get('coachQuestionChoices').addEventListener('click', (event) => { const button = event.target.closest('[data-coach-answer]'); if (button) answerQuestion(Number(button.dataset.coachAnswer)); });
    get('coachOverview').addEventListener('click', (event) => { const button = event.target.closest('[data-coach-destination]'); if (button) navigate(button.dataset.coachDestination); });
    get('coachClearMistakesBtn').addEventListener('click', () => { state.mistakes = []; saveState(); renderOverview(); });
    window.addEventListener('pipe-learning-mistake', (event) => { recordMistake(event.detail); renderOverview(); });
    window.addEventListener('pipe-profile-change', () => { loadState(); renderOverview(); });
    window.addEventListener('pipe-page-change', (event) => { if (event.detail.page === 'coach') renderOverview(); });
  }

  loadState();
  bindEvents();
  renderOverview();
  window.PipeLearningCoach = { getSummary, recordMistake, open: () => navigate('coach') };
  window.dispatchEvent(new CustomEvent('pipe-coach-ready', { detail: getSummary() }));
})();
