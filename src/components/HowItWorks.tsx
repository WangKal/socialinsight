import { motion, useInView } from "motion/react";
import { Upload, Cpu, LineChart, Sparkles, LinkIcon,Download,MousePointer } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    icon: Download, // Chrome extension download
    title: "Install the Extension",
    description: "Download our Chrome extension to capture posts directly from social media platforms (Currently X formely twitter is supported).",
    color: "violet",
  },
  {
    icon: MousePointer, // scrolling / auto-capture
    title: "Open & Capture the Post",
    description: "Open the post and scroll through it, or let Auto-Capture detect everything for you.",
    color: "blue",
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Our AI processes sentiment, topics, engagement signals, and agreement patterns.",
    color: "red",
  },
  {
    icon: LineChart,
    title: "View Insights",
    description: "Insights appear instantly both in the extension and on your dashboard here.",
    color: "green",
  },
  {
    icon: LinkIcon, // coming soon
    title: "Analyze by Link (Coming Soon)",
    description: "Paste a post link and get instant analysis without needing the extension.",
    color: "yellow",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="py-24 px-6 bg-gradient-to-b from-violet-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Get from data to insights in four simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-300 via-blue-300 to-purple-300 rounded-full"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                  {/* Number badge */}
                  <motion.div
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-${step.color}-400 to-${step.color}-600 flex items-center justify-center text-white`}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {index + 1}
                  </motion.div>

                  {/* Icon with animation */}
                  <motion.div
                    className={`mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-${step.color}-400 to-${step.color}-600 flex items-center justify-center mb-6`}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  <h3 className="text-xl mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>

                  {/* Animated particles */}
                  <motion.div
                    className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-${step.color}-200 to-${step.color}-300 rounded-full opacity-20`}
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>

                {/* Arrow connector for large screens */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 -translate-y-1/2 z-20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  >
                    <motion.div
                      animate={{
                        x: [0, 5, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <svg
                        className={`w-8 h-8 text-${step.color}-400`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
