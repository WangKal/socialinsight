import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Post, Reply } from "./PostCard";

interface Message {
  role: "user" | "bot";
  text: string;
  replyMentions?: Reply[];
}

interface ChatSectionProps {
  post: Post;
}

export function ChatSection({ post }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [expandedMentions, setExpandedMentions] = useState<number | null>(null);
  const [copiedMention, setCopiedMention] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateAIResponse = (question: string): { text: string; mentions: Reply[] } => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("who") || lowerQuestion.includes("user") || lowerQuestion.includes("mention")) {
      const relevantReplies = post.replies.slice(0, 3);
      return {
        text: `Based on the discussion, several users have shared their thoughts:\n\n${relevantReplies.map((r) => `• @${r.username}`).join("\n")}\n\nThese users provided valuable insights. You can copy their usernames to mention them in your response on X or Facebook.`,
        mentions: relevantReplies,
      };
    }
    
    if (lowerQuestion.includes("what") || lowerQuestion.includes("about") || lowerQuestion.includes("summary")) {
      const relevantReplies = post.replies.filter((r) => r.text.length > 50).slice(0, 3);
      return {
        text: `This post discusses: "${post.content.slice(0, 150)}..."\n\nKey contributors include @${relevantReplies[0]?.username || "users"} who shared detailed insights. The conversation has ${post.replies.length} replies with diverse perspectives.`,
        mentions: relevantReplies,
      };
    }
    
    if (lowerQuestion.includes("opinion") || lowerQuestion.includes("think") || lowerQuestion.includes("sentiment")) {
      const relevantReplies = post.replies.slice(0, 4);
      return {
        text: `The sentiment is generally positive with varied perspectives:\n\n${relevantReplies.slice(0, 2).map((r) => `• @${r.username} shares supportive views`).join("\n")}\n\nYou can engage with these users by mentioning them in your response.`,
        mentions: relevantReplies,
      };
    }
    
    if (lowerQuestion.includes("agree") || lowerQuestion.includes("disagree") || lowerQuestion.includes("support")) {
      const relevantReplies = post.replies.slice(0, 3);
      return {
        text: `Looking at the replies, there are different viewpoints. Users like @${relevantReplies[0]?.username} have expressed their stance. Copy their usernames below to respond directly on your social platform.`,
        mentions: relevantReplies,
      };
    }
    
    if (lowerQuestion.includes("best") || lowerQuestion.includes("most") || lowerQuestion.includes("top") || lowerQuestion.includes("key")) {
      const relevantReplies = post.replies.slice(0, 4);
      return {
        text: `The most insightful contributions come from:\n\n${relevantReplies.map((r, i) => `${i + 1}. @${r.username}`).join("\n")}\n\nThese users added significant value to the conversation.`,
        mentions: relevantReplies,
      };
    }

    // Default response
    const relevantReplies = post.replies.slice(0, 3);
    return {
      text: `That's an interesting question! This post has ${post.replies.length} replies from engaged users. Notable contributors include @${relevantReplies[0]?.username}. Would you like me to provide more specific information?`,
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

    setTimeout(() => {
      const response = generateAIResponse(input);
      const botMessage: Message = {
        role: "bot",
        text: response.text,
        replyMentions: response.mentions,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const copyMention = (username: string) => {
    navigator.clipboard.writeText(`@${username}`);
    setCopiedMention(username);
    setTimeout(() => setCopiedMention(null), 2000);
  };

  const copyAllMentions = (mentions: Reply[]) => {
    const allMentions = mentions.map((m) => `@${m.username}`).join(" ");
    navigator.clipboard.writeText(allMentions);
    setCopiedMention("all");
    setTimeout(() => setCopiedMention(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Analysis Chat</h2>
            <p className="text-sm text-white/90">Ask questions about this post</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-sm">
              <Bot className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                Ask me anything about this post and its replies!
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">Try asking:</p>
                {[
                  "Who are the key users mentioned?",
                  "What's the general sentiment?",
                  "Summarize the main points",
                  "Who should I respond to?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="block w-full text-left text-sm px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-white shadow-md text-gray-800"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {msg.replyMentions && msg.replyMentions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setExpandedMentions(expandedMentions === idx ? null : idx)}
                        className="flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-700"
                      >
                        📌 {msg.replyMentions.length} Users to Mention
                        {expandedMentions === idx ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                      {expandedMentions === idx && (
                        <button
                          onClick={() => copyAllMentions(msg.replyMentions!)}
                          className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          {copiedMention === "all" ? (
                            <>
                              <Check className="w-3 h-3" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy All
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedMentions === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {msg.replyMentions.map((reply) => (
                            <div
                              key={reply.id}
                              className="bg-gray-50 rounded-lg p-3 flex items-start justify-between gap-2"
                            >
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <img
                                  src={reply.avatar}
                                  alt={reply.username}
                                  className="w-6 h-6 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-purple-600">
                                      @{reply.username}
                                    </span>
                                    <span className="text-xs text-gray-500">{reply.timestamp}</span>
                                  </div>
                                  <p className="text-xs text-gray-700 line-clamp-2">{reply.text}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => copyMention(reply.username)}
                                className="flex-shrink-0 p-1.5 hover:bg-gray-200 rounded transition-colors"
                                title="Copy username"
                              >
                                {copiedMention === reply.username ? (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-gray-600" />
                                )}
                              </button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              
              {msg.role === "user" && (
                <div className="bg-purple-100 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-purple-600" />
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
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-full h-10 w-10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white shadow-md rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
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
            placeholder="Ask about users, sentiment, key points..."
            disabled={isTyping}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
