import { motion } from "motion/react";
import { ArrowLeft, MessageSquare, Trophy } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { PromoStatusBanner, PromoStatus } from "../components/promo/PromoStatusBanner";
import { PromoRulesCard } from "../components/promo/PromoRulesCard";
import { ReplyList, Reply } from "../components/promo/ReplyList";
import { WinnerList } from "../components/promo/WinnerList";
import { EvaluatePromoButton } from "../components/promo/EvaluatePromoButton";
import { PromoFormData } from "../components/promo/PromoForm";
import { getWinners, getReplies, evaluatePromo, getPromoById } from "@/services/socialEcho";

interface Promo extends PromoFormData {
  id: string;
  status: PromoStatus;
}

// Winner selection logic
function selectWinners(replies: Reply[], promo: Promo): Reply[] {
  const seenUsernames = new Set<string>();
  const uniqueReplies = replies.filter((reply) => {
    if (seenUsernames.has(reply.username)) return false;
    seenUsernames.add(reply.username);
    return true;
  });

  const sortedReplies = [...uniqueReplies].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let winners: Reply[] = [];

  switch (promo.type) {
    case "first-n":
      winners = sortedReplies.slice(0, promo.number_of_winners);
      break;
    case "every-nth":
      const interval = promo.interval || 10;
      for (let i = interval - 1; i < sortedReplies.length; i += interval) {
        winners.push(sortedReplies[i]);
        if (winners.length >= promo.number_of_winners) break;
      }
      break;
    case "correct-answer":
      const correctAnswer = promo.correct_answer || "";
      const matchingReplies = sortedReplies.filter((reply) => {
        const replyText = promo.case_sensitive ? reply.text : reply.text.toLowerCase();
        const answer = promo.case_sensitive ? correctAnswer : correctANswer.toLowerCase();
        return replyText.trim() === answer.trim();
      });
      winners = matchingReplies.slice(0, promo.number_of_winners);
      break;
    case "random":
      const shuffled = [...sortedReplies].sort(() => Math.random() - 0.5);
      winners = shuffled.slice(0, promo.number_of_winners);
      break;
  }

  return winners;
}

export default function PromoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<"replies" | "winners">("replies");

  // Fetch promo
  const { data: promo } = useQuery({
    queryKey: ["promo", id],
    queryFn: () => getPromoById(id!),
    enabled: !!id,
  });

  // Fetch replies
  const { data: replies = [] } = useQuery({
    queryKey: ["replies", id],
    queryFn: () => getReplies(id!),
    enabled: !!id,
  });

  // Fetch winners
  const { data: winners = [] } = useQuery({
    queryKey: ["winners", id],
    queryFn: () => getWinners(id!),
    enabled: !!id,
  });

  const repliesWithDuplicateFlags = replies.map((reply) => ({
    ...reply,
    isDuplicate:
      replies.filter((r) => r.username === reply.username).length > 1 &&
      replies.find((r) => r.username === reply.username)?.id !== reply.id,
  }));

  const mutation = useMutation({
    mutationFn: () => evaluatePromo(promo!),
    onSuccess: () => {
      queryClient.invalidateQueries(["replies", id]);
      queryClient.invalidateQueries(["winners", id]);
      setSelectedTab("winners");
    },
  });

  const isEvaluating = mutation.isPending;
  const hasBeenEvaluated = winners.length > 0;

  const handleEvaluate = () => {
    mutation.mutate();
  };

  const repliesWithWinners = repliesWithDuplicateFlags.map((reply) => ({
    ...reply,
    isWinner: winners.some((w) => w.id === reply.id),
  }));

  if (!promo) return <div>Loading promo...</div>;

  const canEvaluate = promo.status === "active" || promo.status === "completed";

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Promos
          </Button>

          <h1 className="text-5xl mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            {promo.title}
          </h1>
          {promo.description && <p className="text-xl text-gray-600">{promo.description}</p>}
        </motion.div>

        {/* Status Banner */}
        <div className="mb-8">
          <PromoStatusBanner status={promo.status} startTime={promo.start_time} endTime={promo.end_time} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Rules */}
          <div className="lg:col-span-1">
            <PromoRulesCard
              type={promo.type}
              numberOfWinners={promo.number_of_winners}
              interval={promo.interval}
              correctAnswer={promo.correct_answer}
              caseSensitive={promo.case_sensitive}
              startTime={promo.start_time}
              endTime={promo.end_time}
              prize={promo.prize}
            />
          </div>

          {/* Right Column - Replies & Winners */}
          <div className="lg:col-span-2 space-y-6">
            <EvaluatePromoButton
              onEvaluate={handleEvaluate}
              disabled={!canEvaluate}
              isEvaluating={isEvaluating}
              hasBeenEvaluated={hasBeenEvaluated}
            />

            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 flex">
                <button
                  onClick={() => setSelectedTab("replies")}
                  className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all ${
                    selectedTab === "replies"
                      ? "border-b-2 border-violet-600 text-violet-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Replies ({repliesWithWinners.length})
                </button>
                <button
                  onClick={() => setSelectedTab("winners")}
                  className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all ${
                    selectedTab === "winners"
                      ? "border-b-2 border-violet-600 text-violet-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                  Winners ({winners.length})
                </button>
              </div>

              <div className="p-6">
                {selectedTab === "replies" ? (
                  <ReplyList replies={repliesWithWinners} highlightValid />
                ) : (
                  <WinnerList winners={winners} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}