(function () {
  'use strict';

  const get = (id) => document.getElementById(id);
  const canvas = get('drawingCanvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const overlay = get('drawingOverlay');
  const stage = get('drawingStage');
  const viewport = get('drawingViewport');
  const directions = [
    ['E', '向东 E+'], ['W', '向西 E-'], ['N', '向北 N+'], ['S', '向南 N-'],
    ['U', '上升 EL+'], ['D', '下降 EL-'], ['XYZ', '空间斜管 ΔXYZ']
  ];

  let currentFile = null;
  let currentObjectUrl = '';
  let pdfDocument = null;
  let pdfPageNumber = 1;
  let pdfText = '';
  let tracing = false;
  let tracePoints = [];
  let inferredSegments = [];
  let suggestedLines = [];
  let ocrWorker = null;
  let fitScale = 1;
  let zoomRatio = 1;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let lastOcrPhase = '尚未初始化';

  function setStatus(message, progress) {
    get('importStatus').textContent = message;
    if (Number.isFinite(progress)) get('importProgressBar').style.width = `${Math.max(0, Math.min(100, progress))}%`;
  }

  function setStep(step) {
    document.querySelectorAll('.import-steps span').forEach((item, index) => item.classList.toggle('is-active', index <= step - 1));
  }

  function setToolsEnabled(enabled) {
    ['runOcrBtn', 'autoLineBtn', 'manualTraceBtn', 'clearTraceBtn', 'fitDrawingBtn', 'zoomInDrawingBtn', 'zoomOutDrawingBtn'].forEach((id) => get(id).disabled = !enabled);
    get('undoTraceBtn').disabled = !enabled || tracePoints.length === 0;
    get('extractPdfTextBtn').disabled = !pdfDocument;
  }

  function resetImportState() {
    tracePoints = [];
    inferredSegments = [];
    suggestedLines = [];
    pdfText = '';
    get('ocrTextOutput').value = '';
    get('ocrCandidateList').innerHTML = '';
    get('importSegmentList').innerHTML = '';
    get('importPointCount').textContent = '0个点';
    get('generateImportedModelBtn').disabled = true;
    setStep(1);
    renderOverlay();
  }

  function drawBitmap(bitmap) {
    const maximum = 2200;
    const scale = Math.min(1, maximum / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    get('drawingStage').querySelector('.drawing-empty').hidden = true;
    syncOverlay();
    setToolsEnabled(true);
    setStatus('图纸已载入。可先读取文字，再标记中心线。', 0);
    requestAnimationFrame(fitDrawing);
  }

  async function loadImageFile(file) {
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = currentObjectUrl;
    await image.decode();
    drawBitmap(image);
  }

  async function loadPdfFile(file) {
    setStatus('正在加载PDF组件...', 5);
    await window.PipeResources.ensurePdf();
    const data = new Uint8Array(await file.arrayBuffer());
    pdfDocument = await window.pdfjsLib.getDocument({ data }).promise;
    pdfPageNumber = 1;
    get('pdfPageControls').hidden = false;
    await renderPdfPage();
  }

  async function renderPdfPage() {
    if (!pdfDocument) return;
    setStatus(`正在载入PDF第 ${pdfPageNumber} 页...`, 15);
    const page = await pdfDocument.getPage(pdfPageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(2.2, 2200 / Math.max(baseViewport.width, baseViewport.height));
    const viewport = page.getViewport({ scale });
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvasContext: context, viewport }).promise;
    get('drawingStage').querySelector('.drawing-empty').hidden = true;
    get('pdfPageLabel').textContent = `${pdfPageNumber} / ${pdfDocument.numPages}`;
    get('pdfPrevPage').disabled = pdfPageNumber <= 1;
    get('pdfNextPage').disabled = pdfPageNumber >= pdfDocument.numPages;
    resetImportState();
    syncOverlay();
    setToolsEnabled(true);
    setStatus('PDF页面已载入。优先点击“读取PDF文字”。', 0);
    requestAnimationFrame(fitDrawing);
  }

  async function handleFile(file) {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setStatus('文件超过50MB，请拆分PDF或压缩图片。', 0);
      return;
    }
    const extension = (file.name.split('.').pop() || '').toLowerCase();
    const accepted = ['image/png', 'image/jpeg', 'application/pdf'];
    const fallbackType = extension === 'pdf' ? 'application/pdf' : ['jpg', 'jpeg'].includes(extension) ? 'image/jpeg' : extension === 'png' ? 'image/png' : '';
    const fileType = file.type || fallbackType;
    if (!accepted.includes(fileType)) {
      setStatus('只支持JPG、PNG和PDF。', 0);
      return;
    }
    currentFile = file;
    pdfDocument = null;
    get('pdfPageControls').hidden = true;
    resetImportState();
    get('drawingFileInfo').textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
    try {
      if (fileType === 'application/pdf') await loadPdfFile(file);
      else await loadImageFile(file);
    } catch (error) {
      console.error(error);
      setStatus(`载入失败：${error.message}`, 0);
    }
  }

  async function extractPdfText(updateStatus = true) {
    if (!pdfDocument) return '';
    const page = await pdfDocument.getPage(pdfPageNumber);
    const content = await page.getTextContent();
    pdfText = content.items.map((item) => item.str).join(' ');
    get('ocrTextOutput').value = pdfText;
    parseRecognizedText(pdfText);
    setStep(2);
    if (updateStatus) setStatus(`已读取PDF文字层，共 ${pdfText.length} 个字符。`, 100);
    return pdfText;
  }

  function formatError(error) {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string' && error.trim()) return error;
    if (error && typeof error === 'object') {
      const detail = error.message || error.error || error.reason || error.data;
      if (detail) return typeof detail === 'string' ? detail : JSON.stringify(detail);
      try {
        const serialized = JSON.stringify(error);
        if (serialized && serialized !== '{}') return serialized;
      } catch (serializationError) { /* use fallback */ }
    }
    return `Worker未返回错误详情（最后阶段：${lastOcrPhase}）`;
  }

  function assetUrl(path) {
    return new URL(path, document.baseURI).href;
  }

  async function createOcrWorker(workerBlobURL) {
    const localApp = location.protocol === 'file:' || Boolean(window.plus);
    lastOcrPhase = workerBlobURL ? 'Blob Worker初始化' : '本地Worker初始化';
    return window.Tesseract.createWorker(['chi_sim', 'eng'], 1, {
      workerPath: assetUrl('vendor/tesseract-worker.min.js'),
      langPath: assetUrl('vendor/tessdata/'),
      corePath: localApp ? assetUrl('vendor/tesseract-core/tesseract-core-lstm.wasm.js') : assetUrl('vendor/tesseract-core/'),
      workerBlobURL,
      cacheMethod: 'none',
      gzip: true,
      logger: (message) => {
        lastOcrPhase = message.status || lastOcrPhase;
        const percent = Number.isFinite(message.progress) ? Math.round(message.progress * 100) : 5;
        setStatus(`OCR：${message.status || '处理中'} ${percent}%`, percent);
      }
    });
  }

  async function getOcrWorker() {
    if (ocrWorker) return ocrWorker;
    setStatus('正在加载OCR组件...', 3);
    await window.PipeResources.ensureOcr();
    setStatus('首次初始化本地OCR，可能需要10-30秒...', 5);
    const localApp = location.protocol === 'file:' || Boolean(window.plus);
    const attempts = localApp ? [false, true] : [true, false];
    let failure;
    for (const workerBlobURL of attempts) {
      try {
        ocrWorker = await createOcrWorker(workerBlobURL);
        return ocrWorker;
      } catch (error) {
        failure = error;
        console.warn(`OCR Worker加载失败，准备切换方案（workerBlobURL=${workerBlobURL}）`, error);
      }
    }
    throw new Error(`${formatError(failure)}；已尝试两种安卓Worker加载方式`);
  }

  async function runOcr() {
    if (!canvas.width) return;
    get('runOcrBtn').disabled = true;
    try {
      const worker = await getOcrWorker();
      const result = await worker.recognize(canvas);
      const text = result.data.text || '';
      get('ocrTextOutput').value = text;
      parseRecognizedText(text);
      setStep(2);
      setStatus(`OCR完成，平均置信度 ${Math.round(result.data.confidence || 0)}%。请人工核对。`, 100);
    } catch (error) {
      console.error(error);
      if (ocrWorker) {
        try { await ocrWorker.terminate(); } catch (terminateError) { /* ignore */ }
        ocrWorker = null;
      }
      setStatus(`OCR失败：${formatError(error)}`, 0);
    } finally {
      get('runOcrBtn').disabled = false;
    }
  }

  function firstMatch(text, patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return '';
  }

  function parseRecognizedText(text) {
    const normalized = text.replace(/[，,]/g, '').replace(/\s+/g, ' ');
    const lineNumber = firstMatch(normalized, [/(?:LINE|管线号)\s*[:：]?\s*([A-Z0-9*]+(?:-[A-Z0-9*]+){2,})/i, /\b([A-Z]{1,5}-\d{3,}[A-Z0-9-]*)\b/]);
    const dn = firstMatch(normalized, [/\bDN\s*[:：]?\s*(\d{1,4})\b/i, /\bNPS\s*[:：]?\s*(\d+(?:\.\d+)?)\b/i]);
    const east = firstMatch(normalized, [/(?:EAST|Easting|东)\s*[:：=+]?\s*(-?\d{2,8})/i, /\bE\s*[:：=+]?\s*(-?\d{2,8})\b/i]);
    const north = firstMatch(normalized, [/(?:NORTH|Northing|北)\s*[:：=+]?\s*(-?\d{2,8})/i, /\bN\s*[:：=+]?\s*(-?\d{2,8})\b/i]);
    const elevation = firstMatch(normalized, [/(?:标高|ELEVATION|ELEV|EL)\s*[:：=+]?\s*([+-]?\d{2,8})/i]);
    if (lineNumber) get('importLineNo').value = lineNumber;
    if (dn) get('importDn').value = dn;
    if (east) get('importStartE').value = east;
    if (north) get('importStartN').value = north;
    if (elevation) get('importStartZ').value = elevation;

    const numbers = Array.from(new Set((normalized.match(/\d{2,6}/g) || []).map(Number).filter((value) => value >= 15 && value <= 999999))).slice(0, 20);
    const candidates = [];
    if (lineNumber) candidates.push({ label: `管线号 ${lineNumber}`, target: 'importLineNo', value: lineNumber });
    if (dn) candidates.push({ label: `DN ${dn}`, target: 'importDn', value: dn });
    numbers.slice(0, 12).forEach((value) => candidates.push({ label: `${value} mm`, target: '', value }));
    get('ocrCandidateList').innerHTML = candidates.map((item) => `<button type="button" data-target="${item.target}" data-value="${item.value}">${item.label}</button>`).join('');
  }

  function applyDrawingZoom(nextRatio, preserveCenter = true) {
    if (!canvas.width || !canvas.height) return;
    const oldWidth = Math.max(1, viewport.getBoundingClientRect().width);
    const oldHeight = Math.max(1, viewport.getBoundingClientRect().height);
    const centerX = (stage.scrollLeft + stage.clientWidth / 2) / oldWidth;
    const centerY = (stage.scrollTop + stage.clientHeight / 2) / oldHeight;
    zoomRatio = Math.max(0.5, Math.min(8, nextRatio));
    const width = Math.max(1, Math.round(canvas.width * fitScale * zoomRatio));
    const height = Math.max(1, Math.round(canvas.height * fitScale * zoomRatio));
    viewport.style.width = `${width}px`;
    viewport.style.height = `${height}px`;
    get('drawingZoomLabel').textContent = `${Math.round(zoomRatio * 100)}%`;
    syncOverlay();
    requestAnimationFrame(() => {
      if (preserveCenter) {
        stage.scrollLeft = Math.max(0, centerX * width - stage.clientWidth / 2);
        stage.scrollTop = Math.max(0, centerY * height - stage.clientHeight / 2);
      }
    });
  }

  function fitDrawing() {
    if (!canvas.width || !canvas.height) return;
    const availableWidth = Math.max(120, stage.clientWidth - 24);
    const availableHeight = Math.max(180, stage.clientHeight - 24);
    fitScale = Math.min(1, availableWidth / canvas.width, availableHeight / canvas.height);
    zoomRatio = 1;
    applyDrawingZoom(1, false);
    requestAnimationFrame(() => stage.scrollTo({ left: 0, top: 0 }));
  }

  function syncOverlay() {
    if (!canvas.width) return;
    requestAnimationFrame(() => {
      overlay.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`);
      renderOverlay();
    });
  }

  function renderOverlay() {
    const auto = suggestedLines.map((line) => `<line class="trace-line-auto" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}"/>`).join('');
    const manualPath = tracePoints.length > 1 ? `<polyline class="trace-line-manual" points="${tracePoints.map((point) => `${point.x},${point.y}`).join(' ')}"/>` : '';
    const points = tracePoints.map((point, index) => `<circle class="trace-point" cx="${point.x}" cy="${point.y}" r="6"/><text class="trace-point-label" x="${point.x + 8}" y="${point.y - 8}">P${index}</text>`).join('');
    overlay.innerHTML = `${auto}${manualPath}${points}`;
    get('undoTraceBtn').disabled = tracePoints.length === 0;
  }

  function overlayCoordinates(event) {
    const rect = overlay.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(canvas.width, (event.clientX - rect.left) / rect.width * canvas.width)),
      y: Math.max(0, Math.min(canvas.height, (event.clientY - rect.top) / rect.height * canvas.height))
    };
  }

  function inferDirection(dx, dy) {
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (Math.abs(dx) < Math.abs(dy) * 0.35) return dy < 0 ? 'U' : 'D';
    if (angle >= -25 && angle <= 25) return 'E';
    if (angle > 25 && angle < 80) return 'E';
    if (angle >= 80 && angle <= 140) return 'N';
    if (angle > 140 || angle < -140) return 'W';
    if (angle >= -140 && angle <= -80) return 'S';
    return angle < 0 ? 'S' : 'N';
  }

  function rebuildInferredSegments() {
    inferredSegments = [];
    for (let index = 0; index < tracePoints.length - 1; index += 1) {
      const start = tracePoints[index], end = tracePoints[index + 1];
      const pixelLength = Math.hypot(end.x - start.x, end.y - start.y);
      const existing = inferredSegments[index];
      const estimatedLength = Math.max(1, Math.round(pixelLength / 10) * 100);
      inferredSegments.push({ dir: inferDirection(end.x - start.x, end.y - start.y), length: estimatedLength, dx: estimatedLength, dy: 0, dz: 0, confidence: '待确认', existing });
    }
    renderSegmentEditor();
  }

  function renderSegmentEditor() {
    get('importPointCount').textContent = `${tracePoints.length}个点`;
    get('importSegmentList').innerHTML = inferredSegments.map((segment, index) => `
      <div class="import-segment-row" data-import-index="${index}">
        <header><strong>第 ${index + 1} 段</strong><span>${segment.confidence}</span></header>
        <div class="import-segment-row-grid">
          <label>方向<select data-import-field="dir">${directions.map(([value, label]) => `<option value="${value}"${segment.dir === value ? ' selected' : ''}>${label}</option>`).join('')}</select></label>
          ${segment.dir === 'XYZ'
            ? `<label>ΔE mm<input type="number" step="1" data-import-field="dx" value="${segment.dx || 0}"></label><label>ΔN mm<input type="number" step="1" data-import-field="dy" value="${segment.dy || 0}"></label><label>ΔEL mm<input type="number" step="1" data-import-field="dz" value="${segment.dz || 0}"></label>`
            : `<label>长度 mm<input type="number" min="1" step="1" data-import-field="length" value="${segment.length}"></label>`}
        </div>
        <small>像素长度仅用于初始估算，必须用图纸标注尺寸替换。</small>
      </div>`).join('');
    get('generateImportedModelBtn').disabled = inferredSegments.length === 0;
    if (inferredSegments.length) setStep(4);
  }

  function addTracePoint(event) {
    if (!tracing || !canvas.width) return;
    tracePoints.push(overlayCoordinates(event));
    renderOverlay();
    rebuildInferredSegments();
    setStep(3);
  }

  function findLongLines() {
    if (!canvas.width) return;
    setStatus('正在寻找长直线...', 20);
    const maximum = 800;
    const scale = Math.min(1, maximum / Math.max(canvas.width, canvas.height));
    const work = document.createElement('canvas');
    work.width = Math.round(canvas.width * scale);
    work.height = Math.round(canvas.height * scale);
    const workContext = work.getContext('2d', { willReadFrequently: true });
    workContext.drawImage(canvas, 0, 0, work.width, work.height);
    const pixels = workContext.getImageData(0, 0, work.width, work.height).data;
    const darkPoints = [];
    for (let y = 2; y < work.height - 2; y += 2) {
      for (let x = 2; x < work.width - 2; x += 2) {
        const offset = (y * work.width + x) * 4;
        const luminance = pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114;
        if (luminance < 70 && pixels[offset + 3] > 200) darkPoints.push({ x, y });
      }
    }
    const angleValues = Array.from({ length: 12 }, (_, index) => index * Math.PI / 12);
    const candidates = [];
    angleValues.forEach((theta) => {
      const cos = Math.cos(theta), sin = Math.sin(theta);
      const bins = new Map();
      darkPoints.forEach((point) => {
        const rho = Math.round(point.x * cos + point.y * sin);
        const bin = bins.get(rho) || [];
        bin.push(point);
        bins.set(rho, bin);
      });
      bins.forEach((points) => {
        if (points.length < 20) return;
        const axisX = -sin, axisY = cos;
        const projections = points.map((point) => point.x * axisX + point.y * axisY);
        const minimum = Math.min(...projections), maximumProjection = Math.max(...projections);
        const span = maximumProjection - minimum;
        if (span < 60) return;
        const rho = Math.round(points[0].x * cos + points[0].y * sin);
        candidates.push({ score: points.length + span, theta, rho, minimum, maximum: maximumProjection });
      });
    });
    candidates.sort((a, b) => b.score - a.score);
    const selected = [];
    candidates.forEach((candidate) => {
      if (selected.length >= 12) return;
      const duplicate = selected.some((item) => Math.abs(item.theta - candidate.theta) < 0.05 && Math.abs(item.rho - candidate.rho) < 12);
      if (!duplicate) selected.push(candidate);
    });
    suggestedLines = selected.map((line) => {
      const cos = Math.cos(line.theta), sin = Math.sin(line.theta), axisX = -sin, axisY = cos;
      return {
        x1: (line.rho * cos + line.minimum * axisX) / scale,
        y1: (line.rho * sin + line.minimum * axisY) / scale,
        x2: (line.rho * cos + line.maximum * axisX) / scale,
        y2: (line.rho * sin + line.maximum * axisY) / scale
      };
    });
    renderOverlay();
    setStatus(`找到 ${suggestedLines.length} 条长线建议。红线可能包含尺寸线和图框，请勿直接当成管线。`, 100);
  }

  function buildImportedModel() {
    const rows = Array.from(document.querySelectorAll('.import-segment-row'));
    const segments = rows.map((row) => {
      const direction = row.querySelector('[data-import-field="dir"]').value;
      if (direction === 'XYZ') return {
        dir: 'XYZ',
        dx: Number(row.querySelector('[data-import-field="dx"]')?.value) || 0,
        dy: Number(row.querySelector('[data-import-field="dy"]')?.value) || 0,
        dz: Number(row.querySelector('[data-import-field="dz"]')?.value) || 0
      };
      const length = Math.max(1, Number(row.querySelector('[data-import-field="length"]')?.value) || 1);
      return { dir: direction, length };
    });
    try {
      window.PipeTrainerApp.loadExternalCase({
        name: get('importLineNo').value || '导入图纸',
        start: [Number(get('importStartE').value) || 0, Number(get('importStartN').value) || 0, Number(get('importStartZ').value) || 0],
        dn: Number(get('importDn').value) || 100,
        segments
      });
      setStatus('已生成3D。请继续对照原图逐段复核。', 100);
    } catch (error) {
      setStatus(`生成失败：${error.message}`, 0);
    }
  }

  function initEvents() {
    get('openImportBtn').addEventListener('click', () => document.querySelector('[data-page="import"]')?.click());
    get('drawingFileInput').addEventListener('change', (event) => handleFile(event.target.files[0]));
    const dropZone = get('drawingDropZone');
    ['dragenter', 'dragover'].forEach((type) => dropZone.addEventListener(type, (event) => { event.preventDefault(); dropZone.classList.add('is-dragging'); }));
    ['dragleave', 'drop'].forEach((type) => dropZone.addEventListener(type, (event) => { event.preventDefault(); dropZone.classList.remove('is-dragging'); }));
    dropZone.addEventListener('drop', (event) => handleFile(event.dataTransfer.files[0]));
    get('pdfPrevPage').addEventListener('click', async () => { if (pdfPageNumber > 1) { pdfPageNumber -= 1; await renderPdfPage(); } });
    get('pdfNextPage').addEventListener('click', async () => { if (pdfDocument && pdfPageNumber < pdfDocument.numPages) { pdfPageNumber += 1; await renderPdfPage(); } });
    get('extractPdfTextBtn').addEventListener('click', () => extractPdfText(true));
    get('runOcrBtn').addEventListener('click', runOcr);
    get('ocrTextOutput').addEventListener('change', (event) => parseRecognizedText(event.target.value));
    get('ocrCandidateList').addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (button?.dataset.target) get(button.dataset.target).value = button.dataset.value;
    });
    get('autoLineBtn').addEventListener('click', findLongLines);
    get('manualTraceBtn').addEventListener('click', () => {
      tracing = !tracing;
      stage.classList.toggle('is-tracing', tracing);
      get('manualTraceBtn').classList.toggle('is-active', tracing);
      get('manualTraceBtn').textContent = tracing ? '结束标点' : '手动标点';
      get('drawingStageHint').textContent = tracing ? '按管线顺序点击起点、转折点和终点' : '标点结束，可在右侧确认路径';
    });
    overlay.addEventListener('click', addTracePoint);
    get('undoTraceBtn').addEventListener('click', () => { tracePoints.pop(); renderOverlay(); rebuildInferredSegments(); });
    get('clearTraceBtn').addEventListener('click', () => { tracePoints = []; suggestedLines = []; renderOverlay(); rebuildInferredSegments(); });
    get('importSegmentList').addEventListener('input', (event) => {
      const row = event.target.closest('[data-import-index]');
      if (!row) return;
      const index = Number(row.dataset.importIndex);
      const field = event.target.dataset.importField;
      if (field === 'dir') {
        inferredSegments[index].dir = event.target.value;
        renderSegmentEditor();
      }
      if (field === 'length') inferredSegments[index].length = Math.max(1, Number(event.target.value) || 1);
      if (['dx', 'dy', 'dz'].includes(field)) inferredSegments[index][field] = Number(event.target.value) || 0;
    });
    get('generateImportedModelBtn').addEventListener('click', buildImportedModel);
    get('fitDrawingBtn').addEventListener('click', fitDrawing);
    get('zoomInDrawingBtn').addEventListener('click', () => applyDrawingZoom(zoomRatio * 1.5));
    get('zoomOutDrawingBtn').addEventListener('click', () => applyDrawingZoom(zoomRatio / 1.5));
    stage.addEventListener('wheel', (event) => {
      if (!event.ctrlKey || !canvas.width) return;
      event.preventDefault();
      applyDrawingZoom(zoomRatio * (event.deltaY < 0 ? 1.2 : 1 / 1.2));
    }, { passive: false });
    stage.addEventListener('touchstart', (event) => {
      if (event.touches.length !== 2) return;
      pinchStartDistance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
      pinchStartZoom = zoomRatio;
    }, { passive: true });
    stage.addEventListener('touchmove', (event) => {
      if (event.touches.length !== 2 || !pinchStartDistance) return;
      event.preventDefault();
      const distance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
      applyDrawingZoom(pinchStartZoom * distance / pinchStartDistance);
    }, { passive: false });
    stage.addEventListener('touchend', (event) => { if (event.touches.length < 2) pinchStartDistance = 0; }, { passive: true });
    window.addEventListener('resize', () => { if (canvas.width) fitDrawing(); });
    window.addEventListener('pagehide', () => { if (ocrWorker) ocrWorker.terminate(); if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl); });
  }

  initEvents();
  setToolsEnabled(false);
})();
