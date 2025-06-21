const { createHash } = require('crypto');
const path = require('path');

exports.handler = async function(event) {
    const { Octokit } = await import("@octokit/rest");
    console.log("Upload function invoked.");

    if (event.httpMethod !== 'POST') {
        console.log("Method not allowed:", event.httpMethod);
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;

    console.log("Checking for environment variables...");
    if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        console.error("Missing one or more required environment variables.");
        if (!GITHUB_TOKEN) console.error("GITHUB_TOKEN is missing.");
        if (!GITHUB_REPO_OWNER) console.error("GITHUB_REPO_OWNER is missing.");
        if (!GITHUB_REPO_NAME) console.error("GITHUB_REPO_NAME is missing.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server is not configured for file uploads. Missing GitHub environment variables.' })
        };
    }
    console.log("Environment variables found.");

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    try {
        console.log("Parsing request body...");
        const { filename, content } = JSON.parse(event.body);

        if (!filename || !content) {
            console.error("Request body is missing filename or content.");
            return { statusCode: 400, body: JSON.stringify({ error: 'Filename and content are required.' }) };
        }
        console.log("File to upload:", filename);

        const base64Data = content.split(';base64,').pop();

        const fileExtension = path.extname(filename);
        const timestamp = Date.now();
        const hash = createHash('md5').update(base64Data).digest('hex').substring(0, 6);
        const newFilename = `${timestamp}-${hash}${fileExtension}`;
        const filePath = `assets/uploads/${newFilename}`;
        console.log("New file path:", filePath);

        console.log("Attempting to commit to GitHub...");
        const { data } = await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            path: filePath,
            message: `feat: Upload ${newFilename}`,
            content: base64Data,
            branch: 'main'
        });
        console.log("Successfully committed to GitHub.");

        return {
            statusCode: 200,
            body: JSON.stringify({
                imageUrl: data.content.download_url
            })
        };

    } catch (error) {
        console.error('--- UPLOAD ERROR ---');
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to upload file.', details: error.message })
        };
    }
}; 
