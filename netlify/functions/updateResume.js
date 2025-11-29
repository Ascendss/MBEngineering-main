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

    const filePath = "content/resume.json";

    try {
        const { title, intro, fileUrl, fileName } = JSON.parse(event.body);

        // Validate inputs
        if (typeof fileUrl !== 'string' && fileUrl !== null && fileUrl !== undefined) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'fileUrl must be a string' })
            };
        }

        if (typeof fileName !== 'string' && fileName !== null && fileName !== undefined) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'fileName must be a string' })
            };
        }

        const getUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

        // Get existing file to retrieve SHA and current data
        const existingRes = await fetch(getUrl, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
            }
        });

        let existingData = {};
        let sha = null;

        if (existingRes.ok) {
            const existing = await existingRes.json();
            sha = existing.sha;
            // Decode existing content
            try {
                existingData = JSON.parse(Buffer.from(existing.content, 'base64').toString('utf8'));
            } catch (e) {
                existingData = {};
            }
        }

        // Merge new values with existing data
        const updatedData = {
            ...existingData,
            title: title || existingData.title || "Resume",
            intro: intro !== undefined ? intro : (existingData.intro || ""),
            fileUrl: fileUrl !== undefined ? fileUrl : (existingData.fileUrl || ""),
            fileName: fileName !== undefined ? fileName : (existingData.fileName || ""),
            updatedAt: new Date().toISOString()
        };

        // Prepare the request body
        const requestBody = {
            message: "Update Resume page content",
            content: Buffer.from(JSON.stringify(updatedData, null, 2)).toString("base64"),
            branch: 'main'
        };

        // Include SHA if updating existing file
        if (sha) {
            requestBody.sha = sha;
        }

        // Update the file
        const updateRes = await fetch(getUrl, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
            },
            body: JSON.stringify(requestBody)
        });

        if (!updateRes.ok) {
            const errorText = await updateRes.text();
            console.error('Error updating file:', errorText);
            return {
                statusCode: updateRes.status,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Failed to update resume.json' })
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, data: updatedData })
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


