import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown, Hash } from "lucide-react";

const samplePosts = [
  {
    text: "Just launched our new product! So excited to share this with everyone! 🚀",
    sentiment: "positive",
    agreement: 92,
    topics: ["Product Launch", "Excitement"],
  },
  {
    text: "The customer service was okay, nothing special but got the job done.",
    sentiment: "neutral",
    agreement: 45,
    topics: ["Customer Service", "Experience"],
  },
  {
    text: "Very disappointed with the quality. Expected much better for the price.",
    sentiment: "negative",
    agreement: 78,
    topics: ["Quality Issues", "Pricing"],
  },
  {
    text: "Absolutely love this feature! Game changer for our workflow! 💯",
    sentiment: "positive",
    agreement: 95,
    topics: ["Features", "Productivity"],
  },
];

export function LiveDemo() {
  const [currentPost, setCurrentPost] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentPost((prev) => (prev + 1) % samplePosts.length);
      }, 1500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const post = samplePosts[currentPost];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="w-6 h-6 text-green-500" />;
      case "negative":
        return <Frown className="w-6 h-6 text-red-500" />;
      default:
        return <Meh className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "from-green-400 to-emerald-500";
      case "negative":
        return "from-red-400 to-rose-500";
      default:
        return "from-yellow-400 to-orange-500";
    }
  };

  return (
    <div className="py-24 px-6 bg-gradient-to-b from-white to-violet-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Watch It In Action
          </h2>
          <p className="text-xl text-gray-600">
            Real-time analysis of social posts with AI precision
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Post Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500" />
                <div>
                  <div className="text-gray-500">Social Post</div>
                </div>
              </div>
              
              <motion.div
                key={currentPost}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-gray-700 text-lg leading-relaxed"
              >
                {post.text}
              </motion.div>

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full"
                    />
                    <span className="text-violet-600">Analyzing...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Analysis Results */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {/* Sentiment */}
            <motion.div
              key={`sentiment-${currentPost}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isAnalyzing ? 0.5 : 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Sentiment Analysis</span>
                {getSentimentIcon(post.sentiment)}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${getSentimentColor(post.sentiment)}`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="capitalize text-gray-700">{post.sentiment}</span>
              </div>
            </motion.div>

            {/* Agreement Score */}
            <motion.div
              key={`agreement-${currentPost}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isAnalyzing ? 0.7 : 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Agreement Score</span>
                {post.agreement > 70 ? (
                  <ThumbsUp className="w-6 h-6 text-blue-500" />
                ) : (
                  <ThumbsDown className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${post.agreement}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-gray-700">{post.agreement}%</span>
              </div>
            </motion.div>

            {/* Topics */}
            <motion.div
              key={`topics-${currentPost}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isAnalyzing ? 0.9 : 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-5 h-5 text-purple-500" />
                <span className="text-gray-600">Detected Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.topics.map((topic, index) => (
                  <motion.span
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: isAnalyzing ? 1.1 + index * 0.1 : 0 }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 rounded-full"
                  >
                    {topic}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
