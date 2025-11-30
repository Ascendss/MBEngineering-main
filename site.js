// Site-wide theme and settings loader
document.addEventListener('DOMContentLoaded', async () => {
  const header = document.querySelector('header');
  const homeLink = document.querySelector('.home-link');
  
  // ===== Scroll shadow effect =====
  if (header) {
    const updateHeaderShadow = () => {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    updateHeaderShadow();
    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  }

  // ===== Highlight active nav link =====
  const navLinks = document.querySelectorAll('nav a');
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Match current page or index
    if (href === currentPage || 
        (currentPage === '' && href === 'index.html') ||
        (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });

  // ===== Load site settings from JSON =====
  try {
    const res = await fetch('/content/site.json');
    if (!res.ok) throw new Error('Failed to load site settings');
    const data = await res.json();

    const root = document.documentElement;

    // Apply theme colors
    if (data.headerBg) root.style.setProperty('--site-header-bg', data.headerBg);
    if (data.headerText) root.style.setProperty('--site-header-text', data.headerText);
    if (data.pageBg) root.style.setProperty('--site-page-bg', data.pageBg);
    if (data.cardBg) root.style.setProperty('--site-card-bg', data.cardBg);

    // Apply animated background GIF
    if (data.backgroundGifEnabled && data.backgroundGifUrl) {
      root.style.setProperty('--page-bg-gif', `url('${data.backgroundGifUrl}')`);
      document.body.classList.remove('no-bg-gif');
    } else {
      root.style.setProperty('--page-bg-gif', 'none');
      document.body.classList.add('no-bg-gif');
    }

    // Apply GIF opacity and blur from settings
    const opacity = (typeof data.backgroundGifOpacity === 'number')
      ? data.backgroundGifOpacity
      : 0.12;
    const blur = (typeof data.backgroundGifBlur === 'number')
      ? data.backgroundGifBlur
      : 7;

    root.style.setProperty('--page-bg-gif-opacity', String(opacity));
    root.style.setProperty('--page-bg-gif-blur', `${blur}px`);

    // Update site title and subtitle
    const siteTitleEl = document.querySelector('.site-title');
    const siteSubtitleEl = document.querySelector('.site-subtitle');

    if (siteTitleEl) siteTitleEl.textContent = data.siteTitle || 'MB Engineering';
    if (siteSubtitleEl) siteSubtitleEl.textContent = data.siteSubtitle || '';

    // Fade in header content after loading
    if (homeLink) homeLink.classList.add('loaded');
  } catch (err) {
    console.error('Error loading site theme:', err);
    // Still show header even on error with fallback text
    const siteTitleEl = document.querySelector('.site-title');
    const siteSubtitleEl = document.querySelector('.site-subtitle');
    if (siteTitleEl && !siteTitleEl.textContent) siteTitleEl.textContent = 'MB Engineering';
    if (siteSubtitleEl && !siteSubtitleEl.textContent) siteSubtitleEl.textContent = '';
    if (homeLink) homeLink.classList.add('loaded');
  }
});

