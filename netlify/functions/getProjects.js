const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

exports.handler = async () => {
  try {
    // ✅ Use process.cwd() to correctly resolve root-relative paths on Netlify
    const dir = path.join(process.cwd(), "content/projects");

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
          title: data.title,
          description: data.description,
          image: data.image,
          link: data.link || "#",
          slug: file.replace(".md", "")
        };
      });

    return {
      statusCode: 200,
      body: JSON.stringify(projects)
    };
  } catch (error) {
    console.error("getProjects.js error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
