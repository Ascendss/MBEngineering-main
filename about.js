document.addEventListener('DOMContentLoaded', async () => {
  const contentWrapper = document.getElementById('aboutContentWrapper');
  
  try {
    const res = await fetch('/content/about.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load about content');
    const data = await res.json();

    // Hero text elements
    const titleEl = document.getElementById('aboutPageTitle');
    const taglineEl = document.getElementById('aboutTagline');
    
    // Avatar element (circular profile image)
    const avatarEl = document.getElementById('aboutAvatar');
    const avatarWrapper = document.querySelector('.about-avatar-wrapper');
    
    // Body content
    const bodyEl = document.getElementById('aboutBody');

    // Populate title
    if (titleEl) {
      titleEl.textContent = data.title || 'About';
    }
    
    // Populate tagline
    if (taglineEl) {
      taglineEl.textContent = data.tagline || '';
    }

    // Populate avatar - show wrapper only if image exists
    if (avatarEl && data.profileImage) {
      avatarEl.src = data.profileImage;
      avatarEl.style.display = 'block';
      if (avatarWrapper) avatarWrapper.style.display = 'block';
    } else if (avatarWrapper) {
      // Hide avatar wrapper if no image
      avatarWrapper.style.display = 'none';
    }

    // Render markdown content
    const markdown = data.content || '';
    if (bodyEl) {
      bodyEl.innerHTML = markdown 
        ? marked.parse(markdown) 
        : '<p>About content coming soon.</p>';
    }

    // Fade in content after loading
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  } catch (err) {
    console.error('Error loading about.json:', err);
    const bodyEl = document.getElementById('aboutBody');
    if (bodyEl) {
      bodyEl.innerHTML = '<p>Unable to load About content right now.</p>';
    }
    // Still show the content even on error
    if (contentWrapper) {
      contentWrapper.classList.add('loaded');
    }
  }
});
