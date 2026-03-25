// Netlify Function: social-feed
// Fetches latest TikTok posts via oEmbed (no auth required)
// For Instagram, requires Instagram Graph API access token set as environment variable INSTAGRAM_TOKEN

const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600',
  };

  try {
    // TikTok oEmbed examples — replace these URLs with actual post URLs from @londonforless
    const tiktokPostUrls = [
      'https://www.tiktok.com/@londonforless/video/1',
      'https://www.tiktok.com/@londonforless/video/2',
    ];

    // Instagram Graph API (requires INSTAGRAM_TOKEN env var)
    // Set this in Netlify dashboard: Site Settings → Environment Variables
    const igToken = process.env.INSTAGRAM_TOKEN;
    let instagramPosts = [];

    if (igToken) {
      const igData = await fetchJson(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=6&access_token=${igToken}`
      );
      instagramPosts = igData.data || [];
    }

    // Return combined feed
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        instagram: instagramPosts,
        tiktok: tiktokPostUrls.map(url => ({ url, platform: 'tiktok' })),
        note: instagramPosts.length === 0
          ? 'Set INSTAGRAM_TOKEN environment variable in Netlify dashboard to enable live Instagram feed.'
          : null,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
