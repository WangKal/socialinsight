import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Gift,
  Plus,
  Calendar,
  Users,
  Trophy,
  Eye,
  Loader2,
  Trash2,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { PromoFormData } from "../components/promo/PromoForm";
import { PromoStatus } from "../components/promo/PromoStatusBanner";
import { PromoTour } from "../components/PromoTour";
import type { Reply } from "../components/promo/ReplyList";
import { AdminPromoDetails } from "@/components/promo/AdminPromoDetails";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRepliesByPromoId,
  saveWinners,
  getPromos,
  savePromoSource,
  // add this in your service
  deletePromo,
} from "@/services/socialEcho";

interface Promo extends PromoFormData {
  id: string;
  status: PromoStatus;
  totalReplies?: number;
  winnersSelected?: number;
  winners?: Reply[];
  promo_url?: string | null;
}

// Winner selection logic
function selectWinners(replies: Reply[], promo: Promo): Reply[] {
  const seenUsernames = new Set<string>();
  const uniqueReplies = replies.filter((reply) => {
    if (seenUsernames.has(reply.username)) {
      return false;
    }
    seenUsernames.add(reply.username);
    return true;
  });

  const sortedReplies = [...uniqueReplies].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let winners: Reply[] = [];

  switch (promo.type) {
    case "first-n":
      winners = sortedReplies.slice(0, promo.numberOfWinners);
      break;

    case "every-nth":
      const interval = promo.interval || 10;
      for (let i = interval - 1; i < sortedReplies.length; i += interval) {
        winners.push(sortedReplies[i]);
        if (winners.length >= promo.numberOfWinners) break;
      }
      break;

    case "correct-answer":
      const correctAnswer = promo.correctAnswer || "";
      const matchingReplies = sortedReplies.filter((reply) => {
        const replyText = promo.caseSensitive ? reply.text : reply.text.toLowerCase();
        const answer = promo.caseSensitive ? correctAnswer : correctAnswer.toLowerCase();
        return replyText.trim() === answer.trim();
      });
      winners = matchingReplies.slice(0, promo.numberOfWinners);
      break;

    case "random":
      const shuffled = [...sortedReplies].sort(() => Math.random() - 0.5);
      winners = shuffled.slice(0, promo.numberOfWinners);
      break;
  }

  return winners;
}

export default function AdminPromos() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<"all" | PromoStatus>("all");
  const [evaluatingPromoId, setEvaluatingPromoId] = useState<string | null>(null);
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [viewPromo, setViewPromo] = useState(false);
  const [isFloatingDialogOpen, setIsFloatingDialogOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceUsername, setSourceUsername] = useState("");
  const [sourceName, setSourceName] = useState("");
  const queryClient = useQueryClient();

