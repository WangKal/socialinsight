// popup.js

    // Onboarding functionality
    const onboardingOverlay = document.getElementById('onboardingOverlay');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const skipBtn = document.getElementById('skipBtn');
    const dontShowAgain = document.getElementById('dontShowAgain');
    const steps = document.querySelectorAll('.onboarding-step');
    const progressDots = document.querySelectorAll('.progress-dot');
    let currentStep = 1;
    const totalSteps = 5;
    let runningTab = null;

    // Check if onboarding should be shown
    function shouldShowOnboarding() {
      return !localStorage.getItem('socialecho_onboarding_completed');
    }

    function updateOnboarding() {
      // Update steps
      steps.forEach(step => {
        step.classList.remove('active', 'exit');
        const stepNum = parseInt(step.dataset.step);
        if (stepNum === currentStep) {
          step.classList.add('active');
        }
      });

      // Update progress dots
      progressDots.forEach(dot => {
        dot.classList.remove('active', 'completed');
        const dotStep = parseInt(dot.dataset.step);
        if (dotStep === currentStep) {
          dot.classList.add('active');
        } else if (dotStep < currentStep) {
          dot.classList.add('completed');
        }
      });

      // Update buttons
      prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
      
      if (currentStep === totalSteps) {
        nextBtn.innerHTML = `Got it, let's start <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        nextBtn.classList.add('finish');
      } else {
        nextBtn.innerHTML = `Next <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
        nextBtn.classList.remove('finish');
      }
    }

    function closeOnboarding() {
      onboardingOverlay.classList.add('closing');
      if (dontShowAgain.checked) {
        localStorage.setItem('socialecho_onboarding_completed', 'true');
      }
      setTimeout(() => {
        onboardingOverlay.style.display = 'none';
      }, 300);
    }

    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateOnboarding();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        currentStep++;
        updateOnboarding();
      } else {
        closeOnboarding();
      }
    });

    skipBtn.addEventListener('click', closeOnboarding);



    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (onboardingOverlay.style.display === 'none') return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextBtn.click();
      } else if (e.key === 'ArrowLeft') {
        prevBtn.click();
      } else if (e.key === 'Escape') {
        closeOnboarding();
      }
    });

    // Loader functionality
    const loaderOverlay = document.getElementById('loaderOverlay');
    const loaderText = document.getElementById('loaderText');
    const analyzeBtn = document.querySelector('.btn-primary');
    const exportBtn = document.querySelectorAll('.btn-secondary')[0];

    function showLoader(text) {
      loaderText.textContent = text;
      loaderOverlay.classList.add('active');
    }

    function hideLoader() {
      loaderOverlay.classList.remove('active');
    }

    analyzeBtn.addEventListener('click', () => {
      showLoader('Analyzing content...');
      // Simulate loading - remove this in production
      setTimeout(hideLoader, 3000);
    });

    exportBtn.addEventListener('click', () => {
      showLoader('Exporting data...');
      // Simulate loading - remove this in production
      setTimeout(hideLoader, 2500);
    });


  const statusHolder = document.getElementById('status-container');
  const statusMessage = document.getElementById('statusMessage');
  const progressBar = document.getElementById('progressBar');
  
  const creditsRemaining = document.getElementById('creditsRemaining');
  const buyCredits = document.getElementById('buyCredits');

  // Simulated credits
  //creditsRemaining.innerText = 5;

  const updateStatus = (msg, progress = null, status = null,color = "blue") => {
   statusHolder.style.display ="block"
    statusMessage.innerText = msg;
    if (progress !== null) {
      progressBar.style.display = 'block';
       progressBar.style.color = color;
      progressBar.style.width = progress;
    } else {
      progressBar.style.display = 'none';
    }

    setInterval(()=>{
      statusHolder.style.display ="none"
       progressBar.style.display = 'none';
      },5000)
  };



 let captureState = "idle"; // idle | capturing | processing
