import { motion } from "motion/react";
import { Play, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

interface EvaluatePromoButtonProps {
  onEvaluate: () => void;
  disabled?: boolean;
  isEvaluating?: boolean;
  hasBeenEvaluated?: boolean;
}

export function EvaluatePromoButton({
  onEvaluate,
  disabled = false,
  isEvaluating = false,
  hasBeenEvaluated = false,
}: EvaluatePromoButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (hasBeenEvaluated) {
      setShowConfirm(true);
    } else {
      onEvaluate();
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onEvaluate();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl mb-2 text-gray-900">Ready to Evaluate?</h3>
            <p className="text-sm text-gray-600">
              {hasBeenEvaluated
                ? "This promo has already been evaluated. You can re-evaluate to select new winners."
                : "Click the button to run the winner selection algorithm based on your promo rules."}
            </p>
            {disabled && (
              <p className="text-sm text-orange-600 mt-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Evaluation is not available yet. Check promo status and timing.
              </p>
            )}
          </div>

          <Button
            onClick={handleClick}
            disabled={disabled || isEvaluating}
            className={`ml-4 px-8 py-6 text-lg ${
              hasBeenEvaluated
                ? "bg-gradient-to-r from-orange-600 to-red-600"
                : "bg-gradient-to-r from-violet-600 to-purple-600"
            } text-white`}
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                {hasBeenEvaluated ? "Re-Evaluate" : "Run Evaluation"}
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowConfirm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-full bg-orange-100">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl mb-2 text-gray-900">Re-Evaluate Promo?</h3>
                  <p className="text-sm text-gray-600">
                    This promo has already been evaluated. Running evaluation again will
                    select new winners and replace the current results.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white"
                >
                  Confirm Re-Evaluation
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </>
  );
}
