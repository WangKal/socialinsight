import { motion } from "motion/react";
import {
  Gift,
  Trophy,
  MessageSquare,
  Search,
  Clock,
  Calendar,
  Users,
  Download,
  ArrowRight,
  Sparkles,
  ExternalLink,
  FileText,
  ChevronUp,
  ChevronDown,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import type { Reply } from "../components/promo/ReplyList";

// --- API functions (replace with your actual API calls) ---
import { getPromos, getPromoWinners, getPromoReplies } from "@/services/socialEcho";

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
  contactName:string;
     contactPhone:string;
     claimInstructions:string;
}
const promoBanners = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Midnight Aurora
  'linear-gradient(to right, #ff0844 0%, #ffb199 100%)', // Sun-Kissed
  'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',   // Soft Cloud
  'linear-gradient(45deg, #243949 0%, #517fa4 100%)',   // Blueprint
  'linear-gradient(to top, #00c6fb 0%, #005bea 100%)'    // Retro Pop
];

// Inside your component:
export default function PublicPromoView() {
  const navigate = useNavigate();

  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [winnerSearchQuery, setWinnerSearchQuery] = useState("");
  const [replySearchQuery, setReplySearchQuery] = useState("");
  const [shuffledReplies, setShuffledReplies] = useState<Reply[]>([]);
    const [showFullInstructions, setShowFullInstructions] = useState(false);

  // --- Fetch promos via React Query ---
  const { data: promos = [], isLoading, isError } = useQuery({
    queryKey: ["promos"],
    queryFn: getPromos,
  });

const handleViewPromo = async (promo: Promo) => {
  try {
    const [replies, winners] = await Promise.all([
      getPromoReplies(promo.id),
      getPromoWinners(promo.id),
    ]);

    setSelectedPromo({ ...promo, replies, winners });
    setShuffledReplies(replies);
    setWinnerSearchQuery("");
    setReplySearchQuery("");
  } catch (err) {
    console.error("Failed to fetch promo data:", err);
    setSelectedPromo({ ...promo, replies: [], winners: [] });
    setShuffledReplies([]);
  }
};
console.log(selectedPromo)
  const handleBack = () => {
    setSelectedPromo(null);
    navigate("/promos"); // adjust path if your list route differs
  };


const handleExportWinners = (promo: Promo) => {
  if (!promo.winners) return;

  const csvContent = [
    ["Rank", "Username", "Reply", "Timestamp"],
    ...promo.winners.map((w, i) => [
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
  a.download = `${promo.title.replace(/\s+/g, "-")}-winners.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const randomBanner = promoBanners[Math.floor(Math.random() * promoBanners.length)];

const processedPromo = selectedPromo
  ? {
      ...selectedPromo,
      winners: (selectedPromo.winners || []).map((w) => ({
        ...w,
        text: w.text ?? w.content, // normalize
        timestamp:
          typeof w.timestamp === "number"
            ? new Date(w.timestamp * 1000).toISOString()
            : w.timestamp,
      })),
      totalReplies: selectedPromo?.replies?.length || 0,
     promoUrl: selectedPromo?.promoUrl,
      brandingImage:selectedPromo?.brandingImage || randomBanner,
    requirementInstructions:selectedPromo?.requirementInstructions || "Think you can guess our new product name? Here's your chance to win!\n\nHow to enter:\n• Reply to this post with your guess\n• The first 5 correct answers will win a free 1-year Pro subscription\n• Only one entry per person\n\nHint: It's related to social media intelligence and starts with 'AI'",
     contactName:selectedPromo.contactName,
     contactPhone:selectedPromo.contactPhone,
     claimInstructions:selectedPromo.claimInstructions, 
      replies: (selectedPromo.replies || []).map((r) => ({
        ...r,
        text: r.text ?? r.content,
        timestamp:
          typeof r.timestamp === "number"
            ? new Date(r.timestamp * 1000).toISOString()
            : r.timestamp,
      })),
    }
  : null;

    const filteredWinners =
  processedPromo?.winners?.filter(
    (winner) =>
      winner.username
        .toLowerCase()
        .includes(winnerSearchQuery.toLowerCase()) ||
      winner.text
        .toLowerCase()
        .includes(winnerSearchQuery.toLowerCase())
  ) || [];

const filteredReplies = processedPromo?.replies?.filter(
  (reply) =>
    reply.username
      .toLowerCase()
      .includes(replySearchQuery.toLowerCase()) ||
    reply.text.toLowerCase().includes(replySearchQuery.toLowerCase())
);



  const getStatusColor = (status: Promo["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const distance = end - now;

    if (distance < 0) return "Ended";

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  // --- Loading / Error State ---
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading promos...
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load promos.
      </div>
    );

  // --- Selected Promo View ---
if (selectedPromo && processedPromo) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button variant="outline" onClick={() => setSelectedPromo(null)} className="mb-4">
              ← Back to Promos
            </Button>
        {/* Hero Section with Branding Image */}
            {processedPromo.brandingImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl"
              >
                <div className="relative h-[400px]">
                  <img
                    src={processedPromo.brandingImage}
                    alt={processedPromo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getStatusColor(processedPromo.status)}>
                        {processedPromo.status}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        <Trophy className="w-3 h-3 mr-1" />
                        {processedPromo.numberOfWinners} Winners
                      </Badge>
                    </div>
                    <h1 className="text-5xl text-white mb-3">{processedPromo.title}</h1>
                    <p className="text-xl text-white/90 mb-6">{processedPromo.description}</p>
                    
                    {/* Prominent CTA Button */}
                    {processedPromo.promoUrl && (
                      <motion.a
                        href={processedPromo.promoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg shadow-2xl hover:shadow-violet-500/50 transition-all group"
                      >
                        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        <span>Enter Giveaway Now</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <ExternalLink className="w-4 h-4" />
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-4 shadow-lg border-2 border-violet-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-violet-600" />
                  <span className="text-sm text-gray-600">Prize</span>
                </div>
                <p className="text-gray-900">{processedPromo.prize}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Time Left</span>
                </div>
                <p className="text-lg text-blue-600">{getTimeRemaining(processedPromo.endTime)}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Total Entries</span>
                </div>
                <p className="text-2xl text-gray-900">{processedPromo.totalReplies}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-4 shadow-lg border-2 border-yellow-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Winners</span>
                </div>
                <p className="text-2xl text-yellow-600">{processedPromo.winners?.length || 0} / {processedPromo.numberOfWinners}</p>
              </motion.div>
            </div>

            {/* Requirements Section */}
            {processedPromo.requirementInstructions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
                    <FileText className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-gray-900">How to Enter</h2>
                    <p className="text-sm text-gray-600">Follow these steps to participate</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 space-y-6">
  
  {/* REQUIREMENTS */}
  {processedPromo.requirementInstructions && (
    <div>
      <p className="text-sm text-gray-500 mb-1">Requirements</p>
      <div className="text-gray-900 whitespace-pre-wrap">
        {showFullInstructions || processedPromo.requirementInstructions.length <= 200
          ? processedPromo.requirementInstructions
          : `${processedPromo.requirementInstructions.substring(0, 200)}...`}
      </div>

      {processedPromo.requirementInstructions.length > 200 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFullInstructions(!showFullInstructions)}
          className="mt-2 flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
        >
          {showFullInstructions ? (
            <>
              <ChevronUp className="w-5 h-5" />
              <span>Show less</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              <span>See more</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  )}

  {/* CLAIM INSTRUCTIONS */}
  {processedPromo.claimInstructions && (
    <div>
      <p className="text-sm text-gray-500 mb-1">How to Claim</p>
      <p className="text-gray-900 whitespace-pre-wrap">
        {processedPromo.claimInstructions}
      </p>
    </div>
  )}

  {/* CONTACT DETAILS */}
  {(processedPromo.contactName || processedPromo.contactPhone) && (
    <div>
      <p className="text-sm text-gray-500 mb-1">Contact</p>
      <div className="text-gray-900 space-y-1">
        {processedPromo.contactName && (
          <p>
            <span className="font-medium">Name:</span> {processedPromo.contactName}
          </p>
        )}
        {processedPromo.contactPhone && (
          <p>
            <span className="font-medium">Phone:</span> {processedPromo.contactPhone}
          </p>
        )}
      </div>
    </div>
  )}

</div>

                {/* CTA Button in Requirements 
                {processedPromo.promoUrl && (
                  <div className="mt-6 text-center">
                    <motion.a
                      href={processedPromo.promoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-10 py-4 rounded-xl text-lg shadow-xl hover:shadow-violet-500/50 transition-all group"
                    >
                      <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Participate on Twitter</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  </div>
                )}*/}
              
{/* Safety Disclaimer */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.65 }}
  className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
>
  <div className="flex items-start gap-3">
    <div className="p-2 bg-red-100 rounded-lg">
      ⚠️
    </div>
    <div>
      <h3 className="text-red-800 text-lg mb-2">Important Notice</h3>
      <p className="text-sm text-red-700 leading-relaxed">
        Participants should <strong>never send money or make any payment</strong> to participate in a promo.
        <br /><br />
        If a promo requires purchasing a product or service:
        <br />
        • Ensure the seller or shop is <strong>legitimate and verified</strong><br />
        • Proceed at your own discretion
        <br /><br />
      This platform is not responsible for payments, transactions, prize delivery, or interactions related to any promotion.</p>
    </div>
  </div>
</motion.div>


              </motion.div>

            )}
          </motion.div>


        <div className="grid lg:grid-cols-2 gap-8">
          {/* Winners Section */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    <h2 className="text-2xl text-gray-900">
                      Winners ({processedPromo.winners?.length || 0})
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportWinners(processedPromo)}
                    disabled={
                      !processedPromo.winners ||
                      processedPromo.winners.length === 0
                    }
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search winners..."
                    value={winnerSearchQuery}
                    onChange={(e) => setWinnerSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto">
                {filteredWinners.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {processedPromo.winners?.length === 0
                        ? "No winners announced yet"
                        : "No winners found"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredWinners.map((winner, index) => (
                      <motion.div
                        key={winner.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white flex-shrink-0">
                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                            {index > 2 && `#${index + 1}`}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 mb-1">
                              @{winner.username}
                            </p>
                            <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded border border-gray-200 mb-2">
                              {winner.text}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(winner.timestamp *1000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl text-gray-900">
                      All Replies ({processedPromo.replies?.length || 0})
                    </h2>
                  </div>
                  
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search replies..."
                    value={replySearchQuery}
                    onChange={(e) => setReplySearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto">
                {filteredReplies.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No replies found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReplies.map((reply, index) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`rounded-lg p-4 border-2 ${
                          reply.isWinner
                            ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                              reply.isWinner
                                ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                                : "bg-gradient-to-br from-blue-500 to-indigo-600"
                            }`}
                          >
                            {reply.isWinner
                              ? "🏆"
                              : reply.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-gray-900">
                                @{reply.username}
                              </p>
                              {reply.isWinner && (
                                <Badge className="bg-yellow-500 text-white text-xs">
                                  Winner
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded border border-gray-200 mb-2">
                              {reply.text}
                            </p>
                            <p className="text-xs text-gray-600">
                            
                              {new Date(reply.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


  // Promo List View
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Active Promos
          </h1>
          <p className="text-xl text-gray-600">
            Browse active giveaways and view winners
          </p>
        </motion.div>

        {/* Promos Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {promos.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => handleViewPromo(promo)}
            >
              {/* Branding Image with Title & Description Overlay */}
              {promo.brandingImage ? (
                <div className="relative h-64 overflow-hidden group/image">
                  <img
                    src={promo.brandingImage}
                    alt={promo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(promo.status)}>
                      {promo.status}
                    </Badge>
                  </div>

                  {/* Title & Description Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl text-white mb-2 line-clamp-2">
                      {promo.title}
                    </h3>
                    <p className="text-sm text-white/90 line-clamp-2">
                      {promo.description}
                    </p>
                  </div>
                </div>
              ) : (
                // Fallback for promos without branding image
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                    <div className="absolute top-4 right-4">
                      <Badge className={getStatusColor(promo.status)}>
                        {promo.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                {/* Creator Information */}
         {/* CREATED BY */}
{promo.createdBy && (
  <div className="mb-4 pb-4 border-b border-gray-200">
    <p className="text-sm text-gray-900 truncate">
      <span className="text-gray-500 mr-1">Promo created by:</span>
      {promo.createdBy}
    </p>
  </div>
)}

{/* CREATED FOR */}
{promo.createdFor && (
  <div className="mb-4 pb-4 border-b border-gray-200">
    <p className="text-xs text-gray-500 mb-1">Ad created for</p>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm flex-shrink-0">
        {promo.createdFor.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{promo.createdFor}</p>
        {promo.createdForHandle && (
          <p className="text-xs text-gray-500 truncate">
            {promo.createdForHandle}
          </p>
        )}
      </div>
    </div>
  </div>
)}

                {/* Prize Section */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-violet-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-shrink-0">Prize:</span>
                    <span className="text-sm text-gray-900 truncate">{promo.prize}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Entries</p>
                    <p className="text-xl text-gray-900">{promo.totalReplies}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Winners</p>
                    <p className="text-xl text-yellow-600">{console.log(promo)}{promo.winners || 0}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Max</p>
                    <p className="text-xl text-blue-600">{promo.numberOfWinners}</p>
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining(promo.endTime)}
                  </div>
                </div>

                {/* CTA Button */}
                <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white group">
                  View Promo Details
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
);
}