// netlify/functions/getprojects.js

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

        const projectsFilePath = "content/projects.json";

        const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${projectsFilePath}?ref=main`;

        const headers = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Netlify-Function",
        };

        // Token is optional for public repos, but use it if present to avoid rate limits
        if (GITHUB_TOKEN) {
            headers.Authorization = `token ${GITHUB_TOKEN}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            console.error("GitHub API error:", response.status, response.statusText);
            return {
                statusCode: response.status,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    error: `Failed to fetch projects.json: ${response.statusText}`,
                }),
            };
        }

        const file = await response.json();

        // GitHub returns base64-encoded file content
        const jsonString = Buffer.from(file.content, "base64").toString("utf8");

        let projects = [];
        try {
            projects = JSON.parse(jsonString);
        } catch (err) {
            console.error("Failed to parse projects.json", err);
            // Keep projects as empty array if parsing fails
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projects),
        };
    } catch (error) {
        console.error("Unexpected error in getprojects:", error);

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Failed to load projects." }),
        };
    }
};
