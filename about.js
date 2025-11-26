document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/content/about.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load about content');
    const data = await res.json();

    const titleEl = document.getElementById('aboutPageTitle');
    const taglineEl = document.getElementById('aboutTagline');
    const avatarEl = document.getElementById('aboutHeroAvatar');
    const bodyEl = document.getElementById('aboutBody');

    if (titleEl && data.title) titleEl.textContent = data.title;
    if (taglineEl && data.tagline) taglineEl.textContent = data.tagline;

    if (avatarEl && data.profileImage) {
      avatarEl.src = data.profileImage;
      avatarEl.style.display = 'block';
    }

    const markdown = data.content || '';
    if (bodyEl) {
      bodyEl.innerHTML = markdown ? marked.parse(markdown) : '<p>About content coming soon.</p>';
    }
  } catch (err) {
    console.error('Error loading about.json:', err);
    const bodyEl = document.getElementById('aboutBody');
    if (bodyEl) bodyEl.innerHTML = '<p>Unable to load About content right now.</p>';
  }
});
