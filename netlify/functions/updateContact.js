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

  const filePath = "content/contact.json";

  try {
    const { title, intro, email, body } = JSON.parse(event.body);

    const getUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`;

    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "User-Agent": "NetlifyFunction"
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch current contact.json: ${getResponse.statusText}`);
    }

    const fileData = await getResponse.json();
    const sha = fileData.sha;

    const updatedData = {
      title: title || "Contact",
      intro: intro || "",
      email: email || "",
      body: body || "",
      updatedAt: new Date().toISOString()
    };

    const updatedContent = Buffer.from(JSON.stringify(updatedData, null, 2)).toString("base64");

    const putResponse = await fetch(getUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "User-Agent": "NetlifyFunction",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update contact.json via admin panel",
        content: updatedContent,
        sha
      })
    });

    if (!putResponse.ok) {
      const errorData = await putResponse.json().catch(() => ({}));
      throw new Error(
        `Failed to update contact.json: ${putResponse.status} ${
          errorData.message || ""
        }`
      );
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data: updatedData })
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};



