fetch("/.netlify/functions/getprojects")
  .then(res => res.json())
  .then(projects => {
    const gallery = document.querySelector(".gallery");
    if (!gallery) return console.error("Gallery element not found");

    gallery.innerHTML = "";

    projects.forEach(project => {
      const div = document.createElement("div");
      div.className = "project-card";
      div.innerHTML = `
        <a href="${project.link || "#"}" target="_blank">
          <img src="${project.image}" alt="${project.title}" />
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </a>
      `;
      gallery.appendChild(div);
    });
  })
  .catch(err => {
    console.error("Failed to load projects:", err);
  });
