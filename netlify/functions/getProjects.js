const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

exports.handler = async () => {
  try {
    // Adjust to Netlify function’s root directory
    const dir = path.resolve("./content/projects");

    if (!fs.existsSync(dir)) {
      throw new Error(`Directory not found: ${dir}`);
    }

    const files = fs.readdirSync(dir);

    const projects = files
      .filter(file => file.endsWith(".md"))
      .map(file => {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, "utf8");
        const { data } = matter(content);

        return {
          title: data.title || "Untitled",
          description: data.description || "",
          image: data.image || "",
          link: data.link || "#",
          slug: file.replace(".md", "")
        };
      });

    return {
      statusCode: 200,
      body: JSON.stringify(projects)
    };
  } catch (error) {
    console.error("Error in getProjects.js:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
