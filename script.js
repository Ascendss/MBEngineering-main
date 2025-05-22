const gallery = document.getElementById("project-gallery");

// Fetch project data from Netlify Function
fetch("/.netlify/functions/getProjects")
  .then(res => res.json())
  .then(projects => {
    gallery.innerHTML = "";

    projects.forEach(project => {
      const card = document.createElement("div");
      card.className = "project-card";

      card.innerHTML = `
        <a href="${project.link || '#'}" target="_blank">
          <img src="${project.image}" alt="${project.title}" />
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </a>
      `;

      gallery.appendChild(card);
    });
  })
  .catch(err => {
    console.error("Failed to load projects:", err);
    gallery.innerHTML = "<p>Unable to load projects at this time.</p>";
  });
