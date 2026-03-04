import { motion } from "motion/react";
import { Link as LinkIcon, Eye, Trash2, CheckCircle, PlayCircle, Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface Request {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  link: string;
  status: "pending" | "analyzing" | "completed" | "deleted";
  dateSubmitted: string;
  description?: string;
}

interface ViewRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
}

function ViewRequestDialog({ isOpen, onClose, request }: ViewRequestDialogProps) {
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
            Request Details
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
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Post Link</p>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <LinkIcon className="w-4 h-4 text-violet-600 flex-shrink-0" />
                <a
                  href={request.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-800 break-all"
                >
                  {request.link}
                </a>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge
                  variant={
                    request.status === "completed"
                      ? "default"
                      : request.status === "analyzing"
                      ? "secondary"
                      : request.status === "deleted"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {request.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Date Submitted</p>
                <p className="text-gray-900">{request.dateSubmitted}</p>
              </div>
            </div>
            
            {request.description && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{request.description}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

interface AdminRequestsProps {
  requests: Request[];
  onAnalyze?: (requestId: string) => void;
  onNotifyDone?: (requestId: string) => void;
  onDelete?: (requestId: string) => void;
  onView?: (requestId: string) => void;
}

export function AdminRequests({
  requests: initialRequests,
  onAnalyze,
  onNotifyDone,
  onDelete,
  onView,
}: AdminRequestsProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAnalyze = (requestId: string) => {
    setRequests(
      requests.map((r) =>
        r.id === requestId ? { ...r, status: "analyzing" as const } : r
      )
    );
    onAnalyze?.(requestId);
    
    // Simulate analysis completion
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "completed" as const } : r
        )
      );
    }, 2000);
  };

  const handleNotifyDone = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      alert(`Notification sent to ${request.userName} about completed analysis`);
      onNotifyDone?.(requestId);
    }
  };

  const handleDelete = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request && confirm(`Delete request from ${request.userName}?`)) {
      setRequests(requests.map((r) => 
        r.id === requestId ? { ...r, status: "deleted" as const } : r
      ));
      onDelete?.(requestId);
    }
  };

  const handleView = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setIsViewDialogOpen(true);
      onView?.(requestId);
    }
  };

  const filteredRequests = requests.filter(
    (request) =>
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.link.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    analyzing: requests.filter((r) => r.status === "analyzing").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          User Requests
        </h3>
        <p className="text-gray-600">Manage user post analysis requests</p>
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
          <p className="text-sm text-gray-600 mb-1">Analyzing</p>
          <p className="text-3xl text-blue-600">{stats.analyzing}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-3xl text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by user name, email, or link..."
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
              <TableHead>Post Link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  No requests found
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
                    <div className="max-w-xs">
                      <a
                        href={request.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:text-violet-800 text-sm truncate block"
                        title={request.link}
                      >
                        {request.link}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "completed"
                          ? "default"
                          : request.status === "analyzing"
                          ? "secondary"
                          : request.status === "deleted"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {request.dateSubmitted}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAnalyze(request.id)}
                          title="Start analysis"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {request.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotifyDone(request.id)}
                          title="Notify user"
                          className="text-green-600 hover:text-green-800"
                        >
                          <Bell className="w-4 h-4" />
                        </Button>
                      )}
                      {request.status !== "deleted" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(request.id)}
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
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
      />
    </div>
  );
}
