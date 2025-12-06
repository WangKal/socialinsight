import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fetchMessages, sendMessage } from "@/services/socialEcho";
import { MessageSquare, Send, Paperclip, Image as ImageIcon, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import {useAuth} from "@/hooks/use-auth";

interface Message {
  id: string;
  sender: "user" | "admin";
  content: string;
  timestamp: string;
  attachment?: {
    type: "image" | "file";
    name: string;
    url: string;
  };
}

export default function Messaging() {
  const {user} = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");


  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const { data } = await fetchMessages();

    const formatted = (data || []).map((msg: any) => ({
      id: msg.id,
      sender: msg.sender,
      content: msg.content,
      timestamp: new Date(msg.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      attachment: msg.attachment_url
        ? {
            url: msg.attachment_url,
            name: msg.attachment_name,
            type: msg.attachment_type,
          }
        : undefined,
    }));

    // If DB has no messages → show the admin welcome message
    if (formatted.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "admin",
          content: "Hello! Welcome to our platform. How can I help you today?",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
    } else {
      setMessages(formatted);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage("");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    // Optimistic UI
    setMessages((prev) => [...prev, userMessage]);

    // Save user message to DB
   const result = await sendMessage(user.id,text);
if(result.error){
toast({
      title: "Messaging",
      description: "Error sending message.",
      variant: "destructive",
    });
  return
}
    // 🟪 If this is the FIRST EVER message from user → show UI admin response
    const hasRealMessages = messages.some((m) => m.sender !== "admin");

    if (!hasRealMessages) {
      setTimeout(() => {
        const uiAdminReply: Message = {
          id: crypto.randomUUID(),
          sender: "admin",
          content: "Thank you for your message. An admin will reply shortly.",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, uiAdminReply]);
      }, 1200);
    }

    // Reload DB messages (optional)
    setTimeout(() => loadMessages(), 300);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-sm text-gray-600">Chat with admin support</p>
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white">Admin Support</h3>
                <p className="text-xs text-white/80">Usually replies within minutes</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  } rounded-2xl p-4 shadow-sm`}
                >
                  {message.attachment && (
                    <div className="mb-2 p-3 bg-white/10 rounded-lg flex items-center gap-2">
                      {message.attachment.type === "image" ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <Paperclip className="w-4 h-4" />
                      )}
                      <span className="text-sm">{message.attachment.name}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === "user"
                        ? "text-white/70"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
