importScripts("libs/supabase.js");



const QUEUE = [];
const activeSubscriptions = {}; // track Realtime subscriptions
async function getAnalysisFromBackend(analysisId) {

      const stored = await chrome.storage.local.get(["jwt", "supabase"]);
      const jwt = stored.jwt;
      const supaSession = stored.supabase;
      const payload = {
          jwt:jwt,
          analysis_id:analysisId,
          user_id: supaSession.user.id,
          supabase_token:supaSession.access_token,
          supabase_refresh:supaSession.refresh_token,
        

        };
      const bodyData = {data:payload};
  if (!analysisId ) return null;

  try {
    const stored = await chrome.storage.local.get(["jwt"]);
    const jwt = stored.jwt;
    if (!jwt) return null;

    const res = await fetch(`https://socialinsightbackend.onrender.com/api/insights/get_analysis/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    if (!res.ok) throw new Error(`Failed to fetch analysis: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("[Background] getAnalysisFromBackend error:", err);
    return null;
  }
}


function subscribeAnalysisViaPolling(analysisId, intervalMs = 120000) {
  if (!analysisId || activeSubscriptions[analysisId]) return;

  const poll = async () => {
    const data = await getAnalysisFromBackend(analysisId);
    if (!data) return;

    chrome.runtime.sendMessage({
      action: "ANALYSIS_UPDATE",
      status: data.status,
      result: data || null,
      analysis_id: analysisId
    });

    if (data.status == "completed" || data.status == "failed" || data.error =="posts not found") {
      clearInterval(activeSubscriptions[analysisId]);
      delete activeSubscriptions[analysisId];
    }
  };

  poll(); // immediate first call
  activeSubscriptions[analysisId] = setInterval(poll, intervalMs);
}

/*
async function flushQueueToBackend() {
  if (!QUEUE.length) return;

  try {
    const { jwt, supabase } = await chrome.storage.local.get(["jwt", "supabase"]);
    if (!jwt || !supabase?.access_token) return;

    const payload = QUEUE.map(item => ({
      url: item.url,
      platform: item.platform,
      timestamp: item.timestamp,
      post: item.post,
      replies: item.replies
    }));

    console.log("[Background] Sending queue to backend:", payload);

    const res = await fetch("https://socialinsightbackend.onrender.com/api/insights/analysis/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify({ user_id: supabase.user_id, data: payload })
    });

    const data = await res.json();
    console.log("[Background] Backend response:", data);

    if (res.ok) QUEUE.length = 0;

  } catch (err) {
    console.error("[Background] Failed to send queue:", err);
  }
}
*/
// ---------------------------
let captureStore = {
  capturing: false,
  snapshot: null
};
let autoCaptureWindowId = null;
let autoCaptureTabId = null;
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  (async () => {
    console.log('[Background] Message received:', msg);

if (msg.action === 'POST_AND_REPLIES_CAPTURED') {
  const { url, data, platform } = msg;
  const replyCount = data.replies ? data.replies.length : 0;

  // Add latest captured item to queue

  QUEUE.push({
    url,
    platform: platform || "unknown",
    post: data.post,
    replies: data.replies || [],
    timestamp: Date.now(),
  });

  try {
    // Retrieve stored JWT and supabase session
    const stored = await chrome.storage.local.get(["jwt", "supabase"]);
    const jwt = stored.jwt;
    const supaSession = stored.supabase;

    if (!supaSession?.user?.id) {
      console.error("No valid Supabase session found.");
      return sendResponse({ ok: false, message: "Supabase session missing." });
    }

    // Send only the last captured item to backend
    const latestItem = QUEUE[QUEUE.length - 1];
    const payload = [{
      user_id: supaSession.user.id,
      url: latestItem.url,
      platform: latestItem.platform,
      timestamp: latestItem.timestamp,
      post: latestItem.post,
      replies: latestItem.replies,
    }];

    const res = await fetch(
      "https://socialinsightbackend.onrender.com/api/insights/analysis/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: payload }),
      }
    );

    const backendData = await res.json();

let msg;

if (backendData.status === "success") {
  msg = backendData.msg || "Analysis started successfully.";
} else {
  // Error case
  if (backendData.missing_credits) {
    msg = `Insufficient credits. You need ${backendData.missing_credits} more credit(s).`;
  } else {
    msg = backendData.msg || "Something went wrong.";
  }
}

chrome.runtime.sendMessage({
  action: "ANALYSIS_ALERT",
  msg: msg,
  data: backendData,
});


const returnedId = backendData.items?.[0]?.id;
    console.log("[Background] Backend response ID:", returnedId);

    if (returnedId) {
      await chrome.storage.local.set({ "recent-analysis": returnedId });
      subscribeAnalysisViaPolling(returnedId);
    }

  } catch (err) {
    console.error("Error sending captured post to backend:", err);
  } finally {
    // Always clear queue safely
    console.log("Clearing QUEUE");
    QUEUE.length = 0;
  }

  return sendResponse({
    ok: true,
    message: `Captured ${replyCount} replies`,
  });
}
if (msg.action === "CAPTURE_SNAPSHOT") {
    captureStore = {
      capturing: true,
      snapshot: msg.payload
    };

    chrome.storage.session.set({ captureStore }, () => {
      console.log("Capture snapshot updated");
    });

    sendResponse({ success: true });
    return true;
  }

if (msg.action == "STOP_CAPTURE") {
  const captureStore = {
    capturing: false,
    snapshot: null
  };

  chrome.storage.session.set({ captureStore }, () => {
    console.log("Capture stopped and snapshot cleared");
  });

  sendResponse({ success: true });
  return true;
}


if (msg.action === "GET_CAPTURE_STATE") {

  chrome.storage.session.get("captureStore", (res) => {

    const store = res.captureStore;

    if (!store || !store.snapshot) {
      sendResponse({ capturing: false, snapshot: null });
      return;
    }

    const snapshotUrl = store.snapshot.url;
    const currentUrl = sender.tab?.url;

    // 🔥 KEY FIX
    if (snapshotUrl && currentUrl && snapshotUrl !== currentUrl) {

      console.log("[Background] Stale capture detected → clearing");

      const cleared = { capturing: false, snapshot: null };

      chrome.storage.session.set({ captureStore: cleared });

      sendResponse({ capturing: false, snapshot: null });
      return;
    }

    sendResponse({
      capturing: !!store.capturing,
      snapshot: store.snapshot
    });

  });

  return true;
}

    else if (msg.action === 'SHOW_QUEUE') {
      sendResponse({ ok: true, queue: QUEUE });
    }
      // ---- STOP & CLEAR ----


    else if (msg.action === 'FETCH_ANALYSIS') {
      console.log("h2");

      const data = await getAnalysisFromBackend(msg.analysisId);
console.log("last analysis" + data)
      if (data) sendResponse({ ok: true, data });
      else sendResponse({ ok: false, data: null });
    }
   else if (msg.action === "CREATE_WINDOW") {
  console.log("opening");

  chrome.windows.create({
    url: msg.url,
    type: "popup",
     focused: true, 
    width: 600,
    height: 800,
    left: 10,
    top: 10
  }, (win) => {

    autoCaptureWindowId = win.id;
    autoCaptureTabId = win.tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId: autoCaptureTabId },
      files: ["content.js"]
    }, () => {
      chrome.tabs.sendMessage(autoCaptureTabId, { action: "AUTO_CAPTURE" });
    });
  });

  return true;
}
else if (
  msg.action === "AUTO_CAPTURE_DONE" ||
  msg.action === "AUTO_CAPTURE_ABORT"
) {
  if (autoCaptureWindowId !== null) {
        chrome.storage.session.set({
      captureStore: {
        capturing: false,
        snapshot: null
      }
    });
    chrome.windows.remove(autoCaptureWindowId);
    autoCaptureWindowId = null;
    autoCaptureTabId = null;
  }
}

