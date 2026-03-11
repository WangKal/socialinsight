import { supabase } from '@/intergrations/supabase/client';
import { Reply } from "@/components/AIChatPanel"; // adjust path if needed


/**
 * Fetch full analytics for a post
 * - clusters with metadata
 * - replies hydrated correctly
 * - statistics preserved
 * - safe for 30k+ replies
 */
export async function fetchPostAnalytics(postId: string) {
  // 1️⃣ Fetch post
  const { data: post, error: postError } = await supabase
    .from("social_posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (postError || !post) return null;

  /* ---------------------------------------
   * 2️⃣ Normalize + index post replies ONCE
   * modelReplyId -> base reply
   * ------------------------------------- */
  const normalizeReplies = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };
console.log((JSON.parse(post.replies)).length)
  const replyIndex = new Map<string, any>();
  normalizeReplies(post.replies).forEach((reply, idx) => {
    replyIndex.set(String(idx ), reply); // 1-based indexing
  });
  /* ---------------------------------------
   * 3️⃣ Fetch agreement metadata
   * ------------------------------------- */
  const [
    agreeRes,
    neutralRes,
    disagreeRes,
  ] = await Promise.all([
    supabase.from("agree_replies").select("reply").eq("social_post_id", postId),
    supabase.from("neutral_replies").select("reply").eq("social_post_id", postId),
    supabase.from("disagree_replies").select("reply").eq("social_post_id", postId),
  ]);

  /* ---------------------------------------
   * 4️⃣ Hydrate agreement replies
   * modelReplyId -> FULL reply JSON
   * ------------------------------------- */

  const hydrateReplies = (rows: any[] = []) => {
    const map = new Map<string, any>();
    const list: any[] = [];

    for (const row of rows) {
    
      const meta = row.reply;
      if (meta?.id  == null) continue;

      const base = replyIndex.get(String(meta.id));
 
      if (!base) continue;

      const hydrated = {
        id: meta.id,
        content: base.content ?? "",
        displayName: base.displayName ?? null,
        username: base.username ?? null,
        timestamp: base.timestamp ?? null,
        counts: base.counts ?? {},
        tone: meta.tone,
        agreement: meta.agreement,
        sentiment: meta.sentiment,
      };

      map.set(String(meta.id), hydrated);
      list.push(hydrated);
    }

    return { map, list };
  };
   

  const agree = hydrateReplies(agreeRes.data || []);
  const neutral = hydrateReplies(neutralRes.data || []);
  const disagree = hydrateReplies(disagreeRes.data || []);


  /* ---------------------------------------
   * 5️⃣ Fallback cluster-table fetcher
   * ------------------------------------- */
const fetchClusterReplyIds = async (
  table: string,
  clusterId: string
): Promise<string[]> => {
  const { data, error } = await supabase
    .from(table)
    .select("reply")
    .eq("cluster_id", clusterId)
    .eq("social_post_id", postId);

  if (error || !Array.isArray(data)) {
    console.error("Cluster reply fetch error:", error);
    return [];
  }

  // data = [{ reply: "7" }, { reply: "12" }, ...]
  return data
    .map(row => String(row.reply))
    .filter(Boolean);
};


  /* ---------------------------------------
   * 6️⃣ Attach replies to clusters
   * ------------------------------------- */
  const attachReplies = async (
    clusters: any[] = [],
    replyMap: Map<string, any>,
    clusterTable: string
  ) => {
    const result = [];

    for (const cluster of clusters) {
      let replyIds: string[] = [];

      // A️⃣ analysis already attached replies
      if (Array.isArray(cluster.replies) && cluster.replies.length) {
        replyIds = cluster.replies.map((r: any) => String(r.id));
      } 
      // B️⃣ fallback to cluster table
      else {
        replyIds = await fetchClusterReplyIds(
          clusterTable,
          cluster.cluster_id
        );
      }

      result.push({
        ...cluster,
        replies: replyIds
          .map(id => replyMap.get(id))
          .filter(Boolean),
      });
    }

    return result;
  };

  /* ---------------------------------------
   * 7️⃣ FINAL PAYLOAD
   * ------------------------------------- */

  return {
    id: post.id,
    post_text: post.post_text,
    platform: post.platform,
    created_at: post.created_at,
    detected_type: post.detected_type,
    total_replies: post.total_replies,

    statistics: {
      agreement_distribution: post.agreement_distribution || {},
      sentiment_distribution: post.sentiment_distribution || {},
    },

    agree_clusters: await attachReplies(
      post.topic_clusters?.agree || [],
      agree.map,
      "agree_clusters"
    ),

    neutral_clusters: await attachReplies(
      post.topic_clusters?.neutral || [],
      neutral.map,
      "neutral_clusters"
    ),

    disagree_clusters: await attachReplies(
      post.topic_clusters?.disagree || [],
      disagree.map,
      "disagree_clusters"
    ),

    // ✅ explicitly returned as requested
    agree_replies: agree.list,
    neutral_replies: neutral.list,
    disagree_replies: disagree.list,
  };
}


