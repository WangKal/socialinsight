import { motion } from "motion/react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Smile, Meh, Frown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface SentimentChartProps {
  positive: number;
  neutral: number;
  negative: number;
}

export function SentimentChart({ positive, neutral, negative }: SentimentChartProps) {
  const [viewType, setViewType] = useState<"area" | "radar">("area");

  const areaData = [
    { name: "Negative", value: negative },
    { name: "Neutral", value: neutral },
    { name: "Positive", value: positive },
  ];

  const radarData = [
    { sentiment: "Positive", value: positive, fullMark: 100 },
    { sentiment: "Neutral", value: neutral, fullMark: 100 },
    { sentiment: "Negative", value: negative, fullMark: 100 },
  ];

  const stats = [
    {
      label: "Positive",
      value: positive,
      color: "from-green-400 to-emerald-500",
      textColor: "text-green-600",
      icon: Smile,
    },
    {
      label: "Neutral",
      value: neutral,
      color: "from-yellow-400 to-amber-500",
      textColor: "text-amber-600",
      icon: Meh,
    },
    {
      label: "Negative",
      value: negative,
      color: "from-red-400 to-rose-500",
      textColor: "text-red-600",
      icon: Frown,
    },
  ];

  const dominantSentiment = positive > neutral && positive > negative
    ? "Positive"
    : neutral > negative
    ? "Neutral"
    : "Negative";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Sentiment Analysis
          </h3>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Dominant: {dominantSentiment}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewType("area")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewType === "area"
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setViewType("radar")}
            className={`px-4 py-2 rounded-lg transition-colors ${
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
      <div className="grid grid-cols-3 gap-4 mb-8">
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
            
            <motion.div
              className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        key={viewType}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-50 rounded-xl p-4"
      >
        {viewType === "area" ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#sentimentGradient)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="sentiment" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="Sentiment"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                animationDuration={800}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </motion.div>
  );
}
