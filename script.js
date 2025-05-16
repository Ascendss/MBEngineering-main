document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling to sections
  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Toggle blog section content
  const blogArticle = document.querySelector("#blog article");
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Toggle Blog Post";
  toggleButton.style.marginBottom = "1em";
  blogArticle.before(toggleButton);

  toggleButton.addEventListener("click", () => {
    blogArticle.style.display = (blogArticle.style.display === "none") ? "block" : "none";
  });

  // Back to top button
  const backToTop = document.createElement("button");
  backToTop.textContent = "↑ Back to Top";
  backToTop.style.position = "fixed";
  backToTop.style.bottom = "20px";
  backToTop.style.right = "20px";
  backToTop.style.display = "none";
  backToTop.style.padding = "10px";
  backToTop.style.zIndex = "1000";
  document.body.appendChild(backToTop);

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      backToTop.style.display = "block";
    } else {
      backToTop.style.display = "none";
    }
  });
});
