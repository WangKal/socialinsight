
import { useState } from "react";
import { X, CalendarDays, CheckCircle2 } from "lucide-react";
import { createConsultationRequest } from "@/services/socialecho";

type BookConsultationProps = {
  open: boolean;
  onClose: () => void;
};

export default function BookConsultation({
  open,
  onClose,
}: BookConsultationProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    organisation: "",
    consultationType: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  if (!open) return null;

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);

    try {
      await createConsultationRequest({
        name: form.name,
        email: form.email,
        organisation: form.organisation,
        consultation_type: form.consultationType,
        preferred_date: form.preferredDate || undefined,
        preferred_time: form.preferredTime || undefined,
        message: form.message,
        source: "website",
        source_page: window.location.pathname,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Consultation request failed:", error);

      alert(
        "We couldn't submit your request. Please try again or contact us directly."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSubmitted(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 sm:px-8 py-6 border-b"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E5E5",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-neutral-100"
            aria-label="Close consultation form"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "#FFF0E8",
                color: "#C2622A",
              }}
            >
              <CalendarDays size={20} />
            </div>

            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#C2622A" }}
              >
                Consultation
              </p>

              <h2
                className="text-2xl font-bold tracking-tight"
                style={{ color: "#222222" }}
              >
                Book a Consultation
              </h2>
            </div>
          </div>

          <p
            className="text-sm leading-relaxed max-w-xl"
            style={{ color: "#666666" }}
          >
            Tell us what you are trying to understand. We'll review your
            requirements and arrange the most appropriate consultation.
          </p>
        </div>

        {submitted ? (
          <div className="px-6 sm:px-8 py-16 text-center">
            <div
              className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "#FFF0E8",
                color: "#C2622A",
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h3
              className="text-2xl font-bold mb-3"
              style={{ color: "#222222" }}
            >
              Consultation request received
            </h3>

            <p
              className="text-sm leading-relaxed max-w-md mx-auto mb-8"
              style={{ color: "#666666" }}
            >
              Thank you. We've received your request and will get back to you
              with the consultation details.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="px-7 py-3 rounded-full text-sm font-semibold transition hover:opacity-90"
              style={{
                backgroundColor: "#C2622A",
                color: "#FFFFFF",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Name"
                required
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Your name"
              />

              <Field
                label="Work email"
                required
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="you@organisation.com"
              />
            </div>

            <Field
              label="Organisation"
              value={form.organisation}
              onChange={(value) => updateField("organisation", value)}
              placeholder="Company, institution or organisation"
            />

            {/* Consultation type */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#222222" }}
              >
                What would you like to discuss?
                <span style={{ color: "#C2622A" }}> *</span>
              </label>

              <select
                required
                value={form.consultationType}
                onChange={(event) =>
                  updateField("consultationType", event.target.value)
                }
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                style={{
                  borderColor: "#D9D9D9",
                  color: "#333333",
                }}
              >
                <option value="">Select a consultation type</option>
                <option value="Brand & Market Intelligence">
                  Brand & Market Intelligence
                </option>
                <option value="Risk & Reputation">
                  Risk & Reputation
                </option>
                <option value="Research & Verification">
                  Research & Verification
                </option>
                <option value="Public Sector Strategy">
                  Public Sector Strategy
                </option>
                <option value="Commercial Strategy">
                  Commercial Strategy
                </option>
                <option value="Custom / Other">
                  Custom / Other
                </option>
              </select>
            </div>

            {/* Preferred meeting */}
            <div>
              <p
                className="text-sm font-semibold mb-3"
                style={{ color: "#222222" }}
              >
                Preferred consultation time
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Date"
                  type="date"
                  value={form.preferredDate}
                  onChange={(value) =>
                    updateField("preferredDate", value)
                  }
                />

                <Field
                  label="Time"
                  type="time"
                  value={form.preferredTime}
                  onChange={(value) =>
                    updateField("preferredTime", value)
                  }
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#222222" }}
              >
                Tell us about your needs
              </label>

              <textarea
                value={form.message}
                onChange={(event) =>
                  updateField("message", event.target.value)
                }
                rows={5}
                placeholder="What are you trying to understand, monitor or solve?"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition focus:ring-2"
                style={{
                  borderColor: "#D9D9D9",
                  color: "#333333",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "#C2622A",
                color: "#FFFFFF",
              }}
            >
              {loading ? "Sending request..." : "Request Consultation"}
            </button>

            <p
              className="text-xs text-center"
              style={{ color: "#999999" }}
            >
              Your information will only be used to arrange your consultation.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: "#222222" }}
      >
        {label}
        {required && <span style={{ color: "#C2622A" }}> *</span>}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
        style={{
          borderColor: "#D9D9D9",
          color: "#333333",
        }}
      />
    </div>
  );
}