function setButtonState(state) {
  const btn = document.getElementById("captureNow");
   const cancelCapture = document.getElementById("cancelCapture");

  captureState = state;

  if (state === "idle") {
    btn.innerText = "Manual Analysis";
    btn.className = "btn btn-primary";
    btn.disabled = false;
    cancelCapture.style.display ="none"
  }

  if (state === "capturing") {
    btn.innerText = "Stop & Analyze";
    btn.className = "btn btn-warning";
    btn.disabled = false;
    cancelCapture.style.display ="block"
  }

  if (state === "processing") {
    btn.innerText = "Analyzing...";
    btn.className = "btn btn-secondary";
    btn.disabled = true;
  }
}
document.addEventListener("DOMContentLoaded", async () => {


  chrome.runtime.sendMessage({ action: "GET_CAPTURE_STATE" }, (state) => {
    
    if (state?.capturing) {
      setButtonState("capturing");
      updateStatus("Capture in progress. Scroll the post…", null, "blue");
    } else {
      setButtonState("idle");
    }
  });
await updateRecentActivity();
});

function parseResponse(res) {
  const data = res.data;
  console.log(data);
  if (!data) return;

  queueContainer.innerHTML = "";

  /* ----------------------------------------------
     🟦 POST HEADER CARD
  ------------------------------------------------ */
  let postData = {};
  try {
    postData = JSON.parse(data.post_text);
  } catch {}

function renderPostNode(node) {
  if (!node) return "";

  let contentHTML = "";

  // TEXT CONTENT (X, Facebook, Threads, etc.)
  if (typeof node.content === "string") {
    contentHTML = `<div class="post-text">${node.content}</div>`;
  }

  // MEDIA CONTENT (TikTok, future embeds)
  else if (typeof node.content === "object" && node.content !== null) {
    // TikTok embed preferred
    if (node.content.embed) {
      contentHTML = `
        <div class="post-embed">
          ${node.content.embed}
        </div>
      `;
    }
    // Thumbnail fallback
    else if (node.content.thumbnail && node.content.url) {
      contentHTML = `
        <a href="${node.content.url}" target="_blank" class="media-link">
          <img src="${node.content.thumbnail}" alt="media thumbnail" />
        </a>
      `;
    }
    // URL-only fallback
    else if (node.content.url) {
      contentHTML = `
        <a href="${node.content.url}" target="_blank">
          ${node.content.url}
        </a>
      `;
    }
  }

  return `
    <div class="post-block">
      <div class="post-author">
        <strong>${node.displayName || ""}</strong>
        ${node.username ? `<span>${node.username}</span>` : ""}
      </div>

      ${contentHTML}

      ${
        node.quoted
          ? `<div class="post-quoted">${renderPostNode(node.quoted)}</div>`
          : ""
      }
    </div>
  `;
}

const postCard = document.createElement("div");
postCard.className = "analytics-card";
postCard.innerHTML = `
  <h3 class="card-title">Post Overview</h3>
  ${postData.isRepost ? `<div class="tag tag-repost">Repost</div>` : ""}
  <div class="original-post">
    ${renderPostNode(postData)}
  </div>
  <p class="card-description">
    <strong>Detected Type:</strong> ${data.detected_type || "Unknown"}
  </p>
`;
queueContainer.appendChild(postCard);


  /* ----------------------------------------------
     🟩 AGREEMENT DISTRIBUTION
  ------------------------------------------------ */
  const ag = data.statistics?.agreement_distribution;
  if (ag) {
    const bar = document.createElement("div");
    bar.className = "analytics-card";
    bar.innerHTML = `
      <h3 class="card-title">Agreement Distribution</h3>
      <div class="stack-bar">
        <div class="bar agree" style="width:${ag.agree || 0}%"></div>
        <div class="bar neutral" style="width:${ag.neutral || 0}%"></div>
        <div class="bar disagree" style="width:${ag.disagree || 0}%"></div>
      </div>
      <p class="bar-labels">
        Agree: ${ag.agree.percentage || 0}% • Neutral: ${ag.neutral.percentage || 0}% • Disagree: ${ag.disagree.percentage || 0}%
      </p>
    `;
    queueContainer.appendChild(bar);
  }

  /* ----------------------------------------------
     🟧 AGREEMENT BREAKDOWN (TABS)
  ------------------------------------------------ */
  (() => {
    const wrapper = document.createElement("div");
    wrapper.className = "analytics-card";

    wrapper.innerHTML = `
      <h3 class="card-title">Agreement Breakdown</h3>
      <div class="tab-group">
        <button class="tab-btn active" data-tab="agree-tab">Agree</button>
        <button class="tab-btn" data-tab="neutral-tab">Neutral</button>
        <button class="tab-btn" data-tab="disagree-tab">Disagree</button>
      </div>
      <div id="agree-tab" class="tab-panel active"></div>
      <div id="neutral-tab" class="tab-panel"></div>
      <div id="disagree-tab" class="tab-panel"></div>
    `;

    queueContainer.appendChild(wrapper);

    const replyBuckets = {
      agree: data.agree_replies || [],
      neutral: data.neutral_replies || [],
      disagree: data.disagree_replies || [],
    };

    function renderReplies(container, replies) {
      if (!replies.length) {
        container.innerHTML = `<p><em>No replies</em></p>`;
        return;
      }

      replies.forEach(r => {
        const div = document.createElement("div");
        div.className = "reply-item small";
        div.innerHTML = `
          <p><strong>${r.displayName || r.username || "User"}</strong>: ${r.content}</p>
          <p class="reply-meta-small">
            Sentiment: ${r.sentiment || "-"} • Tone: ${r.tone || "-"}
          </p>
        `;
        container.appendChild(div);
      });
    }

    renderReplies(wrapper.querySelector("#agree-tab"), replyBuckets.agree);
    renderReplies(wrapper.querySelector("#neutral-tab"), replyBuckets.neutral);
    renderReplies(wrapper.querySelector("#disagree-tab"), replyBuckets.disagree);

    wrapper.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        wrapper.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        wrapper.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        wrapper.querySelector(`#${btn.dataset.tab}`).classList.add("active");
      });
    });
  })();

  /* ----------------------------------------------
     🟦 CLUSTERS BY AGREEMENT
  ------------------------------------------------ */
  (() => {
    const wrap = document.createElement("div");
    wrap.className = "analytics-card";

    wrap.innerHTML = `
      <h3 class="card-title">Clusters by Agreement</h3>
      <div class="tab-group">
        <button class="tab-btn active" data-tab="c-agree">Agree</button>
        <button class="tab-btn" data-tab="c-neutral">Neutral</button>
        <button class="tab-btn" data-tab="c-disagree">Disagree</button>
      </div>
      <div id="c-agree" class="tab-panel active"></div>
      <div id="c-neutral" class="tab-panel"></div>
      <div id="c-disagree" class="tab-panel"></div>
    `;

    queueContainer.appendChild(wrap);

    const clusterSets = {
      agree: data.agree_clusters || [],
      neutral: data.neutral_clusters || [],
      disagree: data.disagree_clusters || [],
    };

    function renderCluster(panel, cluster) {
      const id = `cl-${cluster.cluster_id}`;
      const box = document.createElement("div");
      box.className = "cluster-box";

      box.innerHTML = `
        <div class="cluster-header" data-target="${id}">
          <strong>${cluster.topic || "Cluster"}</strong>
          <span class="count">(${cluster.replies.length})</span>
          <span class="caret">▸</span>
        </div>
        <div id="${id}" class="cluster-replies hidden"></div>
      `;

      const repliesDiv = box.querySelector(`#${id}`);
      if (!cluster.replies.length) {
        repliesDiv.innerHTML = `<p><em>No replies in this cluster</em></p>`;
      } else {
        cluster.replies.forEach(r => {
          const div = document.createElement("div");
          div.className = "reply-item small";
          div.innerHTML = `
            <p><strong>${r.displayName || r.username || "User"}</strong>: ${r.content}</p>
            <p class="reply-meta-small">
              Sentiment: ${r.sentiment || "-"} • Agreement: ${r.agreement || "-"} • Tone: ${r.tone || "-"}
            </p>
          `;
          repliesDiv.appendChild(div);
        });
      }

      panel.appendChild(box);
    }

    Object.entries(clusterSets).forEach(([key, clusters]) => {
      const panel = wrap.querySelector(`#c-${key}`);
      if (!clusters.length) {
        panel.innerHTML = `<p><em>No clusters</em></p>`;
      } else {
        clusters.forEach(c => renderCluster(panel, c));
      }
    });

    wrap.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        wrap.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        wrap.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        wrap.querySelector(`#${btn.dataset.tab}`).classList.add("active");
      });
    });

    wrap.querySelectorAll(".cluster-header").forEach(h => {
      h.addEventListener("click", () => {
        const target = document.getElementById(h.dataset.target);
        const caret = h.querySelector(".caret");
        target.classList.toggle("hidden");
        caret.textContent = target.classList.contains("hidden") ? "▸" : "▾";
      });
    });
  })();
}


