import { motion } from "motion/react";
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Users,
  TrendingUp,
  Download,
  MessageSquare,
  Clock,
  Gift,
  AlertCircle,
  Copy,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PromoFormData } from "@/components/promo/PromoForm";
import { PromoStatus } from "@/components/promo/PromoStatusBanner";
import { Reply } from "@/components/promo/ReplyList";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- API functions (replace with your actual API calls) ---
import { getPromos, getPromoWinners, getPromoReplies,getPromoById, updateWinner } from "@/services/socialEcho";

interface Promo {
  id: string;
  title: string;
  description: string;
  prize: string;
  startTime: string;
  endTime: string;
  totalReplies: number;
  numberOfWinners: number;
  status: "scheduled" | "active" | "completed";
  winners?: Reply[];
  replies?: Reply[];
  promoUrl: string;
  brandingImage:string;
  requirementInstructions:string;
  createdBy:string;
  createdFor:string;
  createForHandle:string;
}


interface AdminPromoDetailsProps {
  promo: Promo;
  onBack: () => void;
}


interface WinnerContact {
  winnerId: string;
  username: string;
  email: string;
  phone: string;
  socialHandle: string;
  prizeAwarded: boolean;
  awardedDate?: string;
  trackingNumber?: string;
  notes: string;
}

export function AdminPromoDetails({promo, onBack} : AdminPromoDetailsProps) {

  const { id } = promo.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [globalprize_awarded, setGlobalprize_awarded] = useState(false);
  const { toast } = useToast();
  const [promoLoading, setPromoLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [winners, setWinners] = useState([]);
  const [winnerContacts, setWinnerContacts] = useState([]);
  const [showFullInstructions, setShowFullInstructions] = useState(false)

useEffect(() => {
  async function fetchData() {
    setPromoLoading(true)
    const [repliesData, winnersData] = await Promise.all([
      getPromoReplies(promo.id),
      getPromoWinners(promo.id),
    ]);

    setReplies(repliesData || []);
    setWinners(winnersData || []);
  setPromoLoading(false)
  }

  if (promo?.id) fetchData();
}, [promo?.id]);

// 👉 Sorting logic here
useEffect(() => {
  if (!winners.length) return;

  const sorted = [...winners].sort((a, b) => {
    // Example: sort by awardedDate (newest first)
    return new Date(b.awardedDate || 0).getTime() - new Date(a.awardedDate || 0).getTime();
  });

  setWinnerContacts(sorted);
}, [winners]);
console.log(winners);
const updateWinnerMutation = useMutation({
  mutationFn: updateWinner,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["winners", id] });
  },
}); 
const handleTogglePrizeAwarded = (winnerId: string) => {

  const current = winnerContacts.find((c) => c.winnerId === winnerId);
  if (!current) return;

  const nextPrizeAwarded = !current.prizeAwarded;
  const nextAwardedDate = nextPrizeAwarded ? new Date().toISOString() : null;

  // optimistic local update
  setWinnerContacts((prev) =>
    prev.map((contact) =>
      contact.winnerId === winnerId
        ? {
            ...contact,
            prizeAwarded: nextPrizeAwarded,
            awardeDate: nextAwardedDate,
          }
        : contact
    )
  );

  // persist to DB
  updateWinnerMutation.mutate(
    {
      id: winnerId,
      prize_awarded: nextPrizeAwarded,
      awarded_date: nextAwardedDate,
    },
    {
      onSuccess: () => {
        toast({
          title: "Prize status updated",
          description: "Winner record saved successfully",
          variant: "default",
        });
      },
      onError: () => {
        // rollback if DB update fails
        setWinnerContacts((prev) =>
          prev.map((contact) =>
            contact.winnerId === winnerId
              ? {
                  ...contact,
                  prizeAwarded: current.prizeAwarded,
                  awardedDate: current.awardedDate ?? null,
                }
              : contact
          )
        );

        toast({
          title: "Update failed",
          description: "Could not save prize status",
          variant: "destructive",
        });
      },
    }
  );
};

const handleUpdateNotes = (winnerId: string, notes: string) => {
  const current = winnerContacts.find((c) => c.winnerId === winnerId);
  if (!current) return;

  setWinnerContacts((prev) =>
    prev.map((contact) =>
      contact.winnerId === winnerId ? { ...contact, notes } : contact
    )
  );

  updateWinnerMutation.mutate(
    {
      id: winnerId,
      notes,
    },
    {
      onSuccess: () => {
        toast({
          title: "Notes updated",
          description: "Winner notes saved successfully",
          variant: "default",
        });
      },
      onError: () => {
        setWinnerContacts((prev) =>
          prev.map((contact) =>
            contact.winnerId === winnerId
              ? { ...contact, notes: current.notes }
              : contact
          )
        );

        toast({
          title: "Update failed",
          description: "Could not save notes",
          variant: "destructive",
        });
      },
    }
  );
};

