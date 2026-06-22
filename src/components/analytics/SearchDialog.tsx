import { motion, AnimatePresence } from "motion/react";
import { X, Search, Tag, Clock } from "lucide-react";
import { useState, useRef, KeyboardEvent } from "react";
import { SocialSearchPayload } from "@/services/socialSearch";
import { buildSocialSearchPayload } from "@/services/socialSearch";

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
  {
    id: "instagram",
    label: "Instagram",
    color: "text-white",
    ring: "ring-[#e1306c]",
    bg: "bg-white border border-gray-200",
    selectedBg:
      "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    selectedText: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

export function SearchDialog({ isOpen, onClose, onSearch }: SearchDialogProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [durationAmount, setDurationAmount] = useState<string>("30");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("days");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addKeyword = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
      setError("");
    }
    setInputValue("");
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(inputValue);
    } else if (e.key === "Backspace" && !inputValue && keywords.length > 0) {
      setKeywords((prev) => prev.slice(0, -1));
    }
  };

  const togglePlatform = (id: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const allKeywords = inputValue.trim()
      ? [...keywords, inputValue.trim()]
      : keywords;

    if (allKeywords.length === 0) {
      setError("Please enter at least one keyword or search term.");
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
  allKeywords,
  selectedPlatforms,
  {
    amount,
    unit: durationUnit,
  }
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
    setKeywords([]);
    setInputValue("");
    setSelectedPlatforms([]);
    setDurationAmount("30");
    setDurationUnit("days");
    setError("");
    onClose();
  };

  return (
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

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Gradient Header */}
              <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 pt-8 pb-10">
                {/* Close */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon + Title */}
                <div className="flex items-center gap-4 mb-1">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl">Keyword Search</h2>
                    <p className="text-white/70 text-sm mt-0.5">
                      Search social media by topic or hashtag
                    </p>
                  </div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />
              </div>

              {/* Card body lifted over gradient */}
              <div className="bg-white -mt-4 rounded-t-3xl px-8 pt-6 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Keywords field */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Keywords / Search Terms
                      <span className="text-violet-500 ml-1">*</span>
                    </label>
                    <div
                      onClick={() => inputRef.current?.focus()}
                      className="min-h-[52px] flex flex-wrap gap-2 items-center px-4 py-3 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent cursor-text transition-all bg-gray-50/50"
                    >
                      {keywords.map((kw) => (
                        <motion.span
                          key={kw}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {kw}
                          <button
                            type="button"
                            onClick={() => removeKeyword(kw)}
                            className="ml-0.5 hover:text-violet-900 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                          if (inputValue.trim()) addKeyword(inputValue);
                        }}
                        placeholder={
                          keywords.length === 0
                            ? "Type keyword and press Enter…"
                            : "Add another…"
                        }
                        className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 ml-1">
                      Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500">Enter</kbd> or{" "}
                      <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500">,</kbd> to add a term
                    </p>
                  </div>

                  {/* Platform selector */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-3">
                      Platforms
                      <span className="text-violet-500 ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {PLATFORMS.map((p) => {
                        const selected = selectedPlatforms.includes(p.id);
                        return (
                          <motion.button
                            key={p.id}
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => togglePlatform(p.id)}
                            className={`relative flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all duration-200 ${
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
                    <label className="block text-sm text-gray-700 mb-2 flex items-center gap-1.5">
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

                    {/* Human-readable summary */}
                    {durationAmount && parseInt(durationAmount) > 0 && (
                      <motion.p
                        key={`${durationAmount}-${durationUnit}`}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-violet-500 mt-2 ml-1"
                      >
                        Searching the last {durationAmount} {parseInt(durationAmount) === 1 ? durationUnit.replace(/s$/, "") : durationUnit}
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

                  {/* Actions */}
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
