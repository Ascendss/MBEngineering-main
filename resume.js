document.addEventListener('DOMContentLoaded', async () => {
  const contentWrapper = document.getElementById('resumeContentWrapper');
  const titleEl = document.getElementById('resumePageTitle');
  const introEl = document.getElementById('resumeIntroText');
  const metaEl = document.getElementById('resumeMeta');
  const canvas = document.getElementById('resumeCanvas');
  const fallback = document.getElementById('resumeFallback');
  const downloadLink = document.getElementById('resumeDownloadLink');
  const fullscreenBtn = document.getElementById('resumeFullscreenButton');

  // Normalize raw GitHub URLs to site-relative paths
  function normalizeResumeUrl(url) {
    if (!url) return '';
    if (url.startsWith('https://raw.githubusercontent.com/')) {
      const parts = url.split('/main/');
      if (parts.length === 2 && parts[1]) {
        return '/' + parts[1];
      }
    }
    return url;
  }

  // Show fallback message
  function showFallback() {
    if (canvas) canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
  }

  try {
    const res = await fetch('/content/resume.json');
    if (!res.ok) throw new Error('Failed to load resume info');
    const data = await res.json();

    const title = data.title || 'Resume';
    const intro = data.intro || 'You can view or download my resume below.';
    const fileUrl = normalizeResumeUrl(data.fileUrl);
    const fileName = data.fileName || 'resume';

    // Set page title and intro
    if (titleEl) titleEl.textContent = title;
    if (introEl) introEl.textContent = intro;

    // Show file name in meta
    if (metaEl) {
      metaEl.textContent = fileName || '';
    }

    if (fileUrl) {
      // Wire download button
      if (downloadLink) {
        downloadLink.href = fileUrl;
        downloadLink.style.display = 'inline-block';
        downloadLink.download = fileName || 'resume';
      }

      // Wire fullscreen button
      if (fullscreenBtn) {
        fullscreenBtn.disabled = false;
        fullscreenBtn.addEventListener('click', () => {
          window.open(fileUrl, '_blank', 'noopener');
        });
      }

      // Check if it's a PDF and PDF.js is available
      const ext = fileUrl.split('.').pop().toLowerCase();
      
      if (ext === 'pdf' && window.pdfjsLib && canvas) {
        try {
          // Configure PDF.js worker
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

          const pdf = await pdfjsLib.getDocument(fileUrl).promise;

          // Get the first page (resume is typically 1 page)
          const page = await pdf.getPage(1);

          // Scale to fit container width with high resolution
          const containerWidth = canvas.parentElement.clientWidth || 800;
          const viewport = page.getViewport({ scale: 1 });
          const scale = (containerWidth / viewport.width) * 2; // 2x for retina/sharp rendering
          const scaledViewport = page.getViewport({ scale });

          // Set canvas dimensions
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;
          
          // Scale down display size for crisp rendering
          canvas.style.width = (scaledViewport.width / 2) + 'px';
          canvas.style.height = (scaledViewport.height / 2) + 'px';

          const canvasCtx = canvas.getContext('2d');

          // Render the page
          await page.render({
            canvasContext: canvasCtx,
            viewport: scaledViewport,
          }).promise;

          canvas.style.display = 'block';
        } catch (pdfErr) {
          console.error('Error rendering resume PDF:', pdfErr);
          showFallback();
        }
      } else if (ext !== 'pdf') {
        // Non-PDF file
        showFallback();
        if (fallback) {
          fallback.innerHTML = '<p>Inline preview is only available for PDF files. Use the button below to download or open the resume.</p>';
        }
      } else {
        // PDF.js not loaded
        showFallback();
      }
    } else {
      // No file URL
      showFallback();
      if (fallback) {
        fallback.innerHTML = '<p>Resume file not uploaded yet.</p>';
      }
      if (downloadLink) downloadLink.style.display = 'none';
      if (fullscreenBtn) fullscreenBtn.disabled = true;
    }

    // Fade in content
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  } catch (err) {
    console.error('Error loading resume:', err);
    showFallback();
    if (fallback) {
      fallback.innerHTML = '<p class="resume-error">Unable to load resume at this time.</p>';
    }
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  }
});
