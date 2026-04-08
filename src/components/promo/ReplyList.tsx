import { motion } from "motion/react";
import { MessageSquare, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "../ui/badge";

export interface Reply {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  isWinner?: boolean;
  isDuplicate?: boolean;
}

interface ReplyListProps {
  replies: Reply[];
  highlightValid?: boolean;
  showSelection?: boolean;
  selectedReplies?: string[];
  onSelectReply?: (replyId: string) => void;
}

export function ReplyList({
  replies,
  highlightValid = false,
  showSelection = false,
  selectedReplies = [],
  onSelectReply,
}: ReplyListProps) {
  if (replies.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-xl text-gray-500">No replies yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Replies will appear here once your promo is active
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {replies.map((reply, index) => {
        const isSelected = selectedReplies.includes(reply.id);
        const isValid = !reply.isDuplicate;

        return (
          <motion.div
            key={reply.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-xl p-4 shadow-md border-2 transition-all ${
              reply.isWinner
                ? "border-green-500 bg-green-50"
                : reply.isDuplicate
                ? "border-orange-300 bg-orange-50"
                : isSelected
                ? "border-violet-500 bg-violet-50"
                : highlightValid && isValid
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Selection Checkbox */}
              {showSelection && (
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectReply?.(reply.id)}
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                </div>
              )}

              {/* Reply Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900">{reply.username}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(reply.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    {reply.isWinner && (
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Winner
                      </Badge>
                    )}
                    {reply.isDuplicate && (
                      <Badge variant="destructive" className="bg-orange-500">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Duplicate
                      </Badge>
                    )}
                    {highlightValid && isValid && !reply.isWinner && (
                      <Badge variant="outline" className="border-blue-500 text-blue-700">
                        Valid
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Reply Text */}
                <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  {console.log(reply)}
                  {reply.content}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
