(function () {
  'use strict';

  const abbreviationData = [
    ['ISO', 'Isometric Drawing', '管道轴测图或单线图'],
    ['P&ID', 'Piping and Instrumentation Diagram', '管道及仪表流程图'],
    ['GA', 'General Arrangement', '总布置图'],
    ['DN', 'Diameter Nominal', '公称直径'],
    ['NPS', 'Nominal Pipe Size', '英制公称管径'],
    ['OD', 'Outside Diameter', '实际外径'],
    ['ID', 'Inside Diameter', '实际内径'],
    ['SCH', 'Schedule', '管壁厚度系列'],
    ['PN', 'Pressure Nominal', '公称压力等级'],
    ['CL', 'Center Line', '中心线或中心标高'],
    ['EL', 'Elevation', '标高'],
    ['BOP', 'Bottom of Pipe', '管底标高'],
    ['TOP', 'Top of Pipe', '管顶标高'],
    ['BW', 'Butt Weld', '对焊连接'],
    ['SW', 'Socket Weld', '承插焊连接；也可能按图例表示预制焊口'],
    ['THD', 'Threaded', '螺纹连接'],
    ['WN', 'Weld Neck Flange', '对焊颈法兰'],
    ['SO', 'Slip-On Flange', '平焊法兰'],
    ['BL', 'Blind Flange', '盲板法兰'],
    ['RF', 'Raised Face', '突面密封面'],
    ['FF', 'Flat Face', '全平面密封面'],
    ['RTJ', 'Ring Type Joint', '环连接密封面'],
    ['LR', 'Long Radius', '长半径弯头，通常R=1.5D'],
    ['SR', 'Short Radius', '短半径弯头，通常R=1D'],
    ['FW', 'Field Weld', '现场焊口'],
    ['NDT', 'Non-Destructive Testing', '无损检测'],
    ['RT', 'Radiographic Testing', '射线检测'],
    ['UT', 'Ultrasonic Testing', '超声检测'],
    ['MT', 'Magnetic Particle Testing', '磁粉检测'],
    ['PT', 'Penetrant Testing', '渗透检测'],
    ['MTO', 'Material Take-Off', '材料统计或材料清单'],
    ['BOM', 'Bill of Materials', '材料表'],
    ['REV', 'Revision', '图纸版本或修订号'],
    ['CONT.', 'Continue / Continued', '管线续接到另一张图或从另一张图接入'],
    ['TYP.', 'Typical', '典型做法，同类位置照此执行'],
    ['HOLD', 'Hold', '暂缓施工或待确认点'],
    ['N / S / E / W', 'North / South / East / West', '北、南、东、西方向']
  ];

  let wireMode = false;
  let quizOrder = [];
  let quizIndex = 0;
  let quizCorrect = 0;
  let quizAnswered = false;

  function shuffle(values) {
    const copy = values.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function startWirePractice() {
    if (!window.PipeTrainerApp) return;
    wireMode = true;
    window.PipeTrainerApp.startWirePractice();
    document.getElementById('wirePracticePanel').hidden = false;
    document.querySelectorAll('[data-wire-check]').forEach((checkbox) => checkbox.checked = false);
    document.getElementById('revealBtn').disabled = true;
    document.getElementById('quizMessage').textContent = '先看单线图，用铁丝按顺序弯出管线。完成自检后再显示3D。';
    const cover = document.getElementById('quizCover');
    cover.querySelector('strong').textContent = '铁丝实操中';
    cover.querySelector('span').textContent = '按单线图弯制，完成后再核对3D';
    updateWireChecklist();
  }

  function updateWireChecklist() {
    const checks = Array.from(document.querySelectorAll('[data-wire-check]'));
    const completed = checks.filter((checkbox) => checkbox.checked).length;
    document.getElementById('wirePracticeProgress').textContent = `完成 ${completed} / ${checks.length} 项${completed === checks.length ? '，现在可以显示3D核对。' : '后显示3D核对。'}`;
    document.getElementById('revealBtn').disabled = wireMode && completed !== checks.length;
  }

  function finishWirePractice() {
    if (!wireMode) return;
    wireMode = false;
    document.getElementById('wirePracticePanel').hidden = true;
    document.getElementById('revealBtn').disabled = false;
    const cover = document.getElementById('quizCover');
    cover.querySelector('strong').textContent = '3D答案已隐藏';
    cover.querySelector('span').textContent = '先从单线图推算终点坐标';
  }

  function startAbbreviationQuiz() {
    quizOrder = shuffle(abbreviationData.map((_, index) => index)).slice(0, 10);
    quizIndex = 0;
    quizCorrect = 0;
    renderAbbreviationQuestion();
  }

  function renderAbbreviationQuestion() {
    quizAnswered = false;
    const item = abbreviationData[quizOrder[quizIndex]];
    const wrongMeanings = shuffle(abbreviationData.filter((entry) => entry !== item).map((entry) => entry[2])).slice(0, 3);
    const choices = shuffle([item[2], ...wrongMeanings]);
    document.getElementById('abbrQuizPrompt').textContent = `“${item[0]}” 在管道图纸中通常表示什么？`;
    document.getElementById('abbrQuizChoices').innerHTML = choices.map((choice) => `<button type="button" data-abbr-answer="${choice === item[2] ? 'correct' : 'wrong'}">${choice}</button>`).join('');
    document.getElementById('abbrQuizFeedback').textContent = '';
    document.getElementById('abbrQuizStartBtn').hidden = true;
    document.getElementById('abbrQuizNextBtn').hidden = true;
    document.getElementById('abbrQuizScore').textContent = `${quizCorrect} / ${quizIndex}`;
  }

  function answerAbbreviation(event) {
    const button = event.target.closest('[data-abbr-answer]');
    if (!button || quizAnswered) return;
    quizAnswered = true;
    const item = abbreviationData[quizOrder[quizIndex]];
    const correct = button.dataset.abbrAnswer === 'correct';
    if (correct) quizCorrect += 1;
    document.querySelectorAll('[data-abbr-answer]').forEach((choice) => {
      choice.disabled = true;
      if (choice.dataset.abbrAnswer === 'correct') choice.classList.add('is-correct');
    });
    if (!correct) button.classList.add('is-wrong');
    if (!correct) window.dispatchEvent(new CustomEvent('pipe-learning-mistake', { detail: { id: `abbr-${item[0]}`, category: 'symbols', label: `英文缩写 ${item[0]}：${item[2]}`, destination: 'glossary', time: new Date().toISOString() } }));
    document.getElementById('abbrQuizFeedback').textContent = `${correct ? '回答正确。' : '回答错误。'} ${item[0]} = ${item[1]}，现场含义：${item[2]}。`;
    document.getElementById('abbrQuizScore').textContent = `${quizCorrect} / ${quizIndex + 1}`;
    const isLast = quizIndex >= quizOrder.length - 1;
    const next = document.getElementById('abbrQuizNextBtn');
    next.hidden = false;
    next.textContent = isLast ? '查看结果' : '下一题';
  }

  function nextAbbreviationQuestion() {
    if (quizIndex >= quizOrder.length - 1) {
      document.getElementById('abbrQuizPrompt').textContent = `本轮完成：答对 ${quizCorrect} / ${quizOrder.length}。`;
      document.getElementById('abbrQuizChoices').innerHTML = '';
      document.getElementById('abbrQuizFeedback').textContent = quizCorrect >= 8 ? '现场常用缩写掌握良好。' : '建议回看上方速查表，再练一轮。';
      document.getElementById('abbrQuizStartBtn').hidden = false;
      document.getElementById('abbrQuizStartBtn').textContent = '再练一轮';
      document.getElementById('abbrQuizNextBtn').hidden = true;
      return;
    }
    quizIndex += 1;
    renderAbbreviationQuestion();
  }

  window.PipeAbbreviationData = abbreviationData.map(([code, english, chinese]) => ({ code, english, chinese }));

  document.getElementById('wirePracticeBtn').addEventListener('click', startWirePractice);
  document.querySelectorAll('[data-wire-check]').forEach((checkbox) => checkbox.addEventListener('change', updateWireChecklist));
  document.getElementById('revealBtn').addEventListener('click', finishWirePractice);
  document.getElementById('randomBtn').addEventListener('click', finishWirePractice);
  document.getElementById('abbrQuizStartBtn').addEventListener('click', startAbbreviationQuiz);
  document.getElementById('abbrQuizChoices').addEventListener('click', answerAbbreviation);
  document.getElementById('abbrQuizNextBtn').addEventListener('click', nextAbbreviationQuestion);
})();
