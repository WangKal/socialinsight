import { motion } from "motion/react";
import { Gift, Plus, Calendar, Users, Trophy, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { PromoFormData } from "../components/promo/PromoForm";
import { PromoStatus } from "../components/promo/PromoStatusBanner";
import { useQuery } from "@tanstack/react-query";
import { getPromos } from "@/services/socialEcho";

interface Promo extends PromoFormData {
  id: string;
  status: PromoStatus;
  total_replies?: number;
  winners_selected?: number;
}


export default function PromoList() {
  const [filterStatus, setFilterStatus] = useState<"all" | PromoStatus>("all");

const { data: promos = [], isLoading } = useQuery({
  queryKey: ["promos"],
  queryFn: getPromos,
});

  const filteredPromos = promos.filter(
  (promo) => filterStatus === "all" || promo.status === filterStatus
);

const stats = {
  total: promos.length,
  active: promos.filter((p) => p.status === "active").length,
  scheduled: promos.filter((p) => p.status === "scheduled").length,
  completed: promos.filter((p) => p.status === "completed").length,
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
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading promos...</p>
    </div>
  );
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Promo Engine
              </h1>
              <p className="text-xl text-gray-600">
                Create and manage giveaways for your social media campaigns
              </p>
            </div>
            <Button
              onClick={onCreatePromo}
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
        {filteredPromos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No promos found</p>
            <p className="text-sm text-gray-400 mb-6">
              Create your first promo to start engaging with your community
            </p>
            <Button
              onClick={onCreatePromo}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Promo
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPromos.map((promo, index) => (
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
                      <Badge className={getStatusColor(promo.status)}>
                        {promo.status}
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
                    <p className="text-2xl text-gray-900">{promo.total_replies || 0}</p>
                  </div>
                  {promo.winners_selected !== undefined && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Winners</p>
                      <p className="text-2xl text-yellow-600">{promo.winners_selected}</p>
                    </div>
                  )}
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

                <Button
                  onClick={() => onViewPromo(promo.id)}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
