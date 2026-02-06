import { motion, AnimatePresence } from "motion/react";
import { X, Link as LinkIcon, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { GuideDialog } from "@/components/GuideDialog";
import {
  detectPlatformFromUrl,
  extractPostData,
  buildAnalysisPayload,
  sendForAnalysis,
} from "@/services/analysisService";
import {useAuth } from "@/hooks/use-auth"


interface AddLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, title: string) => void;
}

export function AddLinkDialog({ isOpen, onClose, onAdd }: AddLinkDialogProps) {
  const { user } = useAuth();
  const navigate =useNavigate()
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [extensionDialog, setExtensionDialog] = useState(false);
   const [guideOpen, setGuideOpen] = useState(false)
   const [isSubmitting, setIsSubmitting] = useState(false);


 const jwt = localStorage.getItem("internal_jwt") || "";


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
   if (isSubmitting) return; // double submit guard
   setIsSubmitting(true);
  setError("");

  if (!url.trim()) {
    setError("URL is required");
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    setIsSubmitting(false)
  } catch {
    setError("Please enter a valid URL");
    setIsSubmitting(false)
    return;
  }

  const platform = detectPlatformFromUrl(parsedUrl.href);

  if (!platform) {
    setError("Unsupported or invalid post URL");
    return;
  }

  if (!user?.id) {
    setError("You must be logged in");
    return;
  }

  try {
    // 1️⃣ Send to backend for analysis
    const response = await sendForAnalysis(parsedUrl, jwt, user.id);

    if (response.status !== "success") {
      setError(response.msg || "Analysis failed");
      return;
    }
setError("")
    // 2️⃣ Show success message first
    setSuccess(
      `Analysis started for the post!\n\nURL: ${parsedUrl.href}\nPlatform: ${platform}\n\nThis may take a few moments.`
    );

    // 3️⃣ Wait for 3 seconds before redirecting
    setTimeout(() => {
      // Trigger your dashboard update or navigation here
      onAdd(parsedUrl.href, platform); // optional, if you want to add it to state
      handleClose(); // close the dialog
      navigate("/dashboard"); // redirect to dashboard
    }, 10000); 
  } catch (err) {
    console.error(err);
    setError("Analysis failed. Please try again.");
  }
};



  const handleClose = () => {
    setUrl("");
    setError("");
    onClose();
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    Analysis
                  </h2>
                </div>
                <p className="text-gray-600">
                  Add a social media post URL to analyze (Only Tiktok Supported)
                </p>
              </div>

              {/* Form */}
<form onSubmit={handleSubmit} className="space-y-4">
  {/* URL Input */}
  <div>
    <label htmlFor="url" className="block text-sm text-gray-700 mb-2">
      Post URL *
    </label>
    <input
      id="url"
      type="text"
      value={url}
      onChange={(e) => {
        setUrl(e.target.value);
        setError("");
      }}
      placeholder="https://twitter.com/user/status/123456789"
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
    />
  </div>

  {/* Messages */}
  {error && (
    <motion.div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-600">{error}</p>
    </motion.div>
  )}

  {success && (
    <motion.div className="p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-600">{success}</p>
    </motion.div>
  )}

  {/* URL Submit Button */}
<Button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white
             disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <div className="flex items-center gap-2">
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      Analyzing…
    </div>
  ) : (
    <>
      <Plus className="w-4 h-4 mr-2" />
      Analyze Link
    </>
  )}
</Button>


  {/* Info Box */}
  <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
    <p className="text-sm text-violet-700 mb-3">
      <strong>Note:</strong> Currently supports X, Facebook, and Twitter.
    </p>

    {/* Extension Button — NOT a submit */}
    <Button
      type="button"
      onClick={() => {
        setExtensionDialog(true);
        handleClose();
      }}
      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white"
    >
      <Plus className="w-4 h-4 mr-2" />
      Analyze by Extension
    </Button>
  </div>

  {/* Cancel */}
  <Button
    type="button"
    variant="outline"
    onClick={handleClose}
    className="w-full"
  >
    Cancel
  </Button>
</form>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
 
          <GuideDialog
    open={guideOpen}
    setOpen ={() => setGuideOpen(false)}
      />
      </>
  );
}

