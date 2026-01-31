import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Smile, Meh, Frown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface RateMetric {
  count: number;
  percentage: number;
}

interface SentimentChartProps {
  positive: RateMetric;
  neutral: RateMetric;
  negative: RateMetric;
}

export function SentimentChart({
  positive,
  neutral,
  negative,
}: SentimentChartProps) {
  const [viewType, setViewType] = useState<"area" | "radar">("area");

  const total =
    positive.count + neutral.count + negative.count;

  const areaData = [
    { name: "Negative", value: negative.count },
    { name: "Neutral", value: neutral.count },
    { name: "Positive", value: positive.count },
  ];

  const radarData = [
    { sentiment: "Positive", value: positive.percentage, fullMark: 100 },
    { sentiment: "Neutral", value: neutral.percentage, fullMark: 100 },
    { sentiment: "Negative", value: negative.percentage, fullMark: 100 },
  ];

  const stats = [
    {
      label: "Positive",
      value: positive.percentage,
      color: "from-green-400 to-emerald-500",
      icon: Smile,
      rawValue: positive.count,
    },
    {
      label: "Neutral",
      value: neutral.percentage,
      color: "from-yellow-400 to-amber-500",
      icon: Meh,
      rawValue: neutral.count,
    },
    {
      label: "Negative",
      value: negative.percentage,
      color: "from-red-400 to-rose-500",
      icon: Frown,
      rawValue: negative.count,
    },
  ];

  const dominantSentiment =
    positive.count > neutral.count && positive.count > negative.count
      ? "Positive"
      : neutral.count > negative.count
      ? "Neutral"
      : "Negative";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Sentiment Analysis
          </h3>
          <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Dominant: {dominantSentiment}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewType("area")}
            className={`px-4 py-2 rounded-lg ${
              viewType === "area"
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setViewType("radar")}
            className={`px-4 py-2 rounded-lg ${
              viewType === "radar"
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Radar
          </button>
        </div>
      </div>

      {/* Sentiment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${stat.color} text-white`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-6 h-6" />
              <span className="text-sm opacity-90">{stat.label}</span>
            </div>

            <div className="text-3xl">{stat.value}%</div>
            <div className="text-xs mt-1 text-white/80">
              ({stat.rawValue} responses)
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        key={viewType}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-50 rounded-xl p-4 w-full h-[260px] sm:h-[300px]"
      >
        {viewType === "area" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip formatter={(v: number) => `${v} responses`} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="sentiment" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip formatter={(v: number) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </motion.div>
  );
}
