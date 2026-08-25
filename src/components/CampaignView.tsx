import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Calendar,
  BarChart2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Users,
  Hash,
  Globe,
  AlertTriangle,
  Target,
  Zap,
  BookOpen,
  TrendingDown,
  TrendingUp,
  Minus,
  MessageSquare,
  Clock,
  Shield,
  ArrowRight,
  Lightbulb,
  Activity,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  downloadTopicsPDF,
  downloadIntelligencePDF,
  downloadArticlePDF,
} from "../utils/pdfExport";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

import { AIChatPanel } from "@/components/AIChatPanel";
import { deleteCampaign } from "@/services/socialEcho";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface PlatformStats {
  posts?: number;
  topic_clusters?: unknown[];
  agreement_distribution?: {
    agree?: number;
    neutral?: number;
    disagree?: number;
  };
  sentiment_distribution?: {
    agree?: number;
    neutral?: number;
    negative?: number;
    positive?: number;
  };
}

interface TopicCluster {
  topic?: string;
  frequency?: number;
  replyable?: boolean;
  cluster_id?: string;
  novelty_score?: number | null;
  average_sentiment?: number;
  reply_suggestions?: {
    ai_reply?: string;
    mention_list?: string;
  };
  batch_index_last_updated?: number;
}

interface Hypothesis {
  hypothesis?: string;
  driver_title?: string;
  evidence_excerpt?: string;
}

interface LinguisticSignal {
  phrase?: string;
  literal_meaning?: string;
  social_meaning?: string;
}

interface RecommendedAction {
  owner?: string;
  action?: string;
  timeline?: string;
}

interface CampaignAssessment {
  key_hypotheses?: Hypothesis[];
  consensus_signal?: string;
  friction_dissent?: {
    type?: string;
    summary?: string;
    explanation?: string;
  };
  detected_patterns?: string[];
  overall_sentiment?: {
    emotional_split?: string;
    agreement_on_fact?: string;
  };
  linguistic_signals?: LinguisticSignal[];
  recommended_actions?: RecommendedAction[];
  engagement_integrity?: {
    classification?: string;
    language_signal?: string;
    reasoning_density?: string;
  };
  executive_implication?: {
    monitor_next?: string;
    risk_or_opportunity?: string;
    decision_makers_should_understand?: string;
  };
}

interface CampaignReport {
  campaign_query?: string[];
  updated_campaign_assessment?: CampaignAssessment;
}

interface CampaignStatistics {
  total_posts?: number;
  aligned_posts?: number;
  neutral_posts?: number;
  opposing_posts?: number;
}

