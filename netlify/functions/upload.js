const { createHash } = require('crypto');
const path = require('path');

exports.handler = async function(event) {
    console.log("Upload function invoked.");

    if (event.httpMethod !== 'POST') {
        console.log("Method not allowed:", event.httpMethod);
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
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

        const githubApiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

        console.log("Attempting to commit to GitHub...");
        const response = await fetch(githubApiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
            },
            body: JSON.stringify({
                message: `feat: Upload ${newFilename}`,
                content: base64Data,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`GitHub API error: ${errorBody.message || response.statusText}`);
        }

        const responseData = await response.json();
        console.log("Successfully committed to GitHub.");

        // Use raw GitHub URL for the image
        const imageUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/${filePath}`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl: imageUrl
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