async function showReplies (analysis_id = null){
  document.getElementById('loaderOverlay').classList.add("active")
  
 let queueContainer = document.getElementById('queueContainer');
  queueContainer.innerHTML = ''; // clear previous content
let r_a = await chrome.storage.local.get("recent-analysis");
let analysisId = (analysis_id == null ? r_a["recent-analysis"] : analysis_id);

  if (analysisId == null || !analysisId) {
   // queueContainer.innerText = 'No Analysis ID available.';
     updateStatus('No Recent Analysis available.',100,"orange");

     document.getElementById('loaderOverlay').classList.remove("active")
    return;
  }

  // Ask background.js to fetch data from Supabase
  chrome.runtime.sendMessage({ action: 'FETCH_ANALYSIS', analysisId }, (res) => {




if (!res.ok || !res.data) {
  //queueContainer.innerText = 'No replies captured yet.';
  updateStatus('No replies captured yet.',100,"orange");
  document.getElementById('loaderOverlay').classList.remove("active")
  return;
}
parseResponse(res);
document.getElementById('loaderOverlay').classList.remove("active")
updateStatus('Analysis complete.',100,"orange");

})
}
async function updateRecentActivity() {
  const container = document.querySelector(".analytics-list");
  if (!container) return;

  chrome.runtime.sendMessage({ type: "FETCH_RECENT_POLLS" }, (response) => {
    const posts = response?.polls || [];
 

    if (!posts.length) {
      container.innerHTML = defaultGlobalActivityHTML();
      return;
    }
    function getPostPreview(postTextRaw) {
  let post;
  try {
    post = JSON.parse(postTextRaw);
  } catch {
    return { text: "No preview available", isLink: false };
  }

  const content = post?.content;

  // TikTok / media object
  if (content && typeof content === "object") {
    if (content.url) {
      return {
        text: content.url,
        isLink: true
      };
    }
  }

  // Text-based (X, Facebook, Threads, etc.)
  if (typeof content === "string") {
    return {
      text: content,
      isLink: false
    };
  }

  return { text: "No preview available", isLink: false };
}

container.innerHTML = "";

posts.forEach((item) => {
  const id = item.id || item.post_id || "N/A";

  let postData = {};
  try {
    postData = JSON.parse(item.post_text);
  } catch {}

  const poster = postData.displayName || "Unknown poster";
  const username = postData.username || "Unknown username";

  const preview = getPostPreview(item.post_text);

  const postType = item.detected_type || "Not classified";
  const totalReplies =
    item.statistics?.total_replies ||
    item.total_replies ||
    0;

  const card = document.createElement("div");
  card.className = "analytics-card";
  card.dataset.postId = id;

  card.innerHTML = `
    <div class="card-content">
      <div class="card-text">

        <h3 class="card-title">
          <strong>${poster}</strong>
          <span><small>${username}</small></span>
        </h3>

        <p class="post-preview" style="opacity: 0.85;">
          ${
            preview.isLink
              ? `<a href="${preview.text}" target="_blank">${preview.text}</a>`
              : truncate(preview.text, 100)
          }
        </p>

        <p class="card-description">
          Type: <strong>${postType}</strong> • 
          Replies: <strong>${totalReplies}</strong>
        </p>

      </div>
      ${arrowIcon()}
    </div>
  `;

  container.appendChild(card);

      // Allow clicking to fetch entire post later
      card.addEventListener("click", async () => {
  await showReplies(card.dataset.postId);
});

    });
  });
}

