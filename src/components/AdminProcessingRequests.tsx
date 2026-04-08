import { motion } from "motion/react";
import { Clock, CheckCircle, XCircle, StopCircle, DollarSign, Eye, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface ProcessingRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestType: "daily" | "weekly" | "monthly";
  startDate: string;
  status: "pending" | "active" | "declined" | "disabled" | "ended";
  postsPerPeriod: number;
  specialRate?: number;
  requestDate: string;
  description?: string;
}

interface ViewRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: ProcessingRequest | null;
  onAccept: (requestId: string, specialRate: number) => void;
  onDecline: (requestId: string) => void;
}

function ViewRequestDialog({
  isOpen,
  onClose,
  request,
  onAccept,
  onDecline,
}: ViewRequestDialogProps) {
  const [specialRate, setSpecialRate] = useState(request?.specialRate || 0);

  if (!isOpen || !request) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          <h3 className="text-2xl mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Processing Request Details
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Request ID</p>
              <p className="text-gray-900 font-mono">{request.id}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">User Name</p>
                <p className="text-gray-900">{request.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">User Email</p>
                <p className="text-gray-900">{request.userEmail}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Request Type</p>
                <Badge>{request.requestType}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge
                  variant={
                    request.status === "active"
                      ? "default"
                      : request.status === "pending"
                      ? "secondary"
                      : request.status === "declined" || request.status === "disabled"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {request.status}
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Posts Per Period</p>
                <p className="text-gray-900">{request.postsPerPeriod} posts</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Request Date</p>
                <p className="text-gray-900">{request.requestDate}</p>
              </div>
            </div>

            {request.startDate && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                <p className="text-gray-900">{request.startDate}</p>
              </div>
            )}

            {request.description && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {request.description}
                </p>
              </div>
            )}

            {request.status === "pending" && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Special Subscription Rate ($/month)</p>
                <input
                  type="number"
                  value={specialRate}
                  onChange={(e) => setSpecialRate(parseFloat(e.target.value))}
                  placeholder="Enter special rate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave at 0 for standard pricing
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            {request.status === "pending" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    onDecline(request.id);
                    onClose();
                  }}
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
                <Button
                  onClick={() => {
                    onAccept(request.id, specialRate);
                    onClose();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Request
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

interface AdminProcessingRequestsProps {
  requests: ProcessingRequest[];
}

export function AdminProcessingRequests({
  requests: initialRequests,
}: AdminProcessingRequestsProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<ProcessingRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAccept = (requestId: string, specialRate: number) => {
    setRequests(
      requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "active" as const,
              specialRate: specialRate > 0 ? specialRate : undefined,
              startDate: new Date().toLocaleDateString(),
            }
          : r
      )
    );
    alert(`Request accepted with special rate: $${specialRate}/month`);
  };

  const handleDecline = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request && confirm(`Decline request from ${request.userName}?`)) {
      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status: "declined" as const } : r
        )
      );
    }
  };

  const handleDisable = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request && confirm(`Disable active request from ${request.userName}?`)) {
      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status: "disabled" as const } : r
        )
      );
    }
  };

  const handleEnd = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request && confirm(`End active request from ${request.userName}?`)) {
      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status: "ended" as const } : r
        )
      );
    }
  };

  const handleView = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setIsViewDialogOpen(true);
    }
  };

  const filteredRequests = requests.filter(
    (request) =>
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    active: requests.filter((r) => r.status === "active").length,
    declined: requests.filter((r) => r.status === "declined").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Daily Analysis Processing Requests
        </h3>
        <p className="text-gray-600">
          Manage user requests for automated daily post analysis
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Requests</p>
          <p className="text-3xl text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-3xl text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Declined</p>
          <p className="text-3xl text-red-600">{stats.declined}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by user name, email, or request type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>User</TableHead>
              <TableHead>Request Type</TableHead>
              <TableHead>Posts/Period</TableHead>
              <TableHead>Special Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  No processing requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request, index) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <TableCell>
                    <div>
                      <div className="text-gray-900">{request.userName}</div>
                      <div className="text-sm text-gray-500">{request.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.requestType}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {request.postsPerPeriod} posts
                  </TableCell>
                  <TableCell>
                    {request.specialRate ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">{request.specialRate}/mo</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Standard</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "active"
                          ? "default"
                          : request.status === "pending"
                          ? "secondary"
                          : request.status === "declined" || request.status === "disabled"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {request.requestDate}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(request.id)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAccept(request.id, 0)}
                            title="Accept request"
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDecline(request.id)}
                            title="Decline request"
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {request.status === "active" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisable(request.id)}
                            title="Disable"
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <StopCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEnd(request.id)}
                            title="End subscription"
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ViewRequestDialog
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </div>
  );
}
