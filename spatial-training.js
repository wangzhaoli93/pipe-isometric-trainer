(function () {
  'use strict';

  const STORAGE_BASE = 'pipe-spatial-training-v1';
  const LEVELS = [
    { id: 1, number: '01', name: '方向基础', subtitle: 'E/N/EL单段判断' },
    { id: 2, number: '02', name: '平面转向', subtitle: '按粗线追踪顺序' },
    { id: 3, number: '03', name: '标高变化', subtitle: '上升下降不看反' },
    { id: 4, number: '04', name: '空间偏移', subtitle: '一个XYZ表达斜管' },
    { id: 5, number: '05', name: '坐标链', subtitle: '逐段累加到终点' },
    { id: 6, number: '06', name: '考试图拆解', subtitle: '排除尺寸与投影线' }
  ];
  const DIRECTION_NAMES = { E: '向东 E+', W: '向西 E-', N: '向北 N+', S: '向南 N-', U: '上升 EL+', D: '下降 EL-' };
  const DIRECTION_SHORT = { E: '东', W: '西', N: '北', S: '南', U: '上', D: '下', XYZ: '空间斜管' };
  const DELTAS = { E: [1, 0, 0], W: [-1, 0, 0], N: [0, 1, 0], S: [0, -1, 0], U: [0, 0, 1], D: [0, 0, -1] };

  function cardinalSegment(dir, length) {
    return { dir, length };
  }

  function xyzSegment(dx, dy, dz) {
    return { dir: 'XYZ', dx, dy, dz };
  }

  function segmentDelta(segment) {
    if (segment.dir === 'XYZ') return [segment.dx, segment.dy, segment.dz];
    const unit = DELTAS[segment.dir];
    return unit.map((value) => value * segment.length);
  }

  function routePoints(start, segments) {
    const points = [{ e: start[0], n: start[1], z: start[2] }];
    segments.forEach((segment) => {
      const delta = segmentDelta(segment);
      const previous = points[points.length - 1];
      points.push({ e: previous.e + delta[0], n: previous.n + delta[1], z: previous.z + delta[2] });
    });
    return points;
  }

  function endOf(start, segments) {
    const points = routePoints(start, segments);
    return points[points.length - 1];
  }

  function describeDelta(dx, dy, dz) {
    const parts = [];
    if (dx) parts.push(`${dx > 0 ? '向东' : '向西'}${Math.abs(dx)}`);
    if (dy) parts.push(`${dy > 0 ? '向北' : '向南'}${Math.abs(dy)}`);
    if (dz) parts.push(`${dz > 0 ? '上升' : '下降'}${Math.abs(dz)}`);
    return parts.join('、');
  }

  function routeSequence(segments) {
    return segments.map((segment) => DIRECTION_SHORT[segment.dir]).join(' → ');
  }

  function unique(values) {
    return Array.from(new Set(values));
  }

  function buildQuestions() {
    const questions = [];
    const axisCases = [
      ['E', 800, [1200, 500, 300]], ['W', 650, [900, 700, 500]], ['N', 900, [300, 1000, 200]],
      ['S', 750, [600, 1400, 450]], ['U', 500, [800, 900, 1200]], ['D', 1100, [400, 300, 2600]]
    ];
    axisCases.forEach(([dir, length, start], index) => {
      const segment = cardinalSegment(dir, length);
      const end = endOf(start, [segment]);
      questions.push({
        id: `l1-${index + 1}`, level: 1, title: '判断单段方向', kind: 'choice', start, segments: [segment],
        prompt: `从 P0 ${formatCoord(start)} 到 P1 ${formatPoint(end)}，这段管道朝哪个方向？`,
        choices: ['向东 E+', '向西 E-', '向北 N+', '向南 N-', '上升 EL+', '下降 EL+'].map((label, choiceIndex) => choiceIndex === 5 ? '下降 EL-' : label),
        answer: DIRECTION_NAMES[dir],
        hints: ['只比较P0和P1中发生变化的那一个坐标。', 'E增为东、N增为北、EL增为上；减少则方向相反。', `本题变化量为 ${describeDelta(...segmentDelta(segment))} mm。`],
        explanation: `只有${dir === 'U' || dir === 'D' ? 'EL标高' : dir === 'E' || dir === 'W' ? 'E坐标' : 'N坐标'}发生变化，所以方向是${DIRECTION_NAMES[dir]}。`
      });
    });

    const planeRoutes = [
      ['E', 'N', 'W'], ['N', 'E', 'S'], ['W', 'S', 'E'], ['S', 'E', 'N'], ['E', 'N', 'E', 'S'], ['N', 'W', 'S', 'E']
    ];
    planeRoutes.forEach((dirs, index) => {
      const lengths = [600, 450, 800, 350];
      const segments = dirs.map((dir, segmentIndex) => cardinalSegment(dir, lengths[segmentIndex]));
      const answer = routeSequence(segments);
      const reverse = dirs.slice().reverse().map((dir) => DIRECTION_SHORT[dir]).join(' → ');
      const swap = dirs.map((dir) => ({ E: '北', N: '东', W: '南', S: '西' }[dir])).join(' → ');
      const firstWrong = dirs.map((dir, itemIndex) => itemIndex === 1 ? ({ E: '西', W: '东', N: '南', S: '北' }[dir]) : DIRECTION_SHORT[dir]).join(' → ');
      questions.push({
        id: `l2-${index + 1}`, level: 2, title: `${dirs.length}段平面追踪`, kind: 'choice', start: [0, 0, 300], segments,
        prompt: '从P0开始，只沿蓝色粗实线走到终点，正确的方向顺序是哪一个？',
        choices: unique([answer, reverse, swap, firstWrong]), answer,
        hints: ['用手指压住P0，一段一段移动，不要隔点看终点。', '这一题标高始终不变，所以只判断E和N。', `正确顺序共有${dirs.length}段，第一段向${DIRECTION_SHORT[dirs[0]]}。`],
        explanation: `按每个真实转折点停一次，方向顺序是：${answer}。`
      });
    });

    const elevationRoutes = [
      { start: [0, 0, 1000], segments: [cardinalSegment('E', 500), cardinalSegment('U', 300), cardinalSegment('N', 400)] },
      { start: [0, 0, 2000], segments: [cardinalSegment('S', 600), cardinalSegment('D', 250), cardinalSegment('E', 500)] },
      { start: [200, 300, 500], segments: [cardinalSegment('U', 700), cardinalSegment('W', 450), cardinalSegment('D', 200)] },
      { start: [800, 1000, 3200], segments: [cardinalSegment('N', 800), cardinalSegment('D', 900), cardinalSegment('E', 300)] },
      { start: [0, 0, 1500], segments: [cardinalSegment('D', 400), cardinalSegment('E', 700), cardinalSegment('U', 650)] },
      { start: [400, 200, 2500], segments: [cardinalSegment('U', 350), cardinalSegment('N', 500), cardinalSegment('U', 450), cardinalSegment('W', 300)] }
    ];
    elevationRoutes.forEach((item, index) => {
      const endpoint = endOf(item.start, item.segments);
      const verticals = item.segments.filter((segment) => segment.dir === 'U' || segment.dir === 'D').map((segment) => `${DIRECTION_SHORT[segment.dir]}${segment.length}`).join('、');
      questions.push({
        id: `l3-${index + 1}`, level: 3, title: '标高逐段累加', kind: 'number', unit: 'mm', start: item.start, segments: item.segments,
        prompt: `起点标高 EL ${item.start[2]} mm，按图走到终点，终点标高是多少？`, answer: endpoint.z,
        hints: ['水平段不会改变EL，只计算上升和下降段。', '上升做加法，下降做减法。', `本题垂直变化依次为：${verticals} mm。`],
        explanation: `终点标高为 EL ${endpoint.z} mm。E、N方向的水平段不参与标高加减。`
      });
    });

    const xyzCases = [
      { start: [1000, 2000, 3000], delta: [400, 300, 500] },
      { start: [2200, 1700, 2600], delta: [-600, 800, -200] },
      { start: [500, 1600, 900], delta: [700, -240, 350] },
      { start: [1800, 900, 1200], delta: [-450, -650, 600] },
      { start: [3000, 2800, 4500], delta: [-300, 400, -500] },
      { start: [2772, 2550, 8030], delta: [308, 310, -437] }
    ];
    xyzCases.forEach((item, index) => {
      const segment = xyzSegment(...item.delta);
      const endpoint = endOf(item.start, [segment]);
      const [dx, dy, dz] = item.delta;
      const answer = describeDelta(dx, dy, dz);
      const choices = unique([
        answer,
        describeDelta(-dx, dy, dz),
        describeDelta(dx, -dy, dz),
        describeDelta(dx, dy, -dz)
      ]);
      questions.push({
        id: `l4-${index + 1}`, level: 4, title: '空间斜管坐标差', kind: 'choice', start: item.start, segments: [segment],
        prompt: `P0 ${formatCoord(item.start)}，P1 ${formatPoint(endpoint)}。这一根空间斜管的正确描述是？`,
        choices, answer,
        hints: ['空间斜管仍然只有一段，不要把E、N、EL拆成三根管。', '分别计算：ΔE=后E-前E、ΔN=后N-前N、ΔEL=后EL-前EL。', `坐标差为 ΔE ${signed(dx)}、ΔN ${signed(dy)}、ΔEL ${signed(dz)} mm。`],
        explanation: `${answer} mm。这三个分量共同描述同一根空间斜管。`
      });
    });

    const chainRoutes = [
      { start: [500, 800, 1200], segments: [cardinalSegment('E', 700), cardinalSegment('N', 450), cardinalSegment('U', 300), cardinalSegment('W', 200)] },
      { start: [1200, 500, 2400], segments: [cardinalSegment('D', 600), xyzSegment(400, 300, -200), cardinalSegment('S', 500)] },
      { start: [0, 0, 300], segments: [cardinalSegment('N', 900), cardinalSegment('U', 500), cardinalSegment('E', 1200), cardinalSegment('D', 250)] },
      { start: [2500, 1700, 3600], segments: [xyzSegment(-600, 400, -500), cardinalSegment('W', 300), cardinalSegment('U', 200)] },
      { start: [800, 2200, 1500], segments: [cardinalSegment('S', 700), xyzSegment(500, -300, 450), cardinalSegment('E', 350), cardinalSegment('D', 150)] },
      { start: [1088, 1870, 29349], segments: [cardinalSegment('D', 1087), xyzSegment(167, 947, -962), xyzSegment(1517, -267, 0)] }
    ];
    chainRoutes.forEach((item, index) => {
      const endpoint = endOf(item.start, item.segments);
      questions.push({
        id: `l5-${index + 1}`, level: 5, title: '连续坐标链', kind: 'coords', start: item.start, segments: item.segments,
        prompt: `从起点 ${formatCoord(item.start)} 出发，逐段累加后填写终点坐标。`, answer: endpoint,
        hints: ['画三列草稿：E、N、EL，每走一段只改对应的列。', 'XYZ段的三个分量要在同一行同时相加。', `终点与起点的总差为 ΔE ${signed(endpoint.e - item.start[0])}、ΔN ${signed(endpoint.n - item.start[1])}、ΔEL ${signed(endpoint.z - item.start[2])}。`],
        explanation: `正确终点：${formatPoint(endpoint)}。用终点减起点还能反向检查总坐标差。`
      });
    });

    const examRoutes = [
      { start: [1088, 1870, 29349], segments: [cardinalSegment('D', 1087), xyzSegment(167, 947, -962), xyzSegment(1517, -267, 0), cardinalSegment('D', 19270), xyzSegment(308, 310, -437)], kind: 'coords', title: '考试图：坐标闭合' },
      { start: [300, 700, 1500], segments: [cardinalSegment('E', 800), cardinalSegment('U', 400), xyzSegment(350, 500, -250), cardinalSegment('S', 600)], kind: 'coords', title: '考试图：多平面追踪' },
      { start: [0, 0, 800], segments: [cardinalSegment('N', 600), cardinalSegment('E', 450), cardinalSegment('D', 300), cardinalSegment('E', 700), cardinalSegment('U', 500)], kind: 'count', title: '考试图：数真实管段' },
      { start: [500, 900, 2200], segments: [xyzSegment(400, 300, -300), cardinalSegment('D', 900), cardinalSegment('W', 550), xyzSegment(-250, 400, 200)], kind: 'count', title: '考试图：排除辅助线' },
      { start: [600, 200, 1000], segments: [cardinalSegment('U', 500), cardinalSegment('N', 700), xyzSegment(400, 300, -250), cardinalSegment('E', 600)], kind: 'sequence', title: '考试图：方向顺序' },
      { start: [1800, 2400, 3200], segments: [cardinalSegment('S', 800), cardinalSegment('D', 450), xyzSegment(-500, 350, 300), cardinalSegment('W', 400), cardinalSegment('U', 250)], kind: 'sequence', title: '考试图：综合识读' }
    ];
    examRoutes.forEach((item, index) => {
      const endpoint = endOf(item.start, item.segments);
      const common = {
        id: `l6-${index + 1}`, level: 6, title: item.title, start: item.start, segments: item.segments, distractors: true,
        hints: ['先用手指只沿蓝色粗实线走，虚线、橙色尺寸线和阴影都不算管段。', '焊口或中间标记不改变方向时，不新增管段。']
      };
      if (item.kind === 'coords') {
        questions.push({ ...common, kind: 'coords', prompt: '忽略尺寸辅助线和投影阴影，填写真实管线终点坐标。', answer: endpoint,
          hints: [...common.hints, `真实路线共有${item.segments.length}段，总坐标差为 ΔE ${signed(endpoint.e - item.start[0])}、ΔN ${signed(endpoint.n - item.start[1])}、ΔEL ${signed(endpoint.z - item.start[2])}。`],
          explanation: `正确终点是 ${formatPoint(endpoint)}。阴影三角形只是三个坐标分量的说明。` });
      } else if (item.kind === 'count') {
        questions.push({ ...common, kind: 'number', unit: '段', prompt: '从P0走到终点，真正改变方向后形成的管段一共有多少段？', answer: item.segments.length,
          hints: [...common.hints, `依次能找到${item.segments.length - 1}个真实转折，因此管段数比转折数多1。`],
          explanation: `真实管段共${item.segments.length}段。尺寸分解线、投影线和焊口编号不能计入。` });
      } else {
        const answer = routeSequence(item.segments);
        const reversed = item.segments.slice().reverse().map((segment) => DIRECTION_SHORT[segment.dir]).join(' → ');
        const withoutXyz = item.segments.map((segment) => segment.dir === 'XYZ' ? '东' : DIRECTION_SHORT[segment.dir]).join(' → ');
        const swapped = item.segments.map((segment) => ({ E: '西', W: '东', N: '南', S: '北', U: '下', D: '上', XYZ: '空间斜管' }[segment.dir])).join(' → ');
        questions.push({ ...common, kind: 'choice', prompt: '从P0开始，真实管线的方向顺序是哪一个？', choices: unique([answer, reversed, withoutXyz, swapped]), answer,
          hints: [...common.hints, `第一段是${DIRECTION_SHORT[item.segments[0].dir]}，其中XYZ三个分量只算一段空间斜管。`],
          explanation: `正确顺序：${answer}。` });
      }
    });
    return questions;
  }

  function signed(value) {
    return `${value >= 0 ? '+' : ''}${formatNumber(value)}`;
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 1 });
  }

  function formatCoord(values) {
    return `E ${formatNumber(values[0])}、N ${formatNumber(values[1])}、EL ${formatNumber(values[2])}`;
  }

  function formatPoint(point) {
    return `E ${formatNumber(point.e)}、N ${formatNumber(point.n)}、EL ${formatNumber(point.z)}`;
  }

  const QUESTIONS = buildQuestions();
  let progress = readProgress();
  let activeLevel = 1;
  let questionIndex = 0;
  let wrongOnly = false;
  let selectedChoice = '';
  let hintCount = 0;
  let wrongAttempts = 0;
  let answered = false;
  let answerRevealed = false;
  let scaleMode = localStorage.getItem('pipe-spatial-scale') === 'true' ? 'true' : 'schematic';
  let layerOptions = { helpers: true, points: true, welds: true };
  let activeStep = -1;
  let pathMode = false;
  let pathSelection = [];
  let scene, camera, renderer, controls, pipeGroup, grid;
  let spatial3dInitialized = false;
  let spatial3dPromise = null;

  function storageKey() {
    const profileId = window.PipeTrainerApp?.getActiveProfileId?.() || 'default';
    return `${STORAGE_BASE}:${profileId}`;
  }

  function readProgress() {
    try {
      const key = storageKey();
      if (localStorage.getItem(key) === null && localStorage.getItem(STORAGE_BASE) !== null) {
        localStorage.setItem(key, localStorage.getItem(STORAGE_BASE));
      }
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      return {
        completed: stored.completed && typeof stored.completed === 'object' ? stored.completed : {},
        wrong: Array.isArray(stored.wrong) ? stored.wrong : []
      };
    } catch (error) {
      return { completed: {}, wrong: [] };
    }
  }

  function saveProgress() {
    try { localStorage.setItem(storageKey(), JSON.stringify(progress)); } catch (error) { /* learning state is non-critical */ }
  }

  function currentQuestions() {
    if (wrongOnly) return progress.wrong.map((id) => QUESTIONS.find((question) => question.id === id)).filter(Boolean);
    return QUESTIONS.filter((question) => question.level === activeLevel);
  }

  function currentQuestion() {
    const list = currentQuestions();
    return list[Math.max(0, Math.min(questionIndex, list.length - 1))] || QUESTIONS[0];
  }

  function renderLevels() {
    const container = document.getElementById('spatialLevelList');
    container.innerHTML = LEVELS.map((level) => {
      const levelQuestions = QUESTIONS.filter((question) => question.level === level.id);
      const completed = levelQuestions.filter((question) => progress.completed[question.id] !== undefined).length;
      return `<button class="spatial-level-btn${!wrongOnly && activeLevel === level.id ? ' is-active' : ''}" type="button" data-spatial-level="${level.id}">
        <b>${level.number}</b><span>${level.name}<small>${level.subtitle}</small></span><em>${completed}/6</em>
      </button>`;
    }).join('');
    document.getElementById('spatialWrongBtn').classList.toggle('is-active', wrongOnly);
  }

  function updateProgressSummary() {
    const completed = Object.keys(progress.completed).filter((id) => QUESTIONS.some((question) => question.id === id)).length;
    document.getElementById('spatialCompletedCount').textContent = `${completed} / ${QUESTIONS.length}`;
    document.getElementById('spatialWrongCount').textContent = progress.wrong.length;
    document.getElementById('spatialProgressBar').style.width = `${completed / QUESTIONS.length * 100}%`;
  }

  function projectIso(point) {
    return { x: (point.e - point.n) * 0.82, y: (point.e + point.n) * 0.38 - point.z * 0.88 };
  }

  function visualRoutePoints(question) {
    const truePoints = routePoints(question.start, question.segments);
    const origin = truePoints[0];
    if (scaleMode === 'true') return truePoints.map((point) => ({ e: point.e - origin.e, n: point.n - origin.n, z: point.z - origin.z }));
    const points = [{ e: 0, n: 0, z: 0 }];
    question.segments.forEach((segment) => {
      const delta = segmentDelta(segment);
      const length = Math.max(1, Math.hypot(...delta));
      const visualLength = segment.dir === 'XYZ' ? 850 : 760;
      const previous = points[points.length - 1];
      points.push({
        e: previous.e + delta[0] / length * visualLength,
        n: previous.n + delta[1] / length * visualLength,
        z: previous.z + delta[2] / length * visualLength
      });
    });
    return points;
  }

  function renderWeldMarks(diagramPoints) {
    return diagramPoints.slice(1).map((point, index) => {
      const start = diagramPoints[index];
      const dx = point.x - start.x, dy = point.y - start.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      const px = -dy / length * 7, py = dx / length * 7;
      const mx = (start.x + point.x) / 2, my = (start.y + point.y) / 2;
      return `<line class="spatial-weld" x1="${mx - px}" y1="${my - py}" x2="${mx + px}" y2="${my + py}"/><text class="spatial-label" x="${mx + px + 3}" y="${my + py - 3}">S${index + 1}</text>`;
    }).join('');
  }

  function renderDiagram(question, showAnswer) {
    const svg = document.getElementById('spatialIsoSvg');
    const relative = visualRoutePoints(question);
    const projected = relative.map(projectIso);
    const xs = projected.map((point) => point.x), ys = projected.map((point) => point.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const scale = Math.min(470 / Math.max(maxX - minX, 1), 300 / Math.max(maxY - minY, 1));
    const diagramPoints = projected.map((point) => ({ x: 75 + (point.x - minX) * scale, y: 65 + (point.y - minY) * scale }));
    const path = diagramPoints.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
    const lowestZ = Math.min(...relative.map((point) => point.z));
    const helperLines = question.distractors && layerOptions.helpers ? relative.map((point, index) => {
      const ground = projectIso({ e: point.e, n: point.n, z: lowestZ });
      const gx = 75 + (ground.x - minX) * scale;
      const gy = 65 + (ground.y - minY) * scale;
      const p = diagramPoints[index];
      return `<line class="spatial-helper" x1="${p.x}" y1="${p.y}" x2="${gx}" y2="${gy}"/><line class="spatial-helper-hit" data-spatial-helper="true" x1="${p.x}" y1="${p.y}" x2="${gx}" y2="${gy}"/>`;
    }).join('') : '';
    const distractorTriangle = question.distractors && layerOptions.helpers && diagramPoints.length > 2 ? `
      <path class="spatial-helper" d="M ${diagramPoints[1].x} ${diagramPoints[1].y} L ${diagramPoints[2].x} ${diagramPoints[1].y} L ${diagramPoints[2].x} ${diagramPoints[2].y} Z"/>
      <path class="spatial-helper-hit" data-spatial-helper="true" d="M ${diagramPoints[1].x} ${diagramPoints[1].y} L ${diagramPoints[2].x} ${diagramPoints[1].y} L ${diagramPoints[2].x} ${diagramPoints[2].y}"/>
      <line class="spatial-dimension" x1="${diagramPoints[1].x}" y1="${diagramPoints[1].y - 22}" x2="${diagramPoints[2].x}" y2="${diagramPoints[1].y - 22}"/><line class="spatial-helper-hit" data-spatial-helper="true" x1="${diagramPoints[1].x}" y1="${diagramPoints[1].y - 22}" x2="${diagramPoints[2].x}" y2="${diagramPoints[1].y - 22}"/>` : '';
    const showPoints = layerOptions.points || pathMode;
    const labels = showPoints ? diagramPoints.map((point, index) => {
      const selected = pathSelection.includes(index);
      const showLabel = !pathMode || selected || index === 0;
      return `<circle class="spatial-point${selected ? ' is-path-selected' : ''}${pathMode ? ' is-path-target' : ''}" data-spatial-point="${index}" cx="${point.x}" cy="${point.y}" r="6"/>${showLabel ? `<text class="spatial-label" x="${point.x + 8}" y="${point.y - 8}">P${index}</text>` : ''}`;
    }).join('') : '';
    const weldMarks = question.distractors && layerOptions.welds ? renderWeldMarks(diagramPoints) : '';
    const currentSegment = activeStep >= 0 && diagramPoints[activeStep + 1]
      ? `<line class="spatial-current-segment" x1="${diagramPoints[activeStep].x}" y1="${diagramPoints[activeStep].y}" x2="${diagramPoints[activeStep + 1].x}" y2="${diagramPoints[activeStep + 1].y}"/>`
      : '';
    const axisX = 72, axisY = 350;
    svg.innerHTML = `<title>${question.title}</title><desc>${question.prompt}</desc>
      <defs><marker id="spatialArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/></marker></defs>
      ${helperLines}${distractorTriangle}
      <polyline class="spatial-pipe" points="${path}"/>
      ${showAnswer ? `<polyline class="spatial-answer-path" points="${path}"/>` : ''}${currentSegment}${weldMarks}${labels}
      <line class="spatial-axis-e" x1="${axisX}" y1="${axisY}" x2="${axisX + 44}" y2="${axisY + 25}"/><text x="${axisX + 49}" y="${axisY + 31}">E+</text>
      <line class="spatial-axis-n" x1="${axisX}" y1="${axisY}" x2="${axisX - 44}" y2="${axisY + 25}"/><text x="${axisX - 64}" y="${axisY + 31}">N+</text>
      <line class="spatial-axis-z" x1="${axisX}" y1="${axisY}" x2="${axisX}" y2="${axisY - 55}"/><text x="${axisX + 7}" y="${axisY - 57}">EL+</text>`;
  }

  function renderAnswerArea(question) {
    const area = document.getElementById('spatialAnswerArea');
    if (question.kind === 'choice') {
      area.innerHTML = `<div class="spatial-choice-grid">${question.choices.map((choice, index) => `<button class="spatial-choice" type="button" data-spatial-choice="${index}">${choice}</button>`).join('')}</div>`;
    } else if (question.kind === 'number') {
      area.innerHTML = `<div class="spatial-number-answer"><label>你的答案<input id="spatialNumberAnswer" type="number" inputmode="decimal" step="0.1"></label><span>${question.unit || ''}</span></div>`;
    } else {
      area.innerHTML = `<div class="spatial-coordinate-answer">
        <label>终点 E<input id="spatialAnswerE" type="number" inputmode="decimal"></label>
        <label>终点 N<input id="spatialAnswerN" type="number" inputmode="decimal"></label>
        <label>终点 EL<input id="spatialAnswerZ" type="number" inputmode="decimal"></label>
      </div>`;
    }
  }

  function resetWireChecklist() {
    document.querySelectorAll('[data-spatial-wire]').forEach((checkbox) => checkbox.checked = false);
    document.getElementById('spatialWireProgress').textContent = '完成 0 / 4 项';
    document.getElementById('spatialWirePractice').open = false;
  }

  function setPathStatus(message, statusClass = '') {
    const status = document.getElementById('spatialPathStatus');
    status.textContent = message;
    status.className = statusClass;
  }

  function togglePathMode() {
    pathMode = !pathMode;
    pathSelection = [];
    const button = document.getElementById('spatialPathModeBtn');
    button.classList.toggle('is-active', pathMode);
    button.textContent = pathMode ? '退出点路径' : '按顺序点路径';
    setPathStatus(pathMode ? '请先点击P0，再沿粗实线依次点击所有转折点和终点。' : '从P0开始，沿粗实线找转折点。');
    renderDiagram(currentQuestion(), answerRevealed);
  }

  function handlePathClick(event) {
    if (!pathMode) return;
    if (event.target.closest('[data-spatial-helper]')) {
      setPathStatus('这是一条尺寸或投影辅助线，不属于真实管路。', 'is-error');
      return;
    }
    const point = event.target.closest('[data-spatial-point]');
    if (!point) return;
    const index = Number(point.dataset.spatialPoint);
    const expected = pathSelection.length;
    if (index !== expected) {
      setPathStatus(expected === 0 ? '必须从P0开始。' : `下一步应从P${expected - 1}沿粗实线寻找相邻转折点。`, 'is-error');
      return;
    }
    pathSelection.push(index);
    const totalPoints = currentQuestion().segments.length + 1;
    if (pathSelection.length === totalPoints) {
      pathMode = false;
      const button = document.getElementById('spatialPathModeBtn');
      button.classList.remove('is-active');
      button.textContent = '重新点路径';
      setPathStatus(`路径顺序正确：P0 → P${totalPoints - 1}，共${totalPoints - 1}段。`, 'is-success');
    } else {
      setPathStatus(`已到P${index}，继续沿粗实线找P${index + 1}。`);
    }
    renderDiagram(currentQuestion(), answerRevealed);
  }

  function segmentExplanation(question, index) {
    const points = routePoints(question.start, question.segments);
    const start = points[index], end = points[index + 1];
    const deltaE = end.e - start.e, deltaN = end.n - start.n, deltaZ = end.z - start.z;
    const segment = question.segments[index];
    const conclusion = segment.dir === 'XYZ'
      ? `${describeDelta(deltaE, deltaN, deltaZ)}，三个分量共同组成一根空间斜管`
      : `${DIRECTION_NAMES[segment.dir]} ${formatNumber(segment.length)} mm`;
    return `P${index}→P${index + 1}：E ${formatNumber(start.e)}→${formatNumber(end.e)}（${signed(deltaE)}）；N ${formatNumber(start.n)}→${formatNumber(end.n)}（${signed(deltaN)}）；EL ${formatNumber(start.z)}→${formatNumber(end.z)}（${signed(deltaZ)}）。结论：${conclusion}。`;
  }

  function updateStepExplainer() {
    const previous = document.getElementById('spatialStepPrevBtn');
    const next = document.getElementById('spatialStepNextBtn');
    const status = document.querySelector('.spatial-step-explainer header span');
    previous.disabled = !answerRevealed;
    next.disabled = !answerRevealed;
    if (!answerRevealed) {
      status.textContent = '答题后开放';
      document.getElementById('spatialStepText').textContent = '提交答案后，可以逐段查看坐标如何变化。';
      return;
    }
    if (activeStep < 0) {
      status.textContent = '全部路径';
      document.getElementById('spatialStepText').textContent = '点击左右箭头，从第一段开始查看“后点减前点”的完整计算。';
      return;
    }
    const question = currentQuestion();
    status.textContent = `第 ${activeStep + 1} / ${question.segments.length} 段`;
    document.getElementById('spatialStepText').textContent = segmentExplanation(question, activeStep);
  }

  function cycleStep(delta) {
    if (!answerRevealed) return;
    const count = currentQuestion().segments.length;
    if (activeStep < 0) activeStep = delta > 0 ? 0 : count - 1;
    else {
      activeStep += delta;
      if (activeStep >= count || activeStep < 0) activeStep = -1;
    }
    updateStepExplainer();
    renderDiagram(currentQuestion(), true);
    buildSpatial3d(currentQuestion());
  }

  function setScaleMode(mode) {
    scaleMode = mode === 'true' ? 'true' : 'schematic';
    localStorage.setItem('pipe-spatial-scale', scaleMode);
    document.querySelectorAll('[data-spatial-scale]').forEach((button) => {
      const active = button.dataset.spatialScale === scaleMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderDiagram(currentQuestion(), answerRevealed);
    if (answerRevealed) buildSpatial3d(currentQuestion());
  }

  function renderQuestion() {
    const questions = currentQuestions();
    if (!questions.length) {
      wrongOnly = false;
      questionIndex = 0;
      document.getElementById('spatialFeedback').textContent = '当前没有错题，继续按级别练习。';
      renderLevels();
      return renderQuestion();
    }
    questionIndex = Math.max(0, Math.min(questionIndex, questions.length - 1));
    const question = currentQuestion();
    const level = LEVELS.find((item) => item.id === question.level);
    selectedChoice = '';
    hintCount = 0;
    wrongAttempts = 0;
    answered = false;
    answerRevealed = false;
    activeStep = -1;
    pathMode = false;
    pathSelection = [];
    document.getElementById('spatialLevelName').textContent = wrongOnly ? '错题复练' : `${level.number} ${level.name}`;
    document.getElementById('spatialQuestionTitle').textContent = question.title;
    document.getElementById('spatialQuestionIndex').textContent = `${questionIndex + 1} / ${questions.length}`;
    document.getElementById('spatialScore').textContent = '100分';
    document.getElementById('spatialPrompt').textContent = question.prompt;
    document.getElementById('spatialHintText').textContent = '';
    document.getElementById('spatialFeedback').textContent = '';
    document.getElementById('spatialFeedback').className = 'spatial-feedback';
    document.getElementById('spatialHintBtn').textContent = '提示 1/3';
    document.getElementById('spatialHintBtn').disabled = false;
    document.getElementById('spatialSubmitBtn').hidden = false;
    document.getElementById('spatialRevealBtn').hidden = false;
    document.getElementById('spatialNextBtn').hidden = true;
    document.getElementById('spatialThreeCover').hidden = false;
    document.getElementById('spatialFitBtn').disabled = true;
    document.getElementById('spatialPathModeBtn').classList.remove('is-active');
    document.getElementById('spatialPathModeBtn').textContent = '按顺序点路径';
    setPathStatus('从P0开始，沿粗实线找转折点。');
    document.getElementById('spatialHelperLayer').checked = layerOptions.helpers;
    document.getElementById('spatialPointLayer').checked = layerOptions.points;
    document.getElementById('spatialWeldLayer').checked = layerOptions.welds;
    document.querySelectorAll('[data-spatial-scale]').forEach((button) => {
      const active = button.dataset.spatialScale === scaleMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderAnswerArea(question);
    renderDiagram(question, false);
    clearSpatial3d();
    updateStepExplainer();
    resetWireChecklist();
    renderLevels();
    updateProgressSummary();
  }

  function currentScore() {
    return Math.max(20, 100 - hintCount * 15 - wrongAttempts * 10);
  }

  function readAnswer(question) {
    if (question.kind === 'choice') return selectedChoice;
    if (question.kind === 'number') return Number(document.getElementById('spatialNumberAnswer')?.value);
    return {
      e: Number(document.getElementById('spatialAnswerE')?.value),
      n: Number(document.getElementById('spatialAnswerN')?.value),
      z: Number(document.getElementById('spatialAnswerZ')?.value)
    };
  }

  function answerIsCorrect(question, answer) {
    if (question.kind === 'choice') return answer === question.answer;
    if (question.kind === 'number') return Number.isFinite(answer) && Math.abs(answer - question.answer) <= 0.5;
    return ['e', 'n', 'z'].every((key) => Number.isFinite(answer[key]) && Math.abs(answer[key] - question.answer[key]) <= 0.5);
  }

  function formatAnswer(question) {
    if (question.kind === 'choice') return question.answer;
    if (question.kind === 'number') return `${formatNumber(question.answer)} ${question.unit || ''}`;
    return formatPoint(question.answer);
  }

  function recordSpatialMistake(question) {
    const category = question.level === 1 || question.level === 3 ? 'direction' : question.level === 5 ? 'calculation' : 'spatial';
    window.dispatchEvent(new CustomEvent('pipe-learning-mistake', { detail: { id: `spatial-${question.id}`, category, label: `${question.title}：${question.prompt}`, destination: 'spatial', time: new Date().toISOString() } }));
  }

  function markChoiceResults(question) {
    document.querySelectorAll('[data-spatial-choice]').forEach((button) => {
      const choice = question.choices[Number(button.dataset.spatialChoice)];
      button.disabled = true;
      button.classList.toggle('is-correct', choice === question.answer);
      button.classList.toggle('is-wrong', choice === selectedChoice && choice !== question.answer);
    });
  }

  async function revealQuestion(correct, forced) {
    const question = currentQuestion();
    answered = true;
    answerRevealed = true;
    if (question.kind === 'choice') markChoiceResults(question);
    else document.querySelectorAll('#spatialAnswerArea input').forEach((input) => input.disabled = true);
    if (correct) {
      const score = currentScore();
      progress.completed[question.id] = Math.max(score, Number(progress.completed[question.id]) || 0);
      progress.wrong = progress.wrong.filter((id) => id !== question.id);
      document.getElementById('spatialFeedback').textContent = `正确，得分${score}。${question.explanation}`;
      document.getElementById('spatialFeedback').className = 'spatial-feedback is-success';
    } else {
      if (!progress.wrong.includes(question.id)) progress.wrong.push(question.id);
      recordSpatialMistake(question);
      document.getElementById('spatialFeedback').textContent = `${forced ? '答案已显示' : '本题未答对'}：${formatAnswer(question)}。${question.explanation}`;
      document.getElementById('spatialFeedback').className = 'spatial-feedback is-error';
    }
    saveProgress();
    activeStep = 0;
    renderDiagram(question, true);
    const cover = document.getElementById('spatialThreeCover');
    cover.hidden = false;
    cover.innerHTML = '<strong>正在加载3D</strong><span>首次打开需要几秒</span>';
    try {
      await ensureSpatial3d();
    } catch (error) {
      cover.innerHTML = `<strong>3D加载失败</strong><span>${String(error.message || error)}</span>`;
      document.getElementById('spatialFitBtn').disabled = true;
      return;
    }
    buildSpatial3d(question);
    updateStepExplainer();
    cover.innerHTML = '<strong>答案已隐藏</strong><span>提交答案后显示3D</span>';
    cover.hidden = true;
    document.getElementById('spatialFitBtn').disabled = false;
    document.getElementById('spatialHintBtn').disabled = true;
    document.getElementById('spatialSubmitBtn').hidden = true;
    document.getElementById('spatialRevealBtn').hidden = true;
    document.getElementById('spatialNextBtn').hidden = false;
    renderLevels();
    updateProgressSummary();
  }

  function submitAnswer() {
    if (answered) return;
    const question = currentQuestion();
    const answer = readAnswer(question);
    const missing = question.kind === 'choice' ? !answer : question.kind === 'number' ? !Number.isFinite(answer) : ['e', 'n', 'z'].some((key) => !Number.isFinite(answer[key]));
    if (missing) {
      document.getElementById('spatialFeedback').textContent = '请先填写或选择答案。';
      document.getElementById('spatialFeedback').className = 'spatial-feedback is-error';
      return;
    }
    const correct = answerIsCorrect(question, answer);
    if (correct) return revealQuestion(true, false);
    wrongAttempts += 1;
    document.getElementById('spatialScore').textContent = `${currentScore()}分`;
    document.getElementById('spatialFeedback').textContent = '暂时不对。先检查方向正负号，可以继续修改，或使用提示。';
    document.getElementById('spatialFeedback').className = 'spatial-feedback is-error';
    if (!progress.wrong.includes(question.id)) progress.wrong.push(question.id);
    recordSpatialMistake(question);
    saveProgress();
    updateProgressSummary();
  }

  function showHint() {
    const question = currentQuestion();
    if (hintCount >= question.hints.length) return;
    document.getElementById('spatialHintText').textContent = `提示${hintCount + 1}：${question.hints[hintCount]}`;
    hintCount += 1;
    document.getElementById('spatialScore').textContent = `${currentScore()}分`;
    document.getElementById('spatialHintBtn').textContent = hintCount < question.hints.length ? `提示 ${hintCount + 1}/3` : '提示已用完';
    document.getElementById('spatialHintBtn').disabled = hintCount >= question.hints.length;
  }

  function goQuestion(delta) {
    const list = currentQuestions();
    questionIndex = (questionIndex + delta + list.length) % list.length;
    renderQuestion();
  }

  function resetLevel() {
    const ids = QUESTIONS.filter((question) => question.level === activeLevel).map((question) => question.id);
    ids.forEach((id) => delete progress.completed[id]);
    saveProgress();
    questionIndex = 0;
    renderQuestion();
  }

  function initSpatial3d() {
    if (spatial3dInitialized) return;
    const viewport = document.getElementById('spatialThreeViewport');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(document.documentElement.getAttribute('data-theme') === 'dark' ? 0x161b20 : 0xf3f5f6);
    camera = new THREE.PerspectiveCamera(42, 1, 0.01, 200);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    viewport.appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.addEventListener('change', renderSpatial3d);
    pipeGroup = new THREE.Group();
    scene.add(pipeGroup);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x53606a, 1.4));
    const light = new THREE.DirectionalLight(0xffffff, 0.85);
    light.position.set(5, 8, 7);
    scene.add(light);
    grid = new THREE.GridHelper(12, 12, 0x8d969d, 0xcbd1d5);
    scene.add(grid);
    new ResizeObserver(resizeSpatial3d).observe(viewport);
    new MutationObserver(() => {
      if (scene) scene.background.set(document.documentElement.getAttribute('data-theme') === 'dark' ? 0x161b20 : 0xf3f5f6);
      renderSpatial3d();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    resizeSpatial3d();
    spatial3dInitialized = true;
  }

  function ensureSpatial3d() {
    if (spatial3dInitialized) return Promise.resolve();
    if (spatial3dPromise) return spatial3dPromise;
    spatial3dPromise = window.PipeResources.ensureThree().then(() => {
      initSpatial3d();
    }).catch((error) => {
      spatial3dPromise = null;
      throw error;
    });
    return spatial3dPromise;
  }

  function disposeSpatialObject(object) {
    object.traverse((child) => {
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose?.());
      else child.material?.dispose?.();
    });
  }

  function clearSpatial3d() {
    if (!pipeGroup) return;
    while (pipeGroup.children.length) {
      const child = pipeGroup.children[0];
      pipeGroup.remove(child);
      disposeSpatialObject(child);
    }
    renderSpatial3d();
  }

  function cylinderBetween(start, end, radius, material) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 18);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  }

  function buildSpatial3d(question) {
    if (!spatial3dInitialized) return;
    clearSpatial3d();
    const relative = visualRoutePoints(question).map((point) => new THREE.Vector3(point.e, point.z, point.n));
    const box = new THREE.Box3().setFromPoints(relative);
    const rawSize = Math.max(box.getSize(new THREE.Vector3()).length(), 1);
    const scale = 6 / rawSize;
    const vectors = relative.map((point) => point.multiplyScalar(scale));
    const jointMaterial = new THREE.MeshStandardMaterial({ color: 0xe7edf0, roughness: 0.65 });
    vectors.slice(1).forEach((point, index) => {
      const material = new THREE.MeshStandardMaterial({ color: index === activeStep ? 0xd46b2a : 0x1681a5, roughness: 0.55, metalness: 0.05 });
      pipeGroup.add(cylinderBetween(vectors[index], point, index === activeStep ? 0.095 : 0.075, material));
    });
    vectors.forEach((point) => {
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 12), jointMaterial.clone());
      joint.position.copy(point);
      pipeGroup.add(joint);
    });
    fitSpatial3d(vectors);
  }

  function fitSpatial3d(vectors) {
    if (!vectors?.length) return;
    const box = new THREE.Box3().setFromPoints(vectors);
    const center = box.getCenter(new THREE.Vector3());
    const size = Math.max(box.getSize(new THREE.Vector3()).length(), 2);
    camera.position.copy(center).add(new THREE.Vector3(1.1, .85, 1.1).normalize().multiplyScalar(size * 1.5));
    controls.target.copy(center);
    controls.update();
    renderSpatial3d();
  }

  function resizeSpatial3d() {
    if (!renderer) return;
    const viewport = document.getElementById('spatialThreeViewport');
    const width = Math.max(280, viewport.clientWidth || 500);
    const height = Math.max(240, viewport.clientHeight || Math.round(width * 0.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderSpatial3d();
  }

  function renderSpatial3d() {
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  function openSpatialPage() {
    if (window.PipeTrainerApp?.navigate) window.PipeTrainerApp.navigate('spatial');
    else document.querySelector('[data-page="spatial"]')?.click();
    window.scrollTo(0, 0);
    ensureSpatial3d().then(() => setTimeout(resizeSpatial3d, 60)).catch(console.error);
  }

  function openLevel(level) {
    activeLevel = Math.max(1, Math.min(6, Number(level) || 1));
    wrongOnly = false;
    questionIndex = 0;
    renderQuestion();
    openSpatialPage();
  }

  function bindEvents() {
    document.getElementById('openSpatialBtn').addEventListener('click', openSpatialPage);
    document.getElementById('spatialBackBtn').addEventListener('click', () => window.PipeTrainerApp?.back?.());
    document.querySelector('[data-page="spatial"]').addEventListener('click', () => ensureSpatial3d().then(() => setTimeout(resizeSpatial3d, 60)).catch(console.error));
    document.getElementById('spatialLevelList').addEventListener('click', (event) => {
      const button = event.target.closest('[data-spatial-level]');
      if (!button) return;
      activeLevel = Number(button.dataset.spatialLevel);
      wrongOnly = false;
      questionIndex = 0;
      renderQuestion();
    });
    document.getElementById('spatialWrongBtn').addEventListener('click', () => {
      if (!progress.wrong.length) {
        document.getElementById('spatialFeedback').textContent = '当前没有错题。';
        return;
      }
      wrongOnly = !wrongOnly;
      questionIndex = 0;
      renderQuestion();
    });
    document.getElementById('spatialAnswerArea').addEventListener('click', (event) => {
      const button = event.target.closest('[data-spatial-choice]');
      if (!button || answered) return;
      const question = currentQuestion();
      selectedChoice = question.choices[Number(button.dataset.spatialChoice)];
      document.querySelectorAll('[data-spatial-choice]').forEach((item) => item.classList.toggle('is-selected', item === button));
    });
    document.getElementById('spatialHintBtn').addEventListener('click', showHint);
    document.getElementById('spatialSubmitBtn').addEventListener('click', submitAnswer);
    document.getElementById('spatialRevealBtn').addEventListener('click', () => revealQuestion(false, true));
    document.getElementById('spatialNextBtn').addEventListener('click', () => goQuestion(1));
    document.getElementById('spatialPrevBtn').addEventListener('click', () => goQuestion(-1));
    document.getElementById('spatialSkipBtn').addEventListener('click', () => goQuestion(1));
    document.getElementById('spatialRestartLevelBtn').addEventListener('click', resetLevel);
    document.querySelectorAll('[data-spatial-scale]').forEach((button) => button.addEventListener('click', () => setScaleMode(button.dataset.spatialScale)));
    document.getElementById('spatialHelperLayer').addEventListener('change', (event) => {
      layerOptions.helpers = event.target.checked;
      renderDiagram(currentQuestion(), answerRevealed);
    });
    document.getElementById('spatialPointLayer').addEventListener('change', (event) => {
      layerOptions.points = event.target.checked;
      renderDiagram(currentQuestion(), answerRevealed);
    });
    document.getElementById('spatialWeldLayer').addEventListener('change', (event) => {
      layerOptions.welds = event.target.checked;
      renderDiagram(currentQuestion(), answerRevealed);
    });
    document.getElementById('spatialPathModeBtn').addEventListener('click', togglePathMode);
    document.getElementById('spatialIsoSvg').addEventListener('click', handlePathClick);
    document.getElementById('spatialStepPrevBtn').addEventListener('click', () => cycleStep(-1));
    document.getElementById('spatialStepNextBtn').addEventListener('click', () => cycleStep(1));
    document.getElementById('spatialFitBtn').addEventListener('click', () => {
      if (pipeGroup?.children.length) {
        const box = new THREE.Box3().setFromObject(pipeGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = Math.max(box.getSize(new THREE.Vector3()).length(), 2);
        camera.position.copy(center).add(new THREE.Vector3(1.1, .85, 1.1).normalize().multiplyScalar(size * 1.5));
        controls.target.copy(center);
        controls.update();
      }
    });
    document.querySelectorAll('[data-spatial-wire]').forEach((checkbox) => checkbox.addEventListener('change', () => {
      const completed = document.querySelectorAll('[data-spatial-wire]:checked').length;
      document.getElementById('spatialWireProgress').textContent = `完成 ${completed} / 4 项${completed === 4 ? '，可以和3D逐项核对。' : ''}`;
    }));
    document.getElementById('spatialAnswerArea').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') submitAnswer();
    });
    window.addEventListener('pipe-profile-change', () => {
      progress = readProgress();
      wrongOnly = false;
      questionIndex = 0;
      renderQuestion();
    });
  }

  bindEvents();
  renderQuestion();
  window.PipeSpatialTraining = { openLevel, open: openSpatialPage };
})();
