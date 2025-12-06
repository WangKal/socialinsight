import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Filter, Search } from "lucide-react";
import { useState } from "react";

interface Reply {
  user: string;
  text: string;
  sentiment: string;
  agreement: string;
  tone: string;
}

interface RepliesSectionProps {
  replies: Reply[];
}

export function RepliesSection({ replies }: RepliesSectionProps) {
  // Ensure replies is always an array
  const safeReplies = Array.isArray(replies) ? replies : [];

  const [activeFilter, setActiveFilter] = useState<"all" | "agree" | "neutral" | "disagree">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReplies = safeReplies.filter((reply) => {
    const matchesFilter =
      activeFilter === "all" || reply.agreement.toLowerCase() === activeFilter;
    const matchesSearch =
      searchTerm === "" ||
      reply.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reply.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { id: "all" as const, label: "All", count: safeReplies.length },
    {
      id: "agree" as const,
      label: "Agree",
      count: safeReplies.filter((r) => r.agreement.toLowerCase() === "agree").length,
    },
    {
      id: "neutral" as const,
      label: "Neutral",
      count: safeReplies.filter((r) => r.agreement.toLowerCase() === "neutral").length,
    },
    {
      id: "disagree" as const,
      label: "Disagree",
      count: safeReplies.filter((r) => r.agreement.toLowerCase() === "disagree").length,
    },
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-amber-600 bg-amber-50";
    }
  };

  const getAgreementColor = (agreement: string) => {
    switch (agreement.toLowerCase()) {
      case "agree":
        return "border-green-500 bg-green-50";
      case "disagree":
        return "border-red-500 bg-red-50";
      default:
        return "border-amber-500 bg-amber-50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-violet-600" />
          <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            All Replies
          </h3>
          <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
            {filteredReplies.length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search replies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeFilter === filter.id
                ? "bg-violet-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Replies List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {filteredReplies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No replies found</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredReplies.map((reply, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={`p-4 rounded-xl border-l-4 ${getAgreementColor(
                  reply.agreement
                )} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    {reply.user[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900 mb-1">{reply.user}</div>
                    <p className="text-gray-700 mb-3">{reply.text}</p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${getSentimentColor(
                          reply.sentiment
                        )}`}
                      >
                        Sentiment: {reply.sentiment}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs text-blue-600 bg-blue-50">
                        Agreement: {reply.agreement}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs text-purple-600 bg-purple-50">
                        Tone: {reply.tone}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
