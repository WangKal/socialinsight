import { motion } from "motion/react";
import { Briefcase, TrendingUp, MessageSquare } from "lucide-react";

interface CampaignCardProps {
  name: string;
  postsCount: number;
  avgSentiment: number;
  avgAgreement: number;
  onClick: () => void;
}

export function CampaignCard({
  name,
  postsCount,
  avgSentiment,
  avgAgreement,
  onClick,
}: CampaignCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-xl p-5 shadow-md border border-gray-200 cursor-pointer group hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">{postsCount}</span>
        </div>
      </div>

      <h4 className="text-gray-900 mb-3 line-clamp-1">{name}</h4>

      <div className="flex items-center justify-between text-sm">
        <div>
          <div className="text-xs text-gray-500 mb-1">Sentiment</div>
          <div
            className={
              avgSentiment > 70
                ? "text-green-600"
                : avgSentiment > 40
                ? "text-amber-600"
                : "text-red-600"
            }
          >
            {avgSentiment}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Agreement</div>
          <div
            className={
              avgAgreement > 60
                ? "text-green-600"
                : avgAgreement > 40
                ? "text-amber-600"
                : "text-red-600"
            }
          >
            {avgAgreement}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
