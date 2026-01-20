import { motion, AnimatePresence } from "motion/react";
import {
  Hash,
  ChevronDown,
  ChevronUp,
  Users,
  Copy,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface Reply {
  user: string;
  text: string;
  sentiment: string;
  agreement: string;
  tone: string;
}

interface Cluster {
  cluster_id: string;
  topic: string;
  replies: Reply[];
  replyable?: boolean;
  reply_suggestions?: {
    ai_reply?: string;
    mention_list?: string;
  };
}

interface Group {
  summary: string;
  percentage: number;
  clusters: Cluster[];
}

interface TopicClustersProps {
  groups: {
    agree?: Group;
    neutral?: Group;
    disagree?: Group;
  };
}

export function TopicClusters({ groups }: TopicClustersProps) {
  const [activeTab, setActiveTab] =
    useState<"agree" | "neutral" | "disagree">("agree");
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(
    new Set()
  );

  const toggleCluster = (clusterId: string) => {
    const next = new Set(expandedClusters);
    next.has(clusterId) ? next.delete(clusterId) : next.add(clusterId);
    setExpandedClusters(next);
  };

  const tabs = [
    { id: "agree" as const, label: "Agree", color: "green" },
    { id: "neutral" as const, label: "Neutral", color: "amber" },
    { id: "disagree" as const, label: "Disagree", color: "red" },
  ];

  const activeGroup =
    groups[activeTab] || { clusters: [], summary: "", percentage: 0 };

  const copyText = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const badge = (cls: string) =>
    `px-2 py-1 rounded-full text-xs max-w-full break-words ${cls}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-8 overflow-hidden"
    >
      <h3 className="text-2xl mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
        Topic Clusters
      </h3>

      <p className="text-sm text-gray-600 mb-6 max-w-full">
        Replies are grouped by similar opinions. Expand a cluster to see who
        said what — and reply to all of them at once.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[90px] px-3 py-2 rounded-lg transition-all text-sm ${
              activeTab === tab.id
                ? `bg-${tab.color}-500 text-white shadow`
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 text-sm">Overall sentiment</span>
          <span className="text-2xl font-semibold text-violet-600">
            {activeGroup.percentage}%
          </span>
        </div>
        <p className="text-gray-600 text-sm break-words">
          {activeGroup.summary || "No summary available"}
        </p>
      </motion.div>

      {/* Clusters */}
      <div className="space-y-4">
        <AnimatePresence>
          {activeGroup.clusters.map((cluster) => {
            const isExpanded = expandedClusters.has(cluster.cluster_id);

            return (
              <motion.div
                key={cluster.cluster_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border rounded-xl bg-white overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => toggleCluster(cluster.cluster_id)}
                  className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-gray-50"
                >
                  <div className="flex gap-3 min-w-0">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-violet-500 text-white flex items-center justify-center">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 break-words font-medium">
                        {cluster.topic}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {cluster.replies.length} replies
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-gray-50 border-t overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        {/* AI Suggestion */}
                        {cluster.reply_suggestions?.ai_reply && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                                <Sparkles className="w-4 h-4" />
                                Suggested Reply
                              </div>
                              <button
                                onClick={() =>
                                  copyText(
                                    cluster.reply_suggestions?.ai_reply
                                  )
                                }
                                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                              >
                                <Copy className="w-3 h-3" />
                                Copy
                              </button>
                            </div>
                            <p className="text-sm text-gray-800 break-words">
                              {cluster.reply_suggestions.ai_reply}
                            </p>
                          </div>
                        )}

                        {/* Mentions */}
                        {cluster.reply_suggestions?.mention_list && (
                          <div className="bg-white border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-gray-600">
                                People to mention
                              </span>
                              <button
                                onClick={() =>
                                  copyText(
                                    cluster.reply_suggestions?.mention_list
                                  )
                                }
                                className="flex items-center gap-1 text-xs text-violet-600 hover:underline"
                              >
                                <Copy className="w-3 h-3" />
                                Copy all
                              </button>
                            </div>
                            <p className="text-xs text-gray-700 break-all max-w-full">
                              {cluster.reply_suggestions.mention_list}
                            </p>
                          </div>
                        )}

                        {/* Replies */}
                        {cluster.replies.map((reply, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-lg border p-4"
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {reply.user}
                            </p>
                            <p className="text-sm text-gray-700 mt-1 break-words">
                              {reply.text}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className={badge("bg-green-50 text-green-600")}>
                                {reply.sentiment}
                              </span>
                              <span className={badge("bg-amber-50 text-amber-600")}>
                                {reply.agreement}
                              </span>
                              <span className={badge("bg-purple-50 text-purple-600")}>
                                {reply.tone}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
