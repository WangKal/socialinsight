import { motion } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { ThumbsUp, Meh, ThumbsDown } from "lucide-react";
import { useState } from "react";

export function AgreementDistribution({
  agree,
  neutral,
  disagree,
}: AgreementDistributionProps) {
  const [viewType, setViewType] = useState<"pie" | "bar">("pie");

  const data = [
    { name: "Agree", value: agree, color: "#10b981", icon: ThumbsUp },
    { name: "Neutral", value: neutral, color: "#f59e0b", icon: Meh },
    { name: "Disagree", value: disagree, color: "#ef4444", icon: ThumbsDown },
  ];

  const barData = [
    { name: "Agree", value: agree },
    { name: "Neutral", value: neutral },
    { name: "Disagree", value: disagree },
  ];

  const total = agree + neutral + disagree;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-xl sm:text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Agreement Distribution
        </h3>

        <div className="flex flex-wrap gap-2">
          {["pie", "bar"].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type as "pie" | "bar")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                viewType === type
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <span className="text-gray-600 text-sm">{item.name}</span>
            </div>

            <div className="text-2xl font-semibold" style={{ color: item.color }}>
              {item.value}%
            </div>

            <div className="text-xs text-gray-500 mt-1">
              {total > 0 ? Math.round((item.value / 100) * total) : 0} responses
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        key={viewType}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full h-[260px] sm:h-[350px]"
      >
        {viewType === "pie" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={window.innerWidth >= 640}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((_, index) => (
                  <Cell key={index} fill={data[index].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex h-3 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${agree}%` }}
            className="bg-green-500"
          />
          <motion.div
            animate={{ width: `${neutral}%` }}
            className="bg-amber-500"
          />
          <motion.div
            animate={{ width: `${disagree}%` }}
            className="bg-red-500"
          />
        </div>
      </div>
    </motion.div>
  );
}
