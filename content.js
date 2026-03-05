(() => {
  let lastSentHash = null;
  let debounceTimer = null;
  const DEBOUNCE_MS = 700;

  const simpleHash = str => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return (h >>> 0).toString(16);
  };

  // ---------------------------
  // Platform Detection
  // ---------------------------
  function detectPlatform() {
    const host = location.hostname;
    if (host.includes('twitter.com') || host.includes('x.com') ||host.includes('web.x.com') ) return 'twitter';
    if (host.includes('facebook.com')) return 'facebook';
    if (host.includes('web.facebook.com')) return 'facebook';
    if (host.includes('tiktok.com')) return 'tiktok';
    if (host.includes('web.tiktok.com')) return 'tiktok';
    if (host.includes('web.whatsapp.com')) return 'whatsapp';
    if (host.includes('reddit.com')) return 'reddit';
    if (host.includes('linkedin.com')) return 'linkedin';
    return 'unknown';
  }

  // ---------------------------
  // Extraction Functions (existing ones)
  // ---------------------------
  // [Insert all your extractXPostAndReplies() functions here: Twitter, FB, TikTok, LinkedIn, Reddit, WhatsApp]

function extractRedditPostAndReplies() {
    const result = { post: null, replies: [] };
    try {
      const postNode = document.querySelector('[data-test-id="post-content"]');
      if (postNode) {
        result.post = {
          displayName: postNode.querySelector('h3')?.innerText || '',
          username: postNode.querySelector('a[data-click-id="user"]')?.innerText || '',
          content: postNode.querySelector('div[data-click-id="text"]')?.innerText || '',
          counts: {}
        };
      }
      const replyNodes = document.querySelectorAll('[data-test-id="comment"]');
      replyNodes.forEach(node => {
        const contentNode = node.querySelector('div[data-testid="comment"]');
        const userNode = node.querySelector('a[data-click-id="user"]');
        if (contentNode && userNode) {
          result.replies.push({
            displayName: userNode.innerText,
            username: userNode.href || '',
            content: contentNode.innerText,
            counts: {}
          });
        }
      });
    } catch(e){ console.error('[Content] Reddit parse error', e); }
    return result;
  }

  // --- NEW: LinkedIn ---
  function extractLinkedInPostAndReplies() {
    const result = { post: null, replies: [] };
    try {
      const postNode = document.querySelector('div.feed-shared-update-v2');
      if (postNode) {
        result.post = {
          displayName: postNode.querySelector('span.feed-shared-actor__name')?.innerText || '',
          username: postNode.querySelector('a.feed-shared-actor__container-link')?.href || '',
          content: postNode.querySelector('div.feed-shared-update-v2__description')?.innerText || '',
          counts: {}
        };
      }
      const replyNodes = document.querySelectorAll('div.comments-comment-item');
      replyNodes.forEach(node => {
        const contentNode = node.querySelector('span.comment-text');
        const userNode = node.querySelector('span.feed-shared-actor__name');
        if (contentNode && userNode) {
          result.replies.push({
            displayName: userNode.innerText,
            username: '',
            content: contentNode.innerText,
            counts: {}
          });
        }
      });
    } catch(e){ console.error('[Content] LinkedIn parse error', e); }
    return result;
  }

function normalizeFacebookProfileUrl(url) {
  if (!url) return '';

  try {
    const u = new URL(url);

    // Remove comment / tracking params
    u.search = '';

    // Normalize known FB paths
    // Keep /profile.php?id=123
    if (u.pathname === '/profile.php') {
      const id = new URL(url).searchParams.get('id');
      return id
        ? `https://www.facebook.com/profile.php?id=${id}`
        : 'https://www.facebook.com/';
    }

    // Remove trailing slash
    return `https://www.facebook.com${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
}



function extractFacebookPostAndReplies() {
  const result = { post: null, replies: [] };
  const seen = new Set();

  // -------------------------
  // Helper
  // -------------------------
  function parseArticle(article) {
    // Prefer semantic FB roles
    const nameNode = article.querySelector('[data-ad-rendering-role="profile_name"] a');
    const messageNodes = article.querySelectorAll('[data-ad-rendering-role="story_message"]');

    let displayName = '';
    let content = '';

    if (nameNode && messageNodes.length) {
      displayName = nameNode.innerText.trim();
      content = Array.from(messageNodes)
        .map(n => n.innerText.trim())
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      // ---- Fallback to old logic ----
      const raw = article.innerText || '';
      if (!raw) return null;

      const lines = raw
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      if (lines.length < 2) return null;

      displayName = lines[0];

      const contentLines = lines.slice(1).filter(line => {
        if (/^(Like|Reply)$/i.test(line)) return false;
        if (/^\d+\s?(s|m|h|d|w)$/i.test(line)) return false;
        if (/^(Author|Top contributor)$/i.test(line)) return false;
        return true;
      });

      content = contentLines.join(' ').trim();
    }

    if (!displayName || !content) return null;

    const authorLink = article.querySelector('a[href]');
    const username = normalizeFacebookProfileUrl(authorLink?.href || '');


    const aria = article.getAttribute('aria-label') || '';
    const timeMatch = aria.match(/by .*? (.*)$/i);
    const timestamp = timeMatch ? timeMatch[1] : '';

    const language =
      article.querySelector('[lang]')?.getAttribute('lang') || 'unknown';

    return {
      displayName,
      username,
      content,
      language,
      timestamp,
      counts: {}
    };
  }

  // -------------------------
  // POST (explicit)
  // -------------------------
  const postArticle = document.querySelector('[aria-posinset="1"]');
  if (postArticle) {
    const post = parseArticle(postArticle);
    if (post) {
      result.post = post;
      seen.add(`${post.displayName}|${post.content.slice(0, 80)}`);
    }
  }

  // -------------------------
  // REPLIES
  // -------------------------
  document.querySelectorAll('[role="article"]').forEach(article => {
    if (article === postArticle) return;

    const item = parseArticle(article);
    if (!item) return;

    const key = `${item.displayName}|${item.content.slice(0, 80)}`;
    if (seen.has(key)) return;

    seen.add(key);
    result.replies.push(item);
  });

  console.log(result);
  return result;
}

async function extractTikTokPostAndReplies() {
  const result = { post: null, replies: [] };

  try {
    console.log("[TikTok] Extracting post...");

    // --- POST ---
    const videoUrl = window.location.href;
    const videoIdMatch = videoUrl.match(/\/(\d+)(?:\?.*)?$/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "unknown";

// =========================
// Display name / username
// =========================

let username = "";
let displayName = "";

// 1️⃣ Direct video page (MOST IMPORTANT)
const directCreatorLink = document.querySelector(
  'a[href^="/@"] p'
);

if (directCreatorLink) {
  const parentLink = directCreatorLink.closest('a[href^="/@"]');
  const href = parentLink?.getAttribute("href");

  if (href) {
    username = href.replace("/", "").trim();
    displayName = directCreatorLink.innerText.trim();
  }
}

// 2️⃣ Feed / FYP fallback
if (!username) {
  const feedCreatorLink = document.querySelector(
    '[data-e2e="feed-video"] a[href^="/@"]'
  );

  if (feedCreatorLink) {
    const href = feedCreatorLink.getAttribute("href");
    username = href.replace("/", "").trim();
    displayName = feedCreatorLink.innerText.trim();
  }
}

// 3️⃣ Absolute fallback (URL-based)
if (!username) {
  const match = window.location.pathname.match(/\/@([^/]+)\/video/);
  if (match) {
    username = `@${match[1]}`;
    displayName = match[1];
  }
}

// =========================
// Thumbnail (poster frame)
// =========================
const posterImg =
  document.querySelector('picture img[src*="tiktokcdn"]') ||
  document.querySelector('img[src*="tiktokcdn"]');

const thumbnail = posterImg?.src || "";

// =========================
// Embed HTML
// =========================
const embedHtml = `<iframe src="https://www.tiktok.com/embed/${videoId}" width="325" height="575" frameborder="0" allowfullscreen></iframe>`;

// =========================
// Final post object
// =========================
result.post = {
  postId: videoId,
  displayName: displayName || "Unknown creator",
  username,
  content: {
    url: videoUrl,
    thumbnail,
    embed: embedHtml
  },
  counts: {}
};

console.log("[TikTok] Post captured:", result.post);

    // --- COMMENTS via TikTok API ---
    console.log("[TikTok] Fetching comments via API...");
    let cursor = 0;
    const countPerPage = 50;

    while (true) {
      const url = `https://www.tiktok.com/api/comment/list/?aid=1988&aweme_id=${videoId}&count=${countPerPage}&cursor=${cursor}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('[TikTok] Failed to fetch comments', response.status);
        break;
      }

      const data = await response.json();
      if (!data.comments || !data.comments.length) break;

      data.comments.forEach(c => {
        result.replies.push({
          commentId: c.cid,
          content: c.text,
          timestamp: c.create_time,
          counts: { likes: c.digg_count },
          displayName: c.user.nickname,
          username: c.user.unique_id,
          userId: c.user.uid
        });
      });

      if (!data.has_more) break;
      cursor = data.cursor;
    }

    console.log("[TikTok] Comments fetched:", result.replies.length);

  } catch (err) {
    console.error('[TikTok] Extraction failed', err);
  }

  console.log("[TikTok] Extraction complete:", result);
  return result;
}

  function extractWhatsAppPostAndReplies() {
    const result = { post: null, replies: [] };
    try {
      const chatNode = document.querySelector('[data-testid="conversation-panel-messages"]') || document.querySelector('#main');
      if (!chatNode) return result;

      const messages = chatNode.querySelectorAll('div[role="row"]');
      messages.forEach(node => {
        try {
          const contentNode = node.querySelector('span.selectable-text') || node.querySelector('div[dir="auto"]');
          const nameNode = node.querySelector('span[title]') || node.querySelector('h4 span');
          if (!contentNode || !nameNode) return;
          if (contentNode.innerText.trim().length > 0) {
            result.replies.push({
              displayName: nameNode.innerText.trim(),
              username: nameNode.title || '',
              content: contentNode.innerText.trim(),
              counts: {}
            });
          }
        } catch (e) { console.error('[Content] WhatsApp reply parse error', e); }
      });
    } catch (err) { console.error('[Content] extractWhatsAppPostAndReplies error', err); }
    return result;
  }

  // For brevity, we will assume all extraction functions exist here:
  function extractPostAndReplies() {
    const platform = detectPlatform();
  
    let data;
    switch(platform) {
      case 'twitter': data = extractTwitterPostAndReplies(); break;
      case 'facebook': data = extractFacebookPostAndReplies(); break;
      case 'tiktok': data = extractTikTokPostAndReplies(); break;
      case 'whatsapp': data = extractWhatsAppPostAndReplies(); break;
      case 'reddit': data = extractRedditPostAndReplies(); break;
      case 'linkedin': data = extractLinkedInPostAndReplies(); break;
      default: data = { post: null, replies: [] }; break;
    }
 
    return { ...data, platform };
  }

  // ---------------------------
  // Intelligent Auto-Scroll
  // ---------------------------
