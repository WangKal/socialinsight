import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { decryptId } from "@/hooks/encrypt";
import { motion } from "motion/react";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { InsightsCards } from "@/components/analytics/InsightsCards";
import { AgreementDistribution } from "@/components/analytics/AgreementDistribution";
import { SentimentChart } from "@/components/analytics/SentimentChart";
import { TopicClusters } from "@/components/analytics/TopicClusters";
import { RepliesSection } from "@/components/analytics/RepliesSection";
import { ExportButton } from "@/components/analytics/ExportButton";
import { AddLinkDialog } from "@/components/analytics/AddLinkDialog";
import { Link as LinkIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { fetchPostAnalytics,fetchRecentPost } from "@/services/socialEcho";
import {useAuth } from "@/hooks/use-auth"

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const location = useLocation();
  const [mode, setMode] = useState<"Recent Post" | "Selected Post">("Recent Post");
useEffect(() => {
  if (!user) return;

  (async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams(location.search);
      const encryptedId = params.get("id");

      // -----------------------------
      // CASE 1: Has ?id= → decrypt + fetch that post
      // -----------------------------
      if (encryptedId) {
        const decryptedId = decryptId(encryptedId);

        if (decryptedId) {
          try {
            const result = await fetchPostAnalytics(decryptedId);

            if (result) {
              setData(result);
              setMode("Selected Post");
              return; // Stop here — do NOT load recent post
            }
          } catch (err) {
            console.error("Error fetching selected post analytics:", err);
          }
        }
      }

      // -----------------------------
      // CASE 2: No valid ?id= → Fetch most recent completed post
      // -----------------------------
      try {
        const recent = await fetchRecentPost(user.id);

        if (recent) {
          setData(recent);
          setMode("Recent Post");
        } else {
          setData(null);
          setMode("No Posts Found");
        }
      } catch (err) {
        console.error("Error fetching recent post:", err);
        setData(null);
        setMode("Error");
      }

    } finally {
      setLoading(false);
    }
  })();
}, [location.search, user?.id]);



  if (loading) return <p>Loading analytics...</p>;
  if (!data) return <p>No data found.</p>;

  // Safe access
  const post = data.post_text || {};
  console.log(post)
  const groups = data?.analysis_result.groups || {};
  const stats = data?.analysis_result.statistics || {};
  const replies = Array.isArray(data?.analysis_result.replies) ? data?.analysis_result.replies : [];
  const topicsCount = Object.values(groups).reduce(
    (sum: number, group: any) => sum + (group?.clusters?.length || 0),
    0
  );

  const agreement = stats.agreement_distribution || {};
  const sentiment = stats.sentiment_distribution || {};
    const handleAddLink = (url: string, title: string) => {
    console.log("Adding link:", { url, title });
    // In a real app, this would trigger the analysis process
    alert(`Link added successfully!\nURL: ${url}\nTitle: ${title}\n\nAnalysis will begin shortly...`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title with Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-5xl mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
  Social Post Analytics
</h1>
<p className="text-xl text-gray-600 mb-4">
  Comprehensive analysis of conversations and engagement
</p>

<div className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 via-purple-50 to-violet-50 border border-gray-200 shadow-sm">
  <h3 className="text-lg font-semibold text-gray-700">
    {mode}
  </h3>
  <p className="text-sm text-gray-500 mt-1">
    {mode === "Recent Post"
      ? "Showing the most recent completed post analytics"
      : "Analytics for the selected post"}
  </p>
</div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setIsAddLinkOpen(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Add Link
              </Button>
              <ExportButton />
            </div>
          </div>
        </motion.div>

        {/* Post Overview */}
        <div className="mb-8">
          <AnalyticsHeader
            postInfo={ post || "" }
            detectedType={data.detected_post_type || "Unknown"}
            timestamp="December 3, 2025"
          />
        </div>

        {/* Insights Cards */}
        <InsightsCards
          totalReplies={replies.length}
          agreementRate={agreement.agree || 0}
          positiveRate={sentiment.positive || 0}
          topicsCount={topicsCount}
        />

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <AgreementDistribution
            agree={agreement.agree || 0}
            neutral={agreement.neutral || 0}
            disagree={agreement.disagree || 0}
          />
          <SentimentChart
            positive={sentiment.positive || 0}
            neutral={sentiment.neutral || 0}
            negative={sentiment.negative || 0}
          />
        </div>

        {/* Topic Clusters */}
        <div className="mb-8">
          <TopicClusters groups={groups} />
        </div>

        {/* All Replies */}
        <div>
          <RepliesSection replies={replies} />
        </div>
      </div>
       {/* Add Link Dialog */}
      <AddLinkDialog
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onAdd={handleAddLink}
      />
    </div>
  );
}