/**
 * Fetch the most recent completed post analytics
 */
export async function fetchRecentPost(userId?: string) {
  const query = supabase
    .from("social_posts")
    .select("id")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1);

  // optional user scoping (future-safe)
  if (userId) {
    query.eq("user_id", userId);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    console.error("Recent post fetch error:", error);
    return null;
  }

  return fetchPostAnalytics(data.id);
}


export async function analyzeExternalLink(link){
  return true;
}

export async function getCredits(userId: string) {
  return supabase.from("credits").select("*").eq("user_id", userId).single();
}

export async function getTransactions(userId: string) {
  return supabase.from("payments").select("*").eq("user_id", userId);
}
/// settings code
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // not found is allowed
  return data || null;
}

export async function updateUserProfile(userId, values) {
  // 1️⃣ Fetch current profile
  const { data: oldProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("full_name, company, phone_number, history")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError; // real error
  }

  const historyArray = oldProfile?.history || [];

  // 2️⃣ If profile exists, push its previous state into history
  let updatedHistory = historyArray;

  if (oldProfile) {
    const historyEntry = {
      full_name: oldProfile.full_name,
      company: oldProfile.company,
      phone_number: oldProfile.phone_number,
      saved_at: new Date().toISOString(),
    };

    updatedHistory = [...historyArray, historyEntry];
  }

  // 3️⃣ Update the profile with new values + updated history
  const { data, error: updateError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        ...values,
        history: updatedHistory,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (updateError) throw updateError;

  return data;
}


//Dashboard fn plus admin

//get campaigns
export async function getCampaignsByUser(userId: string) {
   const result= await supabase.from("campaigns").select("*").eq("user_id", userId);
  
   return result.data
}
/**
 * Convert Supabase row → UI Post format
 */

function mapPost(row: any) {
  const analysis = row.analysis_result?.post;

  return {
    id: row.id,

    title: analysis?.text?.slice(0, 80) || "Untitled Post",

    url: row.source_url,

    date: new Date(row.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),

    replies: Number(row.total_replies) || 0,

    sentiment: row.sentiment_percentage ?? 0,

    agreement: row.agreement_percentage ?? 0,
    agreement_distribution: row.agreement_distribution?.agree?.percentage ?? 0,
    sentiment_distribution: row.sentiment_distribution?.positive?.percentage ?? 0,

    category: row.category || null,

    campaign: row.campaign || null,
    campaignName: row.campaign_name || null,

    status: row.status || "pending",
  };
}

/**
 * Fetch posts for a specific user
 */
export async function getPostsByUser(user_id: string) {

  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .eq("user_id", user_id)               // <-- FILTER BY USER
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getPostsByUser error:", error);
    throw error;
  }

  return data.map(mapPost);
}