function arrowIcon() {
  return `
    <svg class="icon-link" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  `;
}

function truncate(text, max) {
  return text.length > max ? text.substring(0, max) + "..." : text;
}


// GLOBAL default analytics to show when user has no polls
function defaultGlobalActivityHTML() {
  return `
    <div class="analytics-card">
      <div class="card-content">
        <div class="card-text">
          <h3 class="card-title">No Recent Analysis</h3>
          <p class="card-description">Start your first analysis to see insights here.</p>
        </div>
        ${arrowIcon()}
      </div>
    </div>

    <div class="analytics-card">
      <div class="card-content">
        <div class="card-text">
          <h3 class="card-title">Tip: Highlight Better</h3>
          <p class="card-description">Highlight a post to generate instant analytics.</p>
        </div>
        ${arrowIcon()}
      </div>
    </div>

    <div class="analytics-card">
      <div class="card-content">
        <div class="card-text">
          <h3 class="card-title">AI Insights Ready</h3>
          <p class="card-description">Your next analysis will appear here automatically.</p>
        </div>
        ${arrowIcon()}
      </div>
    </div>

    <div class="analytics-card">
      <div class="card-content">
        <div class="card-text">
          <h3 class="card-title">Need Help?</h3>
          <p class="card-description">Use the extension on X, WhatsApp, TikTok, Reddit, LinkedIn, Instagram or Facebook.</p>
        </div>
        ${arrowIcon()}
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {

 





// Add this somewhere in your popup script, before calling captureNow
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "ANALYSIS_UPDATE" && msg.analysis_id) {
   

    if (msg.status === "completed") {
      setButtonState("idle");
      // Final result available
      const res = {data:msg.result}
      parseResponse(res); // <-- capture result here
      updateStatus('Analysis complete.', 100, "green");
      document.getElementById('loaderOverlay').classList.remove("active");
    } else if (msg.status === "failed") {
      setButtonState("idle");
      updateStatus('Analysis failed.', 100, "red");
      document.getElementById('loaderOverlay').classList.remove("active");
    } else {
      // Optional: intermediate status
      updateStatus(`Analysis in progress... (${msg.status})`, 50, "blue");
    }
  }
});

// Add this somewhere in your popup script, before calling captureNow
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "CHANGE_BUTTON_STATUS") {
   

      setButtonState("idle");
  
}
});
chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== "ANALYSIS_ALERT") return;

  showToast(message.msg || "Something went wrong");
});

function showToast(text) {
  const toast = document.createElement("div");
  toast.textContent = text;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#111",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    zIndex: 9999,
    opacity: "0",
    transition: "opacity 0.2s ease",
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, 5000);
}

// Add this somewhere in your popup script, before calling captureNow
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "ANALYSIS_ATTEMPT_STATUS" && msg.message) {
    alert(msg.message); // Or replace with UI display logic
  }
});

 // --- Auto (Headless) ---
  document.getElementById('autoCapture').addEventListener('click', () => {
    updateStatus('Auto capture will run in the background.',null,"blue");
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'START_AUTO_CAPTURE'}, (resp) => {
runningTab = tabs[0].id;
      if (resp?.success) {
        
chrome.runtime.sendMessage({ 
          action: 'CREATE_WINDOW', 
          url: resp.url, 
        }, (res) => {

/*

        // Trigger backend save and polling via background
        chrome.runtime.sendMessage({ 
          action: 'POST_AND_REPLIES_CAPTURED', 
          url: res.data.url,
          data: res.data 
        }, (res2) => {
          if (!res2.ok) {
            updateStatus('Failed to queue analysis. Try again.', 100, "orange");
            document.getElementById('loaderOverlay').classList.remove("active");
            return;
          }

          // At this point, background has started polling.
          // The actual result will be received asynchronously via ANALYSIS_UPDATE listener above.
          updateStatus('Analysis queued. Waiting for AI results...', 50, "blue");
        });
*/
      })

      } else {
        updateStatus('Failed to capture. Scroll further or try again.', 100, "red");
      }

    });
  });
  });





function stopCapture(tabId) {
  chrome.tabs.sendMessage(tabId, { action: "STOP_CAPTURE" });
}

// Capture post & replies
document.getElementById('captureNow').addEventListener('click', () => {

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tabId = tabs[0].id;
    runningTab = tabs[0].id;

    // ---------------- START CAPTURE ----------------
    if (captureState === "idle") {
      updateStatus("Capture started. Scroll the post…", null, "blue");

      chrome.tabs.sendMessage(tabId, { action: 'CAPTURE_NOW' }, () => {
        setButtonState("capturing");
      });

      return;
    }

    // ---------------- STOP & ANALYZE ----------------
// ---------------- STOP & ANALYZE ----------------
if (captureState === "capturing") {
  setButtonState("processing");
  document.getElementById('loaderOverlay').classList.add("active");
  updateStatus("Finalizing capture…", null, "blue");

  // 🔑 GET SNAPSHOT FROM BACKGROUND (NOT CONTENT SCRIPT)
  chrome.runtime.sendMessage({ action: "GET_CAPTURE_STATE" }, (state) => {

    const snapshot = state?.snapshot;

    if (!snapshot?.data?.post) {
      chrome.runtime.sendMessage({ action: "STOP_CAPTURE" });
      stopCapture(tabId);

      updateStatus(
        "No post captured. Scroll more and try again.",
        100,
        "red"
      );

      document.getElementById('loaderOverlay').classList.remove("active");
      setButtonState("idle");
      return;
    }

    updateStatus(
      `Captured ${snapshot.data.replies.length} replies. Sending for analysis…`,
      60,
      "green"
    );

    // 🔑 Stop capture everywhere
    chrome.runtime.sendMessage({ action: "STOP_CAPTURE" });
    stopCapture(tabId);

    // 🔑 Send FINAL SNAPSHOT for processing
    chrome.runtime.sendMessage({
      action: "POST_AND_REPLIES_CAPTURED",
      url: snapshot.url,
      data: snapshot.data,
      platform:  snapshot.platform,
    }, (res) => {

      if (!res?.ok) {
        updateStatus(
          "Failed to queue analysis.",
          100,
          "orange"
        );
        document.getElementById('loaderOverlay').classList.remove("active");
        setButtonState("idle");
        return;
      }

      updateStatus(
        "Analysis queued. Waiting for AI results…",
        40,
        "blue"
      );
    });
  });

  return;
}

  });
});
// --- Show Replies ---
document.getElementById('cancelCapture').addEventListener('click', async () => {
        setButtonState("idle");
        chrome.runtime.sendMessage({ action: "STOP_CAPTURE" });
        stopCapture(runningTab);

      });
/*document.getElementById('showReplies').addEventListener('click', async () => {
        await showReplies();
      });*/
  
;
// --- Listen for realtime updates from background ---
/*chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'ANALYSIS_UPDATE') {
    const { url, status,result } = msg;
    if (status === 'analyzing') {
      updateStatus(`Analysis running for ${url}...`,50,"green");
      progressBar.style.display = 'block';
    } else if (status === 'complete' ) {
      //progressBar.style.display = 'none';
      updateStatus(`Analysis complete for ${url}`,100,"green");
      parseResponse(msg.result)
      // Optionally refresh showReplies
     // document.getElementById('showReplies').click();
    }else if (status === 'complete' || status === 'failed') {
      //progressBar.style.display = 'none';
      updateStatus(`Analysis failed for ${url}`,100,"red");
      // Optionally refresh showReplies
      
      //document.getElementById('showReplies').click();
    }
    
  }
});*/

  // --- Buy Credits ---
 /* buyCredits.addEventListener('click', () => {
    const url = 'https://yourextensionwebsite.com/buy-credits';
    chrome.tabs.query({ url }, (tabs) => {
      if (tabs.length) {
        chrome.tabs.update(tabs[0].id, { active: true });
      } else {
        chrome.tabs.create({ url });
      }
    });
  });*/


document.getElementById("buyCreditsBtn").addEventListener("click", async () => { 
  const stored = await chrome.storage.local.get(["jwt", "supabase"]);
  const internalJwt = stored.jwt;
  const userId = stored.supabase?.user?.id;
  const supaAccessToken = stored.supabase?.access_token;
  const supaRefreshToken = stored.supabase?.refresh_token;

  if (!internalJwt || !userId || !supaAccessToken) {
    alert("Authentication missing. Please sign in again.");
    return;
  }

  // Generate redirect link from backend
  const resp = await fetch("https://socialinsightbackend.onrender.com/api/auth_app/verify_user/", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${internalJwt}`
    },
    body: JSON.stringify({
      user_id: userId,
      supabase_token: supaAccessToken,
      supabase_refresh: supaRefreshToken
    })
  });

  const json = await resp.json();

  // Redirect user to YOUR payment page (not Paystack directly)
  window.open(json.redirect_url, "_blank");
});


});


