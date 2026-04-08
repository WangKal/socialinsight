import { motion } from "motion/react";
import {
  BarChart3,
  ThumbsUp,
  MessageSquare,
  FileText,
  TrendingUp,
  Eye,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { GeneratedArticle } from "../components/analytics/GeneratedArticle";
import { useAuth } from "@/hooks/use-auth";
import { AuthButtons } from "@/components/AuthButtons";
import { getPostsByUser, getGeneralPosts } from "@/services/socialEcho";
import { useParams, useNavigate } from "react-router-dom";
interface Analysis {
  id: string;
  title: string;
  postLink: string;
  platform: string;
  date: string;
  totalReplies: number;
  agreementStats: {
    agree: number;
    neutral: number;
    disagree: number;
  };
  sentimentStats: {
    positive: number;
    neutral: number;
    negative: number;
  };
  article: {
    title: string;
    content: string;
    aiModel: string;
  };
  category: "General" | "Personal" | "Campaign";
  campaignName?: string;
}



export default function AnalysesList() {
  const { user } = useAuth();
  const { scope } = useParams();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  const [filterCategory, setFilterCategory] = useState<
    "All" | "General" | "Personal" | "Campaign"
  >("All");

useEffect(() => {
  async function load() {
    setLoading(true);

    try {
      let result: Analysis[] = [];

      if (scope === "personal" && user?.id) {
        result = await getPostsByUser(user.id);
      } else {
        result = await getGeneralPosts();
      }

      setAnalyses(result || []);
    } catch (error) {
      console.error("Failed to load analyses:", error);
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  }

  load();
}, [scope, user?.id]);

  const filteredAnalyses = analyses.filter(
    (analysis) =>
      filterCategory === "All" || analysis.category === filterCategory
  );
console.log(analyses)
  const totalAnalyses = analyses.length;


const avgPositiveSentiment =
  analyses.length > 0
    ? analyses.reduce(
        (sum, a) =>
          sum + (parseInt(a.sentiment_distribution?.positive?.percentage) || 0),
        0
      ) / analyses.length
    : 0;

const avgAgreement =
  analyses.length > 0
    ? analyses.reduce(
        (sum, a) =>
          sum + (parseInt(a.agreement_distribution?.agree?.percentage) || 0),
        0
      ) / analyses.length
    : 0;

  const totalRepliesAnalyzed = analyses.reduce(
    (sum, a) => sum + a.replies,
    0
  );

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading analyses...
      </div>
    );
  }
function renderAnalysisContent(title: any) {
  if (!title) return null;

  const parsed =
    typeof JSON.parse(title).content === "string"
      ? (() => {
          try {
           
            return JSON.parse(title).content;
          } catch {
            return title;
          }
        })()
      : title.content;

  // Object (TikTok)
  if (typeof parsed === "object") {
    if (parsed.embed) {
      const src =
        parsed.embed.match(/src=\"([^\"]+)\"/)?.[1] || parsed.url;

      return (
        <div className="mt-3 w-full max-w-[320px]">
          <div className="relative w-full aspect-[9/16] overflow-hidden rounded-xl">
            <iframe
              src={src}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    return (
      <p className="text-gray-700 break-words">
        {parsed.url || ""}
      </p>
    );
  }

  // String (normal case)
  return (
    <h3 className="text-1xl text-gray-900">
      {parsed}
    </h3>
  );
}return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            All Analyses
          </h1>
          <p className="text-xl text-gray-600">
            View and manage all completed social post analyses
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-8 h-8 text-violet-600" />
              <p className="text-sm text-gray-600">Total Analyses</p>
            </div>
            <p className="text-4xl text-gray-900">{totalAnalyses}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <p className="text-sm text-gray-600">Total Replies</p>
            </div>
            <p className="text-4xl text-gray-900">{totalRepliesAnalyzed}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <p className="text-sm text-gray-600">Avg Agreement</p>
            </div>
            <p className="text-4xl text-gray-900">{Math.round(avgAgreement)}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <ThumbsUp className="w-8 h-8 text-emerald-600" />
              <p className="text-sm text-gray-600">Avg Positive</p>
            </div>
            <p className="text-4xl text-gray-900">{Math.round(avgPositiveSentiment)}%</p>
          </motion.div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {["All", "General", "Personal", "Campaign"].map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category as any)}
              className={`px-6 py-2 rounded-lg transition-all ${
                filterCategory === category
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-violet-400"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Analyses List */}
        {selectedAnalysis ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              onClick={() => setSelectedAnalysis(null)}
              variant="outline"
              className="mb-6"
            >
              ← Back to All Analyses
            </Button>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl text-gray-900 mb-2">{renderAnalysisContent(selectedAnalysis.title)}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedAnalysis.dateAnalyzed}
                    </div>
                    <Badge>{selectedAnalysis.platform}</Badge>
                    <Badge variant="outline">{JSON.parse(selectedAnalysis.title)?.displayName}</Badge>
                    
                      <Badge variant="secondary">{JSON.parse(selectedAnalysis.title)?.username}</Badge>
                   
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Agreement Stats */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-violet-600" />
                    Agreement Distribution
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Agree</span>
                        <span className="text-sm text-gray-900">{selectedAnalysis.agreement_distribution.agree.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                          style={{ width: `${selectedAnalysis.agreement_distribution.agree.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Neutral</span>
                        <span className="text-sm text-gray-900">{selectedAnalysis.agreement_distribution.neutral.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                          style={{ width: `${selectedAnalysis.agreement_distribution.neutral.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Disagree</span>
                        <span className="text-sm text-gray-900">{selectedAnalysis.agreement_distribution.disagree.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-red-600"
                          style={{ width: `${selectedAnalysis.agreement_distribution.disagree.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sentiment Stats */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Sentiment Distribution
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Positive</span>
                        <span className="text-sm text-gray-900">{selectedAnalysis.sentiment_distribution.positive.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                          style={{ width: `${selectedAnalysis.sentiment_distribution.positive.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Neutral</span>
                        <span className="text-sm text-gray-900">{selectedAnalysis.sentiment_distribution.neutral.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gray-400 to-gray-500"
                          style={{ width: `${selectedAnalysis.sentiment_distribution.neutral.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Negative</span>
                        <span className="text-sm text-gray-900">{selectedAnalysis.sentiment_distribution.negative.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-red-600"
                          style={{ width: `${selectedAnalysis.sentiment_distribution.negative.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Article */}
             <GeneratedArticle
              title={selectedAnalysis.discussion_title}
              content={selectedAnalysis.discussion_article}
              aiModel={selectedAnalysis.article_model}
              generatedDate={selectedAnalysis.dated}
            />
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredAnalyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        {renderAnalysisContent(analysis.title)}
                      <Badge>{analysis.platform}</Badge>
                     
                     
                    </div>
                   
                      <p className="text-sm text-gray-600 mb-2">
                        {JSON.parse(analysis.title)?.username}
                   
                      </p>
               
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {analysis.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {analysis.totalReplies} replies
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedAnalysis(analysis)}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">Agreement</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-gray-900">{analysis.agreement_distribution?.agree?.percentage}%</span>
                      <div className="flex gap-1 text-xs">
                        <span className="text-gray-600">N: {analysis.agreement_distribution?.neutral?.percentage}%</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">D: {analysis.agreement_distribution?.disagree?.percentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">Positive Sentiment</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-gray-900">{analysis.sentiment_distribution.positive?.percentage}%</span>
                      <div className="flex gap-1 text-xs">
                        <span className="text-gray-600">N: {analysis.sentiment_distribution.neutral?.percentage}%</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">Neg: {analysis.sentiment_distribution.negative?.percentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-violet-600" />
                      <span className="text-sm text-gray-700">AI Article</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{analysis.article_model}</span>
                      <Badge variant="secondary" className="text-xs">Generated</Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