export async function assignPost(
  postId: string,
  userId: string,
  category: "personal" | "campaign" | "removeCampaign" | "removePersonal",
  campaignId?: string | null,
  newCampaignName?: string | null,
  description?:string | null
) {
 /** console.log(userId+" "+
  category+" "+
  campaignId+" "+
  newCampaignName)**/
  try {
    // PERSONAL assignment
    if (category === "personal") {
      const { error } = await supabase
        .from("social_posts")
        .update({ category: "personal" })
        .eq("id", postId)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true };
    }

    // Remove personal assignment
    if (category === "removePersonal") {
      const { error } = await supabase
        .from("social_posts")
        .update({ category: null })
        .eq("id", postId)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true };
    }

    // Remove campaign assignment
    if (category === "removeCampaign") {
      const { error } = await supabase
        .from("social_posts")
        .update({ campaign: null, campaign_name: null })
        .eq("id", postId)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true };
    }

    // Create new campaign & assign
   if (category === "campaign" && campaignId === "new") {
  if (!newCampaignName) throw new Error("New campaign name is required");

  // Define possible gradient colors
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-green-500 to-emerald-600",
    "from-pink-500 to-rose-600",
    "from-yellow-400 to-orange-500",
    "from-indigo-500 to-purple-500",
    "from-teal-400 to-cyan-500",
    "from-red-500 to-pink-600"
  ];

  // Pick a random color
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Insert new campaign
  const { data: newCampaign, error: createError } = await supabase
    .from("campaigns")
    .insert({
      name: newCampaignName,
      user_id: userId,
      description: description, // you can add a description variable if needed
      color: color,
    })
    .select()
    .single();

  if (createError) throw createError;

  // Update post to link to new campaign
  const { error: updateError } = await supabase
    .from("social_posts")
    .update({
      campaign_id: newCampaign.id,
      campaign_name: newCampaign.name,
      category: "campaign",
    })
    .eq("id", postId)
    .eq("user_id", userId);

  if (updateError) throw updateError;

  return { success: true, newCampaign };
}

    // Assign to existing campaign
    if (category === "campaign" && campaignId && campaignId !== "new") {
      const { data: campaign, error: fetchError } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("id", campaignId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("social_posts")
        .update({
          campaign: campaign.id,
          campaign_name: campaign.name,
          
        })
        .eq("id", postId)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      return { success: true };
    }

    throw new Error("Invalid assignment parameters");
  } catch (error: any) {
    console.error("Assignment Error:", error.message);
    return { error: error.message };
  }
}
// Messages
export const fetchMessages = async () => {
  return await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });
};

export const sendMessage = async (user:string,content: string) => {
  //const { data: user } = await supabase.auth.getUser();

  return await supabase.from("messages").insert({
    sender: "user",
    content,
  });
};
//Notifications

