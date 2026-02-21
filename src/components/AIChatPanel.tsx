import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, ChevronDown, ChevronUp, Copy, Check, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchAIResponse, AIHistory } from "@/services/socialEcho"; // fetch calls from services
import {useAuth } from "@/hooks/use-auth"
import { Link ,useNavigate} from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Reply {
  id?: string;
  username?: string;
  user_name?: string;
  text?: string;
  reply_text?: string;
  timestamp?: string;
  created_at?: string;
}

interface Message {
  role: "user" | "bot";
  text: string;
  replyMentions?: Reply[];
}

interface AIChatPanelProps {
  postContent: string;
  replies: Reply[];
  postUsername?: string;

}

export function AIChatPanel({ postContent, replies,  postUsername }: AIChatPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [expandedMentions, setExpandedMentions] = useState<number | null>(null);
  const [copiedMention, setCopiedMention] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
useEffect(() => {
  const fetchHistory = async () => {
    if (!user?.id) {
      console.warn("User not logged in. Skipping AI history fetch.");
      return;
    }

    try {
      const data = await AIHistory(user.id, postContent.id);
      const hydratedMessages: Message[] = (data.chats || []).map((msg) => {
        const hydratedReplies: Reply[] = (msg.reply_mentions || [])
          .map((mentionId) => {
            const match = replies.find((r) => r.id == String(mentionId));
            if (!match) return null;
            return normalizeReply(match);
          })
          .filter(Boolean) as Reply[];

        return { ...msg, replyMentions: hydratedReplies };
      });

      setMessages(hydratedMessages);
    } catch (err) {
      console.error("Failed to fetch AI chat history:", err);
    }
  };

  fetchHistory();
}, [postContent, replies, user?.id]);



  const normalizeReply = (reply: Reply) => ({
    id: reply.id || "",
    username: reply.username || reply.user_name || "user",
    text: reply.content || "",
    name: reply.displayName || "",
    sentiment:reply.sentiment || "",
    tone:reply.tone || "",
    timestamp: reply.timestamp || reply.created_at || "",
  });

const sendMessage = async () => {
  if (!user?.id) {
    toast({
      title: "Sign in required",
      description: "You need to log in to ask questions or see AI insights.",
      variant: "destructive",
    });
    return;
  }

  if (!input.trim()) return;
  if (messages.some(m => m.id === "waiting")) return;

  const pendingMessage: Message = {
    id: "waiting",
    question: input.trim(),
    answer: "",
    replyMentions: [],
  };

  setMessages(prev => [...prev, pendingMessage]);
  setInput("");
  setIsTyping(true);

  try {
    const response: AIResponse = await fetchAIResponse(
      user.id,
      pendingMessage.question,
      postContent
    );

    const hydratedMentions: Reply[] = (response.reply_mentions || [])
      .map((mentionId) => {
        const match = replies.find(r => r.id == String(mentionId));
        if (!match) return null;
        return normalizeReply(match);
      })
      .filter(Boolean) as Reply[];

    setMessages(prev =>
      prev.map(msg =>
        msg.id === "waiting"
          ? {
              ...msg,
              id: response.chat_id || Date.now().toString(),
              answer: response.answer || response.text,
              replyMentions: hydratedMentions,
            }
          : msg
      )
    );
  } catch (err) {
    console.error("AI error:", err);
    setMessages(prev =>
      prev.map(msg =>
        msg.id === "waiting"
          ? { ...msg, id: Date.now().toString(), answer: "Unable to generate answer." }
          : msg
      )
    );
  }

  setIsTyping(false);
};




  const copyMention = (username: string) => {
    navigator.clipboard.writeText(`@${username}`);
    setCopiedMention(username);
    setTimeout(() => setCopiedMention(null), 2000);
  };

  const copyAllMentions = (mentions: Reply[]) => {
    const allMentions = mentions.map(normalizeReply).map((m) => `@${m.username}`).join(" ");
    navigator.clipboard.writeText(allMentions);
    setCopiedMention("all");
    setTimeout(() => setCopiedMention(null), 2000);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => {
  if (!user) {
    toast({
      title: "Authentication Required",
      description:
        "You need to be signed in to access insights, analytics, and AI-powered tools.",
      variant: "destructive", // or custom warning variant
    });

    setTimeout(() => {
      navigate("/auth"); // or router.push("/auth")
    }, 1200);

    return;
  }

  setIsOpen(true);
}}

          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-violet-500/50 transition-all hover:scale-110"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[480px] z-50 bg-white shadow-2xl flex flex-col"
          >
                        {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">AI Assistant</h2>
                    <p className="text-sm text-white/90">Find insights within this post</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <Bot className="w-12 h-12 text-violet-500 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Ask me anything about this post!</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Try asking:</p>
                      {["Who should I mention?", "List all key users", "What's the sentiment?", "Give me top contributors"].map(
                        (q) => (
                          <button
                            key={q}
                            onClick={() => { setInput(q); sendMessage(); }}
                            className="block w-full text-left text-sm px-4 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors"
                          >
                            {q}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

           {/* Messages list */}
<AnimatePresence>
  {messages.map((msg, idx) => (
    <React.Fragment key={idx}>
      {/* User Question */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 justify-end"
      >
        {/* User Avatar */}
        <div className="bg-violet-100 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-violet-600" />
        </div>

        {/* Question Bubble */}
        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.question}</p>
        </div>
      </motion.div>

      {/* AI Answer */}
      {msg.id !="waiting" &&(<motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 justify-start mt-2"
      >
        {/* Bot Avatar */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-600 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>

        {/* Answer Bubble */}
        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white shadow-md text-gray-800">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.answer}</p>

          {/* Reply Mentions (only for bot) */}
          {msg.replyMentions && msg.replyMentions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    setExpandedMentions(expandedMentions === idx ? null : idx)
                  }
                  className="flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-700"
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
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
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

              {/* Reply Mentions List */}
              <AnimatePresence>
                {expandedMentions === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {msg.replyMentions.map((normalized) => (
                      <div
                        key={normalized.id}
                        className="bg-gray-50 rounded-lg p-3 flex items-start justify-between gap-2"
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                            {normalized.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-violet-600">
                                @{normalized.name}
                              </span>
                              {normalized.username && (
                                <span className="text-xs text-gray-500">
                                  {normalized.username}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-700 line-clamp-2">
                              {normalized.text}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => copyMention(normalized.username)}
                          className="flex-shrink-0 p-1.5 hover:bg-gray-200 rounded transition-colors"
                          title="Copy username"
                        >
                          {copiedMention === normalized.username ? (
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
      </motion.div>
      )}
    </React.Fragment>
  ))}
</AnimatePresence>



              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="bg-gradient-to-br from-violet-600 to-purple-600 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white shadow-md rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 0, 0].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                          className="w-2 h-2 bg-violet-400 rounded-full"
                        />
                      ))}
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
                  placeholder="Ask about users, mentions, sentiment..."
                  disabled={isTyping}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
