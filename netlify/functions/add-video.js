// Netlify Function: add-video
// Called by Zapier/Make when a new TikTok is posted.
// Updates videos.json in the GitHub repo via the GitHub Contents API,
// which triggers a Netlify rebuild automatically.
//
// Required environment variables (set in Netlify dashboard):
//   GITHUB_TOKEN   — Personal Access Token with repo write access
//   GITHUB_REPO    — e.g. "zaid5678/LondonForLess"
//   WEBHOOK_SECRET — any secret string; Zapier must send this as { "token": "..." }

const https = require('https');

function githubRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'LondonForLess-Bot',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let result = '';
      res.on('data', (chunk) => (result += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(result)); }
        catch (e) { resolve(result); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const secret = process.env.WEBHOOK_SECRET;
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Missing GITHUB_TOKEN or GITHUB_REPO env vars' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  if (secret && body.token !== secret) {
    return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const { video_id, title = '', description = '' } = body;
  if (!video_id) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing video_id' }) };
  }

  // Fetch current videos.json from GitHub
  const filePath = `/repos/${repo}/contents/videos.json`;
  const fileData = await githubRequest('GET', filePath, null, token);

  let videos = [];
  const sha = fileData.sha;
  if (fileData.content) {
    videos = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  }

  // Avoid duplicates
  if (videos.some((v) => v.id === video_id)) {
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true, note: 'Video already exists' }) };
  }

  // Prepend new video (most recent first), keep max 9
  videos.unshift({
    id: video_id,
    title,
    description,
    date: new Date().toISOString().split('T')[0],
  });
  videos = videos.slice(0, 9);

  // Write updated videos.json back to GitHub
  const updatedContent = Buffer.from(JSON.stringify(videos, null, 2)).toString('base64');
  await githubRequest('PUT', filePath, {
    message: `Add TikTok video ${video_id}`,
    content: updatedContent,
    sha,
  }, token);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ success: true, video_id }),
  };
};
