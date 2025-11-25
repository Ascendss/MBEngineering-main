// netlify/functions/getBlogPosts.js

exports.handler = async function (event) {
    try {
        const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;

        if (!GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    error: "Server is not configured. Missing GitHub owner or repo name.",
                }),
            };
        }

        const blogFilePath = "content/blog.json";

        const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${blogFilePath}?ref=main`;

        const headers = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Netlify-Function",
        };

        if (GITHUB_TOKEN) {
            headers.Authorization = `token ${GITHUB_TOKEN}`;
        }

        const response = await fetch(url, { headers });

        // If file doesn't exist yet, return empty array
        if (response.status === 404) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([]),
            };
        }

        if (!response.ok) {
            console.error("GitHub API error:", response.status, response.statusText);
            return {
                statusCode: response.status,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    error: `Failed to fetch blog.json: ${response.statusText}`,
                }),
            };
        }

        const file = await response.json();
        const jsonString = Buffer.from(file.content, "base64").toString("utf8");

        let posts = [];
        try {
            posts = JSON.parse(jsonString);
        } catch (err) {
            console.error("Failed to parse blog.json", err);
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(posts),
        };
    } catch (error) {
        console.error("Unexpected error in getBlogPosts:", error);

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Failed to load blog posts." }),
        };
    }
};