function intelligentAutoScroll(win, done, options = {}) {
  const {
    step = 800,
    interval = 1200,
    maxIdle = 20,
    settleDelay = 2500
  } = options;

  let lastHeight = document.documentElement.scrollHeight;
  let idleCount = 0;
  let scrolling = false;

  const tick = async () => {
    if (scrolling) return;
    scrolling = true;

    win.scrollBy(0, step);

    // ⏳ wait long enough for hydration + virtualization
    await new Promise(r => setTimeout(r, settleDelay));

    const currentHeight = document.documentElement.scrollHeight;

    if (currentHeight <= lastHeight) {
      idleCount++;
    } else {
      idleCount = 0;
      lastHeight = currentHeight;
    }

    scrolling = false;

    if (idleCount >= maxIdle) {
      clearInterval(timer);
      done();
    }
  };

  const timer = setInterval(tick, interval);
}


  // Extract post/replies inside invisible window
  function extractPostAndRepliesFromWindow(win) {
    const platform = (() => {
  const host = win.location.hostname;
  if (host.includes('twitter.com') || host.includes('x.com')) return 'twitter';
  if (host.includes('facebook.com')) return 'facebook';
  if (host.includes('tiktok.com')) return 'tiktok';
  if (host.includes('reddit.com')) return 'reddit';
  if (host.includes('linkedin.com')) return 'linkedin';
  return 'unknown';
})();

    let data;
    switch(platform) {
      case 'twitter': data = win.extractTwitterPostAndReplies?.() || { post: null, replies: [] }; break;
      case 'facebook': data = win.extractFacebookPostAndReplies?.() || { post: null, replies: [] }; break;
      case 'tiktok': data = win.extractTikTokPostAndReplies?.() || { post: null, replies: [] }; break;
      case 'reddit': data = win.extractRedditPostAndReplies?.() || { post: null, replies: [] }; break;
      case 'linkedin': data = win.extractLinkedInPostAndReplies?.() || { post: null, replies: [] }; break;
      default: data = { post: null, replies: [] }; break;
    }
    return { ...data, platform };
  }

  // ---------------------------
  // Send Data
  // ---------------------------
  function sendData(data) {
    if (!data.post && data.replies.length === 0) return;

    const hash = simpleHash(JSON.stringify(data));
    if (hash === lastSentHash) return;
    lastSentHash = hash;

    chrome.runtime.sendMessage({
      action: 'POST_AND_REPLIES_CAPTURED',
      url: location.href,
      data
    });
  }

 // ---------------------------
