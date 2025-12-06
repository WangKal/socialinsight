import { motion } from "motion/react";
import { ArrowLeft, Calendar, MessageSquare, Repeat2 } from "lucide-react";
import { Button } from "../ui/button";

interface TweetNode {
  displayName?: string;
  username?: string;
  content?: string;
  quoted?: TweetNode;
}

interface AnalyticsHeaderProps {
  postInfo: {
    isRepost?: boolean;
    displayName?: string;
    username?: string;
    content?: string;
    quoted?: TweetNode;
  };
  detectedType?: string;
  timestamp?: string;
  onBack?: () => void;
}

export function AnalyticsHeader({ postInfo, detectedType, timestamp, onBack }: AnalyticsHeaderProps) {
 
const postData =JSON.parse(postInfo);
  const renderTweetChain = (node: TweetNode, isQuoted = false) => {
    if (!node) return null;

    return (
      <div className={`${isQuoted ? 'border-l-4 border-violet-400 pl-4 ml-4 mt-4' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
            {node.displayName?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-900">{node.displayName || 'Unknown User'}</span>
              <span className="text-gray-500">{node.username || 'username'}</span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{node.content || ''}</p>
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
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <h2 className="text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Post Analysis
          </h2>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {timestamp && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {timestamp}
            </div>
          )}
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Analysis
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-6">
        {postData.isRepost && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
          >
            <Repeat2 className="w-4 h-4" />
            Repost
          </motion.div>
        )}
        {detectedType && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
          >
            {detectedType}
          </motion.div>
        )}
      </div>

      {/* Post Content */}
      <div className="bg-gray-50 rounded-xl p-6">
        {renderTweetChain(postData)}
      </div>
    </motion.div>
  );
}
