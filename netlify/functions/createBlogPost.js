exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server is not configured. Missing GitHub environment variables.' })
        };
    }

    // Helper to generate URL-safe slugs
    function slugify(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const blogFilePath = 'content/blog.json';

    try {
        const { title, summary, content, imageUrl } = JSON.parse(event.body || '{}');
        let posts = [];
        let existingFileSha = null;

        // Try to get existing file
        const getUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${blogFilePath}?ref=main`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
            }
        });

        if (getResponse.ok) {
            const existingFile = await getResponse.json();
            existingFileSha = existingFile.sha;
            const fileContent = Buffer.from(existingFile.content, 'base64').toString('utf8');
            posts = JSON.parse(fileContent);
        } else if (getResponse.status !== 404) {
            throw new Error(`Failed to get existing file: ${getResponse.statusText}`);
        }

        // Build the new blog post
        const post = {
            id: Date.now().toString(),
            title,
            slug: `${slugify(title)}-${Date.now()}`,
            summary: summary || '',
            heroImage: imageUrl || '',
            content: content || '',
            createdAt: new Date().toISOString()
        };
        posts.push(post);

        // Create or update the file
        const putUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${blogFilePath}`;
        const putBody = {
            message: `feat: Add blog post "${post.title}"`,
            content: Buffer.from(JSON.stringify(posts, null, 2)).toString('base64'),
            branch: 'main'
        };

        if (existingFileSha) {
            putBody.sha = existingFileSha;
        }

        const putResponse = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
            },
            body: JSON.stringify(putBody)
        });

        if (!putResponse.ok) {
            const errorBody = await putResponse.json().catch(() => ({}));
            throw new Error(`GitHub API error: ${errorBody.message || putResponse.statusText}`);
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        };

    } catch (error) {
        console.error('Create blog post error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create blog post.', details: error.message })
        };
    }
};