// Global temp storage
// ---------------------------

function resetTempCapture() {
  window._insight_tempData = {
    post: null,
    replies: [],
    seenHashes: {},
    url: location.href,
    capturing: true
  };

  chrome.storage.session.set({
    insightTempCapture: window._insight_tempData
  });
}
// ---------------------------
// Extract Twitter Post + Replies
// ---------------------------
function extractTwitterPostAndReplies() {
  const result = { post: null, replies: [] };

  try {
    const tweetNodes = document.querySelectorAll('[data-testid="cellInnerDiv"]');
    if (!tweetNodes.length) return result;

    // MAIN POST (first tweet always safe)
    result.post = parseTweet(tweetNodes[0]);

    // REPLIES (skip ads, stop at Discover)
    for (let i = 1; i < tweetNodes.length; i++) {
      const node = tweetNodes[i];
 



      // Skip ads / promoted tweets
      if (isAdTweet(node)) continue;

      // Stop processing if we hit Discover section
      if (isDiscoverMoreNode(node,i)) break;

      const parsed = parseTweet(node);
      if (!parsed) continue;

      // Filter trash (media-only, empty content)
      if (!parsed.content && !parsed.quoted) continue;

      result.replies.push(parsed);
    }

  } catch (err) {
    console.error("[Extractor] extractPostAndReplies error", err);
  }

  return result;
}

