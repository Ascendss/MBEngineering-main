fetch('content/projects')
  .then(res => res.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const gallery = document.querySelector('#gallery .gallery');
    const projects = Array.from(doc.querySelectorAll('a')).filter(a =>
      a.href.endsWith('.md')
    );

    gallery.innerHTML = "";

    projects.forEach(link => {
      fetch(link.href)
        .then(res => res.text())
        .then(raw => {
          const frontmatter = /---([\s\S]*?)---/.exec(raw);
          if (frontmatter) {
            const data = Object.fromEntries(
              frontmatter[1].trim().split('\n').map(line => {
                const [key, ...value] = line.split(':');
                return [key.trim(), value.join(':').trim()];
              })
            );

            const card = document.createElement('div');
            card.innerHTML = `
              <a href="${data.link || '#'}" target="_blank">
                <img src="${data.image}" alt="${data.title}" />
                <p><strong>${data.title}</strong></p>
                <p>${data.description}</p>
              </a>
            `;
            gallery.appendChild(card);
          }
        });
    });
  });
