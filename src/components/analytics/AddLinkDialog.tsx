import { motion, AnimatePresence } from "motion/react";
import { X, Link as LinkIcon, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { GuideDialog } from "@/components/GuideDialog";

interface AddLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, title: string) => void;
}

export function AddLinkDialog({ isOpen, onClose, onAdd }: AddLinkDialogProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [extensionDialog, setExtensionDialog] = useState(false);
   const [guideOpen, setGuideOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }


    onAdd(url, title);
    setUrl("");
    setError("");
    onClose();
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
                <p className="text-gray-600"><i><strong>Heads Up</strong>: We capture the most recent posts and their top-level replies. Some replies may be missing, nested replies are not included, and replies may change if users edit or delete them</i></p>
              </div>

              



                {/* Info Box */}
                <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                  <p className="text-sm text-violet-700">
                    <strong>Note:</strong> Currently we only support the use of our extension. Please use the guide below and embark on you post analysis journey
                  </p>
                  <Button
                    onClick={()=>{ setGuideOpen(true)}}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Analyze by Extension
                  </Button>
                </div>
               

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>   
            
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
