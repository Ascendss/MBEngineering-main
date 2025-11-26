document.addEventListener('DOMContentLoaded', async () => {
  const contentWrapper = document.getElementById('resumeContentWrapper');
  const titleEl = document.getElementById('resumePageTitle');
  const introEl = document.getElementById('resumeIntroText');
  const previewContainer = document.getElementById('resumePreview');
  const downloadLink = document.getElementById('resumeDownloadLink');

  try {
    const res = await fetch('/content/resume.json');
    if (!res.ok) throw new Error('Failed to load resume info');
    const data = await res.json();

    const title = data.title || 'Resume';
    const intro = data.intro || 'You can view or download my resume below.';
    const fileUrl = data.fileUrl || '';
    const fileName = data.fileName || 'resume';

    if (titleEl) titleEl.textContent = title;
    if (introEl) introEl.textContent = intro;

    if (fileUrl) {
      if (downloadLink) {
        downloadLink.href = fileUrl;
        downloadLink.style.display = 'inline-block';
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
          previewContainer.appendChild(iframe);
        } else {
          const msg = document.createElement('p');
          msg.textContent = 'Inline preview is not available for this file type. Use the button below to download or open the resume.';
          msg.className = 'resume-no-preview';
          previewContainer.appendChild(msg);
        }
      }
    } else {
      if (previewContainer) {
        previewContainer.innerHTML = '<p class="resume-no-preview">Resume file not uploaded yet.</p>';
      }
      if (downloadLink) {
        downloadLink.style.display = 'none';
      }
    }

    // Fade in content after loading
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  } catch (err) {
    console.error('Error loading resume:', err);
    if (previewContainer) {
      previewContainer.innerHTML = '<p class="resume-error">Unable to load resume at this time.</p>';
    }
    // Still show content on error
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  }
});