export interface Campaign {
  id: number;
  created_at: string;
  name: string;
  description: string;
  status: string;
  query: string;
  platforms: string;
  start_date: string;
  end_date: string;
  total_posts: number;
  analyzed_posts: number;
  platform_stats: string;
  campaign_topic_clusters: string;
  campaign_article: string;
  campaign_report: string;
  campaign_statistics: string;
  last_heartbeat: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function safeJSON<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value !== "string") {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function sentimentColor(score: number) {
  if (score >= 0) return "text-emerald-600";
  if (score >= -0.4) return "text-amber-500";
  return "text-red-500";
}

function sentimentLabel(score: number) {
  if (score >= 0.3) return "Positive";
  if (score >= -0.3) return "Neutral";
  if (score >= -0.6) return "Mixed";
  return "Negative";
}

function sentimentBg(score: number) {
  if (score >= 0) return "bg-emerald-50 border-emerald-200";
  if (score >= -0.4) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function hasContent(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM META
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_META: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
  }
> = {
  x: {
    label: "X (Twitter)",
    color: "text-gray-900",
    bg: "bg-gray-900",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },

  tiktok: {
    label: "TikTok",
    color: "text-black",
    bg: "bg-black",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 1 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 1 0 6.33 6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },

  instagram: {
    label: "Instagram",
    color: "text-pink-600",
    bg: "bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.28-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 2.618 6.78 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY / PROCESSING STATE
// ─────────────────────────────────────────────────────────────────────────────

function DataState({
  title = "Data not available yet",
  description = "This campaign is still being processed. Check back when analysis is complete.",
  processing = false,
  icon,
}: {
  title?: string;
  description?: string;
  processing?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mx-auto mb-4">
        {processing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          icon ?? <Activity className="w-6 h-6" />
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-700 mb-1">
        {title}
      </h3>

      <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTONS
// ─────────────────────────────────────────────────────────────────────────────

function DownloadButton({
  label,
  onClick,
  loading,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}

      {loading ? "Generating PDF…" : label}
    </button>
  );
}

function CopyButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <button
      onClick={copy}
      disabled={!text}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
        copied
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-100 hover:bg-violet-100 text-gray-500 hover:text-violet-700"
      } ${className}`}
    >
      {copied ? (
        <Check className="w-3 h-3" />
      ) : (
        <Copy className="w-3 h-3" />
      )}

      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MENTIONS
// ─────────────────────────────────────────────────────────────────────────────

function MentionChips({
  mentionStr,
}: {
  mentionStr?: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handles = hasContent(mentionStr)
    ? mentionStr.split(" ").filter(Boolean)
    : [];

  if (handles.length === 0) {
    return null;
  }

  const copy = async (handle: string) => {
    try {
      await navigator.clipboard.writeText("@" + handle);
      setCopied(handle);

      setTimeout(() => {
        setCopied(null);
      }, 1600);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {handles.map((handle, index) => (
        <button
          key={`${handle}-${index}`}
          onClick={() => copy(handle)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${
            copied === handle
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50"
          }`}
        >
          <Users className="w-3 h-3" />

          @{handle}

          {copied === handle ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3 opacity-50" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SENTIMENT
// ─────────────────────────────────────────────────────────────────────────────

function SentimentBar({
  score,
}: {
  score?: number;
}) {
  const safeScore = safeNumber(score, 0);
  const pct = Math.max(
    0,
    Math.min(100, Math.round(((safeScore + 1) / 2) * 100))
  );

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            safeScore >= 0
              ? "bg-emerald-400"
              : safeScore >= -0.4
                ? "bg-amber-400"
                : "bg-red-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <span
        className={`text-xs tabular-nums ${sentimentColor(safeScore)}`}
      >
        {safeScore.toFixed(2)}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC CARD
// ─────────────────────────────────────────────────────────────────────────────

function TopicClusterCard({
  cluster,
  index,
}: {
  cluster: TopicCluster;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const sentiment = safeNumber(cluster.average_sentiment, 0);
  const mentions = cluster.reply_suggestions?.mention_list ?? "";
  const reply = cluster.reply_suggestions?.ai_reply ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${sentimentBg(
        sentiment
      )}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm text-gray-800 leading-snug flex-1">
          {cluster.topic || "Unnamed topic"}
        </p>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/70 rounded-full text-xs text-gray-600 border border-gray-200">
            <BarChart2 className="w-3 h-3" />

            {safeNumber(cluster.frequency)} posts
          </span>

          {cluster.replyable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 rounded-full text-xs text-violet-700 border border-violet-200">
              <MessageSquare className="w-3 h-3" />
              Replyable
            </span>
          )}
        </div>
      </div>

      <SentimentBar score={sentiment} />

      <p className={`text-xs mt-1 ${sentimentColor(sentiment)}`}>
        {sentimentLabel(sentiment)} sentiment
      </p>

      {reply && (
        <div className="mt-4">
          <button
            onClick={() => setExpanded((value) => !value)}
            className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />

            Reply Suggestions

            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-3 bg-white/80 rounded-xl border border-white">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      AI Reply
                    </p>

                    <CopyButton text={reply} />
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">
                    {reply}
                  </p>

                  {mentions && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Mention List
                      </p>

                      <MentionChips mentionStr={mentions} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN
// ─────────────────────────────────────────────────────────────────────────────

function PatternBadge({
  label,
}: {
  label?: string;
}) {
  const clean = (label || "Unknown").replace(/[\[\]]/g, "");

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs">
      <Hash className="w-3 h-3" />

      {clean}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE
// ─────────────────────────────────────────────────────────────────────────────

function TimelineGroup({
  actions,
}: {
  actions?: RecommendedAction[];
}) {
  const safeActions = safeArray<RecommendedAction>(actions);

  if (safeActions.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No recommended actions available yet.
      </p>
    );
  }

  const groups: Record<string, RecommendedAction[]> = {};

  safeActions.forEach((action) => {
    const key = action.timeline || "Unspecified";

    groups[key] = [
      ...(groups[key] || []),
      action,
    ];
  });

  const timelineColors: Record<string, string> = {
    "Short-term (0-3 months)": "bg-emerald-500",
    "Medium-term (3-6 months)": "bg-amber-400",
    "Long-term (6-12 months)": "bg-violet-500",
    Ongoing: "bg-blue-500",
  };

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([timeline, items]) => (
        <div key={timeline}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                timelineColors[timeline] ?? "bg-gray-400"
              }`}
            />

            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {timeline}
            </p>
          </div>

          <div className="space-y-2 pl-4 border-l-2 border-gray-100">
            {items.map((action, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                <p className="text-xs text-violet-600 mb-1">
                  {action.owner || "Unassigned"}
                </p>

                <p className="text-sm text-gray-700">
                  {action.action || "No action description available."}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  "Overview",
  "Topics",
  "Intelligence",
  "Article",
] as const;

type Tab = typeof TABS[number];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function CampaignView({
  campaign,
}: {
  campaign: Campaign;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [articleExpanded, setArticleExpanded] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // SAFE PARSING
  // ───────────────────────────────────────────────────────────────────────────

  const keywords = safeJSON<string[]>(
    campaign?.query,
    []
  );

  const platforms = safeJSON<string[]>(
    campaign?.platforms,
    []
  );

  const platformStats = safeJSON<
    Record<string, PlatformStats>
  >(
    campaign?.platform_stats,
    {}
  );

  const topicClusters = safeJSON<{
    merged_topics?: TopicCluster[];
  }>(
    campaign?.campaign_topic_clusters,
    { merged_topics: [] }
  );

  const report = safeJSON<CampaignReport | null>(
    campaign?.campaign_report,
    null
  );

  const stats = safeJSON<CampaignStatistics>(
    campaign?.campaign_statistics,
    {
      total_posts: safeNumber(campaign?.total_posts),
      aligned_posts: 0,
      neutral_posts: 0,
      opposing_posts: 0,
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // NORMALIZED DATA
  // ───────────────────────────────────────────────────────────────────────────

  const normalizedKeywords = safeArray<string>(keywords);

  const normalizedPlatforms = safeArray<string>(platforms);

  const normalizedTopics = safeArray<TopicCluster>(
    topicClusters?.merged_topics
  );

  const assessment =
    report?.updated_campaign_assessment ?? null;

  const article =
    hasContent(campaign?.campaign_article)
      ? campaign.campaign_article
      : "";

  const xStats = platformStats?.x ?? null;

  const processing =
    campaign?.status === "processing" ||
    campaign?.status === "pending";

  // ───────────────────────────────────────────────────────────────────────────
  // PDF META
  // ───────────────────────────────────────────────────────────────────────────

  const pdfMeta = {
    keywords: normalizedKeywords,
    platforms: normalizedPlatforms,
    start_date: campaign?.start_date,
    end_date: campaign?.end_date,
  };

  // ───────────────────────────────────────────────────────────────────────────
  // DOWNLOAD
  // ───────────────────────────────────────────────────────────────────────────

  const withDownload =
    (
      key: string,
      fn: () => Promise<void>
    ) =>
    async () => {
      setDownloading(key);

      try {
        await fn();
      } catch (error) {
        console.error(`Failed to generate ${key} PDF:`, error);
      } finally {
        setDownloading(null);
      }
    };

  // ───────────────────────────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────────────────────────

  const handleDeleteCampaign = async () => {
    const confirmed = window.confirm(
      `Delete campaign "${campaign.name || `#${campaign.id}`}"?\n\n` +
        `This will permanently delete the campaign and all posts, replies, clusters, and requests belonging to it.`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteCampaign(campaign.id);

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Failed to delete campaign:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete campaign"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CHART DATA
  // ───────────────────────────────────────────────────────────────────────────

  const agreementDistribution =
    xStats?.agreement_distribution ?? {};

  const sentimentDistribution =
    xStats?.sentiment_distribution ?? {};

  const agreementData = xStats
    ? [
        {
          name: "Agree",
          value: safeNumber(
            agreementDistribution.agree
          ),
          color: "#10b981",
        },
        {
          name: "Neutral",
          value: safeNumber(
            agreementDistribution.neutral
          ),
          color: "#94a3b8",
        },
        {
          name: "Disagree",
          value: safeNumber(
            agreementDistribution.disagree
          ),
          color: "#f43f5e",
        },
      ]
    : [];

  const sentimentData = xStats
    ? [
        {
          name: "Positive",
          value: safeNumber(
            sentimentDistribution.positive
          ),
          fill: "#10b981",
        },
        {
          name: "Neutral",
          value: safeNumber(
            sentimentDistribution.neutral
          ),
          fill: "#94a3b8",
        },
        {
          name: "Negative",
          value: safeNumber(
            sentimentDistribution.negative
          ),
          fill: "#f43f5e",
        },
      ]
    : [];

  const statusColors: Record<string, string> = {
    collected:
      "bg-emerald-100 text-emerald-700 border-emerald-200",

    processing:
      "bg-amber-100 text-amber-700 border-amber-200",

    pending:
      "bg-gray-100 text-gray-600 border-gray-200",

    completed:
      "bg-violet-100 text-violet-700 border-violet-200",
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* AI CHAT */}
      <AIChatPanel
        mode="campaign"
        campaignId={campaign.id}
      />

      {/* ───────────────────────────────────────────────────────────────────────
          HERO
      ─────────────────────────────────────────────────────────────────────── */}

      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900 px-6 pt-10 pb-16">

        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.3) 0%, transparent 50%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto">

          {/* Breadcrumb */}

          <div className="flex items-center gap-2 text-white/40 text-xs mb-5">
            <Globe className="w-3.5 h-3.5" />

            <span>Campaigns</span>

            <ArrowRight className="w-3 h-3" />

            <span className="text-white/70">
              #{campaign.id}
            </span>
          </div>

          {/* Title */}

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">

            <div>
              <h1 className="text-3xl text-white mb-2">
                {normalizedKeywords.length > 0
                  ? normalizedKeywords.join(", ")
                  : campaign.name || "Keyword Campaign"}
              </h1>

              <p className="text-white/60 text-sm">
                {campaign.description ||
                  "Campaign intelligence and social analysis."}
              </p>
            </div>

            <div className="flex items-center gap-2">

              <span
                className={`px-3 py-1 rounded-full text-xs border capitalize ${
                  statusColors[campaign.status] ??
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {campaign.status || "pending"}
              </span>

              <button
                onClick={handleDeleteCampaign}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-200 hover:text-red-100 text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete Campaign"}
              </button>

            </div>
          </div>

          {/* Keywords */}

          {normalizedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {normalizedKeywords.map((keyword, index) => (
                <span
                  key={`${keyword}-${index}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm border border-white/20"
                >
                  <Search className="w-3.5 h-3.5 opacity-70" />

                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}

          <div className="flex flex-wrap gap-4 text-white/50 text-xs">

            {/* Platforms */}

            {normalizedPlatforms.length > 0 && (
              <div className="flex items-center gap-2">
                {normalizedPlatforms.map((platform) => {
                  const meta =
                    PLATFORM_META[platform];

                  if (!meta) return null;

                  return (
                    <span
                      key={platform}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs"
                    >
                      {meta.icon}

                      {meta.label}
                    </span>
                  );
                })}
              </div>
            )}

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />

              {formatDate(campaign.start_date)}
              {" — "}
              {formatDate(campaign.end_date)}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />

              Updated{" "}
              {formatDate(campaign.last_heartbeat)}
            </span>

          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          STATS
      ─────────────────────────────────────────────────────────────────────── */}

      <div className="max-w-5xl mx-auto px-6 -mt-8 mb-8 relative z-10">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {[
            {
              label: "Total Posts",
              value: safeNumber(stats.total_posts),
              icon: <Activity className="w-4 h-4" />,
              color: "text-slate-700",
              bg: "bg-white",
            },
            {
              label: "Aligned",
              value: safeNumber(stats.aligned_posts),
              icon: <TrendingUp className="w-4 h-4" />,
              color: "text-emerald-700",
              bg: "bg-emerald-50 border-emerald-100",
            },
            {
              label: "Neutral",
              value: safeNumber(stats.neutral_posts),
              icon: <Minus className="w-4 h-4" />,
              color: "text-slate-500",
              bg: "bg-slate-50 border-slate-100",
            },
            {
              label: "Opposing",
              value: safeNumber(stats.opposing_posts),
              icon: <TrendingDown className="w-4 h-4" />,
              color: "text-rose-600",
              bg: "bg-rose-50 border-rose-100",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border shadow-sm p-5 ${stat.bg}`}
            >
              <div
                className={`flex items-center gap-1.5 mb-2 ${stat.color}`}
              >
                {stat.icon}

                <span className="text-xs uppercase tracking-wide opacity-70">
                  {stat.label}
                </span>
              </div>

              <p
                className={`text-3xl tabular-nums ${stat.color}`}
              >
                {stat.value}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          TABS
      ─────────────────────────────────────────────────────────────────────── */}

      <div className="max-w-5xl mx-auto px-6">

        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit mb-8">

          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm transition-all duration-150 ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}

        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            OVERVIEW
        ───────────────────────────────────────────────────────────────────── */}

        {activeTab === "Overview" && (
          <div className="space-y-6 pb-16">

            {/* Platform coverage */}

            <div>
              <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-500" />

                Platform Coverage
              </h2>

              {normalizedPlatforms.length === 0 ? (
                <DataState
                  title="No platforms configured"
                  description="No social platforms have been configured for this campaign yet."
                  icon={<Globe className="w-6 h-6" />}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  {normalizedPlatforms.map((platform) => {
                    const meta =
                      PLATFORM_META[platform];

                    const pStats =
                      platformStats?.[platform];

                    const hasData =
                      !!pStats;

                    const agreement =
                      pStats?.agreement_distribution ?? {};

                    return (
                      <div
                        key={platform}
                        className={`rounded-2xl border p-5 ${
                          hasData
                            ? "bg-white"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">

                          <div
                            className={`w-8 h-8 rounded-xl ${
                              meta?.bg ??
                              "bg-gray-400"
                            } flex items-center justify-center text-white shadow-sm`}
                          >
                            {meta?.icon ?? (
                              <Globe className="w-4 h-4" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-gray-800">
                              {meta?.label ?? platform}
                            </p>

                            <p className="text-xs text-gray-400">
                              {hasData
                                ? `${safeNumber(
                                    pStats.posts
                                  )} posts`
                                : "No data yet"}
                            </p>
                          </div>
                        </div>

                        {hasData ? (
                          <div className="space-y-1.5 text-xs">

                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Agree
                              </span>

                              <span className="text-emerald-600">
                                {safeNumber(
                                  agreement.agree
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Neutral
                              </span>

                              <span className="text-gray-500">
                                {safeNumber(
                                  agreement.neutral
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Disagree
                              </span>

                              <span className="text-rose-500">
                                {safeNumber(
                                  agreement.disagree
                                )}
                              </span>
                            </div>

                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 w-fit">

                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />

                            <span className="text-xs text-amber-600">
                              Awaiting data
                            </span>

                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              )}
            </div>

            {/* Charts */}

            {xStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="bg-white rounded-2xl border p-5">

                  <h3 className="text-sm text-gray-700 mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-violet-500" />

                    Agreement Distribution (X)
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={180}
                  >
                    <PieChart>
                      <Pie
                        data={agreementData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {agreementData.map(
                          (entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.color}
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        formatter={(value) => [
                          `${value} posts`,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="flex justify-center gap-4 mt-2">
                    {agreementData.map((data) => (
                      <div
                        key={data.name}
                        className="flex items-center gap-1.5 text-xs text-gray-500"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: data.color,
                          }}
                        />

                        {data.name} ({data.value})
                      </div>
                    ))}
                  </div>

                </div>

                <div className="bg-white rounded-2xl border p-5">

                  <h3 className="text-sm text-gray-700 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-500" />

                    Sentiment Breakdown (X)
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={180}
                  >
                    <BarChart
                      data={sentimentData}
                      barSize={32}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis hide />

                      <Tooltip
                        formatter={(value) => [
                          `${value}%`,
                        ]}
                      />

                      <Bar
                        dataKey="value"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      >
                        {sentimentData.map(
                          (data, index) => (
                            <Cell
                              key={index}
                              fill={data.fill}
                            />
                          )
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                </div>

              </div>
            ) : (
              <DataState
                title={
                  processing
                    ? "Analysis in progress"
                    : "No platform analysis yet"
                }
                description={
                  processing
                    ? "The campaign is still collecting or processing social data. Charts will appear automatically when statistics are available."
                    : "Platform statistics have not been generated for this campaign yet."
                }
                processing={processing}
                icon={<BarChart2 className="w-6 h-6" />}
              />
            )}

            {/* Consensus */}

            {assessment?.consensus_signal ? (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">

                <h3 className="text-sm text-violet-700 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />

                  Consensus Signal
                </h3>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {assessment.consensus_signal}
                </p>

              </div>
            ) : (
              <DataState
                title={
                  processing
                    ? "Consensus analysis is processing"
                    : "Consensus signal not available"
                }
                description="The campaign needs enough analyzed data before a consensus signal can be generated."
                processing={processing}
                icon={<Zap className="w-6 h-6" />}
              />
            )}

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            TOPICS
        ───────────────────────────────────────────────────────────────────── */}

        {activeTab === "Topics" && (
          <div className="pb-16">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-base text-gray-700 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-500" />

                Topic Clusters

                <span className="text-xs text-gray-400 ml-1">
                  ({normalizedTopics.length})
                </span>
              </h2>

              <DownloadButton
                label="Download PDF"
                loading={downloading === "topics"}
                disabled={normalizedTopics.length === 0}
                onClick={withDownload(
                  "topics",
                  () =>
                    downloadTopicsPDF(
                      normalizedTopics,
                      pdfMeta
                    )
                )}
              />

            </div>

            {normalizedTopics.length > 0 ? (
              <div className="space-y-4">

                {normalizedTopics.map(
                  (cluster, index) => (
                    <TopicClusterCard
                      key={
                        cluster.cluster_id ||
                        `cluster-${index}`
                      }
                      cluster={cluster}
                      index={index}
                    />
                  )
                )}

              </div>
            ) : (
              <DataState
                title={
                  processing
                    ? "Topic clustering is processing"
                    : "No topic clusters available"
                }
                description={
                  processing
                    ? "Topics will appear here once the campaign posts have been collected and analyzed."
                    : "There are currently no topic clusters available for this campaign."
                }
                processing={processing}
                icon={<Target className="w-6 h-6" />}
              />
            )}

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            INTELLIGENCE
        ───────────────────────────────────────────────────────────────────── */}

        {activeTab === "Intelligence" && (
          <div className="space-y-8 pb-16">

            {!assessment ? (
              <DataState
                title={
                  processing
                    ? "Strategic intelligence is processing"
                    : "Strategic intelligence not available"
                }
                description={
                  processing
                    ? "The campaign is still being analyzed. Strategic hypotheses, patterns, sentiment and recommendations will appear here when the report is ready."
                    : "A strategic intelligence report has not been generated for this campaign yet."
                }
                processing={processing}
                icon={<Shield className="w-6 h-6" />}
              />
            ) : (
              <>
                {/* Header */}

                <div className="flex items-center justify-between">

                  <h2 className="text-base text-gray-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-500" />

                    Strategic Intelligence
                  </h2>

                  <DownloadButton
                    label="Download PDF"
                    loading={
                      downloading === "intelligence"
                    }
                    onClick={withDownload(
                      "intelligence",
                      () =>
                        downloadIntelligencePDF(
                          assessment,
                          pdfMeta
                        )
                    )}
                  />

                </div>

                {/* Patterns */}

                <div>

                  <h2 className="text-base text-gray-700 mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-violet-500" />

                    Detected Patterns
                  </h2>

                  {safeArray<string>(
                    assessment.detected_patterns
                  ).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {safeArray<string>(
                        assessment.detected_patterns
                      ).map(
                        (pattern, index) => (
                          <PatternBadge
                            key={index}
                            label={pattern}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No detected patterns available.
                    </p>
                  )}

                </div>

                {/* Sentiment */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="bg-white rounded-2xl border p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                      Emotional Split
                    </p>

                    <p className="text-sm text-gray-700">
                      {assessment.overall_sentiment?.emotional_split ||
                        "Not available"}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                      Agreement on Fact
                    </p>

                    <p className="text-sm text-gray-700">
                      {assessment.overall_sentiment?.agreement_on_fact ||
                        "Not available"}
                    </p>
                  </div>

                </div>

                {/* Engagement */}

                <div className="bg-white rounded-2xl border p-5">

                  <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-500" />

                    Engagement Integrity
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Classification
                      </p>

                      <p className="text-gray-700">
                        {assessment.engagement_integrity
                          ?.classification ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Language Signal
                      </p>

                      <p className="text-gray-700">
                        {assessment.engagement_integrity
                          ?.language_signal ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Reasoning Density
                      </p>

                      <p className="text-gray-700">
                        {assessment.engagement_integrity
                          ?.reasoning_density ||
                          "Not available"}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Friction */}

                {assessment.friction_dissent ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">

                    <h2 className="text-base text-amber-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />

                      Friction & Dissent
                    </h2>

                    <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-xs mb-3">
                      {assessment.friction_dissent.type ||
                        "Not classified"}
                    </span>

                    <p className="text-sm text-gray-700 mb-2">
                      {assessment.friction_dissent.summary ||
                        "No summary available."}
                    </p>

                    <p className="text-sm text-gray-500">
                      {assessment.friction_dissent.explanation ||
                        "No explanation available."}
                    </p>

                  </div>
                ) : null}

                {/* Hypotheses */}

                <div>

                  <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-violet-500" />

                    Key Hypotheses
                  </h2>

                  {safeArray<Hypothesis>(
                    assessment.key_hypotheses
                  ).length > 0 ? (
                    <div className="space-y-3">

                      {safeArray<Hypothesis>(
                        assessment.key_hypotheses
                      ).map(
                        (hypothesis, index) => (
                          <details
                            key={index}
                            className="group bg-white rounded-2xl border overflow-hidden"
                          >
                            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">

                              <div className="flex items-start gap-3">

                                <span className="shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs flex items-center justify-center mt-0.5">
                                  {index + 1}
                                </span>

                                <div>

                                  <p className="text-xs text-violet-600 mb-0.5">
                                    {hypothesis.driver_title ||
                                      "Hypothesis"}
                                  </p>

                                  <p className="text-sm text-gray-700">
                                    {hypothesis.hypothesis ||
                                      "No hypothesis description."}
                                  </p>

                                </div>
                              </div>

                              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-3 group-open:rotate-180 transition-transform" />

                            </summary>

                            <div className="px-5 pb-4 pt-0 border-t border-gray-50">

                              <p className="text-xs text-gray-400 uppercase tracking-wide mt-3 mb-1">
                                Evidence
                              </p>

                              <p className="text-sm text-gray-600 italic">
                                {hypothesis.evidence_excerpt
                                  ? `"${hypothesis.evidence_excerpt}"`
                                  : "No evidence excerpt available."}
                              </p>

                            </div>
                          </details>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No key hypotheses available.
                    </p>
                  )}

                </div>

                {/* Linguistic Signals */}

                <div>

                  <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-500" />

                    Linguistic Signals
                  </h2>

                  {safeArray<LinguisticSignal>(
                    assessment.linguistic_signals
                  ).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      {safeArray<LinguisticSignal>(
                        assessment.linguistic_signals
                      ).map(
                        (signal, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-2xl border p-4"
                          >

                            <p className="text-sm text-gray-900 mb-1">
                              "{signal.phrase ||
                                "Unknown phrase"}"
                            </p>

                            <p className="text-xs text-gray-400 mb-2">
                              Literal:{" "}
                              {signal.literal_meaning ||
                                "Not available"}
                            </p>

                            <p className="text-xs text-gray-600 leading-relaxed">
                              {signal.social_meaning ||
                                "Not available"}
                            </p>

                          </div>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No linguistic signals available.
                    </p>
                  )}

                </div>

                {/* Actions */}

                <div>

                  <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-500" />

                    Recommended Actions
                  </h2>

                  <TimelineGroup
                    actions={
                      assessment.recommended_actions
                    }
                  />

                </div>

                {/* Executive */}

                {assessment.executive_implication ? (
                  <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5">

                    <h2 className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-400" />

                      Executive Implication
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">

                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wide mb-2">
                          Monitor Next
                        </p>

                        <p className="text-white/80 leading-relaxed">
                          {assessment.executive_implication.monitor_next ||
                            "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wide mb-2">
                          Risk / Opportunity
                        </p>

                        <p className="text-white/80 leading-relaxed">
                          {assessment.executive_implication.risk_or_opportunity ||
                            "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wide mb-2">
                          Decision Makers
                        </p>

                        <p className="text-white/80 leading-relaxed">
                          {assessment.executive_implication
                            .decision_makers_should_understand ||
                            "Not available"}
                        </p>
                      </div>

                    </div>
                  </div>
                ) : null}
              </>
            )}

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            ARTICLE
        ───────────────────────────────────────────────────────────────────── */}

        {activeTab === "Article" && (
          <div className="pb-16">

            <div className="flex items-center justify-between mb-5 max-w-3xl">

              <h2 className="text-base text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" />

                Campaign Article
              </h2>

              <DownloadButton
                label="Download PDF"
                loading={downloading === "article"}
                disabled={!article}
                onClick={withDownload(
                  "article",
                  () =>
                    downloadArticlePDF(
                      article,
                      pdfMeta
                    )
                )}
              />

            </div>

            {!article ? (
              <DataState
                title={
                  processing
                    ? "Article is still being generated"
                    : "Campaign article not available"
                }
                description={
                  processing
                    ? "The campaign article will appear here once the campaign analysis has finished."
                    : "There is currently no generated article for this campaign."
                }
                processing={processing}
                icon={<BookOpen className="w-6 h-6" />}
              />
            ) : (
              <div className="bg-white rounded-2xl border p-8 max-w-3xl">

                <div
                  className={`prose prose-sm max-w-none overflow-hidden transition-all ${
                    articleExpanded
                      ? ""
                      : "max-h-[500px]"
                  }`}
                >
                  {article
                    .split("\n")
                    .map((line, index) => {

                      if (line.startsWith("## ")) {
                        return (
                          <h2
                            key={index}
                            className="text-base text-gray-800 mt-6 mb-2"
                          >
                            {line.replace(
                              "## ",
                              ""
                            )}
                          </h2>
                        );
                      }

                      if (line.startsWith("# ")) {
                        return (
                          <h1
                            key={index}
                            className="text-xl text-gray-900 mb-3"
                          >
                            {line.replace(
                              "# ",
                              ""
                            )}
                          </h1>
                        );
                      }

                      if (line.startsWith("- ")) {
                        return (
                          <li
                            key={index}
                            className="text-sm text-gray-600 ml-4 mb-1 list-disc"
                          >
                            {line.replace(
                              "- ",
                              ""
                            )}
                          </li>
                        );
                      }

                      if (
                        line.startsWith("| ") &&
                        line.includes("|")
                      ) {
                        return null;
                      }

                      if (line.trim() === "---") {
                        return (
                          <hr
                            key={index}
                            className="my-4 border-gray-100"
                          />
                        );
                      }

                      if (line.trim() === "") {
                        return (
                          <br key={index} />
                        );
                      }

                      return (
                        <p
                          key={index}
                          className="text-sm text-gray-700 leading-relaxed mb-2"
                        >
                          {line}
                        </p>
                      );
                    })}
                </div>

                {!articleExpanded && (
                  <div className="relative -mt-20 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}

                <button
                  onClick={() =>
                    setArticleExpanded(
                      (value) => !value
                    )
                  }
                  className="mt-4 flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors"
                >
                  {articleExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />

                      Collapse article
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />

                      Read full article
                    </>
                  )}
                </button>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}