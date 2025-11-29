document.addEventListener('DOMContentLoaded', async () => {
  const contentWrapper = document.getElementById('resumeContentWrapper');
  const titleEl = document.getElementById('resumePageTitle');
  const introEl = document.getElementById('resumeIntroText');
  const previewContainer = document.getElementById('resumePreview');
  const downloadLink = document.getElementById('resumeDownloadLink');
  const metaEl = document.getElementById('resumeMeta');
  const fullscreenBtn = document.getElementById('resumeFullscreenButton');

  try {
    const res = await fetch('/content/resume.json');
    if (!res.ok) throw new Error('Failed to load resume info');
    const data = await res.json();

    const title = data.title || 'Resume';
    const intro = data.intro || 'You can view or download my resume below.';
    let fileUrl = data.fileUrl || '';
    const fileName = data.fileName || 'resume';

    // If the URL is a raw.githubusercontent.com link, convert it
    // to a site-relative asset path on the Netlify site.
    // Example:
    //   https://raw.githubusercontent.com/.../main/assets/uploads/xyz.pdf
    // becomes:
    //   /assets/uploads/xyz.pdf
    if (fileUrl && fileUrl.startsWith('https://raw.githubusercontent.com/')) {
      const parts = fileUrl.split('/main/');
      if (parts.length === 2 && parts[1]) {
        fileUrl = '/' + parts[1]; // "assets/uploads/..." -> "/assets/uploads/..."
      }
    }

    if (titleEl) titleEl.textContent = title;
    if (introEl) introEl.textContent = intro;

    // Show file name + last updated if available
    if (metaEl) {
      const updated = data.updatedAt ? new Date(data.updatedAt) : null;
      const parts = [];

      if (fileName) parts.push(fileName);
      if (updated && !isNaN(updated)) {
        parts.push(
          'Last updated: ' +
            updated.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
        );
      }

      metaEl.textContent = parts.length
        ? parts.join(' • ')
        : 'Resume details coming soon.';
    }

    if (fileUrl) {
      if (downloadLink) {
        downloadLink.href = fileUrl;
        downloadLink.style.display = 'inline-block';
        // Optional: suggest a filename for the browser
        downloadLink.download = fileName || 'resume';
      }

      // Clear preview container and add content
      if (previewContainer) {
        previewContainer.innerHTML = '';

        const ext = fileUrl.split('.').pop().toLowerCase();
        if (ext === 'pdf') {
          const iframe = document.createElement('iframe');
          iframe.src = fileUrl;
          iframe.className = 'resume-iframe';
          iframe.title = 'Resume Preview';
          iframe.loading = 'lazy';
          previewContainer.appendChild(iframe);
        } else {
          const msg = document.createElement('p');
          msg.textContent =
            'Inline preview is only available for PDF files. Use the button below to download or open the resume.';
          msg.className = 'resume-no-preview';
          previewContainer.appendChild(msg);
        }
      }

      // Full screen button: open the PDF in a new tab if available
      if (fullscreenBtn) {
        fullscreenBtn.disabled = false;
        fullscreenBtn.addEventListener('click', () => {
          window.open(fileUrl, '_blank', 'noopener');
        });
      }
    } else {
      if (previewContainer) {
        previewContainer.innerHTML =
          '<p class="resume-no-preview">Resume file not uploaded yet.</p>';
      }
      if (downloadLink) {
        downloadLink.style.display = 'none';
      }
      if (fullscreenBtn) {
        fullscreenBtn.disabled = true;
      }
    }

    // Fade in content after loading
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  } catch (err) {
    console.error('Error loading resume:', err);
    if (previewContainer) {
      previewContainer.innerHTML =
        '<p class="resume-error">Unable to load resume at this time.</p>';
    }
    // Still show content on error
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  }
});