//--Auth Fn --
async function checkAuthState() {



  const { jwt, temp_jwt, supabase } = await chrome.storage.local.get(["jwt", "temp_jwt", "supabase"]);

  // --- Normal login: JWT + Supabase access token ---
  if (jwt && supabase?.access_token) {
    // Optional: check expiry timestamp in Supabase session
    const now = Math.floor(Date.now() / 1000); // seconds
    if (!supabase.expires_at || supabase.expires_at > now) {
      showDashboard();

      loadCredits();
      document.getElementById("user-account").innerText = supabase.user.email
      document.getElementById("logout-btn").innerText = "Log Out"
       await updateRecentActivity();
      return;
    }
  }

  // --- Pending signup auto-complete ---
  if (temp_jwt) {
    try {
      const res = await fetch("https://socialinsightbackend.onrender.com/api/auth_app/complete_signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_jwt })
      });
      const data = await res.json();

      if (data.jwt && data.supabase_session) {
        // Save returned session & JWT
        setStorage("jwt", data.jwt);
        setStorage("supabase", data.supabase_session);
        document.getElementById("user-account").innerText = data.supabase_session.user.email
        document.getElementById("logout-btn").innerText = "Log Out"

        // Remove temp_jwt after successful login
        chrome.storage.local.remove("temp_jwt");

        showDashboard();
            if (shouldShowOnboarding()) {
      onboardingOverlay.style.display = 'flex';
      updateOnboarding();
    } else {
      onboardingOverlay.style.display = 'none';
    }
         await updateRecentActivity();
        return;
      } else {
        console.warn("Pending signup could not complete:", data);
      }
    } catch (err) {
      console.error("Complete signup failed:", err);
    }
  }

  // --- Default: show auth screen ---
  showLoginScreen();
}



