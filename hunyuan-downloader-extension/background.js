// Hunyuan 3D Downloader - Background Service Worker

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download_model') {
    const { url, filename } = request;
    
    // Ensure clean subfolder path: Hunyuan3D/filename.glb
    const safePath = filename.startsWith('Hunyuan3D/') ? filename : `Hunyuan3D/${filename}`;

    chrome.downloads.download({
      url: url,
      filename: safePath,
      conflictAction: 'uniquify',
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.warn('İndirme hatası:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });
    return true; // Asynchronous sendResponse
  }
});
