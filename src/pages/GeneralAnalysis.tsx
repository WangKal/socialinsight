import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { AuthButtons } from "@/components/AuthButtons";

export default function Analytics() {
  const { user } = useAuth();
  const navigate =useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const location = useLocation();
  const [mode, setMode] = useState<"Recent Post" | "Selected Post">("Recent Post");
useEffect(() => {
  (async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams(location.search);
      const generalPost = params.get("post");

      // If no post in URL, navigate home
      if (!generalPost) {
        navigate("/");
        return; // stop further execution
      }

      // Decrypt ID if needed
      
      // Fetch analytics for the selected post
      try {
        const result = await fetchPostAnalytics(generalPost);

        if (result) {
          setData(result);
          setMode("Selected Post");
          return; // stop here, do NOT load recent posts
        }
      } catch (err) {
        console.error("Error fetching selected post analytics:", err);
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
  const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// usage
<p>{formatDate(data.created_at)}</p>

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-blue-50">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl  flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <img src="/images/SocialInsightLogo.png" alt="Logo" /> </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">SocialInsight</span>
              <span className="block text-[10px] text-muted-foreground -mt-1">Analytics Platform</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a href={!user?"/login":"/analytics"} className="text-muted-foreground hover:text-foreground transition-colors relative group">
              {!user?"Sign In":"Analyze"}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            
          </nav>
          <div className="flex items-center gap-3">
            <AuthButtons/>
          </div>
        </div>
      </header>

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
              {/*<ExportButton />*/}
            </div>
          </div>
        </motion.div>

        {/* Post Overview */}
        <div className="mb-8">
         <AnalyticsHeader
            postInfo={ post || "" }
            detectedType={data.detected_type || "Unknown"}
            timestamp={formatDate(data.created_at)}
            platform={data.platform}
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
