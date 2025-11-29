async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const titleEl = document.getElementById('post-title');
  const dateEl = document.getElementById('post-date');
  const summaryEl = document.getElementById('post-summary');
  const heroEl = document.getElementById('post-hero');
  const contentEl = document.getElementById('post-content');

  if (!slug) {
    titleEl.textContent = 'Post not found';
    summaryEl.textContent = 'Missing post slug in URL.';
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/getBlogPosts');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const posts = await response.json();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      titleEl.textContent = 'Post not found';
      summaryEl.textContent = 'We could not find a blog post with that link.';
      return;
    }

    // Update page title
    document.title = `${post.title} - MB Engineering`;

    // Title
    titleEl.textContent = post.title;

    // Date
    if (post.createdAt) {
      const date = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      dateEl.textContent = date;
    }

    // Summary
    summaryEl.textContent = post.summary || '';

    // Hero image
    heroEl.innerHTML = '';
    if (post.heroImage) {
      const img = document.createElement('img');
      img.src = post.heroImage;
      img.alt = post.title;
      img.className = 'project-main-image';
      heroEl.appendChild(img);
    }

    // Long-form content (Markdown → HTML)
    const markdown = post.content || '';
    contentEl.innerHTML = markdown
      ? marked.parse(markdown)
      : '<p>No content yet.</p>';

  } catch (err) {
    console.error('Error loading post:', err);
    titleEl.textContent = 'Error loading post';
    summaryEl.textContent = 'Please try again later.';
  }
}

document.addEventListener('DOMContentLoaded', loadPost);


