import { motion, AnimatePresence } from "motion/react";
import { Hash, ChevronDown, ChevronUp, Users,Copy,Sparkles } from "lucide-react";
import { useState } from "react";

interface Reply {
  displayName?: string;
  content: string;
  sentiment?: string;
  agreement?: string;
  tone?: string;
}

interface Cluster {
  cluster_id: string;
  topic: string;
  replies: Reply[];
  replyable?: boolean;
  reply_suggestions?: { ai_reply: string; mention_list?: string };
}

interface Group {
  summary?: string;
  percentage?: number;
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
  const [activeTab, setActiveTab] = useState<"agree" | "neutral" | "disagree">("agree");

  // Track expanded clusters per group using index
  const [expandedClusters, setExpandedClusters] = useState<Record<string, Set<number>>>({
    agree: new Set(),
    neutral: new Set(),
    disagree: new Set(),
  });

  const toggleCluster = (clusterIndex: number) => {
    setExpandedClusters((prev) => {
      const currentSet = new Set(prev[activeTab]);
      if (currentSet.has(clusterIndex)) currentSet.delete(clusterIndex);
      else currentSet.add(clusterIndex);
      return { ...prev, [activeTab]: currentSet };
    });
  };
  const copyText = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };
  const tabs = [
    { id: "agree" as const, label: "Agree", color: "green", title: "Agreement Clusters" },
    { id: "neutral" as const, label: "Neutral", color: "amber", title: "Neutral Clusters" },
    { id: "disagree" as const, label: "Disagree", color: "red", title: "Disagreement Clusters" },
  ];

  const activeGroup: Group = groups[activeTab] || { clusters: [], summary: "", percentage: 0 };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-amber-600 bg-amber-50";
    }
  };

  const getAgreementColor = (agreement?: string) => {
    switch (agreement?.toLowerCase()) {
      case "agree":
        return "text-green-600 bg-green-50";
      case "disagree":
        return "text-red-600 bg-red-50";
      default:
        return "text-amber-600 bg-amber-50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
    >
      <h3 className="text-2xl mb-6 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
        Topic Clusters
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-lg transition-all ${
              activeTab === tab.id
                ? `bg-${tab.color}-500 text-white shadow-lg`
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Group Summary */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700">Group Summary</span>
          <span className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            {activeGroup.percentage.percentage ?? 0}%
          </span>
        </div>
        <p className="text-gray-600">{activeGroup.summary || "No summary available"}</p>
      </motion.div>

      {/* Clusters */}
      <div className="space-y-4">
        {activeGroup.clusters.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Hash className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No clusters found in this group</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <h3 className="text-2xl mb-6 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {tabs.find((tab) => tab.id === activeTab)?.title || ""}
            </h3>

            {activeGroup.clusters.map((cluster, index) => {
              const compositeKey = `${activeTab}|${index}`;
              const isExpanded = expandedClusters[activeTab].has(index);

              return (
                <motion.div
                  key={compositeKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Cluster Header */}
                  <button
                    onClick={() => toggleCluster(index)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900">{cluster.topic}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {cluster.replies.length} {cluster.replies.length === 1 ? "reply" : "replies"}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
{/* Cluster Replies */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 bg-gray-50"
                      >
                  {/* Replyable / AI Suggestion */}
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

                  
                        <div className="p-4 space-y-3">
                          {cluster.replies.map((reply, replyIndex) => (
                            <motion.div
                              key={replyIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: replyIndex * 0.05 }}
                              className="bg-white rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                                  {reply.displayName?.[0] ?? "?"}
                                </div>
                                <div className="flex-1">
                                  <div className="text-gray-900 mb-1">{reply.displayName}</div>
                                  <p className="text-gray-700 mb-3">{reply.content}</p>
                                  <div className="flex flex-wrap gap-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(
                                        reply.sentiment
                                      )}`}
                                    >
                                      {reply.sentiment}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${getAgreementColor(
                                        reply.agreement
                                      )}`}
                                    >
                                      {reply.agreement}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs text-purple-600 bg-purple-50">
                                      {reply.tone}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
