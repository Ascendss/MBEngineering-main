document.addEventListener('DOMContentLoaded', function() {
  const blogList = document.getElementById('blog-list');

  if (blogList) {
    // Show loading state
    blogList.innerHTML = '<p class="loading-message">Loading blog posts...</p>';

    fetch('/.netlify/functions/getBlogPosts')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(posts => {
        blogList.innerHTML = '';
        
        if (posts.length === 0) {
          blogList.innerHTML = '<p class="empty-message">No blog posts yet. Check back soon!</p>';
          return;
        }

        // Sort by createdAt descending (newest first)
        const sorted = [...posts].sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        sorted.forEach(post => {
          const card = document.createElement('div');
          card.className = 'project-card';

          const imageUrl = post.heroImage || '';
          const summary = post.summary || '';
          const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : '';

          let cardHTML = '';
          if (imageUrl) {
            cardHTML += `<img src="${imageUrl}" alt="${post.title}" class="project-thumb" />`;
          }
          cardHTML += `<h3>${post.title}</h3>`;
          if (date) {
            cardHTML += `<p class="post-date">${date}</p>`;
          }
          if (summary) {
            cardHTML += `<p class="project-summary">${summary}</p>`;
          }
          card.innerHTML = cardHTML;

          card.style.cursor = 'pointer';
          card.addEventListener('click', () => {
            if (post.slug) {
              window.location.href = `/post.html?slug=${encodeURIComponent(post.slug)}`;
            }
          });

          blogList.appendChild(card);
        });
      })
      .catch(error => {
        console.error('Error fetching blog posts:', error);
        blogList.innerHTML = '<p class="error-message">Error loading blog posts. Please try again later.</p>';
      });
  }
});