export interface Notification {
  id: string;
  user_id: string | null;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Fetch notifications for a user (global + user-specific)
export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from<Notification>("notifications")
    .select("*")
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Insert a new notification
export const addNotification = async (notification: Omit<Notification, "id" | "created_at" | "read">) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert({ ...notification })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Mark notification as read
export const markAsRead = async (id: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .or(`user_id.eq.${userId},user_id.is.null`)
    .select();

  if (error) throw error;
  return data;
};

// Delete Post
export const deletePost = async (postId: string) => {

  // 1️⃣ Delete Replies
  await supabase.from("agree_replies").delete().eq("social_post_id", postId);
  await supabase.from("neutral_replies").delete().eq("social_post_id", postId);
  await supabase.from("disagree_replies").delete().eq("social_post_id", postId);

  // 2️⃣ Delete Clusters
  await supabase.from("agree_clusters").delete().eq("social_post_id", postId);
  await supabase.from("neutral_clusters").delete().eq("social_post_id", postId);
  await supabase.from("disagree_clusters").delete().eq("social_post_id", postId);

  // 3️⃣ Delete Post (LAST)
  const { data, error } = await supabase
    .from("social_posts")
    .delete()
    .eq("id", postId);

  if (error) throw error;

  return data;
};

export const AIHistory= async (userId: string,postId: string) => {

 const jwt = localStorage.getItem("internal_jwt") || "";
 const payload = {
    user_id: userId,
    post_id:postId
  };
  try {
  const res = await fetch(`https://socialinsightbackend.onrender.com/api/insights/ai_chat_history/`, {
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
  } catch (err) {
    console.error(err);
    return { text: "Sorry, I couldn't get a response. Try again.", replyMentions: [] };
  }
};


export interface AIResponse {
  text: string;
  replyMentions: Reply[];
}

export const fetchAIResponse = async (userId: string, question: string, postId: string): Promise<AIResponse> => {
 
 const jwt = localStorage.getItem("internal_jwt") || "";
 const payload = {
    user_id: userId,
    question:question,
    postId:postId
  };
  try {
  const res = await fetch(`https://socialinsightbackend.onrender.com/api/insights/ai_chat/`, {
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
  } catch (err) {
    console.error(err);
    return { text: "Sorry, I couldn't get a response. Try again.", replyMentions: [] };
  }
};

export async function trackHomeView() {
  await supabase.rpc("increment_page_view", {
    p_page_name: "home",
  });
}

export async function trackGeneralView() {
  await supabase.rpc("increment_page_view", {
    p_page_name: "general_view",
  });
}

export async function trackAnalyticsDashboardView() {
  await supabase.rpc("increment_page_view", {
    p_page_name: "analytics_dashboard",
  });
}
export async function trackAnalyticsView() {
  await supabase.rpc("increment_page_view", {
    p_page_name: "analytics",
  });
}

export async function trackPaymentsView() {
  await supabase.rpc("increment_page_view", {
    p_page_name: "payments",
  });
}
export async function generateTemplate(post: any) {

  const sentimentDist = post.sentiment_distribution || {};
  const agreementDist = post.agreement_distribution || {};
  const clusters = post.topic_clusters || {};
   const jwt = localStorage.getItem("internal_jwt") || "";

  // Extract top topics (not just dominant)
  const topics: any[] = [];

  Object.values(clusters).forEach((group: any) => {
    group.forEach((cluster: any) => {
      topics.push({
        topic: cluster.topic,
        frequency: cluster.frequency
      });
    });
  });

  // Sort topics by frequency
  const topTopics = topics
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5); // limit context size

  const response = await fetch("http://127.0.0.1:8000/api/insights/generate_marketing_post/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`
    },
    body: JSON.stringify({
      post: {
        id: post.id, // backend expects "id", not "post_id"
        sentiment_distribution: sentimentDist,
        agreement_distribution: agreementDist,
        platform:post.platform,
        topic_clusters: {
          main: topTopics.map(topic => ({
            topic: topic.topic,
            frequency: topic.frequency
          }))
        },
        analysis_link: `https://socialinsight.vercel.app/general-analysis?post=${post.id}`
      }
    })
  });

  return response.json();
}



export async function getAdminUsers() {
  // 1️⃣ Get profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, full_name, role, created_at");

  if (profilesError) throw profilesError;

  // 2️⃣ Get posts grouped by user
  const { data: posts } = await supabase
    .from("social_posts")
    .select("user_id, id");

  // 3️⃣ Get credits
  const { data: credits } = await supabase
    .from("credits")
    .select("user_id, used_credits, remaining_credits");

  // 4️⃣ Get campaigns
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("user_id, id");

  return profiles.map((profile) => {
    const userPosts = posts?.filter(p => p.user_id === profile.user_id) || [];
    const userCredits = credits?.find(c => c.user_id === profile.user_id);
    const userCampaigns = campaigns?.filter(c => c.user_id === profile.user_id) || [];

    return {
      id: profile.user_id,
      name: profile.full_name || "Unnamed",
      role: profile.role,
      totalPosts: userPosts.length,
      creditsUsed: userCredits?.used_credits ?? 0,
      creditsRemaining: userCredits?.remaining_credits ?? 0,
      campaigns: userCampaigns.length,
      joinedDate: profile.created_at,
    };
  });
}

export async function getAdminPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      user_id,
      amount,
      credits_purchased,
      status,
      payment_method,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}
export async function getAdminRequests() {
  const { data, error } = await supabase
    .from("requests")
    .select(`
      id,
      requested_by,
      source_url,
      status,
      platform,
      created_at,
      done_by
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}