if (!user?.id) navigate("/");
const { data: promos = [], isLoading, isError } = useQuery({
  queryKey: ["promos", user?.id],
  queryFn: () => getPromos(user?.id),
  enabled: true, // optional, see below
});

  const evaluateMutation = useMutation({
    mutationFn: async ({ promoId, promo }: { promoId: string; promo: Promo }) => {
      const replies = await getRepliesByPromoId(promoId);
      const winners = selectWinners(replies, promo);
      await saveWinners(promoId, winners);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["promos"] });
      queryClient.invalidateQueries({ queryKey: ["replies", variables.promoId] });
      queryClient.invalidateQueries({ queryKey: ["winners", variables.promoId] });
    },
  });

  const deletePromoMutation = useMutation({
    mutationFn: async (promoId: string) => {
      return await deletePromo(promoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promos"] });
      toast({
        title: "Delete promo",
        description: "Promo deleted successfully",
        variant: "constructive",
      });
    },
    onError: () => {
      toast({
        title: "Delete promo",
        description: "Failed to delete promo",
        variant: "destructive",
      });
    },
  });

  const handleDeletePromo = (promoId: string) => {
    deletePromoMutation.mutate(promoId);
  };

  const handleRunEvaluation = (promoId: string) => {
    const promo = promos.find((p) => p.id === promoId);
    if (!promo) return;

    setEvaluatingPromoId(promoId);

    evaluateMutation.mutate(
      { promoId, promo },
      {
        onSettled: () => setEvaluatingPromoId(null),
      }
    );
  };

  const filteredPromos = promos.filter(
    (promo) => filterStatus === "all" || promo.status === filterStatus
  );

  const stats = {
    total: promos.length,
    active: promos.filter((p) => p.status === "active").length,
    scheduled: promos.filter((p) => p.status === "scheduled").length,
    completed: promos.filter((p) => p.status === "completed").length,
  };

  const handleSaveSource = () => {
    if (!selectedPromo) return;

    saveSourceMutation.mutate({
      promoId: selectedPromo.id,
      source: {
        url: sourceUrl,
        username: sourceUsername,
        name: sourceName,
      },
    });
  };

  const saveSourceMutation = useMutation({
    mutationFn: async ({ promoId, source }) => {
      return await savePromoSource(promoId, source);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promos"] });
      toast({
        title: "Adding promo source",
        description: "Source added successfully",
        variant: "constructive",
      });

      setIsSourceDialogOpen(false);
      setSourceUrl("");
      setSourceUsername("");
      setSourceName("");
      setSelectedPromo(null);
    },

    onError: () => {
      toast({
        title: "Adding promo source",
        description: "Failed to add source",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (promo: Promo) => {
    setSelectedPromo(promo);
    setViewPromo(true);
  };

  const handleBackFromDetails = () => {
    setSelectedPromo(null);
    setViewPromo(false);
  };

  const openSourceDialog = (promo: Promo) => {
    setSelectedPromo(promo);
    setIsSourceDialogOpen(true);
  };

  const getStatusColor = (status: PromoStatus) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "first-n":
        return "First N";
      case "every-nth":
        return "Every Nth";
      case "correct-answer":
        return "Quiz";
      case "random":
        return "Random";
      default:
        return type;
    }
  };

  if (viewPromo && selectedPromo) {
    return <AdminPromoDetails promo={selectedPromo} onBack={() => handleBackFromDetails()} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Admin - Promo Management
                </h1>
                <p className="text-xl text-gray-600">
                  Create promos and manage winner selection
                </p>
              </div>
              <Button
                onClick={() => {
                  navigate("/promo-create");
                }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-6 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Promo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <Gift className="w-8 h-8 text-violet-600" />
                <p className="text-sm text-gray-600">Total Promos</p>
              </div>
              <p className="text-4xl text-gray-900">{stats.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <p className="text-sm text-gray-600">Scheduled</p>
              </div>
              <p className="text-4xl text-gray-900">{stats.scheduled}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8 text-green-600" />
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <p className="text-4xl text-gray-900">{stats.active}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <p className="text-4xl text-gray-900">{stats.completed}</p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All Promos" },
              { id: "scheduled", label: "Scheduled" },
              { id: "active", label: "Active" },
              { id: "completed", label: "Completed" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id as any)}
                className={`px-6 py-2 rounded-lg transition-all whitespace-nowrap ${
                  filterStatus === filter.id
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-violet-400"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Promos Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPromos.map((promo, index) => {
              const shouldShowSourceState =
                promo.status === "scheduled" || promo.status === "active";
              const hasPromoUrl = !!promo.promo_url;

              return (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl text-gray-900">{promo.title}</h3>
                        <Badge className={getStatusColor(promo.status)}>{promo.status}</Badge>
                          {/* ✅ NEW TEST BADGE */}
  <Badge
    className={`${
      promo.test
        ? "bg-amber-100 text-amber-700 border border-amber-300"
        : "bg-emerald-100 text-emerald-700 border border-emerald-300"
    }`}
  >
    {promo.test ? "Test Promo" : "Live Promo"}
  </Badge>
                      </div>
                      {promo.description && (
                        <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getTypeLabel(promo.type)}</Badge>
                        <Badge variant="outline">{promo.numberOfWinners} Winners</Badge>
                      </div>
                    </div>
                  </div>

                  {promo.prize && (
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-violet-600" />
                        <span className="text-sm text-gray-700">Prize:</span>
                        <span className="text-sm text-gray-900">{promo.prize}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Total Replies</p>
                      <p className="text-2xl text-gray-900">{promo.totalReplies || 0}</p>
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        promo.winnersSelected ? "bg-yellow-50" : "bg-gray-50"
                      }`}
                    >
                      <p className="text-xs text-gray-600 mb-1">Winners Selected</p>
                      <p
                        className={`text-2xl ${
                          promo.winnersSelected ? "text-yellow-600" : "text-gray-400"
                        }`}
                      >
                        {promo.winnersSelected || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(promo.startTime).toLocaleDateString()}
                    </div>
                    <div>→</div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(promo.endTime).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => handleViewDetails(promo)}
                      variant="outline"
                      className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {shouldShowSourceState && (
                      <Button
                        onClick={() => openSourceDialog(promo)}
                        disabled={hasPromoUrl}
                        variant="outline"
                        className={`flex-1 border-0 text-white transition-all ${
                          hasPromoUrl
                            ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 cursor-not-allowed opacity-100"
                            : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 animate-pulse shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {hasPromoUrl ? "Source Added" : "Add Source"}
                      </Button>
                    )}

                    {promo.status === "scheduled" && (
                      <Button
                        onClick={() => handleDeletePromo(promo.id)}
                        disabled={deletePromoMutation.isPending}
                        variant="outline"
                        className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 text-white border-0 shadow-lg"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Promo
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Floating Button */}
{/* Floating Button */}
<button
  onClick={() => setIsFloatingDialogOpen(true)}
  className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full 
  bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 
  text-white shadow-2xl hover:scale-105 transition-all"
>
  <Sparkles className="w-5 h-5" />
  <span className="text-sm font-medium">How It Works</span>
</button>
      </div>

      {isSourceDialogOpen && selectedPromo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl mb-4">Enter Source Details</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Post URL (required)"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full border rounded-lg p-2"
              />

              <input
                type="text"
                placeholder="Username (optional)"
                value={sourceUsername}
                onChange={(e) => setSourceUsername(e.target.value)}
                className="w-full border rounded-lg p-2"
              />

              <input
                type="text"
                placeholder="Name (optional)"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (saveSourceMutation.isPending) return;
                  setIsSourceDialogOpen(false);
                }}
                disabled={saveSourceMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                className="flex-1 bg-violet-600 text-white"
                disabled={!sourceUrl}
                onClick={handleSaveSource}
              >
                Save Source
              </Button>
            </div>
          </div>
        </div>
      )}

    
{/* Floating Dialog */}
{isFloatingDialogOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
    <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
      <button
        onClick={() => setIsFloatingDialogOpen(false)}
        className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-4">How To</h2>

        <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50 p-4 sm:p-6">
          <PromoTour />
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
}