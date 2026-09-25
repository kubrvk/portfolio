// ==UserScript==
// @name         Hunyuan 3D Batch Asset Downloader
// @namespace    https://3d.hunyuan.tencent.com/
// @version      1.1.2
// @description  Download all generated 3D assets (.glb) in background with correct names and subfolder
// @match        https://3d.hunyuan.tencent.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Prevent duplicate panel injections
  if (document.getElementById('hy-downloader-panel')) {
    return;
  }

  function cleanFileName(str) {
    return (str || 'Model')
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .trim()
      .slice(0, 40) || 'Model';
  }

  function accelerateUrl(url) {
    if (!url || typeof url !== 'string') return '';
    return url.replace(
      'hunyuan-base-prod-1258344703.cos.ap-guangzhou.myqcloud.com',
      'hunyuan-base-prod-1258344703.cos.accelerate.myqcloud.com'
    );
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function generateTraceId() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }

  let scannedModels = [];
  let isScanning = false;
  let isDownloading = false;
  let cancelDownload = false;

  // Send download request to background service worker (chrome.downloads API)
  function downloadViaExtension(url, filename) {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'download_model',
            url: url,
            filename: `Hunyuan3D/${filename}`
          }, (res) => {
            if (chrome.runtime.lastError) {
              console.warn('Runtime message error:', chrome.runtime.lastError.message);
              resolve({ success: false, error: chrome.runtime.lastError.message });
            } else {
              resolve(res || { success: true });
            }
          });
        } else {
          // Fallback if not running as extension
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => a.remove(), 100);
          resolve({ success: true });
        }
      } catch (e) {
        console.warn('Download message error:', e);
        resolve({ success: false, error: e.message });
      }
    });
  }

  // Styles
  if (!document.getElementById('hy-downloader-style')) {
    const style = document.createElement('style');
    style.id = 'hy-downloader-style';
    style.textContent = `
      #hy-launcher-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        background: linear-gradient(135deg, #2563eb, #7c3aed);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 9999px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #hy-launcher-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(124, 58, 237, 0.5);
      }
      #hy-downloader-panel {
        position: fixed;
        bottom: 84px;
        right: 24px;
        width: 440px;
        max-width: calc(100vw - 48px);
        background: #18191e;
        border: 1px solid #2e323b;
        border-radius: 16px;
        z-index: 999999;
        display: none;
        flex-direction: column;
        box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #e5e7eb;
        overflow: hidden;
      }
      .hy-panel-header {
        padding: 14px 18px;
        background: #20232b;
        border-bottom: 1px solid #2e323b;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
      }
      .hy-panel-title {
        font-size: 14px;
        font-weight: 700;
        color: #f3f4f6;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .hy-panel-close {
        background: none;
        border: none;
        color: #9ca3af;
        font-size: 18px;
        cursor: pointer;
        line-height: 1;
        padding: 4px;
        border-radius: 4px;
      }
      .hy-panel-close:hover {
        color: #fff;
        background: rgba(255,255,255,0.1);
      }
      .hy-panel-body {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-height: 480px;
        overflow-y: auto;
      }
      .hy-stat-box {
        background: #20242e;
        border: 1px solid #2e3342;
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 13px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .hy-stat-row {
        display: flex;
        justify-content: space-between;
        color: #9ca3af;
      }
      .hy-stat-val {
        color: #60a5fa;
        font-weight: 600;
      }
      .hy-btn-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .hy-btn {
        padding: 11px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      .hy-btn-primary {
        background: #2563eb;
        color: #fff;
      }
      .hy-btn-primary:hover:not(:disabled) {
        background: #1d4ed8;
      }
      .hy-btn-secondary {
        background: #374151;
        color: #f3f4f6;
      }
      .hy-btn-secondary:hover:not(:disabled) {
        background: #4b5563;
      }
      .hy-btn-green {
        background: #059669;
        color: #fff;
        grid-column: span 2;
        font-size: 14px;
      }
      .hy-btn-green:hover:not(:disabled) {
        background: #047857;
      }
      .hy-btn-danger {
        background: #dc2626;
        color: #fff;
      }
      .hy-btn-danger:hover:not(:disabled) {
        background: #b91c1c;
      }
      .hy-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .hy-progress-container {
        display: none;
        flex-direction: column;
        gap: 6px;
        background: #1f232d;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #2e3342;
      }
      .hy-progress-bar-bg {
        width: 100%;
        height: 8px;
        background: #374151;
        border-radius: 4px;
        overflow: hidden;
      }
      .hy-progress-bar-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #3b82f6, #10b981);
        transition: width 0.2s ease;
      }
      .hy-progress-text {
        font-size: 12px;
        color: #9ca3af;
        display: flex;
        justify-content: space-between;
      }
      .hy-list-preview {
        display: none;
        flex-direction: column;
        gap: 4px;
        max-height: 160px;
        overflow-y: auto;
        background: #131418;
        border-radius: 8px;
        padding: 8px;
        border: 1px solid #242731;
      }
      .hy-list-item {
        font-size: 11px;
        color: #9ca3af;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 6px;
        border-radius: 4px;
      }
      .hy-list-item:nth-child(odd) {
        background: rgba(255,255,255,0.02);
      }
      .hy-list-item-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 290px;
      }
      .hy-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #2563eb33;
        color: #60a5fa;
      }
    `;
    document.head.appendChild(style);
  }

  // Create Launcher Button
  let launcher = document.getElementById('hy-launcher-btn');
  if (!launcher) {
    launcher = document.createElement('button');
    launcher.id = 'hy-launcher-btn';
    launcher.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>Toplu İndir</span>
    `;
    document.body.appendChild(launcher);
  }

  // Create Panel
  const panel = document.createElement('div');
  panel.id = 'hy-downloader-panel';
  panel.innerHTML = `
    <div class="hy-panel-header">
      <div class="hy-panel-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        <span>Hunyuan 3D Toplu İndirici</span>
      </div>
      <button class="hy-panel-close" id="hy-close-btn">&times;</button>
    </div>
    <div class="hy-panel-body">
      <div class="hy-stat-box">
        <div class="hy-stat-row">
          <span>Durum:</span>
          <span class="hy-stat-val" id="hy-status-text">Hazır</span>
        </div>
        <div class="hy-stat-row">
          <span>Tespit Edilen Model:</span>
          <span class="hy-stat-val" id="hy-count-text">0 model</span>
        </div>
        <div class="hy-stat-row">
          <span>Hedef Klasör:</span>
          <span style="color:#60a5fa;font-weight:600">İndirilenler / Hunyuan3D /</span>
        </div>
        <div class="hy-stat-row">
          <span>İsimlendirme:</span>
          <span style="color:#10b981;font-weight:600">Prompt_Adı_v1_id.glb</span>
        </div>
      </div>

      <div class="hy-progress-container" id="hy-progress-box">
        <div class="hy-progress-text">
          <span id="hy-prog-label">İndiriliyor...</span>
          <span id="hy-prog-pct">0%</span>
        </div>
        <div class="hy-progress-bar-bg">
          <div class="hy-progress-bar-fill" id="hy-prog-fill"></div>
        </div>
      </div>

      <div class="hy-btn-group">
        <button class="hy-btn hy-btn-green" id="hy-dl-bg-btn" disabled>
          ⚡ Arka Planda Sessizce İndir (Sekme Açmaz)
        </button>
        <button class="hy-btn hy-btn-secondary" id="hy-scan-btn">
          🔍 Modelleri Tara
        </button>
        <button class="hy-btn hy-btn-secondary" id="hy-copy-btn" disabled>
          📋 Linkleri Kopyala
        </button>
      </div>

      <button class="hy-btn hy-btn-secondary" id="hy-toggle-list" style="font-size:11px;padding:6px;display:none;">
        📋 Model Listesini Göster / Gizle
      </button>

      <div class="hy-list-preview" id="hy-list-preview"></div>
    </div>
  `;
  document.body.appendChild(panel);

  const closeBtn = document.getElementById('hy-close-btn');
  const scanBtn = document.getElementById('hy-scan-btn');
  const dlBgBtn = document.getElementById('hy-dl-bg-btn');
  const copyBtn = document.getElementById('hy-copy-btn');
  const toggleListBtn = document.getElementById('hy-toggle-list');
  const statusText = document.getElementById('hy-status-text');
  const countText = document.getElementById('hy-count-text');
  const progressBox = document.getElementById('hy-progress-box');
  const progFill = document.getElementById('hy-prog-fill');
  const progLabel = document.getElementById('hy-prog-label');
  const progPct = document.getElementById('hy-prog-pct');
  const listPreview = document.getElementById('hy-list-preview');

  launcher.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    if (scannedModels.length === 0 && !isScanning) {
      scanAssets();
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.style.display = 'none';
  });

  toggleListBtn.addEventListener('click', () => {
    listPreview.style.display = listPreview.style.display === 'flex' ? 'none' : 'flex';
  });

  function updateUI() {
    if (scannedModels.length > 0) {
      statusText.textContent = 'Tarama Tamamlandı!';
      countText.textContent = `${scannedModels.length} model hazır`;
      dlBgBtn.disabled = false;
      copyBtn.disabled = false;
      toggleListBtn.style.display = 'block';

      listPreview.innerHTML = scannedModels.map((m, idx) => `
        <div class="hy-list-item">
          <span class="hy-list-item-title">${idx + 1}. ${m.name}</span>
          <span class="hy-badge">GLB</span>
        </div>
      `).join('');
    } else {
      statusText.textContent = isScanning ? 'Modeller taranıyor...' : 'Model bulunamadı!';
      countText.textContent = '0 model';
      dlBgBtn.disabled = true;
      copyBtn.disabled = true;
      toggleListBtn.style.display = 'none';
      listPreview.style.display = 'none';
    }
  }

  // Parse creations array into individual models with correct prompt names
  function addCreationsToModels(creations) {
    if (!Array.isArray(creations)) return;
    creations.forEach((c, cIdx) => {
      const rawPrompt = c.prompt || c.title || c.name || `Model_${cIdx + 1}`;
      const cleanPrompt = cleanFileName(rawPrompt);

      if (Array.isArray(c.result) && c.result.length > 0) {
        c.result.forEach((item, rIdx) => {
          if (!item) return;
          // Case-insensitive status check (Tencent uses lowercase "success")
          if (item.status && item.status.toLowerCase() !== 'success') return;
          let glb = item.urlResult?.glb || item.styleItem?.modelUrl || (typeof item.modelUrl === 'string' && item.modelUrl.includes('.glb') ? item.modelUrl : null);
          if (glb && typeof glb === 'string') {
            glb = accelerateUrl(glb);
            const assetId = (item.assetId || c.id || '').slice(-6);
            const name = `${cleanPrompt}_v${rIdx + 1}_${assetId || (rIdx + 1)}.glb`;
            if (!scannedModels.some(m => m.url === glb)) {
              scannedModels.push({ url: glb, name, prompt: rawPrompt, id: item.assetId || c.id });
            }
          }
        });
      } else {
        let glb = c.urlResult?.glb || c.styleItem?.modelUrl || (typeof c.modelUrl === 'string' && c.modelUrl.includes('.glb') ? c.modelUrl : null);
        if (glb && typeof glb === 'string') {
          glb = accelerateUrl(glb);
          const assetId = (c.id || '').slice(-6);
          const name = `${cleanPrompt}_${assetId || 'model'}.glb`;
          if (!scannedModels.some(m => m.url === glb)) {
            scannedModels.push({ url: glb, name, prompt: rawPrompt, id: c.id });
          }
        }
      }
    });
  }

  // Deep inspector to find GLB URLs inside React Fiber / State
  function findGlbInObject(obj, visited = new Set(), depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 12 || visited.has(obj)) return;
    visited.add(obj);

    // Array traversal
    if (Array.isArray(obj)) {
      for (const item of obj) {
        findGlbInObject(item, visited, depth + 1);
      }
      return;
    }

    // Direct GLB check on item
    const singleGlb = obj.urlResult?.glb || obj.styleItem?.modelUrl || (typeof obj.modelUrl === 'string' && obj.modelUrl.includes('.glb') ? obj.modelUrl : null);
    if (singleGlb && typeof singleGlb === 'string') {
      const glb = accelerateUrl(singleGlb);
      if (!scannedModels.some(m => m.url === glb)) {
        const rawPrompt = obj.prompt || obj.parent?.prompt || obj.parent?.title || obj.title || obj.name || 'Model';
        const cleanPrompt = cleanFileName(rawPrompt);
        const id = (obj.assetId || obj.id || obj.creationId || '').slice(-6);
        scannedModels.push({
          url: glb,
          name: `${cleanPrompt}_${id || 'asset'}.glb`,
          prompt: rawPrompt,
          id: obj.assetId || obj.id
        });
      }
      return;
    }

    // Result array check (4 variations per prompt)
    if (Array.isArray(obj.result) && obj.result.length > 0) {
      const rawPrompt = obj.prompt || obj.title || obj.name || 'Model';
      const cleanPrompt = cleanFileName(rawPrompt);
      obj.result.forEach((v, vIdx) => {
        if (!v) return;
        if (v.status && v.status.toLowerCase() !== 'success') return;
        const vGlb = v.urlResult?.glb || v.styleItem?.modelUrl || (typeof v.modelUrl === 'string' && v.modelUrl.includes('.glb') ? v.modelUrl : null);
        if (vGlb && typeof vGlb === 'string') {
          const glb = accelerateUrl(vGlb);
          if (!scannedModels.some(m => m.url === glb)) {
            const id = (v.assetId || obj.id || '').slice(-6);
            scannedModels.push({
              url: glb,
              name: `${cleanPrompt}_v${vIdx + 1}_${id || (vIdx + 1)}.glb`,
              prompt: rawPrompt,
              id: v.assetId || obj.id
            });
          }
        }
      });
      return;
    }

    // Property recursion
    for (const key of Object.keys(obj)) {
      if (['children', 'memoizedProps', 'memoizedState', 'current', 'props', 'result', 'taskList', 'modelList', 'creations', 'value', 'state', 'data'].includes(key)) {
        findGlbInObject(obj[key], visited, depth + 1);
      }
    }
  }

  // Scan directly from DOM and React Fiber (100% Offline & Reliable)
  function scanFromDOM() {
    const targets = [
      document.querySelector('.task-list-wrapper'),
      document.querySelector('.task-list'),
      document.querySelector('.assets-content'),
      document.querySelector('#app'),
      document.body
    ].filter(Boolean);

    for (const el of targets) {
      const fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
      if (!fiberKey) continue;
      let fiber = el[fiberKey];
      let d = 0;
      while (fiber && d++ < 50) {
        // Direct state / props check
        findGlbInObject(fiber.memoizedState);
        findGlbInObject(fiber.memoizedProps);

        // Hook traversal if functional component
        let hook = fiber.memoizedState;
        let hCount = 0;
        while (hook && typeof hook === 'object' && hCount++ < 50) {
          if (hook.memoizedState) {
            findGlbInObject(hook.memoizedState);
            if (hook.memoizedState.current) {
              findGlbInObject(hook.memoizedState.current);
            }
          }
          hook = hook.next;
        }

        fiber = fiber.return;
      }
      if (scannedModels.length > 0) break;
    }

    // Also check task-list DOM items
    const items = document.querySelectorAll('.task-list__item, [class*="task-list__item"], [class*="asset"]');
    items.forEach(item => {
      for (const k of Object.keys(item)) {
        if (k.startsWith('__reactFiber$') || k.startsWith('__reactProps$') || k.startsWith('__reactInternalInstance$')) {
          findGlbInObject(item[k]);
        }
      }
    });
  }

  // Fetch creations from Tencent API with limit 20 and proper headers
  async function fetchCreationsList(offset = 0) {
    const hyUser = getCookie('hy_user');
    const headers = {
      'Content-Type': 'application/json',
      'x-source': 'web',
      'x-product': 'hunyuan3d',
      'Trace-Id': generateTraceId()
    };
    if (hyUser) {
      headers['x_hunyuan_inner_user_id'] = hyUser;
    }

    const payloads = [
      { limit: 20, offset: offset, sceneTypeList: ["playGround3D", "playGround3D-2.0"] },
      { limit: 20, offset: offset, sceneTypeList: [] },
      { limit: 20, offset: offset }
    ];

    for (const body of payloads) {
      try {
        const res = await fetch('/api/3d/creations/list', {
          method: 'POST',
          credentials: 'include',
          headers: headers,
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.creations || json?.creations || [];
          if (Array.isArray(list) && list.length > 0) {
            return { success: true, list };
          }
          if (json?.code === 0 && Array.isArray(list)) {
            // Valid end of creations list
            return { success: true, list: [] };
          }
        } else {
          console.warn('API Error HTTP', res.status, await res.text().catch(() => ''));
        }
      } catch (e) {
        console.warn('Fetch exception:', e);
      }
    }
    return { success: false, list: [] };
  }

  // Master Scan Trigger
  async function scanAssets() {
    if (isScanning) return;
    isScanning = true;
    scanBtn.disabled = true;
    statusText.textContent = 'Modeller taranıyor...';
    scannedModels = [];
    updateUI();

    try {
      // 1. Ekrandaki React DOM ve Fiber'ı tara (Sayfadaki açık modelleri anında yakalar)
      statusText.textContent = 'Sayfa hafızası taranıyor...';
      scanFromDOM();
      if (scannedModels.length > 0) {
        statusText.textContent = `${scannedModels.length} model hafızadan bulundu, sunucu kontrol ediliyor...`;
        updateUI();
      }

      // 2. Tencent API'sinden tüm sayfaları çek (Geçmiş tüm modelleri eksiksiz toplar)
      let offset = 0;
      const limit = 20;

      while (offset < 200) { // En fazla 200 creation = ~800 model için güvenlik sınırı
        statusText.textContent = `Sunucu taranıyor (${offset})...`;
        const result = await fetchCreationsList(offset);
        if (!result.success || !result.list || result.list.length === 0) {
          break;
        }
        addCreationsToModels(result.list);
        updateUI();
        if (result.list.length < limit) break;
        offset += limit;
      }

      // 3. Son bir kez DOM'u tekrar tara (Herhangi bir eksik kalmasın)
      scanFromDOM();
      updateUI();

      if (scannedModels.length === 0) {
        statusText.textContent = 'Model bulunamadı (Sayfayı yenileyip tekrar deneyin)';
      }
    } catch (err) {
      console.error('Tarama Hatası:', err);
      statusText.textContent = 'Hata: ' + (err.message || 'Tarama tamamlanamadı');
    } finally {
      isScanning = false;
      scanBtn.disabled = false;
    }
  }

  scanBtn.addEventListener('click', scanAssets);

  // Copy Links
  copyBtn.addEventListener('click', () => {
    if (scannedModels.length === 0) return;
    const text = scannedModels.map(m => `${m.name}\t${m.url}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      const prev = copyBtn.textContent;
      copyBtn.textContent = '✅ Kopyalandı!';
      setTimeout(() => { copyBtn.textContent = prev; }, 2000);
    }).catch(() => {
      const blob = new Blob([text], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'hunyuan3d_links.txt';
      a.click();
    });
  });

  // Calm, background download via chrome.downloads API (No new tabs, subfolder Hunyuan3D/, correct names)
  dlBgBtn.addEventListener('click', async () => {
    if (scannedModels.length === 0) return;

    if (isDownloading) {
      cancelDownload = true;
      dlBgBtn.textContent = 'Durduruluyor...';
      return;
    }

    isDownloading = true;
    cancelDownload = false;
    dlBgBtn.textContent = '⏹️ İndirmeyi Durdur';
    dlBgBtn.classList.remove('hy-btn-green');
    dlBgBtn.classList.add('hy-btn-danger');
    scanBtn.disabled = true;
    progressBox.style.display = 'flex';

    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < scannedModels.length; i++) {
        if (cancelDownload) {
          progLabel.textContent = `İndirme durduruldu (${successCount} indirildi).`;
          break;
        }

        const m = scannedModels[i];
        const pct = Math.round(((i + 1) / scannedModels.length) * 100);
        progLabel.textContent = `İndiriliyor (${i + 1}/${scannedModels.length}): ${m.name}`;
        progPct.textContent = `${pct}%`;
        progFill.style.width = `${pct}%`;

        // Download silently in background directly to Hunyuan3D/filename.glb
        const res = await downloadViaExtension(m.url, m.name);
        if (res && res.success) {
          successCount++;
        } else {
          failCount++;
          console.warn('İndirme hatası:', m.name, res?.error);
        }

        // Calm delay (600ms) to ensure smooth background streaming without PC freeze
        await new Promise(r => setTimeout(r, 600));
      }

      if (!cancelDownload) {
        progLabel.textContent = `✅ Tamamlandı! ${successCount} dosya "Hunyuan3D/" klasörüne kaydedildi.`;
      }
    } catch (err) {
      console.error(err);
      progLabel.textContent = 'Hata oluştu!';
    } finally {
      isDownloading = false;
      cancelDownload = false;
      dlBgBtn.textContent = '⚡ Arka Planda Sessizce İndir';
      dlBgBtn.classList.remove('hy-btn-danger');
      dlBgBtn.classList.add('hy-btn-green');
      scanBtn.disabled = false;
    }
  });

})();