// ---------------------------
// Ads / Promoted Detection
// ---------------------------
function isAdTweet(node) {
  if (!node) return false;

  const parent = node.parentElement;
  if (!parent) return false;

  // Check if any child of parent has placementTracking
  if (parent.querySelector('[data-testid="placementTracking"]')) return true;

  return false;
}

// ---------------------------
// Discover Detection
// ---------------------------
function isDiscoverMoreNode(node , pos) {
  if (!node) return false;

  // Check previous sibling for Discover keywords
  const discoverKeywords = [
    "discover more",
    "who to follow",
    "topics to follow",
    "sourced from across x",
    "trending in",
    "you might like"
  ];

  return nodeContainsText(node, discoverKeywords);
}

// ---------------------------
// Helper: Text Search
// ---------------------------
function nodeContainsText(node, texts = []) {
  if (!node || !texts.length) return false;

  const needles = texts.map(t => t.toLowerCase());

  function walk(el) {
    if (!el) return false;

    // Text node
    if (el.nodeType === Node.TEXT_NODE) {
      const txt = el.textContent?.toLowerCase() || "";
      return needles.some(n => txt.includes(n));
    }

    // Element node
    if (el.nodeType === Node.ELEMENT_NODE) {
      // Skip non-visible / irrelevant nodes
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
        return false;
      }

      // Check direct text content of element
      if (el.childNodes && el.childNodes.length) {
        for (const child of el.childNodes) {
          if (walk(child)) return true;
        }
      }
    }

    return false;
  }

  return walk(node);
}




