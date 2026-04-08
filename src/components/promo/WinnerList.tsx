import { motion } from "motion/react";
import { Trophy, User, MessageSquare, Clock, Download, Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState } from "react";
import type { Reply } from "./ReplyList";

interface WinnerListProps {
  winners: Reply[];
}

export function WinnerList({ winners }: WinnerListProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyWinners = () => {
    const winnerText = winners
      .map((w, i) => `${i + 1}. @${w.username} - "${w.text}" (${new Date(w.timestamp).toLocaleString()})`)
      .join("\n");
    
    navigator.clipboard.writeText(winnerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWinners = () => {
    const csvContent = [
      ["Rank", "Username", "Reply", "Timestamp"],
      ...winners.map((w, i) => [
        (i + 1).toString(),
        w.username,
        w.text,
        new Date(w.timestamp).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promo-winners-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (winners.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 text-center">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-xl text-gray-500">No winners yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Winners will be displayed here after evaluation
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 shadow-lg border border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl text-gray-900">Winners Announced!</h3>
              <p className="text-sm text-gray-600">
                {winners.length} {winners.length === 1 ? "winner" : "winners"} selected
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyWinners}
              className="border-gray-300"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy List
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportWinners}
              className="border-gray-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Winners List */}
      <div className="space-y-4">
        {winners.map((winner, index) => (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-500 relative overflow-hidden"
          >
            {/* Winner Rank Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-500 to-orange-600 text-white px-4 py-1 rounded-bl-xl">
              <span className="text-sm">
                {index === 0 && "🥇"}
                {index === 1 && "🥈"}
                {index === 2 && "🥉"}
                {index > 2 && `#${index + 1}`}
              </span>
            </div>

            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xl text-gray-900">{winner.username}</p>
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    Winner
                  </Badge>
                </div>

                <div className="bg-green-50 rounded-lg p-4 mb-3 border border-green-200">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{winner.text}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(winner.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confetti Effect (Visual Enhancement) */}
      {winners.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2 }}
          className="fixed inset-0 pointer-events-none z-50"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: [
                  "#f59e0b",
                  "#10b981",
                  "#3b82f6",
                  "#ef4444",
                  "#8b5cf6",
                ][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
