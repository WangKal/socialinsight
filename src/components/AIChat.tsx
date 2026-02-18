import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, X, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Post, Reply } from "./PostCard";

interface Message {
  role: "user" | "bot";
  text: string;
  replyMentions?: Reply[];
  isTyping?: boolean;
}

interface AIChatProps {
  post: Post;
  onClose: () => void;
}

export function AIChat({ post, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateAIResponse = (question: string): { text: string; mentions: Reply[] } => {
    const lowerQuestion = question.toLowerCase();
    
    // Analyze question and provide relevant response
    if (lowerQuestion.includes("who") || lowerQuestion.includes("user")) {
      const relevantReplies = post.replies.filter((_, i) => i < 2);
      return {
        text: `Based on the discussion, several users have shared their thoughts. Notably, @${relevantReplies[0]?.username || "users"} provided valuable insights. The conversation shows a mix of perspectives from the community.`,
        mentions: relevantReplies,
      };
    }
    
    if (lowerQuestion.includes("what") || lowerQuestion.includes("about") || lowerQuestion.includes("summary")) {
      const relevantReplies = post.replies.filter((r) => r.text.length > 50).slice(0, 2);
      return {
        text: `This post is about ${post.content.slice(0, 100)}... The replies show interesting engagement, with @${relevantReplies[0]?.username || "users"} contributing thoughtful commentary.`,
        mentions: relevantReplies,
      };
    }
    
    if (lowerQuestion.includes("opinion") || lowerQuestion.includes("think")) {
      const relevantReplies = post.replies.filter((_, i) => i % 2 === 0).slice(0, 3);
      return {
        text: `Opinions are divided. Some users like @${relevantReplies[0]?.username || "user1"} and @${relevantReplies[1]?.username || "user2"} have shared their perspectives. The general sentiment appears to be mixed with thoughtful insights from the community.`,
        mentions: relevantReplies,
      };
    }
    
    if (lowerQuestion.includes("agree") || lowerQuestion.includes("disagree")) {
      const relevantReplies = post.replies.slice(0, 2);
      return {
        text: `Looking at the replies, there are different viewpoints. Users like @${relevantReplies[0]?.username || "user"} have expressed their agreement or concerns. It's a nuanced discussion worth exploring.`,
        mentions: relevantReplies,
      };
    }
    
    if (lowerQuestion.includes("best") || lowerQuestion.includes("most") || lowerQuestion.includes("top")) {
      const relevantReplies = post.replies.slice(0, 3);
      return {
        text: `Some of the most insightful replies come from @${relevantReplies[0]?.username || "users"}. Their contributions add depth to the conversation. Check out these highlighted responses for more context.`,
        mentions: relevantReplies,
      };
    }

    if (lowerQuestion.includes("when") || lowerQuestion.includes("time")) {
      const relevantReplies = post.replies.slice(-2);
      return {
        text: `This post was shared ${post.timestamp}. Recent activity includes replies from @${relevantReplies[0]?.username || "users"}, showing ongoing engagement with the topic.`,
        mentions: relevantReplies,
      };
    }
    
    // Default response
    const relevantReplies = post.replies.slice(0, 2);
    return {
      text: `That's an interesting question! Based on this post and its ${post.replies.length} replies, I can see there's active discussion. Users like @${relevantReplies[0]?.username || "users"} have contributed to the conversation. Would you like me to elaborate on any specific aspect?`,
      mentions: relevantReplies,
    };
  };

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateAIResponse(input);
      const botMessage: Message = {
        role: "bot",
        text: response.text,
        replyMentions: response.mentions,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Post Assistant</h2>
                <p className="text-sm text-white/80">Ask me anything about this post</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Post Preview */}
          <div className="bg-white/10 rounded-lg p-3 mt-4 backdrop-blur-sm">
            <div className="flex gap-2 items-start">
              <img
                src={post.avatar}
                alt={post.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">@{post.username}</p>
                <p className="text-sm text-white/90 line-clamp-2">{post.content}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-white shadow-md text-gray-800"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.replyMentions && msg.replyMentions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold mb-2 text-gray-600">
                        📌 Referenced Replies:
                      </p>
                      <div className="space-y-2">
                        {msg.replyMentions.map((reply) => (
                          <motion.div
                            key={reply.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gray-50 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={reply.avatar}
                                alt={reply.username}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-xs font-medium text-purple-600">
                                @{reply.username}
                              </span>
                              <span className="text-xs text-gray-500">{reply.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-700 line-clamp-2">{reply.text}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {msg.role === "user" && (
                  <div className="bg-purple-100 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white shadow-md rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything about this post..."
              disabled={isTyping}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Try asking:</span>
              {["What's this about?", "Who's mentioned?", "What do people think?"].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