function parseTweet(node) {
  try {
    if (!node) return null;

    // ----------- SOCIAL CONTEXT -----------
    const socialContext = node.querySelector('span[data-testid="socialContext"]')
      ?.innerText.trim() || null;

    const isRepost = socialContext?.toLowerCase().includes("reposted") || false;

    // ----------- MAIN TEXT -----------
    const contentNode = node.querySelector(':scope > div [data-testid="tweetText"]');
    let rawContent = contentNode?.innerText.trim() || null;

    // ----------- USER INFO -----------
    const userHref = node.querySelector(':scope a[href^="/"][role="link"]')
      ?.getAttribute("href");
    const username = userHref ? "@" + userHref.replace("/", "") : "";

    // ----------- DISPLAY NAME -----------
    let displayName = node.querySelector(':scope div[dir="ltr"] span')?.innerText.trim() || "";
    if (!displayName) {
      displayName = node.querySelector('[data-testid="User-Name"] span')?.innerText.trim() || "";
    }

    // ----------- COUNTS -----------
    const counts = {};
    node.querySelectorAll(':scope div[data-testid$="-count"]').forEach(c => {
      const key = c.getAttribute("data-testid").replace("-count", "");
      counts[key] = parseInt(c.innerText.replace(/\D/g, "")) || 0;
    });

    // ----------- QUOTED TWEET DETECTION -----------
    const quotedNode = findQuotedTweet(node);
    let quoted = null;

    if (quotedNode) {
      quoted = parseQuotedTweet(quotedNode);
    }

    // ----------- FIX CONTENT LOGIC -----------
    if (isRepost && (!rawContent || rawContent.length < 2)) {
      rawContent = null;
    }

    return {
      displayName,
      username,
      socialContext,
      isRepost,
      content: rawContent,
      quoted,
      counts
    };

  } catch (err) {
    console.error("parseTweet error", err);
    return null;
  }
}


function parseQuotedTweet(node) {
  const contentNode = node.querySelector('[data-testid="tweetText"]');
  const content = contentNode?.innerText.trim() || null;

  // ----------- DISPLAY NAME -----------
let displayName = "";
const userNameContainer = node.querySelector('[data-testid="User-Name"]');
if (userNameContainer) {
  const spanNodes = userNameContainer.querySelectorAll("span");
  for (let span of spanNodes) {
    const text = span.innerText.trim();
    if (text.startsWith("@")) {
      displayName = text;
      break;
    }
  }
}

// fallback to older selector
if (!displayName) {
  displayName = node.querySelector('div[dir="ltr"] span')?.innerText.trim() || "";
}

  const userHref = node.querySelector('a[href^="/"][role="link"]')
    ?.getAttribute("href");
  const username = userHref ? "@" + userHref.replace("/", "") : "";

  // nested quoted tweet
  const nestedNode = findQuotedTweet(node);
  let nested = null;

  if (nestedNode) {
    nested = parseQuotedTweet(nestedNode);
  }

  return {
    displayName,
    username,
    content,
    quoted: nested
  };
}
function findQuotedTweet(node) {
  if (!node) return null;

  // Look for potential quoted tweet text inside the current tweet
  const quotedTextNodes = node.querySelectorAll('[data-testid="tweetText"]');

  for (let i = 0; i < quotedTextNodes.length; i++) {
    const textNode = quotedTextNodes[i];

    // Skip if this is the main tweet's content
    if (textNode === node.querySelector('[data-testid="tweetText"]')) continue;

    // Find the nearest parent that also has a username/displayName
    let parent = textNode;
    while (parent && !parent.querySelector('[data-testid="User-Name"]')) {
      parent = parent.parentElement;
    }

    if (parent) return parent; // this is the quoted tweet container
  }

  return null;
}


