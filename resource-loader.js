(function () {
  'use strict';

  const pending = new Map();
  const loaded = new Set();

  function loadScript(src, test) {
    if (test()) return Promise.resolve();
    if (pending.has(src)) return pending.get(src);
    const promise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-pipe-resource="${src}"]`);
      if (existing) {
        existing.addEventListener('load', () => test() ? resolve() : reject(new Error(`${src}加载后未初始化`)), { once: true });
        existing.addEventListener('error', () => reject(new Error(`${src}加载失败`)), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.pipeResource = src;
      const timeout = setTimeout(() => { script.remove(); reject(new Error(`${src}加载超时`)); }, 20000);
      script.onload = () => {
        clearTimeout(timeout);
        if (!test()) return reject(new Error(`${src}加载后未初始化`));
        loaded.add(src);
        resolve();
      };
      script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error(`${src}加载失败`)); };
      document.head.appendChild(script);
    }).catch((error) => { pending.delete(src); throw error; });
    pending.set(src, promise);
    return promise;
  }

  async function ensureThree() {
    await loadScript('vendor/three.min.js', () => Boolean(window.THREE));
    await loadScript('vendor/OrbitControls.js', () => Boolean(window.THREE?.OrbitControls));
  }

  async function ensurePdf() {
    await loadScript('vendor/pdf.min.js', () => Boolean(window.pdfjsLib));
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
  }

  async function ensureOcr() {
    await loadScript('vendor/tesseract.min.js', () => Boolean(window.Tesseract));
  }

  window.PipeResources = {
    ensureThree,
    ensurePdf,
    ensureOcr,
    status() {
      return { three: Boolean(window.THREE?.OrbitControls), pdf: Boolean(window.pdfjsLib), ocr: Boolean(window.Tesseract), loaded: Array.from(loaded) };
    }
  };
})();
