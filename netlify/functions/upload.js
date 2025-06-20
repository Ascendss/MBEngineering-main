const { createHash } = require('crypto');
const path = require('path');

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server is not configured for file uploads. Missing GitHub environment variables.' })
        };
    }

    try {
        const { filename, content } = JSON.parse(event.body);

        if (!filename || !content) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Filename and content are required.' }) };
        }

        // Extract the base64 content
        const base64Data = content.split(';base64,').pop();

        // Create a unique filename
        const fileExtension = path.extname(filename);
        const timestamp = Date.now();
        const hash = createHash('md5').update(base64Data).digest('hex').substring(0, 6);
        const newFilename = `${timestamp}-${hash}${fileExtension}`;
        const filePath = `assets/uploads/${newFilename}`;

        const githubApiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

        const response = await fetch(githubApiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `feat: Upload ${newFilename}`,
                content: base64Data,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`GitHub API error: ${errorBody.message}`);
        }

        const responseData = await response.json();
        const imageUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/${filePath}`;

        return {
            statusCode: 200,
            body: JSON.stringify({
                imageUrl: imageUrl
            })
        };

    } catch (error) {
        console.error('Upload error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to upload file.', details: error.message })
        };
    }
}; 