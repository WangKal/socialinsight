import { supabase } from '@/intergrations/supabase/client';


/**
 * Fetch post analytics by post ID
 * @param {string} postId 
 * @returns {Promise<Object>}
 */
export async function  fetchPostAnalytics(postId) {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Supabase fetch error:', error);
    return null;
  }

  return data;
}
export async function fetchRecentPost(userId: string) {
  const { data, error } =  await supabase
        .from("social_posts")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

        if (error) {
    console.error('Supabase fetch error:', error);
    return null;
  }

  return data;
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
   console.log(result)
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

    sentiment: (() => {
      if (analysis?.sentiment === "positive") return 90;
      if (analysis?.sentiment === "neutral") return 50;
      if (analysis?.sentiment === "negative") return 10;
      return 50;
    })(),

    agreement: row.agree_percentage ?? 0,

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
  console.log(userId+" "+
  category+" "+
  campaignId+" "+
  newCampaignName)
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
