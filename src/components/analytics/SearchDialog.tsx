import { motion, AnimatePresence } from "motion/react";
import { X, Search, Tag, Clock, FileText, Plus, Sparkles, MonitorCheck } from "lucide-react";
import { useState } from "react";
import { SocialSearchPayload } from "@/services/socialSearch";
import { buildSocialSearchPayload } from "@/services/socialSearch";
import { XAccountForm } from "@/components/XAccountForm";
import { useAuth } from "@/hooks/use-auth";
import { GuideDialog } from "@/components/GuideDialog";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (payload: SocialSearchPayload) => Promise<void>;
}

type DurationUnit = "hours" | "days" | "weeks" | "months" | "years";

const DURATION_UNITS: { id: DurationUnit; label: string; max: number }[] = [
  { id: "hours", label: "Hours", max: 8760 },
  { id: "days", label: "Days", max: 365 },
  { id: "weeks", label: "Weeks", max: 52 },
  { id: "months", label: "Months", max: 24 },
  { id: "years", label: "Years", max: 5 },
];

const QUICK_PICKS: { label: string; value: number; unit: DurationUnit }[] = [
  { label: "6h", value: 6, unit: "hours" },
  { label: "24h", value: 24, unit: "hours" },
  { label: "7d", value: 7, unit: "days" },
  { label: "30d", value: 30, unit: "days" },
  { label: "3mo", value: 3, unit: "months" },
];

export interface DurationValue {
  amount: number;
  unit: DurationUnit;
}

type Platform = "x" | "tiktok" | "instagram";

const PLATFORMS: {
  id: Platform;
  label: string;
  color: string;
  ring: string;
  bg: string;
  selectedBg: string;
  selectedText: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "x",
    label: "X (Twitter)",
    color: "text-white",
    ring: "ring-black",
    bg: "bg-white border border-gray-200",
    selectedBg: "bg-black",
    selectedText: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    id: "tiktok",
    label: "TikTok",
    color: "text-white",
    ring: "ring-[#ff0050]",
    bg: "bg-white border border-gray-200",
    selectedBg: "bg-gradient-to-br from-[#010101] via-[#ff0050] to-[#69c9d0]",
    selectedText: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },
];

