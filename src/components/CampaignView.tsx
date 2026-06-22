import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Calendar, BarChart2, Copy, Check,
  ChevronDown, ChevronUp, Users, Hash, Globe,
  AlertTriangle, Target, Zap, BookOpen, TrendingDown,
  TrendingUp, Minus, MessageSquare, Clock, Shield,
  ArrowRight, Lightbulb, Activity, Download, Loader2
} from "lucide-react";
import {
  downloadTopicsPDF,
  downloadIntelligencePDF,
  downloadArticlePDF,
} from "../utils/pdfExport";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformStats {
  posts: number;
  topic_clusters: unknown[];
  agreement_distribution: { agree: number; neutral: number; disagree: number };
  sentiment_distribution: { agree?: number; neutral: number; negative: number; positive: number };
}

interface TopicCluster {
  topic: string;
  frequency: number;
  replyable: boolean;
  cluster_id: string;
  novelty_score: number | null;
  average_sentiment: number;
  reply_suggestions: { ai_reply: string; mention_list: string };
  batch_index_last_updated: number;
}

interface Hypothesis {
  hypothesis: string;
  driver_title: string;
  evidence_excerpt: string;
}

interface LinguisticSignal {
  phrase: string;
  literal_meaning: string;
  social_meaning: string;
}

interface RecommendedAction {
  owner: string;
  action: string;
  timeline: string;
}

interface CampaignReport {
  campaign_query: string[];
  updated_campaign_assessment: {
    key_hypotheses: Hypothesis[];
    consensus_signal: string;
    friction_dissent: { type: string; summary: string; explanation: string };
    detected_patterns: string[];
    overall_sentiment: { emotional_split: string; agreement_on_fact: string };
    linguistic_signals: LinguisticSignal[];
    recommended_actions: RecommendedAction[];
    engagement_integrity: { classification: string; language_signal: string; reasoning_density: string };
    executive_implication: { monitor_next: string; risk_or_opportunity: string; decision_makers_should_understand: string };
  };
}

interface CampaignStatistics {
  total_posts: number;
  aligned_posts: number;
  neutral_posts: number;
  opposing_posts: number;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeJSON<T>(str: string, fallback: T): T {
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
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

const PLATFORM_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
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
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },
  instagram: {
    label: "Instagram",
    color: "text-pink-600",
    bg: "bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DownloadButton({ label, onClick, loading }: { label: string; onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <Download className="w-4 h-4" />}
      {loading ? "Generating PDF…" : label}
    </button>
  );
}

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
        copied ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 hover:bg-violet-100 text-gray-500 hover:text-violet-700"
      } ${className}`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function MentionChips({ mentionStr }: { mentionStr: string }) {
  const handles = mentionStr.split(" ").filter(Boolean);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (h: string) => {
    navigator.clipboard.writeText("@" + h);
    setCopied(h);
    setTimeout(() => setCopied(null), 1600);
  };
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {handles.map((h) => (
        <button
          key={h}
          onClick={() => copy(h)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${
            copied === h
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50"
          }`}
        >
          <Users className="w-3 h-3" />@{h}
          {copied === h ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-50" />}
        </button>
      ))}
    </div>
  );
}

