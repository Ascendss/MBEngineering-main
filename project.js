async function loadProject() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const titleEl = document.getElementById('project-title');
  const summaryEl = document.getElementById('project-summary');
  const heroEl = document.getElementById('project-hero');
  const contentEl = document.getElementById('project-content');

  if (!slug) {
    titleEl.textContent = 'Project not found';
    summaryEl.textContent = 'Missing project slug in URL.';
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/getprojects');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const projects = await response.json();
    const project = projects.find(p => p.slug === slug);

    if (!project) {
      titleEl.textContent = 'Project not found';
      summaryEl.textContent = 'We could not find a project with that link.';
      return;
    }

    // Update page title
    document.title = `${project.title} - MB Engineering`;

    // Title & summary
    titleEl.textContent = project.title;
    summaryEl.textContent = project.summary || '';

    // Hero image
    heroEl.innerHTML = '';
    const heroUrl = project.heroImage || project.imageUrl || project.image;
    if (heroUrl) {
      const img = document.createElement('img');
      img.src = heroUrl;
      img.alt = project.title;
      img.className = 'project-main-image';
      heroEl.appendChild(img);
    }

    // Long-form content (Markdown → HTML)
    const markdown = project.content || project.description || '';
    contentEl.innerHTML = markdown
      ? marked.parse(markdown)
      : '<p>No additional details yet.</p>';

  } catch (err) {
    console.error('Error loading project:', err);
    titleEl.textContent = 'Error loading project';
    summaryEl.textContent = 'Please try again later.';
  }
}

document.addEventListener('DOMContentLoaded', loadProject);




