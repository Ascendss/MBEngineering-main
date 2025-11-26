// Site-wide theme and settings loader
document.addEventListener('DOMContentLoaded', async () => {
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