export function SearchDialog({ isOpen, onClose, onSearch }: SearchDialogProps) {
  const { user } = useAuth();
  
  const [keyword, setKeyword] = useState("");
  const [context, setContext] = useState("");

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [durationAmount, setDurationAmount] = useState<string>("30");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("days");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showXDialog, setShowXDialog] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const togglePlatform = (id: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    setError("");
  };

  const handleAnalyze = () => {
    try {
      if (selectedPlatforms?.includes("x")) {
        const valid = false;
        if (!valid) {
          setShowXDialog(true);
          return;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setError("Please enter a keyword.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform.");
      return;
    }

    setIsSubmitting(true);
    try {
      const amount = parseInt(durationAmount, 10);
      if (!amount || amount < 1) {
        setError("Please enter a valid duration.");
        setIsSubmitting(false);
        return;
      }

      const payload = buildSocialSearchPayload(
        trimmedKeyword,
        selectedPlatforms,
        {
          amount,
          unit: durationUnit,
        },
        context.trim(),
      );

      await onSearch(payload);
      handleClose();
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setKeyword("");
    setContext("");
    setSelectedPlatforms([]);
    setDurationAmount("30");
    setDurationUnit("days");
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto">
                
                {/* Fixed Header */}
                <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 pt-6 pb-8 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-semibold">Search Options</h2>
                      <p className="text-white/70 text-sm mt-0.5">
                        Choose online keyword search or browser extension method
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />
                </div>

                {/* Scrollable Content Area */}
                <div className="bg-white -mt-4 rounded-t-3xl px-8 pt-6 pb-8 overflow-y-auto flex-1 space-y-6">

                  {/* OPTION A: Separate Form Section */}
                  <form onSubmit={handleSubmit} className="space-y-5 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="w-4 h-4 text-violet-600" />
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Option 1: Direct Keyword Search
                      </h3>
                    </div>

                    {/* Single Keyword field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-violet-500" />
                        Keyword
                        <span className="text-violet-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => {
                          setKeyword(e.target.value);
                          setError("");
                        }}
                        placeholder="e.g. innovation"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50 transition-all"
                      />
                    </div>

                    {/* Context field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-violet-500" />
                        Context
                      </label>
                      <input
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="e.g. Tech industry trends in 2026"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50 transition-all"
                      />
                    </div>

                    {/* Platform selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2.5">
                        Platforms
                        <span className="text-violet-500 ml-1">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {PLATFORMS.map((p) => {
                          const selected = selectedPlatforms.includes(p.id);
                          return (
                            <motion.button
                              key={p.id}
                              type="button"
                              whileTap={{ scale: 0.96 }}
                              onClick={() => {
                                togglePlatform(p.id);
                                handleAnalyze();
                              }}
                              className={`relative flex flex-col items-center gap-2 py-3.5 px-3 rounded-2xl border-2 transition-all duration-200 ${
                                selected
                                  ? `${p.selectedBg} border-transparent shadow-lg shadow-violet-200`
                                  : "bg-white border-gray-200 hover:border-violet-300 hover:shadow-md"
                              }`}
                            >
                              {selected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center"
                                >
                                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2">
                                    <polyline points="2,6 5,9 10,3" />
                                  </svg>
                                </motion.div>
                              )}
                              <span className={`${selected ? "text-white" : "text-gray-700"} transition-colors`}>
                                {p.icon}
                              </span>
                              <span className={`text-xs ${selected ? "text-white" : "text-gray-600"} transition-colors`}>
                                {p.label}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-violet-500" />
                        Duration
                      </label>

                      {/* Quick picks */}
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {QUICK_PICKS.map((q) => {
                          const active = durationAmount === String(q.value) && durationUnit === q.unit;
                          return (
                            <motion.button
                              key={q.label}
                              type="button"
                              whileTap={{ scale: 0.93 }}
                              onClick={() => {
                                setDurationAmount(String(q.value));
                                setDurationUnit(q.unit);
                              }}
                              className={`px-3 py-1 rounded-full text-xs border transition-all duration-150 ${
                                active
                                  ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                                  : "bg-white border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600"
                              }`}
                            >
                              {q.label}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Custom number + unit */}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          max={DURATION_UNITS.find((u) => u.id === durationUnit)?.max ?? 9999}
                          value={durationAmount}
                          onChange={(e) => {
                            setDurationAmount(e.target.value);
                            setError("");
                          }}
                          className="w-24 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center bg-gray-50/50"
                          placeholder="e.g. 48"
                        />
                        <div className="flex flex-1 gap-1.5">
                          {DURATION_UNITS.map((u) => {
                            const active = durationUnit === u.id;
                            return (
                              <motion.button
                                key={u.id}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setDurationUnit(u.id)}
                                className={`flex-1 py-2 rounded-xl border-2 text-xs transition-all duration-150 ${
                                  active
                                    ? "border-violet-500 bg-violet-50 text-violet-700"
                                    : "border-gray-200 bg-white text-gray-500 hover:border-violet-300"
                                }`}
                              >
                                {u.label}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {durationAmount && parseInt(durationAmount, 10) > 0 && (
                        <motion.p
                          key={`${durationAmount}-${durationUnit}`}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-violet-500 mt-2 ml-1"
                        >
                          Searching the last {durationAmount} {parseInt(durationAmount, 10) === 1 ? durationUnit.replace(/s$/, "") : durationUnit}
                        </motion.p>
                      )}
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="p-3 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <p className="text-sm text-red-600">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm shadow-md shadow-violet-200 hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Searching…
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            Search {selectedPlatforms.length > 0 ? `(${selectedPlatforms.length})` : ""}
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* OPTION B: Fully Separate Extension Section */}
                  <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-800 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-violet-600" /> Option 2: Browser Extension
                      </div>
                      <span className="bg-violet-200/80 text-violet-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        PREFERRED
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <MonitorCheck className="w-4 h-4 text-violet-600" />
                        Comprehensive Direct Analysis
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        Using the extension provides significantly <strong>better methods</strong> and deeper extraction capabilities directly from your active browser session.
                      </p>
                    </div>

                    <p className="text-xs text-violet-700 font-medium">
                      <strong>Supported:</strong> X (Twitter), Facebook, TikTok
                    </p>

                    <Button
                      type="button"
                      onClick={() => {
                        setGuideOpen(true);
                        handleClose();
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-sm hover:opacity-95 transition-opacity"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Analyze by Extension
                    </Button>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}

        <Dialog
          open={showXDialog}
          onOpenChange={(open) => {
            setShowXDialog(open);
          }}
        >
          <DialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            className="w-[95vw] max-w-4xl max-h-[90vh] p-0 overflow-hidden z-[101]"
          >
            <div className="overflow-y-auto max-h-[90vh]">
              <XAccountForm
                user={user}
                onSaved={async () => {
                  setShowXDialog(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </AnimatePresence>

      <GuideDialog
        open={guideOpen}
        setOpen={() => setGuideOpen(false)}
      />
    </>
  );
}