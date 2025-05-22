const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

exports.handler = async () => {
  try {
    const dir = path.join(process.cwd(), "content", "projects");
    console.log("Looking for directory:", dir);

    const files = fs.readdirSync(dir);
    console.log("Files found:", files);

    const projects = files
      .filter(file => file.endsWith(".md"))
      .map(file => {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, "utf8");
        const { data } = matter(content);
        console.log("Parsed project:", data);

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
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