else if (msg.type === "FETCH_RECENT_POLLS") {
  try {
    const stored = await chrome.storage.local.get(["jwt", "supabase"]);
    const jwt = stored.jwt;
    const supaSession = stored.supabase;

    const payload = {
      jwt: jwt,
      user_id: supaSession.user.id,
      supabase_token: supaSession.access_token,
      supabase_refresh: supaSession.refresh_token,
    };

    console.log("Sending payload:", payload);

    const bodyData = { data: payload };

    fetch("https://socialinsightbackend.onrender.com/api/insights/recent_analysis/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`,
      },
      body: JSON.stringify(bodyData),
    })
      .then((res) => res.json())        // <-- IMPORTANT: return parsed JSON
      .then((data) => {
        console.log("Backend response:", data);
        sendResponse({ polls: data || [] });
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        sendResponse({ polls: [] });
      });

    return true; // <-- KEEP PORT OPEN FOR async sendResponse
  } catch (err) {
    console.error("FETCH_RECENT_POLLS error:", err);
    sendResponse({ polls: [] });
  }
}


  })(); // END async wrapper

  return true; // keep port open
});

// Backup interval flush
//setInterval(flushQueueToBackend, 30000);

// Debug logging
setInterval(() => {
  if (QUEUE.length > 0) {
    console.log(`[Background] Queue size: ${QUEUE.length}`);
  }
}, 10000);
