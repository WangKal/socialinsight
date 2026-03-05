// services/analysisService.ts

export function detectPlatformFromUrl(url: string) {
  const u = new URL(url);

  if (u.hostname.includes("tiktok.com")) {
    // Must be a video URL
    if (/\/@[^/]+\/video\/\d+/.test(u.pathname)) {
      return "tiktok";
    }
  }

  if (u.hostname.includes("twitter.com") || u.hostname.includes("x.com")) {
    if (/\/status\/\d+/.test(u.pathname)) {
      return "twitter";
    }
  }

  if (u.hostname.includes("facebook.com")) {
    // reels, posts, videos
    if (
      /\/posts\/|\/reel\/|\/videos\//.test(u.pathname)
    ) {
      return "facebook";
    }
  }

  return null;
}



// services/tiktokService.ts
export function validateTikTokUrl(url: string): boolean {

  const pattern = /^https?:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\/\d+/;
  return pattern.test(url);
}
export function validatePostUrl(url: string, platform: string): boolean {
  let pattern: RegExp;

  switch (platform) {
    case "tiktok":
      // https://www.tiktok.com/@user/video/123456789
      pattern = /^https?:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\/\d+/;
      break;

    case "twitter":
    case "x":
      // https://twitter.com/user/status/123456789
      // https://x.com/user/status/123456789
      pattern = /^https?:\/\/(www\.)?(twitter|x)\.com\/[^/]+\/status\/\d+/;
      break;

    case "facebook":
      // Common FB post formats
      pattern =
        /^https?:\/\/(www\.)?facebook\.com\/.*(posts\/\d+|story\.php\?story_fbid=\d+|reel\/\d+|videos\/\d+)/;
      break;

    default:
      return false;
  }

  return pattern.test(url);
}
export async function sendForAnalysis(url: string, jwt: string, userId: string) {
  if (!validateTikTokUrl(url)) throw new Error("Invalid TikTok URL");

  const payload = {
    user_id: userId,
    url,
    platform: "tiktok",
    timestamp: Date.now()
  };

  const res = await fetch(`https://socialinsightbackend.onrender.com/api/insights/web_analysis/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`
    },
    body: JSON.stringify({ data: [payload] })
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.statusText}`);
  }

  return res.json();
}
export async function requestAnalysis(playform:string,url: string, jwt: string, userId: string) {
  if (!validatePostUrl(url,platform)) throw new Error("Invalid URL");

  const payload = {
    user_id: userId,
    url,
    platform: platform,
    timestamp: Date.now()
  };

  const res = await fetch(`https://socialinsightbackend.onrender.com/api/insights/request_analysis/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`
    },
    body: JSON.stringify({ data: [payload] })
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.statusText}`);
  }

  return res.json();
}
