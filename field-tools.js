(function () {
  'use strict';

  const pipeCatalog = [
    { dn: 15, nps: '1/2', inch: '4分', od: 21.3, lr: 38, sr: null },
    { dn: 20, nps: '3/4', inch: '6分', od: 26.7, lr: 38, sr: null },
    { dn: 25, nps: '1', inch: '1寸', od: 33.4, lr: 38, sr: 25 },
    { dn: 32, nps: '1 1/4', inch: '1¼寸', od: 42.2, lr: 48, sr: 32 },
    { dn: 40, nps: '1 1/2', inch: '1½寸', od: 48.3, lr: 57, sr: 38 },
    { dn: 50, nps: '2', inch: '2寸', od: 60.3, lr: 76, sr: 51 },
    { dn: 65, nps: '2 1/2', inch: '2½寸', od: 73.0, lr: 95, sr: 64 },
    { dn: 80, nps: '3', inch: '3寸', od: 88.9, lr: 114, sr: 76 },
    { dn: 100, nps: '4', inch: '4寸', od: 114.3, lr: 152, sr: 102 },
    { dn: 125, nps: '5', inch: '5寸', od: 141.3, lr: 190, sr: 127 },
    { dn: 150, nps: '6', inch: '6寸', od: 168.3, lr: 229, sr: 152 },
    { dn: 200, nps: '8', inch: '8寸', od: 219.1, lr: 305, sr: 203 },
    { dn: 250, nps: '10', inch: '10寸', od: 273.0, lr: 381, sr: 254 },
    { dn: 300, nps: '12', inch: '12寸', od: 323.9, lr: 457, sr: 305 },
    { dn: 350, nps: '14', inch: '14寸', od: 355.6, lr: 533, sr: 356 },
    { dn: 400, nps: '16', inch: '16寸', od: 406.4, lr: 610, sr: 406 },
    { dn: 450, nps: '18', inch: '18寸', od: 457.0, lr: 686, sr: 457 },
    { dn: 500, nps: '20', inch: '20寸', od: 508.0, lr: 762, sr: 508 },
    { dn: 600, nps: '24', inch: '24寸', od: 610.0, lr: 914, sr: 610 }
  ];

  const get = (id) => document.getElementById(id);
  const numberValue = (id, fallback = 0) => {
    const value = Number(get(id).value);
    return Number.isFinite(value) ? value : fallback;
  };
  const format = (value, digits = 1) => Number(value).toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });

  function renderPipeCatalog() {
    get('nominalSizeBody').innerHTML = pipeCatalog.map((item) => `<tr><td>${item.dn}</td><td>${item.nps}</td><td>${item.inch}</td><td>${format(item.od, 1)}</td><td>${format(item.lr, 0)}</td><td>${item.sr === null ? '—' : format(item.sr, 0)}</td></tr>`).join('');
    get('compoundPipeSize').innerHTML = pipeCatalog.map((item) => `<option value="${item.dn}"${item.dn === 100 ? ' selected' : ''}>DN${item.dn} / NPS ${item.nps} / OD ${format(item.od, 1)}</option>`).join('');
    updateCatalogButtons();
  }

  function selectedPipe() {
    const dn = Number(get('compoundPipeSize').value);
    return pipeCatalog.find((item) => item.dn === dn) || pipeCatalog[8];
  }

  function updateCatalogButtons() {
    const pipe = selectedPipe();
    get('compoundUseLrBtn').textContent = `采用LR ${format(pipe.lr, 0)} mm`;
    get('compoundUseSrBtn').textContent = pipe.sr === null ? '该尺寸无SR参考' : `采用SR ${format(pipe.sr, 0)} mm`;
    get('compoundUseSrBtn').disabled = pipe.sr === null;
  }

  function updateCompound() {
    const offsetX = numberValue('compoundOffsetX');
    const offsetY = numberValue('compoundOffsetY');
    const angle = Math.max(0.01, Math.min(89.99, Math.abs(numberValue('compoundAngle', 45))));
    const radius = Math.max(0, numberValue('compoundRadius'));
    const gap = Math.max(0, numberValue('compoundGap'));
    const combined = Math.hypot(offsetX, offsetY);
    const radians = angle * Math.PI / 180;
    const roll = (Math.atan2(offsetY, offsetX) * 180 / Math.PI + 360) % 360;
    const travel = combined / Math.sin(radians);
    const run = combined / Math.tan(radians);
    const tangent = radius * Math.tan(radians / 2);
    const spool = travel - tangent * 2 - gap * 2;
    get('compoundOffsetResult').textContent = `${format(combined)} mm`;
    get('compoundRollResult').textContent = combined ? `${format(roll, 2)}°` : '—';
    get('compoundTravelResult').textContent = combined ? `${format(travel)} mm` : '—';
    get('compoundRunResult').textContent = combined ? `${format(run)} mm` : '—';
    get('compoundTangentResult').textContent = `${format(tangent)} mm`;
    get('compoundSpoolResult').textContent = combined && spool >= 0 ? `${format(spool)} mm` : '—';
    get('compoundError').textContent = !combined ? 'X和Y偏移不能同时为0。' : spool < 0 ? '当前合成偏移放不下两只弯头和焊口间隙，请增大偏移、减小半径或调整角度。' : '';
    renderCompoundDiagram({ offsetX, offsetY, combined, roll, angle, travel, run, spool });
  }

  function renderCompoundDiagram(values) {
    const { offsetX, offsetY, combined, roll, angle, travel, run, spool } = values;
    const planScale = 150 / Math.max(Math.abs(offsetX), Math.abs(offsetY), 1);
    const ox = 120, oy = 250;
    const px = ox + offsetX * planScale, py = oy - offsetY * planScale;
    const sideScale = 155 / Math.max(Math.abs(run), combined, 1);
    const sx = 370, sy = 260;
    const ex = sx + run * sideScale, ey = sy - combined * sideScale;
    get('compoundDiagram').innerHTML = `<title>复合偏移平面与侧面分解</title><desc>X和Y形成合成偏移，再与轴向推进形成斜管行程</desc>
      <text x="28" y="30">平面滚转</text><text x="335" y="30">偏移侧视</text>
      <line class="diagram-axis" x1="45" y1="${oy}" x2="300" y2="${oy}"/><line class="diagram-axis" x1="${ox}" y1="60" x2="${ox}" y2="300"/>
      <line class="diagram-grid" x1="${px}" y1="${oy}" x2="${px}" y2="${py}"/><line class="diagram-grid" x1="${ox}" y1="${py}" x2="${px}" y2="${py}"/>
      <line class="diagram-main" x1="${ox}" y1="${oy}" x2="${px}" y2="${py}"/>
      <text class="diagram-muted" x="${(ox + px) / 2 - 32}" y="${oy + 20}">X ${format(offsetX, 0)}</text><text class="diagram-muted" x="${px + 6}" y="${(oy + py) / 2}">Y ${format(offsetY, 0)}</text>
      <text x="${(ox + px) / 2 - 35}" y="${(oy + py) / 2 - 10}">O ${format(combined, 0)}</text><text class="diagram-muted" x="45" y="325">φ ${format(roll, 2)}°</text>
      <line class="diagram-axis" x1="${sx}" y1="${sy}" x2="590" y2="${sy}"/><line class="diagram-grid" x1="${ex}" y1="${sy}" x2="${ex}" y2="${ey}"/><line class="diagram-main" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}"/>
      <text class="diagram-muted" x="${(sx + ex) / 2 - 30}" y="${sy + 20}">推进 ${format(run, 0)}</text><text class="diagram-muted" x="${ex + 5}" y="${(sy + ey) / 2}">偏移 ${format(combined, 0)}</text>
      <text x="${(sx + ex) / 2 - 30}" y="${(sy + ey) / 2 - 10}">行程 ${format(travel, 0)}</text><text class="diagram-muted" x="340" y="325">θ ${format(angle, 1)}° · 直管 ${spool >= 0 ? format(spool, 0) : '无法布置'}</text>`;
  }

  function slopeGrade(value, unit) {
    if (unit === 'percent') return value / 100;
    if (unit === 'permille' || unit === 'mmper') return value / 1000;
    if (unit === 'ratio') return value > 0 ? 1 / value : NaN;
    return Math.tan(value * Math.PI / 180);
  }

  function updateSlope() {
    const startEl = numberValue('slopeStartEl');
    const length = Math.max(0, numberValue('slopeLength'));
    const value = Math.max(0, numberValue('slopeValue'));
    const unit = get('slopeUnit').value;
    const direction = get('slopeDirection').value;
    const interval = Math.max(0, numberValue('slopeStationInterval'));
    const grade = slopeGrade(value, unit);
    const valid = Number.isFinite(grade) && length > 0 && interval > 0;
    const pointCount = valid ? Math.ceil(length / interval) + 1 : 0;
    const tooMany = pointCount > 201;
    const signedGrade = direction === 'down' ? -grade : grade;
    const rise = length * signedGrade;
    const endEl = startEl + rise;
    const angle = Math.atan(grade) * 180 / Math.PI;
    get('slopeRiseResult').textContent = valid ? `${rise >= 0 ? '+' : ''}${format(rise)} mm` : '—';
    get('slopeEndResult').textContent = valid ? `EL ${format(endEl)} mm` : '—';
    get('slopeEquivalentResult').textContent = valid ? `${format(grade * 100, 3)}% · ${format(grade * 1000, 2)}‰ · ${format(grade * 1000, 2)} mm/m · 1:${grade ? format(1 / grade, 1) : '∞'}` : '—';
    get('slopeAngleResult').textContent = valid ? `${format(angle, 3)}°` : '—';
    get('slopeError').textContent = !valid ? '距离、坡度和测点间距必须为有效正数；水平管可将坡度填写0。' : tooMany ? '测点超过200个，请增大测点间距。' : '';
    if (!valid || tooMany) {
      get('slopeStationBody').innerHTML = '';
      get('slopeDiagram').innerHTML = '<title>坡度输入无效</title><text x="70" y="150">请检查距离、坡度单位和测点间距</text>';
      return;
    }
    const stations = [];
    for (let distance = 0; distance < length; distance += interval) stations.push(distance);
    if (stations[stations.length - 1] !== length) stations.push(length);
    get('slopeStationBody').innerHTML = stations.map((distance, index) => `<tr><td>P${index}</td><td>${format(distance, 0)}</td><td>${format(startEl + distance * signedGrade, 1)}</td></tr>`).join('');
    renderSlopeDiagram({ startEl, length, rise, endEl, grade, angle, stations });
  }

  function renderSlopeDiagram(values) {
    const { startEl, length, rise, endEl, grade, angle, stations } = values;
    const x1 = 70, x2 = 550, baseY = 170;
    const visualDelta = rise === 0 ? 0 : Math.sign(rise) * Math.min(120, Math.max(35, Math.abs(rise) * 0.35));
    const y2 = baseY - visualDelta;
    const stationMarks = stations.map((distance, index) => {
      const ratio = distance / length;
      const x = x1 + (x2 - x1) * ratio;
      const y = baseY + (y2 - baseY) * ratio;
      return `<line class="diagram-grid" x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}"/>${index === 0 || index === stations.length - 1 ? `<text class="diagram-muted" x="${x - 18}" y="${y + 25}">P${index}</text>` : ''}`;
    }).join('');
    get('slopeDiagram').innerHTML = `<title>坡管标高变化</title><desc>显示起点终点、流向和沿线测点</desc>
      <text x="28" y="30">坡度 ${format(grade * 100, 3)}% · ${format(angle, 3)}°</text>
      <line class="diagram-axis" x1="45" y1="${baseY}" x2="575" y2="${baseY}"/><line class="diagram-main" x1="${x1}" y1="${baseY}" x2="${x2}" y2="${y2}"/>${stationMarks}
      <circle class="diagram-point" cx="${x1}" cy="${baseY}" r="5"/><circle class="diagram-point" cx="${x2}" cy="${y2}" r="5"/>
      <text class="diagram-muted" x="${x1}" y="${baseY - 14}">EL ${format(startEl, 1)}</text><text class="diagram-muted" x="${x2 - 80}" y="${y2 - 14}">EL ${format(endEl, 1)}</text>
      <text class="diagram-muted" x="230" y="270">水平距离 ${format(length, 0)} mm · 总升降 ${rise >= 0 ? '+' : ''}${format(rise, 1)} mm</text>`;
  }

  function applySlopeExample(name) {
    const examples = {
      '2percent': { value: 2, unit: 'percent', length: 6000, interval: 1000, direction: 'down' },
      '5permille': { value: 5, unit: 'permille', length: 12000, interval: 2000, direction: 'down' },
      ratio100: { value: 100, unit: 'ratio', length: 10000, interval: 1000, direction: 'down' }
    };
    const example = examples[name];
    if (!example) return;
    get('slopeValue').value = example.value;
    get('slopeUnit').value = example.unit;
    get('slopeLength').value = example.length;
    get('slopeStationInterval').value = example.interval;
    get('slopeDirection').value = example.direction;
    updateSlope();
  }

  function bindEvents() {
    ['compoundOffsetX', 'compoundOffsetY', 'compoundAngle', 'compoundRadius', 'compoundGap'].forEach((id) => get(id).addEventListener('input', updateCompound));
    get('compoundPipeSize').addEventListener('change', updateCatalogButtons);
    get('compoundUseLrBtn').addEventListener('click', () => { get('compoundRadius').value = selectedPipe().lr; updateCompound(); });
    get('compoundUseSrBtn').addEventListener('click', () => { const radius = selectedPipe().sr; if (radius !== null) { get('compoundRadius').value = radius; updateCompound(); } });
    ['slopeStartEl', 'slopeLength', 'slopeValue', 'slopeStationInterval'].forEach((id) => get(id).addEventListener('input', updateSlope));
    ['slopeUnit', 'slopeDirection'].forEach((id) => get(id).addEventListener('change', updateSlope));
    document.querySelectorAll('[data-slope-example]').forEach((button) => button.addEventListener('click', () => applySlopeExample(button.dataset.slopeExample)));
  }

  window.PipeFieldTools = { pipeCatalog };
  renderPipeCatalog();
  bindEvents();
  updateCompound();
  updateSlope();
})();
