import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  Search,
  XCircle,X
} from "lucide-react";

import {
  getConsultationRequests,
  markConsultationResponded,
  scheduleConsultation,
  markConsultationCompleted,
  markConsultationOnboarded,
  rejectConsultationRequest,
  updateConsultationRequest,
} from "@/services/socialEcho";

import { useQuery, useQueryClient } from "@tanstack/react-query";

type ConsultationStatus =
  | "new"
  | "reviewing"
  | "responded"
  | "scheduled"
  | "completed"
  | "onboarded"
  | "rejected";

type ConsultationRequest = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  organisation?: string | null;
  job_title?: string | null;
  country?: string | null;
  consultation_type?: string | null;
  message?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  status?: ConsultationStatus | null;
  admin_notes?: string | null;
  response_notes?: string | null;
  meeting_notes?: string | null;
  assigned_to?: string | null;
  responded_at?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  onboarded_at?: string | null;
  created_at: string;
  updated_at?: string;
};

const statusOptions = [
  "all",
  "new",
  "reviewing",
  "responded",
  "scheduled",
  "completed",
  "onboarded",
  "rejected",
];

export function AdminConsultations() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] =
    useState<ConsultationRequest | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "admin-consultations",
      statusFilter,
      search,
    ],
    queryFn: () =>
      getConsultationRequests({
        status: statusFilter,
        search,
        limit: 100,
      }),
  });

  const requests = (data?.data || []) as ConsultationRequest[];

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["admin-consultations"],
    });
  };

  const handleStatus = async (
    id: string,
    status: ConsultationStatus
  ) => {
    try {
      await updateConsultationRequest(id, { status });
      await refresh();

      if (selected?.id === id) {
        setSelected((current) =>
          current ? { ...current, status } : current
        );
      }
    } catch (error) {
      console.error(error);
      alert("Unable to update consultation status.");
    }
  };

  const handleRespond = async () => {
    if (!selected) return;

    const notes = window.prompt(
      "Response notes (optional):",
      selected.response_notes || ""
    );

    if (notes === null) return;

    try {
      await markConsultationResponded(selected.id, notes);
      await refresh();

      setSelected({
        ...selected,
        status: "responded",
        response_notes: notes,
        responded_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      alert("Unable to mark consultation as responded.");
    }
  };

  const handleSchedule = async () => {
    if (!selected) return;

    const defaultValue = selected.scheduled_at
      ? selected.scheduled_at.slice(0, 16)
      : selected.preferred_date && selected.preferred_time
        ? `${selected.preferred_date}T${selected.preferred_time}`
        : "";

    const value = window.prompt(
      "Scheduled date and time:",
      defaultValue
    );

    if (!value) return;

    const meetingNotes = window.prompt(
      "Meeting notes (optional):",
      selected.meeting_notes || ""
    );

    if (meetingNotes === null) return;

    try {
      await scheduleConsultation(
        selected.id,
        new Date(value).toISOString(),
        meetingNotes
      );

      await refresh();

      setSelected({
        ...selected,
        status: "scheduled",
        scheduled_at: new Date(value).toISOString(),
        meeting_notes: meetingNotes,
      });
    } catch (error) {
      console.error(error);
      alert("Unable to schedule consultation.");
    }
  };

  const handleComplete = async () => {
    if (!selected) return;

    const notes = window.prompt(
      "Completion / meeting notes (optional):",
      selected.meeting_notes || ""
    );

    if (notes === null) return;

    try {
      await markConsultationCompleted(selected.id, notes);
      await refresh();

      setSelected({
        ...selected,
        status: "completed",
        completed_at: new Date().toISOString(),
        meeting_notes: notes,
      });
    } catch (error) {
      console.error(error);
      alert("Unable to mark consultation as completed.");
    }
  };

  const handleOnboard = async () => {
    if (!selected) return;

    const notes = window.prompt(
      "Onboarding notes (optional):"
    );

    if (notes === null) return;

    try {
      await markConsultationOnboarded(selected.id, notes);
      await refresh();

      setSelected({
        ...selected,
        status: "onboarded",
        onboarded_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      alert("Unable to mark consultation as onboarded.");
    }
  };

  const handleReject = async () => {
    if (!selected) return;

    const reason = window.prompt(
      "Reason for rejecting this request:"
    );

    if (reason === null) return;

    try {
      await rejectConsultationRequest(selected.id, reason);
      await refresh();

      setSelected({
        ...selected,
        status: "rejected",
        admin_notes: reason,
      });
    } catch (error) {
      console.error(error);
      alert("Unable to reject consultation request.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Consultation Requests
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            Review, respond to and manage consultation requests.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {data?.count ?? requests.length} request
          {(data?.count ?? requests.length) !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or organisation..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "all"
                  ? "All statuses"
                  : formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Clock className="w-8 h-8 mx-auto mb-3 text-violet-500 animate-pulse" />
          <p className="text-gray-600">
            Loading consultation requests...
          </p>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <p className="text-red-600">
            Unable to load consultation requests.
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && requests.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-700 font-medium">
            No consultation requests found.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            New requests submitted from the website will appear here.
          </p>
        </div>
      )}

      {/* Requests */}
      {!isLoading && !isError && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((request) => (
            <ConsultationRow
              key={request.id}
              request={request}
              onView={() => setSelected(request)}
            />
          ))}
        </div>
      )}

      {/* Details */}
      {selected && (
        <ConsultationDetails
          request={selected}
          onClose={() => setSelected(null)}
          onRefresh={refresh}
          onRespond={handleRespond}
          onSchedule={handleSchedule}
          onComplete={handleComplete}
          onOnboard={handleOnboard}
          onReject={handleReject}
          onStatus={handleStatus}
        />
      )}
    </div>
  );
}


// ============================================================
// REQUEST ROW
// ============================================================

function ConsultationRow({
  request,
  onView,
}: {
  request: ConsultationRequest;
  onView: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">
              {request.name}
            </h3>

            <StatusBadge status={request.status || "new"} />
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>{request.email}</p>

            {request.organisation && (
              <p>{request.organisation}</p>
            )}

            {request.consultation_type && (
              <p className="text-gray-500">
                {request.consultation_type}
              </p>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Submitted{" "}
            {new Date(request.created_at).toLocaleDateString()}
          </p>

          {request.preferred_date && (
            <p className="mt-1">
              Preferred: {request.preferred_date}
              {request.preferred_time
                ? ` at ${request.preferred_time}`
                : ""}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      </div>
    </div>
  );
}


// ============================================================
// DETAILS
// ============================================================

function ConsultationDetails({
  request,
  onClose,
  onRespond,
  onSchedule,
  onComplete,
  onOnboard,
  onReject,
}: {
  request: ConsultationRequest;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onRespond: () => Promise<void>;
  onSchedule: () => Promise<void>;
  onComplete: () => Promise<void>;
  onOnboard: () => Promise<void>;
  onReject: () => Promise<void>;
  onStatus: (
    id: string,
    status: ConsultationStatus
  ) => Promise<void>;
}) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Consultation Request
                  </h3>

                  <StatusBadge
                    status={request.status || "new"}
                  />
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  Submitted{" "}
                  {new Date(
                    request.created_at
                  ).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Contact */}
            <Section title="Contact Information">
              <Detail label="Name" value={request.name} />
              <Detail label="Email" value={request.email} />
              <Detail label="Phone" value={request.phone} />
              <Detail
                label="Organisation"
                value={request.organisation}
              />
              <Detail
                label="Job title"
                value={request.job_title}
              />
              <Detail label="Country" value={request.country} />
            </Section>

            {/* Consultation */}
            <Section title="Consultation">
              <Detail
                label="Type"
                value={request.consultation_type}
              />

              <Detail
                label="Preferred date"
                value={request.preferred_date}
              />

              <Detail
                label="Preferred time"
                value={request.preferred_time}
              />
            </Section>

            {/* Message */}
            {request.message && (
              <Section title="Client Message">
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {request.message}
                </div>
              </Section>
            )}

            {/* Workflow */}
            <Section title="Workflow">
              <div className="grid sm:grid-cols-2 gap-4">
                <Detail
                  label="Responded"
                  value={
                    request.responded_at
                      ? new Date(
                          request.responded_at
                        ).toLocaleString()
                      : "Not yet"
                  }
                />

                <Detail
                  label="Scheduled"
                  value={
                    request.scheduled_at
                      ? new Date(
                          request.scheduled_at
                        ).toLocaleString()
                      : "Not scheduled"
                  }
                />

                <Detail
                  label="Completed"
                  value={
                    request.completed_at
                      ? new Date(
                          request.completed_at
                        ).toLocaleString()
                      : "Not completed"
                  }
                />

                <Detail
                  label="Onboarded"
                  value={
                    request.onboarded_at
                      ? new Date(
                          request.onboarded_at
                        ).toLocaleString()
                      : "Not onboarded"
                  }
                />
              </div>
            </Section>

            {/* Notes */}
            {(request.admin_notes ||
              request.response_notes ||
              request.meeting_notes) && (
              <Section title="Notes">
                {request.admin_notes && (
                  <Note
                    label="Admin notes"
                    value={request.admin_notes}
                  />
                )}

                {request.response_notes && (
                  <Note
                    label="Response notes"
                    value={request.response_notes}
                  />
                )}

                {request.meeting_notes && (
                  <Note
                    label="Meeting notes"
                    value={request.meeting_notes}
                  />
                )}
              </Section>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Actions
              </h4>

              <div className="flex flex-wrap gap-3">
                {!["responded", "scheduled", "completed", "onboarded", "rejected"].includes(
                  request.status || ""
                ) && (
                  <ActionButton
                    onClick={onRespond}
                    icon={<MessageSquare className="w-4 h-4" />}
                  >
                    Mark Responded
                  </ActionButton>
                )}

                {["new", "reviewing", "responded"].includes(
                  request.status || ""
                ) && (
                  <ActionButton
                    onClick={onSchedule}
                    icon={<CalendarDays className="w-4 h-4" />}
                  >
                    Schedule
                  </ActionButton>
                )}

                {request.status === "scheduled" && (
                  <ActionButton
                    onClick={onComplete}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Mark Completed
                  </ActionButton>
                )}

                {request.status === "completed" && (
                  <ActionButton
                    onClick={onOnboard}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Mark Onboarded
                  </ActionButton>
                )}

                {!["completed", "onboarded", "rejected"].includes(
                  request.status || ""
                ) && (
                  <button
                    type="button"
                    onClick={onReject}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


// ============================================================
// SMALL UI HELPERS
// ============================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
        {title}
      </h4>

      <div className="grid sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <p className="text-sm text-gray-900 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

function Note({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
    >
      {icon}
      {children}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    reviewing: "bg-amber-50 text-amber-700 border-amber-200",
    responded: "bg-purple-50 text-purple-700 border-purple-200",
    scheduled: "bg-indigo-50 text-indigo-700 border-indigo-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    onboarded: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${
        styles[status] ||
        "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
