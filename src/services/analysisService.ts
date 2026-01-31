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
      return "x";
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
	console.log(url)
  const pattern = /^https?:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\/\d+/;
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

  const res = await fetch(`http://127.0.0.1:8000/api/insights/web_analysis/`, {
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