const handleUpdateTracking = (winnerId: string, trackingNumber: string) => {
  const current = winnerContacts.find((c) => c.winnerId === winnerId);
  if (!current) return;

  setWinnerContacts((prev) =>
    prev.map((contact) =>
      contact.winnerId === winnerId
        ? { ...contact, tracking_number: trackingNumber }
        : contact
    )
  );

  updateWinnerMutation.mutate(
    {
      id: winnerId,
      tracking_number: trackingNumber,
    },
    {
      onSuccess: () => {
        toast({
          title: "Tracking updated",
          description: "Tracking number saved successfully",
          variant: "default",
        });
      },
      onError: () => {
        setWinnerContacts((prev) =>
          prev.map((contact) =>
            contact.winnerId === winnerId
              ? { ...contact, tracking_number: current.tracking_number ?? "" }
              : contact
          )
        );

        toast({
          title: "Update failed",
          description: "Could not save tracking number",
          variant: "destructive",
        });
      },
    }
  );
};
  const handleExportWinners = () => {
    const csvContent = [
      ["Username", "Email", "Phone", "Social Handle", "Prize Awarded", "Awarded Date", "Tracking Number", "Notes"],
      ...winnerContacts.map((contact) => [
        contact.username,
        contact.email,
        contact.phone,
        contact.social_handle,
        contact.prizeAwarded ? "Yes" : "No",
        contact.awardedDate || "N/A",
        contact.trackingNumber || "N/A",
        contact.notes || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${promo.id}_winners.csv`;
    a.click();
    toast({
            title: "Export Winners",
            description: "Winners exported successfully",
            variant: "default",
          });
  };

  const handleCopyContact = (text: string) => {
    navigator.clipboard.writeText(text);
   toast({
            title: "Copy",
            description: "Copied to clipboard",
            variant: "default",
          });
  };

  console.log(winnerContacts)
  const allPrizesAwarded = winnerContacts.every((c) => c.prizeAwarded);
  const totalReplies = promo?.totalReplies || 0;
  const winnersCount = winners.length || 0;
  const uniqueParticipants = totalReplies; // In real scenario, would filter duplicates
  const participationRate = totalReplies > 0 ? 100 : 0;

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
        return "First N Participants";
      case "every-nth":
        return "Every Nth Participant";
      case "correct-answer":
        return "Correct Answer Quiz";
      case "random":
        return "Random Selection";
      default:
        return type;
    }
  };

if (promoLoading ) {
  return <div>Loading...</div>;
}

if (!promo) {
  return <div>Promo not found</div>;
}

 return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Promos
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-5xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {promo.title}
                </h1>
                <Badge className={getStatusColor(promo.status)}>
                  {promo.status}
                </Badge>
              </div>
              {promo.description && (
                <p className="text-xl text-gray-600 mb-2">{promo.description}</p>
              )}
              <p className="text-sm text-gray-500">Promo ID: {promo.id}</p>
            </div>

            <Button
              onClick={handleExportWinners}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
              disabled={winnersCount === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Winners
            </Button>
          </div>
        </motion.div>

        {/* Branding Image and Requirements */}
        {(promo.brandingImage || promo.requirementInstructions || promo.promoUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 grid lg:grid-cols-2 gap-6"
          >
            {/* Branding Image */}
            {promo.brandingImage && (
              <Card className="p-6 overflow-hidden">
                <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-violet-600" />
                  Promo Branding
                </h3>
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={promo.brandingImage}
                    alt={promo.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                {promo.promoUrl && (
                  <div className="mt-4">
                    <a
                      href={promo.promoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Promo Post
                    </a>
                  </div>
                )}
              </Card>
            )}

            {/* Requirement Instructions */}
            {promo.requirementInstructions && (
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-600" />
                  Participation Requirements
                </h3>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4">
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {showFullInstructions || promo.requirementInstructions.length <= 200
                      ? promo.requirementInstructions
                      : `${promo.requirementInstructions.substring(0, 200)}...`}
                  </div>
                  {promo.requirementInstructions.length > 200 && (
                    <button
                      onClick={() => setShowFullInstructions(!showFullInstructions)}
                      className="mt-3 flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      {showFullInstructions ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          See more
                        </>
                      )}
                    </button>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Prize Award Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card
            className={`p-6 border-2 ${
              allPrizesAwarded && winnersCount > 0
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {allPrizesAwarded && winnersCount > 0 ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                )}
                <div>
                  <h3 className="text-xl text-gray-900 mb-1">
                    Prize Distribution Status
                  </h3>
                  <p className="text-sm text-gray-600">
                    {allPrizesAwarded && winnersCount > 0
                      ? "All prizes have been awarded to winners"
                      : winnersCount > 0
                      ? `${winnerContacts.filter((c) => c.prizeAwarded).length} of ${winnersCount} prizes awarded`
                      : "No winners selected yet"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl text-gray-900 mb-1">
                  {winnerContacts.filter((c) => c.prizeAwarded).length}/{winnersCount}
                </div>
                <div className="text-sm text-gray-600">Prizes Delivered</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Promo Details */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-violet-600" />
                Promo Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Prize</label>
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-3 mt-1">
                    <p className="text-sm text-gray-900">{promo.prize || "Not specified"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Selection Type</label>
                  <p className="text-sm text-gray-900 mt-1">{getTypeLabel(promo.type)}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Number of Winners</label>
                  <p className="text-sm text-gray-900 mt-1">{promo.numberOfWinners}</p>
                </div>

                {promo.type === "every-nth" && (
                  <div>
                    <label className="text-sm text-gray-600">Interval</label>
                    <p className="text-sm text-gray-900 mt-1">Every {promo.interval}th participant</p>
                  </div>
                )}

                {promo.type === "correct-answer" && (
                  <div>
                    <label className="text-sm text-gray-600">Correct Answer</label>
                    <p className="text-sm text-gray-900 mt-1">{promo.correctAnswer}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Case sensitive: {promo.caseSensitive ? "Yes" : "No"}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Start Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {new Date(promo.startTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">End Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {new Date(promo.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Total Replies</span>
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl text-gray-900">{totalReplies}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Unique Participants</span>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl text-gray-900">{uniqueParticipants}</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Winners Selected</span>
                    <Trophy className="w-4 h-4 text-yellow-600" />
                  </div>
                  <p className="text-2xl text-yellow-600">{winnersCount}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Prizes Delivered</span>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl text-green-600">
                    {winnerContacts.filter((c) => c.prizeAwarded).length}
                  </p>
                </div>

                {winnersCount > 0 && (
                  <div className="bg-violet-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <TrendingUp className="w-4 h-4 text-violet-600" />
                    </div>
                    <p className="text-2xl text-violet-600">
                      {Math.round((winnerContacts.filter((c) => c.prizeAwarded).length / winnersCount) * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600" />
                Timeline
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900">Promo Created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(promo.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {promo.status !== "scheduled" && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900">Promo Started</p>
                      <p className="text-xs text-gray-500">
                        {new Date(promo.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {winnersCount > 0 && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900">Winners Selected</p>
                      <p className="text-xs text-gray-500">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {promo.status === "completed" && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900">Promo Ended</p>
                      <p className="text-xs text-gray-500">
                        {new Date(promo.endTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Winner Contacts */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-violet-600" />
                  Winner Contact Information
                </h3>
                {winnersCount > 0 && (
                  <Badge
                    variant="outline"
                    className={
                      allPrizesAwarded
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }
                  >
                    {allPrizesAwarded ? "All Complete" : "In Progress"}
                  </Badge>
                )}
              </div>

              {winnersCount === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No winners have been selected yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Run the evaluation to select winners
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {winnerContacts.map((contact, index) => (
                    <motion.div
                      key={contact.winnerId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border-2 rounded-xl p-6 transition-all ${
                        contact.prizeAwarded
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg text-gray-900">
                              {contact.username}
                            </h4>
                            {contact.prizeAwarded && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Prize Awarded
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">Winner #{index + 1}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Prize Delivered</span>
                          <Switch
                            checked={contact.prizeAwarded}
                            onCheckedChange={() =>
                              handleTogglePrizeAwarded(contact.winnerId)
                            }
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              Email
                            </div>
                            <button
                              onClick={() => handleCopyContact(contact.email)}
                              className="text-violet-600 hover:text-violet-700"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-900">{contact.email}</p>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              Phone
                            </div>
                            <button
                              onClick={() => handleCopyContact(contact.phone)}
                              className="text-violet-600 hover:text-violet-700"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-900">{contact.phone}</p>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              Social Handle
                            </div>
                            <button
                              onClick={() => handleCopyContact(contact.username)}
                              className="text-violet-600 hover:text-violet-700"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-900">
                              {contact.username}
                            </p>
                          
                          </div>
                        </div>

                        {contact.prizeAwarded && contact.awardedDate && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Awarded Date
                            </div>
                            <p className="text-sm text-gray-900">
                              {new Date(contact.awardedDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {contact.prizeAwarded && (
                        <div className="mb-4">
                          <label className="text-sm text-gray-600 mb-2 block">
                            Tracking Number
                          </label>
                          <Input
                            placeholder="Enter tracking number..."
                            value={contact.trackingNumber || ""}
                            onChange={(e) =>
                              handleUpdateTracking(contact.winnerId, e.target.value)
                            }
                            className="bg-white"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                          Admin Notes
                        </label>
                        <Textarea
                          placeholder="Add notes about this winner..."
                          value={contact.notes}
                          onChange={(e) =>
                            handleUpdateNotes(contact.winnerId, e.target.value)
                          }
                          className="bg-white min-h-[80px]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
