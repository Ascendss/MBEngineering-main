// Site-wide theme and settings loader
document.addEventListener('DOMContentLoaded', async () => {
  const header = document.querySelector('header');
  
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
    if (!res.ok) return;
    const data = await res.json();

    const root = document.documentElement;

    // Apply theme colors
    if (data.headerBg) root.style.setProperty('--site-header-bg', data.headerBg);
    if (data.headerText) root.style.setProperty('--site-header-text', data.headerText);
    if (data.pageBg) root.style.setProperty('--site-page-bg', data.pageBg);
    if (data.cardBg) root.style.setProperty('--site-card-bg', data.cardBg);

    // Update site title and subtitle
    const siteTitleEl = document.querySelector('.site-title');
    const siteSubtitleEl = document.querySelector('.site-subtitle');

    if (siteTitleEl && data.siteTitle) siteTitleEl.textContent = data.siteTitle;
    if (siteSubtitleEl && data.siteSubtitle) siteSubtitleEl.textContent = data.siteSubtitle;
  } catch (err) {
    console.error('Error loading site theme:', err);
  }
});

