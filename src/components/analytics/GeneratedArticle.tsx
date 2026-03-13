import { motion, AnimatePresence } from "motion/react";
import { FileText, Copy, Check, ChevronDown, ChevronUp, Sparkles, Cpu } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface GeneratedArticleProps {
  title: string;
  content: string;
  generatedDate?: string;
  wordCount?: number;
  aiModel?: string;
}

export function GeneratedArticle({
  title,
  content,
  generatedDate = new Date().toLocaleDateString(),
  wordCount = content.split(' ').length,
  aiModel = "GPT-4",
}: GeneratedArticleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const PREVIEW_LENGTH = 300;
  const shouldTruncate = content.length > PREVIEW_LENGTH;
  const displayContent = isExpanded || !shouldTruncate 
    ? content 
    : content.substring(0, PREVIEW_LENGTH) + "...";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
    >
      {/* Header with Sparkle Effect */}
      <div className="relative bg-gradient-to-r from-violet-50 via-purple-50 to-blue-50 p-6 border-b border-gray-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-violet-400/20 rounded-full blur-2xl"></div>
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  AI Generated Article
                </h3>
                <p className="text-sm text-gray-600">
                  {generatedDate} • {wordCount} words
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleCopy}
            className={`${
              isCopied
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            } text-white shadow-lg transition-all duration-300`}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Article
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Article Title */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-3xl text-gray-900 mb-2">{title}</h2>
        <div className="h-1 w-24 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"></div>
      </div>

      {/* Article Content */}
      <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={isExpanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {displayContent}
              </div>
            </div>
            
            {/* Gradient Fade Effect when collapsed */}
            {shouldTruncate && !isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* See More / See Less Button */}
        {shouldTruncate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex justify-center"
          >
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              className="group border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all duration-300"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Read Full Article
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-violet-50/30 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-600" />
              <span className="text-gray-600">{wordCount} words</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">AI Generated</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">{aiModel}</span>
            </div>
          </div>
          <span className="text-gray-500">Generated on {generatedDate}</span>
        </div>
      </div>
    </motion.div>
  );
}