checkAuthState();

// Helper to get/set storage
function setStorage(key, value) {
  chrome.storage.local.set({ [key]: value });
}

function getStorage(key) {
  return new Promise(resolve => chrome.storage.local.get([key], result => resolve(result[key])));
}

function clearStorage(keys) {
  chrome.storage.local.remove(keys);
}

// -------------------
// LOGIN / SIGNUP
// -------------------
async function fetchWithRetry(url, options, retries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (attempt ${attempt})`);
      return data;
    } catch (err) {
      console.warn(`Fetch attempt ${attempt} failed:`, err);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs)); // wait before retry
    }
  }
}

// ---------------- LOGIN ----------------
async function loginUser(email, password) {
  const loader = document.getElementById("loaderOverlay");
  const loginBtn = document.getElementById("login-btn");

  loader.classList.add("active");
  loginBtn.disabled = true;
  loginBtn.innerText = "Logging in...";
  showLoginStatus("Authenticating...", "#0d6efd");

  try {
    const data = await fetchWithRetry(
      "https://socialinsightbackend.onrender.com/api/auth_app/login/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (data.jwt && data.supabase_session) {
      await setStorage("jwt", data.jwt);
      await setStorage("supabase", data.supabase_session);

      showLoginStatus("Logged in successfully!", "green");
      document.getElementById("user-account").innerText = email;
      document.getElementById("logout-btn").innerText = "Log Out";

      showDashboard();
      if (shouldShowOnboarding()) {
        onboardingOverlay.style.display = 'flex';
        updateOnboarding();
      } else {
        onboardingOverlay.style.display = 'none';
      }
      await updateRecentActivity();
      loadCredits();
    } else {
      showLoginStatus("Invalid login response.", "red");
    }
  } catch (err) {
    console.error("Login error after retries:", err);
    showLoginStatus("Network error. Please try again later.", "red");
  } finally {
    loader.classList.remove("active");
    loginBtn.disabled = false;
    loginBtn.innerText = "Log Out";
  }
}

// ---------------- SIGNUP ----------------
async function signupUser(company, name, email, password) {
  const loader = document.getElementById("loaderOverlay");
  const signupBtn = document.getElementById("signup-btn");

  if (!document.getElementById("terms").checked) {
    showSignupStatus("Please accept Terms & Privacy Policy.", "red");
    return;
  }

  loader.classList.add("active");
  signupBtn.disabled = true;
  signupBtn.innerText = "Creating account...";
  showSignupStatus("Processing signup...", "#0d6efd");

  try {
    const data = await fetchWithRetry(
      "https://socialinsightbackend.onrender.com/api/auth_app/signup/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, name, email, password }),
      }
    );

    if (data.jwt) {
      await setStorage("temp_jwt", data.jwt);
      showSignupStatus("Account created! Check your email for confirmation.", "green");

      const confirmBox = document.getElementById("email-confirmation");
      if (confirmBox) confirmBox.style.display = "block";
    } else {
      showSignupStatus("Signup failed. Try again.", "red");
    }
  } catch (err) {
    console.error("Signup error after retries:", err);
    showSignupStatus("Network error. Please try again later.", "red");
  } finally {
    loader.classList.remove("active");
    signupBtn.disabled = false;
    signupBtn.innerText = "Sign Up";
  }
}

// -------------------
// GOOGLE OAUTH
// -------------------
function googleLogin() {
  // Redirect the extension to backend OAuth endpoint
  window.location.href = "https://socialinsightbackend.onrender.com/api/auth_app/google/";
}

// Handle callback (e.g., extension URL: chrome-extension://<id>/auth)
async function handleOAuthCallback(queryString) {
  const params = new URLSearchParams(queryString);
  const jwt = params.get("jwt");
  const supabase_access = params.get("supabase_access");
  const supabase_refresh = params.get("supabase_refresh");

  if (jwt && supabase_access) {
    setStorage("jwt", jwt);
    setStorage("supabase", { access_token: supabase_access, refresh_token: supabase_refresh });
    showDashboard();
  }
}

// -------------------
// TOKEN EXCHANGE (optional)
// -------------------
async function exchangeSupabaseToken() {
  const supabase = await getStorage("supabase");
  if (!supabase?.access_token) return;

  try {
    const res = await fetch("https://socialinsightbackend.onrender.com/api/auth_app/exchange_token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supabase_token: supabase.access_token })
    });
    const data = await res.json();
    if (data.jwt) setStorage("jwt", data.jwt);
  } catch (err) {
    console.error("Token exchange failed", err);
  }
}

// -------------------
// LOGOUT
// -------------------
async function logout() {
  const supabase = await getStorage("supabase");
  try {
    if (supabase?.access_token) {
      await fetch("https://socialinsightbackend.onrender.com/api/auth_app/logout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabase_access_token: supabase.access_token })
      });
    }
  } catch (err) {
    console.error("Logout error", err);
  } finally {
    clearStorage(["jwt", "supabase"]);
  
    showLoginScreen();
    showSignupStatus("Successfully signed out! .Hope to see you soon", "green");

  }
}


function showLoginStatus(message, color="black") {
  const s = document.getElementById("login-status");
  s.innerText = message;
  s.style.color = color;
   setInterval(()=>{
      s.innerText = "";
      },10000)
}
function showSignupStatus(message, color="black") {
  const s = document.getElementById("signup-status");
  s.innerText = message;
  s.style.color = color;
  setInterval(()=>{
      s.innerText = "";
      },10000)
}

// -------------------
// UI SWITCHING
// -------------------

// For AUTH 
document.getElementById("show-signup").addEventListener("click", () => {
  document.querySelector(".flip-card").classList.add("flipped");
});

document.getElementById("show-login").addEventListener("click", () => {
  document.querySelector(".flip-card").classList.remove("flipped");
});

//To Dashboard
function showDashboard() {
  document.querySelector(".login-section").style.display = "none";
  document.querySelector(".extension-popup").style.display = "block";
}

function showLoginScreen() {
  document.querySelector(".login-section").style.display = "block";
  document.querySelector(".extension-popup").style.display = "none";
}

// -------------------
// EVENT LISTENERS
// -------------------
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showLoginStatus("Please enter email and password.", "red");
    return;
  }

  await loginUser(email, password);
});


document.getElementById("signup-btn").addEventListener("click", async () => {
  const company = document.getElementById("signup-company").value.trim();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!name || !email || !password) {
    showSignupStatus("Ensure name , email and password fields are required.", "red");
    return;
  }

  await signupUser(company, name, email, password);
});


//document.getElementById("google-login-btn").addEventListener("click", googleLogin);
document.getElementById("logout-btn").addEventListener("click", logout);


// On popup load: check if callback from OAuth
if (window.location.href.includes("auth?")) {
  handleOAuthCallback(window.location.search);
}
/** Credits **/

async function loadCredits() {
  const supabase = await getStorage("supabase");
  const jwt = await getStorage("jwt");

  if (!supabase?.user?.id) return;

  try {
    if (supabase?.access_token) {
      const res = await fetch(
        "https://socialinsightbackend.onrender.com/api/payments/get_credits/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              jwt: jwt,
              user_id: supabase.user.id
            }
          })
        }
      );

      const data = await res.json();
      console.log("Credits response:", data);

      if (data?.remaining_credits !== undefined) {
        document.getElementById("credits-amount").innerText = data.remaining_credits;
      }
    }
  } catch (err) {
    console.error("Credits error", err);
  }
}
