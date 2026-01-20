import { motion } from "motion/react";
import { ArrowLeft, Calendar, MessageSquare, Repeat2 } from "lucide-react";
import { Button } from "../ui/button";

export function AnalyticsHeader({
  postInfo,
  detectedType,
  timestamp,
  platform,
  onBack,
}: AnalyticsHeaderProps) {
  const postData = typeof postInfo === "string" ? JSON.parse(postInfo) : postInfo;

  const renderTweetChain = (node: TweetNode, isQuoted = false) => {
    if (!node) return null;

    return (
      <div
        className={`${
          isQuoted ? "border-l-4 border-violet-400 pl-3 ml-3 mt-4" : ""
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
            {node.displayName?.[0] || "U"}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 truncate">
                {node.displayName || "Unknown User"}
              </span>
              <span className="text-gray-500 truncate">
                {node.username || "username"}
              </span>
            </div>

            {/* Text / Media */}
            {node.content && (
              typeof node.content === "object" ? (
                node.content.embed ? (
                  <div className="mt-3 w-full max-w-[320px]">
                    <div className="relative w-full aspect-[9/16] overflow-hidden rounded-xl">
                      <iframe
                        src={
                          node.content.embed.match(/src="([^"]+)"/)?.[1] ||
                          node.content.url
                        }
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 break-words overflow-hidden">
                    {node.content.url || ""}
                  </p>
                )
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap break-words overflow-hidden">
                  {node.content}
                </p>
              )
            )}
          </div>
        </div>

        {node.quoted && renderTweetChain(node.quoted, true)}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <h2 className="text-xl sm:text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Post Analysis
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {timestamp && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="truncate">{timestamp}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Analysis
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {postData.isRepost && (
          <motion.div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            <Repeat2 className="w-4 h-4" />
            Repost
          </motion.div>
        )}
        {detectedType && (
          <motion.div className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
            {detectedType}
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 overflow-hidden">
        {renderTweetChain(postData)}
      </div>
    </motion.div>
  );
}
