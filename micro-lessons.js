(function () {
  'use strict';

  const lessons = [
    {
      id: 'directions', title: '方向与坐标正负号', summary: '建立E、N、EL坐标感，学会用后点减前点判断方向。',
      steps: [
        { title: '建立坐标轴', text: '等轴图中E+通常画向右下，N+画向左下，EL+竖直向上。纸面斜向下不等于标高下降。', formula: '东加西减 · 北加南减 · 上加下减' },
        { title: '判断E方向', text: '只有E坐标增加时，管段向东E+；E坐标减少时，方向为向西E-。', formula: 'ΔE = E终点 - E起点' },
        { title: '判断N方向', text: '只有N坐标增加时，管段向北N+。在等轴图中，N+通常投影为左下方向。', formula: 'N 1000 → 1900：ΔN = +900，所以向北N+' },
        { title: '判断标高', text: 'EL增加表示上升，EL减少表示下降。E、N变化但EL不变时，管段仍是水平管。', formula: 'EL 3000 → 2500：ΔEL = -500，所以下降EL-' }
      ],
      quiz: { q: 'P0的N=1000，P1的N=1900，E和EL不变，这段管道是什么方向？', choices: ['向南 N-', '向北 N+', '上升 EL+', '向东 E+'], correct: 1, why: '后点减前点：1900-1000=+900，所以是N+向北。' }
    },
    {
      id: 'iso3d', title: '单线图如何变成3D', summary: '把粗实线、转折点、标高和投影逐层组合成空间管线。',
      steps: [
        { title: '先找真实粗线', text: '第一遍只追踪代表管道中心线的粗实线，不读取尺寸线、阴影和文字引线。', formula: '粗实线 = 管道中心线草图' },
        { title: '标记真实转折点', text: '每次方向真正改变时标记P点；同一直管上的焊口不等于新增弯头。', formula: '转折数 + 1 = 管段数' },
        { title: '加入标高变化', text: '通过EL坐标判断哪些段上升或下降，不能仅凭线条在纸面上向上或向下判断。', formula: 'ΔEL = EL后点 - EL前点' },
        { title: '显示地面投影', text: '投影虚线帮助判断E/N平面位置，但虚线不是实体管道。最终3D必须通过坐标闭合。', formula: '终点 = 起点 + Σ(每段坐标差)' }
      ],
      quiz: { q: '单线图中一根直管中间出现现场焊口，但方向没有变化，应增加几个弯头？', choices: ['0个', '1个', '2个', '无法判断'], correct: 0, why: '焊口是连接位置，不代表管道方向发生变化。' }
    },
    {
      id: 'fitting-direction', title: '三通与弯头方向', summary: '把图纸符号与空间外形对应，辨认支口和弯头朝向。',
      steps: [
        { title: '主管和支口分开看', text: '三通先确定贯通的主管，再从三通中心判断第三个支口的坐标变化。', formula: '主管W↔E + 支口EL+ = 三通支口向上' },
        { title: '支口向上与向下', text: '支口终点EL增加就是向上，EL减少就是向下；符号细节仍应核对项目图例。', formula: 'EL+ 向上 · EL- 向下' },
        { title: '弯头转向', text: '弯头只有两个接口。水平管经过弯头转成EL+立管，就是弯头向上。', formula: '弯头：2个接口 · 三通：3个接口' },
        { title: '支口向北与向南', text: '主管沿W—E时，第三口N增加是向北，N减少是向南。', formula: 'N+ 向北 · N- 向南' }
      ],
      quiz: { q: '主管沿W—E，三通第三口的终点标高比中心高500mm，这个支口朝向哪里？', choices: ['向北 N+', '向南 N-', '向上 EL+', '向下 EL-'], correct: 2, why: '只有标高EL增加，所以支口向上EL+。' }
    },
    {
      id: 'cut-length', title: '弯头扣除与焊口间隙', summary: '从中心距逐步扣除管件占用和焊口间隙，得到直管下料长度。',
      steps: [
        { title: '确认尺寸基准', text: '先判断900mm是中心距、坡口端面净距，还是图纸直接给出的直管长度。基准不同，公式不同。', formula: '本例：两个弯头中心距 D = 900mm' },
        { title: '扣除两端管件占用', text: '假设两端弯头中心至坡口端面各150mm，先从中心距中扣除300mm。', formula: '900 - 150 - 150 = 600mm' },
        { title: '扣除焊口根部间隙', text: '若两端各需2mm根部间隙，再扣除4mm。根部间隙必须以项目WPS为准。', formula: '600 - 2×2 = 596mm' },
        { title: '区分成品与耗料', text: '596mm是直管成品目标。锯缝只影响原材料消耗，不应再次从596mm中减掉。', formula: '直管下料596mm · 若锯缝3mm，原料至少消耗599mm' }
      ],
      quiz: { q: '中心距900mm，两端占用各150mm，两道焊口间隙各2mm，直管下料是多少？', choices: ['900mm', '600mm', '596mm', '599mm'], correct: 2, why: '900-150-150-2-2=596mm；599mm是包含一次3mm锯缝的原料消耗。' }
    },
    {
      id: 'exam-breakdown', title: '真实考试图逐段拆解', summary: '按照固定顺序排除图框、尺寸线和阴影，再用坐标差还原管线。',
      steps: [
        { title: '先看整张图', text: '找到连接口、管线号、管径和起止坐标，不急着读取所有数字。', formula: '第一遍只找：起点 · 终点 · 粗管线' },
        { title: '隐藏辅助信息', text: '暂时忽略图框、材料表、尺寸引线、投影虚线和阴影三角形。', formula: '细线与虚线 ≠ 实体管段' },
        { title: '沿粗线标P点', text: '从P0开始，遇到真实方向变化才新增P点；焊口编号不会自动形成转折。', formula: 'P0 → P1 → P2 → … → 终点' },
        { title: '逐段计算坐标差', text: '每一段使用后点减前点，得到ΔE、ΔN、ΔEL；XYZ三个分量共同表示一根空间斜管。', formula: 'ΔE=E后-E前 · ΔN=N后-N前 · ΔEL=EL后-EL前' },
        { title: '闭合并显示3D', text: '逐段累加必须回到图纸标注的终点坐标；不闭合就回查符号、正负号和数字归属。', formula: '起点 + Σ坐标差 = 图纸终点' }
      ],
      quiz: { q: '考试图中的阴影三角形通常表示什么？', choices: ['三根实体管', '坐标分量或投影辅助', '保温材料', '焊缝数量'], correct: 1, why: '阴影三角形用于说明坐标分量和空间投影，不应拆成多根实体管。' }
    }
  ];

  const get = (id) => document.getElementById(id);
  let activeLesson = 0;
  let activeStep = 0;
  let playing = false;
  let playTimer = null;
  let quizCorrect = false;
  let completed = new Set();

  function profileId() { return window.PipeTrainerApp?.getActiveProfileId?.() || 'default'; }
  function storageKey() { return `pipe-micro-lessons:${profileId()}`; }
  function loadProgress() {
    try { completed = new Set(JSON.parse(localStorage.getItem(storageKey()) || '[]')); } catch (error) { completed = new Set(); }
  }
  function saveProgress() {
    try { localStorage.setItem(storageKey(), JSON.stringify(Array.from(completed))); } catch (error) { /* local learning state */ }
    window.dispatchEvent(new CustomEvent('pipe-micro-progress'));
  }

  function axisSvg() {
    return `<line class="micro-axis-e" x1="130" y1="320" x2="235" y2="380"/><text x="245" y="390">E+</text><line class="micro-axis-n" x1="130" y1="320" x2="25" y2="380"/><text x="4" y="392">N+</text><line class="micro-axis-z" x1="130" y1="320" x2="130" y2="170"/><text x="140" y="168">EL+</text>`;
  }

  function renderDirections(step) {
    const segments = [
      '',
      '<line class="micro-active" x1="130" y1="320" x2="400" y2="375"/><text x="410" y="382">E+ 向东</text>',
      '<line class="micro-active" x1="130" y1="320" x2="35" y2="370"/><text x="10" y="405">N+ 向北</text>',
      '<line class="micro-active" x1="130" y1="320" x2="130" y2="80"/><text x="145" y="85">EL+ 上升</text><line class="micro-helper" x1="300" y1="90" x2="300" y2="320"/><line class="micro-main" x1="300" y1="90" x2="300" y2="245"/><text x="315" y="180">EL- 下降</text>'
    ];
    return `${axisSvg()}${segments[step]}<circle class="micro-point" cx="130" cy="320" r="7"/><text class="micro-muted" x="480" y="35">看坐标增减，不看纸面上下</text>`;
  }

  function renderIso3d(step) {
    const points = 'M90 320 L210 260 L210 120 L390 210 L600 110';
    const helpers = step >= 2 ? '<path class="micro-helper" d="M90 320 L210 360 L390 310 L600 370"/><line class="micro-helper" x1="210" y1="120" x2="210" y2="360"/><line class="micro-helper" x1="390" y1="210" x2="390" y2="310"/><line class="micro-helper" x1="600" y1="110" x2="600" y2="370"/>' : '';
    const labels = step >= 1 ? [[90,320],[210,260],[210,120],[390,210],[600,110]].map((point,index)=>`<circle class="micro-point" cx="${point[0]}" cy="${point[1]}" r="6"/><text x="${point[0]+9}" y="${point[1]-8}">P${index}</text>`).join('') : '';
    const transform = step >= 3 ? '<path class="micro-active" d="M90 320 L210 260 L210 120 L390 210 L600 110"/><text x="455" y="65">坐标闭合后显示3D</text>' : '';
    return `<path class="micro-main" d="${points}"/>${helpers}${labels}${transform}${axisSvg()}`;
  }

  function renderFitting(step) {
    const branch = [
      '<line class="micro-active" x1="370" y1="230" x2="370" y2="80"/><text x="390" y="85">支口EL+</text>',
      '<line class="micro-active" x1="370" y1="230" x2="370" y2="385"/><text x="390" y="385">支口EL-</text>',
      '<path class="micro-active" d="M120 260 H300 V90"/><text x="315" y="95">弯头向上</text>',
      '<line class="micro-active" x1="370" y1="230" x2="240" y2="310"/><text x="190" y="335">支口N+</text><line class="micro-helper" x1="370" y1="230" x2="500" y2="150"/><text x="505" y="150">N-</text>'
    ];
    const main = step < 2 ? '<line class="micro-main" x1="100" y1="230" x2="650" y2="230"/><circle class="micro-point" cx="370" cy="230" r="8"/>' : '';
    return `${main}${branch[step]}${axisSvg()}<text class="micro-muted" x="480" y="35">符号变化时仍以坐标方向为准</text>`;
  }

  function renderCut(step) {
    const layers = [
      '<line class="micro-dimension" x1="80" y1="90" x2="680" y2="90"/><text x="330" y="72">中心距 D = 900</text>',
      '<line class="micro-dimension" x1="80" y1="90" x2="680" y2="90"/><path class="micro-active" d="M80 230 H190 M570 230 H680"/><text x="105" y="210">150</text><text x="600" y="210">150</text><text x="285" y="72">900-150-150=600</text>',
      '<path class="micro-main" d="M205 230 H555"/><line class="micro-active" x1="190" y1="230" x2="205" y2="230"/><line class="micro-active" x1="555" y1="230" x2="570" y2="230"/><text x="305" y="205">596 mm</text><text x="185" y="260">2</text><text x="558" y="260">2</text>',
      '<path class="micro-main" d="M205 230 H555"/><path class="micro-helper" d="M150 330 H600"/><line class="micro-active" x1="600" y1="315" x2="615" y2="345"/><text x="150" y="310">成品596</text><text x="560" y="370">锯缝3 → 原料599</text>'
    ];
    return `<rect class="micro-pipe-fill" x="190" y="195" width="380" height="70"/>${layers[step]}<text class="micro-muted" x="60" y="35">尺寸基准 → 管件占用 → 焊口间隙 → 原料耗用</text>`;
  }

  function renderExam(step) {
    const route = '<path class="micro-main" d="M125 75 L125 145 L250 220 L470 195 L470 345 L575 380"/>';
    const helpers = '<path class="micro-helper" d="M125 145 L250 145 L250 220 Z M250 220 L470 220 L470 195 Z"/><line class="micro-dimension" x1="95" y1="75" x2="95" y2="345"/><line class="micro-dimension" x1="250" y1="260" x2="470" y2="260"/>';
    const pointData = [[125,75],[125,145],[250,220],[470,195],[470,345],[575,380]];
    const points = pointData.map((point,index)=>`<circle class="micro-point" cx="${point[0]}" cy="${point[1]}" r="6"/><text x="${point[0]+8}" y="${point[1]-8}">P${index}</text>`).join('');
    if (step === 0) return `${route}${helpers}<text x="510" y="55">先找起终点</text>`;
    if (step === 1) return `${route}<text x="480" y="55">隐藏辅助线</text>`;
    if (step === 2) return `${route}${points}<text x="475" y="55">只在真实转折处标点</text>`;
    if (step === 3) return `${route}${points}<text class="micro-muted" x="75" y="410">逐段：后点 - 前点 = ΔE / ΔN / ΔEL</text>`;
    return `${route}${points}<path class="micro-active" d="M125 75 L125 145 L250 220 L470 195 L470 345 L575 380"/><text x="475" y="55">坐标闭合，生成3D</text>`;
  }

  function visualFor(lesson, step) {
    if (lesson.id === 'directions') return renderDirections(step);
    if (lesson.id === 'iso3d') return renderIso3d(step);
    if (lesson.id === 'fitting-direction') return renderFitting(step);
    if (lesson.id === 'cut-length') return renderCut(step);
    return renderExam(step);
  }

  function renderLessonList() {
    get('microLessonList').innerHTML = lessons.map((lesson,index)=>`<button class="${index===activeLesson?'is-active':''}" type="button" data-micro-lesson="${index}"><b>${String(index+1).padStart(2,'0')}</b><span>${lesson.title}<small>${lesson.summary}</small></span><em>${completed.has(lesson.id)?'完成':'○'}</em></button>`).join('');
  }

  function renderStep() {
    const lesson = lessons[activeLesson];
    const step = lesson.steps[activeStep];
    get('microLessonNumber').textContent = `LESSON ${String(activeLesson+1).padStart(2,'0')}`;
    get('microLessonTitle').textContent = lesson.title;
    get('microLessonSummary').textContent = lesson.summary;
    get('microLessonStepCounter').textContent = `${activeStep+1} / ${lesson.steps.length}`;
    get('microLessonStepTitle').textContent = step.title;
    get('microExplanationTitle').textContent = step.title;
    get('microExplanationText').textContent = step.text;
    get('microFormula').textContent = step.formula;
    get('microLessonSvg').innerHTML = `<title>${lesson.title}：${step.title}</title><desc>${step.text}</desc>${visualFor(lesson,activeStep)}`;
    get('microLessonDots').innerHTML = lesson.steps.map((_,index)=>`<button class="${index===activeStep?'is-active':''}" type="button" data-micro-step="${index}" aria-label="第${index+1}步"></button>`).join('');
    get('microLessonPrevBtn').disabled = activeStep === 0;
    get('microLessonNextBtn').disabled = activeStep === lesson.steps.length-1;
  }

  function renderQuiz() {
    const quiz = lessons[activeLesson].quiz;
    quizCorrect = false;
    get('microQuizQuestion').textContent = quiz.q;
    get('microQuizStatus').textContent = completed.has(lessons[activeLesson].id) ? '已完成' : '未完成';
    get('microQuizChoices').innerHTML = quiz.choices.map((choice,index)=>`<button type="button" data-micro-answer="${index}">${choice}</button>`).join('');
    get('microQuizFeedback').textContent = '';
    get('microQuizFeedback').className = '';
    get('microLessonCompleteBtn').disabled = !completed.has(lessons[activeLesson].id);
    get('microLessonCompleteBtn').textContent = completed.has(lessons[activeLesson].id) ? '已完成 · 点击取消' : '答对后完成本课';
  }

  function renderProgress() {
    get('microLessonsProgressText').textContent = `${completed.size} / ${lessons.length}`;
    get('microLessonsProgressBar').style.width = `${completed.size/lessons.length*100}%`;
    renderLessonList();
  }

  function selectLesson(index) {
    stopPlayback();
    activeLesson = index;
    activeStep = 0;
    renderProgress();
    renderStep();
    renderQuiz();
    window.scrollTo(0,0);
  }

  function stopPlayback() {
    playing = false;
    clearInterval(playTimer);
    playTimer = null;
    get('microLessonPlayBtn').textContent = '播放';
  }

  function togglePlayback() {
    if (playing) return stopPlayback();
    playing = true;
    get('microLessonPlayBtn').textContent = '暂停';
    if (activeStep === lessons[activeLesson].steps.length-1) activeStep = 0;
    renderStep();
    playTimer = setInterval(()=>{
      if (activeStep >= lessons[activeLesson].steps.length-1) return stopPlayback();
      activeStep += 1;
      renderStep();
    },1600);
  }

  function answerQuiz(index) {
    const quiz = lessons[activeLesson].quiz;
    document.querySelectorAll('[data-micro-answer]').forEach((button,buttonIndex)=>{
      button.disabled = true;
      button.classList.toggle('is-correct',buttonIndex===quiz.correct);
      button.classList.toggle('is-wrong',buttonIndex===index && index!==quiz.correct);
    });
    quizCorrect = index===quiz.correct;
    if (!quizCorrect) window.dispatchEvent(new CustomEvent('pipe-learning-mistake', { detail: { id: `micro-${lessons[activeLesson].id}`, label: `${lessons[activeLesson].title}：${quiz.q}`, destination: 'lessons', time: new Date().toISOString() } }));
    get('microQuizFeedback').textContent = `${quizCorrect?'回答正确。':'这一步需要再核对。'}${quiz.why}`;
    get('microQuizFeedback').className = quizCorrect?'is-success':'is-error';
    get('microLessonCompleteBtn').disabled = !quizCorrect;
    if (quizCorrect) get('microLessonCompleteBtn').textContent = '标记本课已完成';
  }

  function toggleComplete() {
    const id = lessons[activeLesson].id;
    if (completed.has(id)) completed.delete(id);
    else if (quizCorrect) completed.add(id);
    saveProgress();
    renderProgress();
    get('microQuizStatus').textContent = completed.has(id)?'已完成':'未完成';
    get('microLessonCompleteBtn').textContent = completed.has(id)?'已完成 · 点击取消':'答对后完成本课';
    get('microLessonCompleteBtn').disabled = !completed.has(id) && !quizCorrect;
  }

  function openExternal(url) {
    if (window.plus?.runtime?.openURL) plus.runtime.openURL(url);
    else window.open(url,'_blank','noopener');
  }

  function bindEvents() {
    get('microLessonsBackBtn').addEventListener('click',()=>document.querySelector('[data-page="home"]')?.click());
    get('microLessonList').addEventListener('click',event=>{const button=event.target.closest('[data-micro-lesson]');if(button)selectLesson(Number(button.dataset.microLesson));});
    get('microLessonDots').addEventListener('click',event=>{const button=event.target.closest('[data-micro-step]');if(button){stopPlayback();activeStep=Number(button.dataset.microStep);renderStep();}});
    get('microLessonPrevBtn').addEventListener('click',()=>{stopPlayback();activeStep=Math.max(0,activeStep-1);renderStep();});
    get('microLessonNextBtn').addEventListener('click',()=>{stopPlayback();activeStep=Math.min(lessons[activeLesson].steps.length-1,activeStep+1);renderStep();});
    get('microLessonPlayBtn').addEventListener('click',togglePlayback);
    get('microQuizChoices').addEventListener('click',event=>{const button=event.target.closest('[data-micro-answer]');if(button)answerQuiz(Number(button.dataset.microAnswer));});
    get('microLessonCompleteBtn').addEventListener('click',toggleComplete);
    document.querySelectorAll('[data-learning-url]').forEach(button=>button.addEventListener('click',()=>openExternal(button.dataset.learningUrl)));
    window.addEventListener('pipe-profile-change',()=>{loadProgress();renderProgress();renderQuiz();});
    document.querySelector('[data-page="lessons"]')?.addEventListener('click',()=>{stopPlayback();renderStep();});
  }

  loadProgress();
  bindEvents();
  renderProgress();
  renderStep();
  renderQuiz();
})();
