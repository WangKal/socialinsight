import { motion } from "motion/react";
import { Gift, Calendar, Hash, CheckCircle, Users, Sparkles, FileText, Phone, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export type PromoType = "first-n" | "every-nth" | "correct-answer" | "random";

export interface PromoFormData {
  title: string;
  description: string;
  type: PromoType;
  numberOfWinners: number;
  interval?: number;
  correctAnswer?: string;
  caseSensitive: boolean;
  startTime: string;
  endTime: string;
  prize: string;
 // brandingImage?: string;
  requirementInstructions?: string;
 // promoUrl?: string;

  contactName: string;
  contactPhone: string;
  claimInstructions: string;
}

interface PromoFormProps {
  onSubmit: (data: PromoFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}




export function PromoForm({ onSubmit, onCancel, isSubmitting }: PromoFormProps) {
  const [formData, setFormData] = useState<PromoFormData>({
    title: "",
    description: "",
    type: "first-n",
    numberOfWinners: 1,
    interval: 10,
    correctAnswer: "",
    caseSensitive: false,
    startTime: "",
    endTime: "",
    prize: "",
    //brandingImage: "",
    requirementInstructions: "",
   // promoUrl: "",

    contactName: "",
    contactPhone: "",
    claimInstructions: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const promoTypes = [
    {
      id: "first-n" as PromoType,
      label: "First N Responders",
      description: "Select the first N valid replies",
      icon: Users,
    },
    {
      id: "every-nth" as PromoType,
      label: "Every Nth Responder",
      description: "Select every Nth responder (e.g., every 10th)",
      icon: Hash,
    },
    {
      id: "correct-answer" as PromoType,
      label: "Correct Answer",
      description: "Winners who provide the correct answer",
      icon: CheckCircle,
    },
    {
      id: "random" as PromoType,
      label: "Random Winner",
      description: "Randomly select from valid replies",
      icon: Sparkles,
    },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.numberOfWinners < 1) {
      newErrors.numberOfWinners = "Must have at least 1 winner";
    }

    if (formData.type === "every-nth" && (!formData.interval || formData.interval < 2)) {
      newErrors.interval = "Interval must be at least 2";
    }

    if (formData.type === "correct-answer" && !formData.correctAnswer?.trim()) {
      newErrors.correctAnswer = "Correct answer is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = "End time must be after start time";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required";
    }

    if (!formData.claimInstructions.trim()) {
      newErrors.claimInstructions = "Claim instructions are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-violet-600" />
          Promo Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Promo Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Summer Giveaway 2026"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your promo..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">Prize</label>
            <input
              type="text"
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              placeholder="e.g., $100 Gift Card, Free Product, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Branding & Links */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl mb-4">Requirements</h3>

        <div className="space-y-4">
          {/*<div>
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Branding Image URL
            </label>
            <input
              type="text"
              value={formData.brandingImage}
              onChange={(e) => setFormData({ ...formData, brandingImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add a branding image for your promo
            </p>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Promo URL
            </label>
            <input
              type="text"
              value={formData.promoUrl}
              onChange={(e) => setFormData({ ...formData, promoUrl: e.target.value })}
              placeholder="https://twitter.com/yourpost"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Link to where the promo is happening (opens in new tab)
            </p>
          </div>**/}

          <div>
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Requirement Instructions
            </label>
            <textarea
              value={formData.requirementInstructions}
              onChange={(e) => setFormData({ ...formData, requirementInstructions: e.target.value })}
              placeholder="Enter detailed instructions for participants...\ne.g., Follow our account, Like this post, Comment with your answer, Tag 2 friends, etc."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Detailed instructions for participants to enter the promo
            </p>
          </div>
        </div>
      </div>

      {/* Winner Claim Contact */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl mb-4">Winner Claim Contact</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="e.g., Candy Kay Promotions Team"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.contactName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.contactName && (
              <p className="text-sm text-red-500 mt-1">{errors.contactName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="e.g., +254712345678"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.contactPhone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.contactPhone && (
              <p className="text-sm text-red-500 mt-1">{errors.contactPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Claim Instructions <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.claimInstructions}
              onChange={(e) => setFormData({ ...formData, claimInstructions: e.target.value })}
              placeholder="e.g., Winners should send a WhatsApp message with their full name and M-Pesa number within 24 hours."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.claimInstructions ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.claimInstructions && (
              <p className="text-sm text-red-500 mt-1">{errors.claimInstructions}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              These instructions will be shown together with selected winners.
            </p>
          </div>
        </div>
      </div>

      {/* Promo Type Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl mb-4">
          Promo Type <span className="text-red-500">*</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {promoTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.id })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.type === type.id
                    ? "border-violet-600 bg-violet-50"
                    : "border-gray-200 hover:border-violet-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-6 h-6 mt-1 ${
                      formData.type === type.id ? "text-violet-600" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={formData.type === type.id ? "text-violet-900" : "text-gray-900"}>
                        {type.label}
                      </p>
                      {formData.type === type.id && (
                        <Badge className="bg-violet-600 text-white">Selected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Promo Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl mb-4">Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Number of Winners <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.numberOfWinners}
              onChange={(e) =>
                setFormData({ ...formData, numberOfWinners: parseInt(e.target.value) || 1 })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.numberOfWinners ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.numberOfWinners && (
              <p className="text-sm text-red-500 mt-1">{errors.numberOfWinners}</p>
            )}
          </div>

          {formData.type === "every-nth" && (
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Interval (Every Nth) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="2"
                value={formData.interval}
                onChange={(e) =>
                  setFormData({ ...formData, interval: parseInt(e.target.value) || 10 })
                }
                placeholder="e.g., 10 (every 10th responder)"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.interval ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.interval && <p className="text-sm text-red-500 mt-1">{errors.interval}</p>}
              <p className="text-sm text-gray-500 mt-1">
                Every {formData.interval || "N"}th valid responder will win
              </p>
            </div>
          )}

          {formData.type === "correct-answer" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData({ ...formData, correctAnswer: e.target.value })
                  }
                  placeholder="Enter the correct answer"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    errors.correctAnswer ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.correctAnswer && (
                  <p className="text-sm text-red-500 mt-1">{errors.correctAnswer}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="caseSensitive"
                  checked={formData.caseSensitive}
                  onChange={(e) =>
                    setFormData({ ...formData, caseSensitive: e.target.checked })
                  }
                  className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
                <label htmlFor="caseSensitive" className="text-sm text-gray-700">
                  Case sensitive matching
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timing */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-600" />
          Schedule
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.startTime ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.endTime ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.endTime && <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white"
        >
          {isSubmitting ? "Creating..." : "Create Promo"}
        </Button>
      </div>
    </motion.form>
  );
}