// ---------------------------
// Initialize temp storage
// ---------------------------
window._insight_tempData = window._insight_tempData || {
  post: null,            // locked first post
  replies: [],           // accumulated replies
  postHash: null,        // hash of the first post
  url: null,             // current page URL
  seenHashes: {},        // tracks all seen items (post + replies)
  capturing: false       // flag if currently capturing
};

// ---------------------------
// Utility: hash an item
// ---------------------------
function itemHash(item) {
  return simpleHash((item.username || "") + "::" + (item.content || ""));
}

// ---------------------------
// Merge Extraction into Temp Storage
// ---------------------------
function mergeExtraction(data) {
  if (!data) return;

  // URL changed → full reset
  if (window._insight_tempData.url && window._insight_tempData.url !== location.href) {
    resetTempCapture();
  }

  window._insight_tempData.url = location.href;

  // Collect all items: post + replies
  const items = [];
  if (data.post) items.push(data.post);
  if (Array.isArray(data.replies)) items.push(...data.replies);
  if (!items.length) return;

  // --- LOCK first post ---
  if (!window._insight_tempData.post) {
    const first = items.shift();
    window._insight_tempData.post = first;
    window._insight_tempData.seenHashes[itemHash(first)] = true;
  }

  // --- MERGE remaining items as replies ---
  items.forEach(item => {
    const h = itemHash(item);
    if (!window._insight_tempData.seenHashes[h]) {
      window._insight_tempData.seenHashes[h] = true;
      window._insight_tempData.replies.push(item);
    }
  });

  return {
    post: window._insight_tempData.post,
    replies: window._insight_tempData.replies
  };
}

// ---------------------------
// Start MutationObserver
// ---------------------------
function startObserver({ autoMode = false } = {}) {
  console.log("[Insight] Starting capture");

  if (window._insight_observer) return; // prevent duplicates
  if (!window._insight_tempData.capturing) resetTempCapture();

async function runExtraction() {
  const platform = detectPlatform();
  let data;

  // Other platforms
  switch(platform) {
    case 'twitter': data = extractTwitterPostAndReplies(); break;
    case 'facebook': data = extractFacebookPostAndReplies(); break;
    case 'whatsapp': data = extractWhatsAppPostAndReplies(); break;
    case 'reddit': data = extractRedditPostAndReplies(); break;
    case 'linkedin': data = extractLinkedInPostAndReplies(); break;
    default: data = { post: null, replies: [] }; break;
  }

  // Merge extraction into tempData
  const snapshot = mergeExtraction(data);
  if (!window._insight_tempData.postHash) {
    window._insight_tempData.postHash = simpleHash(JSON.stringify(snapshot.post));
  }

  chrome.runtime.sendMessage({
    action: "CAPTURE_SNAPSHOT",
    payload: {
      capturing: true,
      url: location.href,
      postHash: window._insight_tempData.postHash,
      data: snapshot,
      platform: platform,
      ts: Date.now()
    }
  });
}


  // ---------------------------
  // Observe DOM mutations
  // ---------------------------
  window._insight_observer = new MutationObserver(() => {
    clearTimeout(window._insight_tempData.debounceTimer);
    window._insight_tempData.debounceTimer = setTimeout(runExtraction, DEBOUNCE_MS);
  });

  window._insight_observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Force first extraction immediately
  setTimeout(runExtraction, 50);

  window._insight_tempData.capturing = true;
}

// ---------------------------
// Stop observer
// ---------------------------
function stopObserver() {
  if (window._insight_observer) {
    window._insight_observer.disconnect();
    window._insight_observer = null;
  }
  window._insight_tempData.capturing = false;
}


// ---------------------------
// Manual capture: read temp data
// ---------------------------
function captureNow() {
  
  startObserver({ autoMode: false });
  // User scrolls manually
  // When they click 'Save', read temp data:
  return window._insight_tempData.data;
}

