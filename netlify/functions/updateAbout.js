exports.handler = async function (event) {
    if (event.httpMethod !== "PUT") {
        return { 
            statusCode: 405, 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;
    
    if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Missing GitHub environment variables' })
        };
    }

    const filePath = "content/about.json";

    try {
        const { title, content } = JSON.parse(event.body);

        const newData = {
            title: title || "About Me",
            content: content || "",
            updatedAt: new Date().toISOString()
        };

        const getUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

        // Get existing file to retrieve SHA
        const existingRes = await fetch(getUrl, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
            }
        });

        if (!existingRes.ok) {
            const errorText = await existingRes.text();
            console.error('Error fetching existing file:', errorText);
            return {
                statusCode: existingRes.status,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Failed to fetch existing about.json' })
            };
        }

        const existing = await existingRes.json();

        // Update the file
        const updateRes = await fetch(getUrl, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
            },
            body: JSON.stringify({
                message: "Update About Me content",
                content: Buffer.from(JSON.stringify(newData, null, 2)).toString("base64"),
                sha: existing.sha,
                branch: 'main'
            })
        });

        if (!updateRes.ok) {
            const errorText = await updateRes.text();
            console.error('Error updating file:', errorText);
            return {
                statusCode: updateRes.status,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Failed to update about.json' })
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, data: newData })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message })
        };
    }
};