function SentimentBar({ score }: { score: number }) {
  const pct = Math.round(((score + 1) / 2) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${score >= 0 ? "bg-emerald-400" : score >= -0.4 ? "bg-amber-400" : "bg-red-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs tabular-nums ${sentimentColor(score)}`}>
        {score.toFixed(2)}
      </span>
    </div>
  );
}

function TopicClusterCard({ cluster, index }: { cluster: TopicCluster; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const mentions = cluster.reply_suggestions?.mention_list || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${sentimentBg(cluster.average_sentiment)}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm text-gray-800 leading-snug flex-1">{cluster.topic}</p>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/70 rounded-full text-xs text-gray-600 border border-gray-200">
            <BarChart2 className="w-3 h-3" /> {cluster.frequency} posts
          </span>
          {cluster.replyable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 rounded-full text-xs text-violet-700 border border-violet-200">
              <MessageSquare className="w-3 h-3" /> Replyable
            </span>
          )}
        </div>
      </div>

      <SentimentBar score={cluster.average_sentiment} />
      <p className={`text-xs mt-1 ${sentimentColor(cluster.average_sentiment)}`}>
        {sentimentLabel(cluster.average_sentiment)} sentiment
      </p>

      {cluster.reply_suggestions?.ai_reply && (
        <div className="mt-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Reply Suggestions
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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
                    <p className="text-xs text-gray-500 uppercase tracking-wide">AI Reply</p>
                    <CopyButton text={cluster.reply_suggestions.ai_reply} />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {cluster.reply_suggestions.ai_reply}
                  </p>

                  {mentions && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mention List</p>
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

function PatternBadge({ label }: { label: string }) {
  const clean = label.replace(/[\[\]]/g, "");
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs">
      <Hash className="w-3 h-3" /> {clean}
    </span>
  );
}

function TimelineGroup({ actions }: { actions: RecommendedAction[] }) {
  const groups: Record<string, RecommendedAction[]> = {};
  actions.forEach((a) => {
    const key = a.timeline || "Unspecified";
    groups[key] = [...(groups[key] || []), a];
  });

  const timelineColors: Record<string, string> = {
    "Short‑term (0‑3 months)": "bg-emerald-500",
    "Medium‑term (3‑6 months)": "bg-amber-400",
    "Long‑term (6‑12 months)": "bg-violet-500",
    Ongoing: "bg-blue-500",
  };

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([timeline, items]) => (
        <div key={timeline}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${timelineColors[timeline] ?? "bg-gray-400"}`} />
            <p className="text-xs text-gray-500 uppercase tracking-wide">{timeline}</p>
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-gray-100">
            {items.map((a, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-violet-600 mb-1">{a.owner}</p>
                <p className="text-sm text-gray-700">{a.action}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = ["Overview", "Topics", "Intelligence", "Article"] as const;
type Tab = typeof TABS[number];

export function CampaignView({ campaign }: { campaign: Campaign }) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [articleExpanded, setArticleExpanded] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const pdfMeta = {
    keywords: safeJSON<string[]>(campaign.query, []),
    platforms: safeJSON<string[]>(campaign.platforms, []),
    start_date: campaign.start_date,
    end_date: campaign.end_date,
  };

  const withDownload = (key: string, fn: () => Promise<void>) => async () => {
    setDownloading(key);
    try { await fn(); } finally { setDownloading(null); }
  };

  // Parse all JSON fields
  const keywords = safeJSON<string[]>(campaign.query, []);
  const platforms = safeJSON<string[]>(campaign.platforms, []);
  const platformStats = safeJSON<Record<string, PlatformStats>>(campaign.platform_stats, {});
  const topicClusters = safeJSON<{ merged_topics: TopicCluster[] }>(campaign.campaign_topic_clusters, { merged_topics: [] });
  const report = safeJSON<CampaignReport>(campaign.campaign_report, null as unknown as CampaignReport);
  const stats = safeJSON<CampaignStatistics>(campaign.campaign_statistics, { total_posts: 0, aligned_posts: 0, neutral_posts: 0, opposing_posts: 0 });

  const assessment = report?.updated_campaign_assessment;

  // Build agreement chart data from X stats
  const xStats = platformStats["x"];
  const agreementData = xStats
    ? [
        { name: "Agree", value: xStats.agreement_distribution.agree, color: "#10b981" },
        { name: "Neutral", value: xStats.agreement_distribution.neutral, color: "#94a3b8" },
        { name: "Disagree", value: xStats.agreement_distribution.disagree, color: "#f43f5e" },
      ]
    : [];

  const sentimentData = xStats
    ? [
        { name: "Positive", value: xStats.sentiment_distribution.positive ?? 0, fill: "#10b981" },
        { name: "Neutral", value: xStats.sentiment_distribution.neutral, fill: "#94a3b8" },
        { name: "Negative", value: xStats.sentiment_distribution.negative, fill: "#f43f5e" },
      ]
    : [];

  const statusColors: Record<string, string> = {
    collected: "bg-emerald-100 text-emerald-700 border-emerald-200",
    processing: "bg-amber-100 text-amber-700 border-amber-200",
    pending: "bg-gray-100 text-gray-600 border-gray-200",
    completed: "bg-violet-100 text-violet-700 border-violet-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900 px-6 pt-10 pb-16">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.3) 0%, transparent 50%)"
        }} />

        <div className="relative max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/40 text-xs mb-5">
            <Globe className="w-3.5 h-3.5" />
            <span>Campaigns</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-white/70">#{campaign.id}</span>
          </div>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl text-white mb-2">
                {keywords.join(", ") || "Keyword Campaign"}
              </h1>
              <p className="text-white/60 text-sm">{campaign.description}</p>
            </div>
            <span className={`self-start px-3 py-1 rounded-full text-xs border capitalize ${statusColors[campaign.status] ?? "bg-gray-100 text-gray-600"}`}>
              {campaign.status}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 mb-6">
            {keywords.map((kw) => (
              <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm border border-white/20">
                <Search className="w-3.5 h-3.5 opacity-70" /> {kw}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-white/50 text-xs">
            {/* Platforms */}
            <div className="flex items-center gap-2">
              {platforms.map((p) => {
                const meta = PLATFORM_META[p];
                return meta ? (
                  <span key={p} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs">
                    {meta.icon} {meta.label}
                  </span>
                ) : null;
              })}
            </div>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(campaign.start_date)} — {formatDate(campaign.end_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Updated {formatDate(campaign.last_heartbeat)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 mb-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Posts", value: stats.total_posts, icon: <Activity className="w-4 h-4" />, color: "text-slate-700", bg: "bg-white" },
            { label: "Aligned", value: stats.aligned_posts, icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
            { label: "Neutral", value: stats.neutral_posts, icon: <Minus className="w-4 h-4" />, color: "text-slate-500", bg: "bg-slate-50 border-slate-100" },
            { label: "Opposing", value: stats.opposing_posts, icon: <TrendingDown className="w-4 h-4" />, color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border shadow-sm p-5 ${s.bg}`}>
              <div className={`flex items-center gap-1.5 mb-2 ${s.color}`}>
                {s.icon}
                <span className="text-xs uppercase tracking-wide opacity-70">{s.label}</span>
              </div>
              <p className={`text-3xl tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
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

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "Overview" && (
          <div className="space-y-6 pb-16">
            {/* Platform coverage */}
            <div>
              <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-500" /> Platform Coverage
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {platforms.map((p) => {
                  const meta = PLATFORM_META[p];
                  const pStats = platformStats[p];
                  const hasData = !!pStats;
                  return (
                    <div key={p} className={`rounded-2xl border p-5 ${hasData ? "bg-white" : "bg-gray-50"}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-xl ${meta?.bg} flex items-center justify-center text-white shadow-sm`}>
                          {meta?.icon}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">{meta?.label ?? p}</p>
                          <p className="text-xs text-gray-400">{hasData ? `${pStats.posts} posts` : "No data yet"}</p>
                        </div>
                      </div>
                      {hasData ? (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Agree</span>
                            <span className="text-emerald-600">{pStats.agreement_distribution.agree}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Neutral</span>
                            <span className="text-gray-500">{pStats.agreement_distribution.neutral}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Disagree</span>
                            <span className="text-rose-500">{pStats.agreement_distribution.disagree}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-xs text-amber-600">Awaiting data</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charts - only show if X has data */}
            {xStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border p-5">
                  <h3 className="text-sm text-gray-700 mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-violet-500" /> Agreement Distribution (X)
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={agreementData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {agreementData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} posts`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {agreementData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border p-5">
                  <h3 className="text-sm text-gray-700 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-500" /> Sentiment Breakdown (X)
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={sentimentData} barSize={32}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip formatter={(v) => [`${v}%`]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {sentimentData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Consensus signal */}
            {assessment?.consensus_signal && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
                <h3 className="text-sm text-violet-700 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Consensus Signal
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{assessment.consensus_signal}</p>
              </div>
            )}
          </div>
        )}

        {/* ── TOPICS TAB ── */}
        {activeTab === "Topics" && (
          <div className="pb-16">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base text-gray-700 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-500" />
                Topic Clusters
                <span className="text-xs text-gray-400 ml-1">({topicClusters.merged_topics.length})</span>
              </h2>
              <DownloadButton
                label="Download PDF"
                loading={downloading === "topics"}
                onClick={withDownload("topics", () =>
                  downloadTopicsPDF(topicClusters.merged_topics, pdfMeta)
                )}
              />
            </div>
            <div className="space-y-4">
              {topicClusters.merged_topics.length > 0
                ? topicClusters.merged_topics.map((c, i) => (
                    <TopicClusterCard key={c.cluster_id} cluster={c} index={i} />
                  ))
                : <p className="text-gray-400 text-sm">No topic clusters available.</p>
              }
            </div>
          </div>
        )}

        {/* ── INTELLIGENCE TAB ── */}
        {activeTab === "Intelligence" && assessment && (
          <div className="space-y-8 pb-16">

            {/* Tab header with download */}
            <div className="flex items-center justify-between">
              <h2 className="text-base text-gray-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-500" /> Strategic Intelligence
              </h2>
              <DownloadButton
                label="Download PDF"
                loading={downloading === "intelligence"}
                onClick={withDownload("intelligence", () =>
                  downloadIntelligencePDF(assessment, pdfMeta)
                )}
              />
            </div>

            {/* Detected Patterns */}
            <div>
              <h2 className="text-base text-gray-700 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-violet-500" /> Detected Patterns
              </h2>
              <div className="flex flex-wrap gap-2">
                {assessment.detected_patterns.map((p, i) => (
                  <PatternBadge key={i} label={p} />
                ))}
              </div>
            </div>

            {/* Overall Sentiment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Emotional Split</p>
                <p className="text-sm text-gray-700">{assessment.overall_sentiment.emotional_split}</p>
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Agreement on Fact</p>
                <p className="text-sm text-gray-700">{assessment.overall_sentiment.agreement_on_fact}</p>
              </div>
            </div>

            {/* Engagement Integrity */}
            <div className="bg-white rounded-2xl border p-5">
              <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-500" /> Engagement Integrity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Classification</p>
                  <p className="text-gray-700">{assessment.engagement_integrity.classification}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Language Signal</p>
                  <p className="text-gray-700">{assessment.engagement_integrity.language_signal}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Reasoning Density</p>
                  <p className="text-gray-700">{assessment.engagement_integrity.reasoning_density}</p>
                </div>
              </div>
            </div>

            {/* Friction & Dissent */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h2 className="text-base text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Friction & Dissent
              </h2>
              <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-xs mb-3">
                {assessment.friction_dissent.type}
              </span>
              <p className="text-sm text-gray-700 mb-2">{assessment.friction_dissent.summary}</p>
              <p className="text-sm text-gray-500">{assessment.friction_dissent.explanation}</p>
            </div>

            {/* Key Hypotheses */}
            <div>
              <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-violet-500" /> Key Hypotheses
              </h2>
              <div className="space-y-3">
                {assessment.key_hypotheses.map((h, i) => (
                  <details key={i} className="group bg-white rounded-2xl border overflow-hidden">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-xs text-violet-600 mb-0.5">{h.driver_title}</p>
                          <p className="text-sm text-gray-700">{h.hypothesis}</p>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-3 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-5 pb-4 pt-0 border-t border-gray-50">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mt-3 mb-1">Evidence</p>
                      <p className="text-sm text-gray-600 italic">"{h.evidence_excerpt}"</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Linguistic Signals */}
            <div>
              <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" /> Linguistic Signals
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assessment.linguistic_signals.map((ls, i) => (
                  <div key={i} className="bg-white rounded-2xl border p-4">
                    <p className="text-sm text-gray-900 mb-1">"{ls.phrase}"</p>
                    <p className="text-xs text-gray-400 mb-2">Literal: {ls.literal_meaning}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{ls.social_meaning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div>
              <h2 className="text-base text-gray-700 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-500" /> Recommended Actions
              </h2>
              <TimelineGroup actions={assessment.recommended_actions} />
            </div>

            {/* Executive Implication */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5">
              <h2 className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" /> Executive Implication
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Monitor Next</p>
                  <p className="text-white/80 leading-relaxed">{assessment.executive_implication.monitor_next}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Risk / Opportunity</p>
                  <p className="text-white/80 leading-relaxed">{assessment.executive_implication.risk_or_opportunity}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Decision Makers</p>
                  <p className="text-white/80 leading-relaxed">{assessment.executive_implication.decision_makers_should_understand}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ARTICLE TAB ── */}
        {activeTab === "Article" && (
          <div className="pb-16">
            <div className="flex items-center justify-between mb-5 max-w-3xl">
              <h2 className="text-base text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" /> Campaign Article
              </h2>
              <DownloadButton
                label="Download PDF"
                loading={downloading === "article"}
                onClick={withDownload("article", () =>
                  downloadArticlePDF(campaign.campaign_article, pdfMeta)
                )}
              />
            </div>
            <div className="bg-white rounded-2xl border p-8 max-w-3xl">
              <div className={`prose prose-sm max-w-none overflow-hidden transition-all ${articleExpanded ? "" : "max-h-[500px]"}`}>
                {campaign.campaign_article.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) return <h2 key={i} className="text-base text-gray-800 mt-6 mb-2">{line.replace("## ", "")}</h2>;
                  if (line.startsWith("# ")) return <h1 key={i} className="text-xl text-gray-900 mb-3">{line.replace("# ", "")}</h1>;
                  if (line.startsWith("- ")) return <li key={i} className="text-sm text-gray-600 ml-4 mb-1 list-disc">{line.replace("- ", "")}</li>;
                  if (line.startsWith("| ") && line.includes("|")) return null;
                  if (line.trim() === "---") return <hr key={i} className="my-4 border-gray-100" />;
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">{line}</p>;
                })}
              </div>

              {!articleExpanded && (
                <div className="relative -mt-20 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}

              <button
                onClick={() => setArticleExpanded((v) => !v)}
                className="mt-4 flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors"
              >
                {articleExpanded ? (
                  <><ChevronUp className="w-4 h-4" /> Collapse article</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> Read full article</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