// ---------------------------
// Auto capture: scroll + send once
// ---------------------------
function autoCapture(container) {
  
  startObserver({ autoMode: true });

  intelligentAutoScroll(container, () => {
    if (window._insight_finalSent) return;
    window._insight_finalSent = true;

    chrome.runtime.sendMessage({ action: "GET_CAPTURE_STATE" }, (state) => {
      const snapshot = state?.snapshot;

      if (!snapshot?.data?.post) {
        chrome.runtime.sendMessage({ action: "STOP_CAPTURE" });
        stopObserver();
        return;
      }
  const platform = detectPlatform();
      chrome.runtime.sendMessage({
        action: "POST_AND_REPLIES_CAPTURED",
        url: snapshot.url,
        data: snapshot.data,
        platform: 'twitter'
      }, () => {
        stopObserver();
      });
      chrome.runtime.sendMessage({ action: "AUTO_CAPTURE_DONE" });
      chrome.runtime.sendMessage({
      action: 'CHANGE_BUTTON_STATUS',
      platform: platform,
      message: "Do not minimize or close  the opened window.It will capture and close automatically"
    });

    });
  }, { forceInterval: true });
}

// Clear temp data + stop observer
// ---------------------------
function clearTempCapture() {
  stopObserver();

  window._insight_tempData = {
    data: null,
    postHash: null,
    url: null
  };
}

// ---------------------------
// Message Listener
// ---------------------------
if (!window._insight_listener_registered) {
  window._insight_listener_registered = true;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    // ------------------ Manual capture ------------------
if (msg.action === 'CAPTURE_NOW') {
   
  const platform = detectPlatform();


  if (platform === "tiktok") {
    (async () => {
            chrome.runtime.sendMessage({
      action: 'ANALYSIS_ATTEMPT_STATUS',
      platform: platform,
      message: "Do not scroll analysis is automatic"
    });
    const videoId = window.location.pathname.split("/").pop();
    data = await extractTikTokPostAndReplies(videoId, 500);

    // Once we have the post, send it and stop observer
    if (!data?.post) {
      chrome.runtime.sendMessage({ action: "STOP_CAPTURE" });
      stopObserver();
      return;
    }
      chrome.runtime.sendMessage({
      action: 'CHANGE_BUTTON_STATUS',
      platform: platform,
      message: "Do not scroll analysis is automatic"
    });

      chrome.runtime.sendMessage({
        action: 'POST_AND_REPLIES_CAPTURED',
        url: location.href,
        data,
        platform: 'tiktok'
      });
    })();

    sendResponse({ success: true });
    return true;
  }      chrome.runtime.sendMessage({
      action: 'ANALYSIS_ATTEMPT_STATUS',
      platform: platform,
      message: "Please scroll the replies to capture them."
    });

  // fallback to observer-based capture for others
  startObserver({ autoMode: false });
}

    // ------------------ Auto capture init ------------------
    if (msg.action === 'START_AUTO_CAPTURE') {
      sendResponse({ success: true, url: location.href });
      return true;
    }
  if (msg.action === "STOP_CAPTURE") {
    clearTempCapture();
    sendResponse({ success: true });
    return true;
  }
    


  if (msg.action === 'AUTO_CAPTURE') {
    const platform = detectPlatform();
    let container = null;
    let analysisMsg = null;

    switch (platform) {
      case 'twitter':
        container = window; // Twitter allows auto-capture
        break;
      case 'tiktok':
        analysisMsg = "Please use Manual Analysis Auto capture is not available for this site.Analysis will still be automatic";
        break;
      case 'whatsapp':
      case 'facebook':
      case 'linkedin':
      case 'reddit':
      default:
        analysisMsg = "Please use Manual Analysis Auto capture is not available for this site";
    }

    // Only run auto-capture for Twitter
    if (platform === 'twitter' && container) {
      autoCapture(container);
    }

    // Send back status to whoever requested auto-capture
    chrome.runtime.sendMessage({
      action: 'ANALYSIS_ATTEMPT_STATUS',
      platform: platform,
      message: analysisMsg
    });

    // Also respond to the original message
    sendResponse({ success: true });
    return true;
  }






  });
}

})();
