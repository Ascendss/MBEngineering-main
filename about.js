document.addEventListener('DOMContentLoaded', async () => {
  const titleEl = document.getElementById('about-title');
  const taglineEl = document.getElementById('about-tagline');
  const bodyEl = document.getElementById('about-body');

  try {
    const res = await fetch('/content/about.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load about content');
    const data = await res.json();

    if (data.title) {
      titleEl.textContent = data.title;
    }

    // We don't currently store tagline in about.json, so keep the default
    // but if a `tagline` field ever gets added, use it:
    if (data.tagline) {
      taglineEl.textContent = data.tagline;
    }

    const markdown = data.content || '';
    bodyEl.innerHTML = markdown
      ? marked.parse(markdown)
      : '<p>About content coming soon.</p>';
  } catch (err) {
    console.error('Error loading about.json:', err);
    bodyEl.innerHTML = '<p>Unable to load About content right now.</p>';
  }
});

