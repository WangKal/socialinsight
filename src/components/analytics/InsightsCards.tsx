import { motion } from "motion/react";
import { TrendingUp, Users, MessageCircle, Target, Activity, Award } from "lucide-react";

interface InsightsCardsProps {
  totalReplies: number;
  agreementRate: number;
  positiveRate: number;
  topicsCount: number;
}

export function InsightsCards({
  totalReplies,
  agreementRate,
  positiveRate,
  topicsCount,
}: InsightsCardsProps) {
  const insights = [
    {
      icon: MessageCircle,
      label: "Total Replies",
      value: totalReplies.toString(),
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: null,
    },
    {
      icon: TrendingUp,
      label: "Agreement Rate",
      value: `${agreementRate}%`,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      trend: agreementRate > 50 ? "+12%" : "-5%",
    },
    {
      icon: Award,
      label: "Positive Sentiment",
      value: `${positiveRate}%`,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: positiveRate > 60 ? "+8%" : "-3%",
    },
    {
      icon: Target,
      label: "Topics Identified",
      value: topicsCount.toString(),
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: null,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {insights.map((insight, index) => (
        <motion.div
          key={insight.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-200 overflow-hidden group"
        >
          {/* Animated gradient background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${insight.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${insight.bgColor} flex items-center justify-center`}>
                <insight.icon className={`w-6 h-6 ${insight.iconColor}`} />
              </div>
              {insight.trend && (
                <span
                  className={`text-sm ${
                    insight.trend.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {insight.trend}
                </span>
              )}
            </div>

            <div className="text-3xl mb-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {insight.value}
            </div>
            <div className="text-sm text-gray-600">{insight.label}</div>
          </div>

          {/* Decorative element */}
          <motion.div
            className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${insight.color} rounded-full opacity-10`}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
