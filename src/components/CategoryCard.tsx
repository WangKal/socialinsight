import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  count: number;
  avgSentiment: number;
  avgAgreement: number;
  color: string;
  onClick: () => void;
}

export function CategoryCard({
  title,
  icon: Icon,
  count,
  avgSentiment,
  avgAgreement,
  color,
  onClick,
}: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="text-right">
          <div className="text-3xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {count}
          </div>
          <div className="text-sm text-gray-500">Posts</div>
        </div>
      </div>

      <h3 className="text-xl text-gray-900 mb-4">{title}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Avg Sentiment</div>
          <div
            className={`text-lg ${
              avgSentiment > 70
                ? "text-green-600"
                : avgSentiment > 40
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {avgSentiment}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Avg Agreement</div>
          <div
            className={`text-lg ${
              avgAgreement > 60
                ? "text-green-600"
                : avgAgreement > 40
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {avgAgreement}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
