const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

exports.handler = async () => {
  try {
    const dir = path.resolve(__dirname, "../../content/projects");

    // 🔍 Log the path to help us debug in Netlify logs
    console.log("🪵 Reading from directory:", dir);

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
          title: data.title || "Untitled Project",
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
    console.error("🔥 Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
