import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { ThumbsUp, Meh, ThumbsDown } from "lucide-react";
import { useState } from "react";

interface AgreementDistributionProps {
  agree: number;
  neutral: number;
  disagree: number;
}

export function AgreementDistribution({ agree, neutral, disagree }: AgreementDistributionProps) {
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
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Agreement Distribution
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewType("pie")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewType === "pie"
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pie
          </button>
          <button
            onClick={() => setViewType("bar")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewType === "bar"
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <span className="text-gray-600">{item.name}</span>
            </div>
            <div className="text-3xl" style={{ color: item.color }}>
              {item.value}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {total > 0 ? Math.round((item.value / 100) * total) : 0} responses
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
      >
        {viewType === "pie" ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={data[index].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex h-4 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${agree}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-green-500"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${neutral}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="bg-amber-500"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${disagree}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="bg-red-500"
          />
        </div>
      </div>
    </motion.div>
  );
}
