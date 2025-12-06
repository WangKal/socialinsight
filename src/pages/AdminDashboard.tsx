import { motion, AnimatePresence } from "motion/react";
import { Shield, Users, DollarSign, BarChart3, MessageSquare, Settings, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { AdminUserManagement } from "../components/AdminUserManagement";
import { AdminPayments } from "../components/AdminPayments";
import { AdminManagement } from "../components/AdminManagement";

// Mock data
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    status: "active" as const,
    totalPosts: 45,
    creditsUsed: 1250,
    creditsRemaining: 750,
    sitesAnalyzed: 12,
    campaigns: 3,
    joinedDate: "2024-11-01",
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Sarah Smith",
    email: "sarah@example.com",
    status: "active" as const,
    totalPosts: 78,
    creditsUsed: 2100,
    creditsRemaining: 900,
    sitesAnalyzed: 24,
    campaigns: 5,
    joinedDate: "2024-10-15",
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    status: "suspended" as const,
    totalPosts: 23,
    creditsUsed: 650,
    creditsRemaining: 50,
    sitesAnalyzed: 8,
    campaigns: 2,
    joinedDate: "2024-11-20",
    lastActive: "1 week ago",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    status: "active" as const,
    totalPosts: 156,
    creditsUsed: 4200,
    creditsRemaining: 1800,
    sitesAnalyzed: 45,
    campaigns: 8,
    joinedDate: "2024-09-10",
    lastActive: "30 min ago",
  },
];

const mockPayments = [
  {
    id: "PAY-001",
    userId: "1",
    userName: "John Doe",
    userEmail: "john@example.com",
    amount: 99,
    credits: 1000,
    date: "Dec 3, 2025",
    status: "completed" as const,
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "PAY-002",
    userId: "2",
    userName: "Sarah Smith",
    userEmail: "sarah@example.com",
    amount: 199,
    credits: 2500,
    date: "Dec 2, 2025",
    status: "completed" as const,
    paymentMethod: "Mastercard •••• 5555",
  },
  {
    id: "PAY-003",
    userId: "4",
    userName: "Emily Davis",
    userEmail: "emily@example.com",
    amount: 299,
    credits: 5000,
    date: "Dec 1, 2025",
    status: "completed" as const,
    paymentMethod: "Visa •••• 1234",
  },
  {
    id: "PAY-004",
    userId: "3",
    userName: "Mike Johnson",
    userEmail: "mike@example.com",
    amount: 99,
    credits: 1000,
    date: "Nov 30, 2025",
    status: "failed" as const,
    paymentMethod: "Visa •••• 9876",
  },
];

const mockAdmins = [
  {
    id: "A1",
    name: "Admin User",
    email: "admin@platform.com",
    role: "admin" as const,
    permissions: ["Full Access"],
    joinedDate: "2024-01-01",
    lastActive: "Just now",
  },
  {
    id: "A2",
    name: "Support Admin",
    email: "support@platform.com",
    role: "sub-admin" as const,
    permissions: ["View Only", "No Payment Access", "No Credit Management"],
    joinedDate: "2024-06-15",
    lastActive: "1 hour ago",
  },
];

type TabType = "overview" | "users" | "payments" | "admins";

interface AddCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

function AddCreditsDialog({ isOpen, onClose, userId, userName }: AddCreditsDialogProps) {
  const [credits, setCredits] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Added ${credits} credits to ${userName}`);
    setCredits("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Add Credits
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">Add credits to {userName}'s account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Credits Amount</label>
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
                min="1"
                placeholder="Enter credits to add"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white"
              >
                Add Credits
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ViewUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: typeof mockUsers[0] | null;
  payments: typeof mockPayments;
}

function ViewUserDialog({ isOpen, onClose, user, payments }: ViewUserDialogProps) {
  if (!isOpen || !user) return null;

  const userPayments = payments.filter((p) => p.userId === user.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              User Details
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="mb-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-gray-900">{user.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined Date</p>
                <p className="text-gray-900">{user.joinedDate}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Posts</p>
              <p className="text-2xl text-gray-900">{user.totalPosts}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Credits Used</p>
              <p className="text-2xl text-gray-900">{user.creditsUsed}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Credits Remaining</p>
              <p className="text-2xl text-gray-900">{user.creditsRemaining}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Sites Analyzed</p>
              <p className="text-2xl text-gray-900">{user.sitesAnalyzed}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Campaigns</p>
              <p className="text-2xl text-gray-900">{user.campaigns}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Last Active</p>
              <p className="text-2xl text-gray-900">{user.lastActive}</p>
            </div>
          </div>

          {/* User Payments */}
          <div>
            <h4 className="text-lg mb-3 text-gray-900">Payment History</h4>
            <AdminPayments payments={userPayments} selectedUserId={user.id} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState<TabType>("overview");
  const [users, setUsers] = useState(mockUsers);
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentAdminRole] = useState<"admin" | "sub-admin">("admin");

  const totalPosts = users.reduce((sum, u) => sum + u.totalPosts, 0);
  const totalCampaigns = users.reduce((sum, u) => sum + u.campaigns, 0);
  const totalRevenue = mockPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsViewUserOpen(true);
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "suspended" as const } : u)));
    alert("User suspended");
  };

  const handleActivateUser = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "active" as const } : u)));
    alert("User activated");
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted");
    }
  };

  const handleAddCredits = (userId: string) => {
    setSelectedUserId(userId);
    setIsAddCreditsOpen(true);
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                {currentAdminRole === "admin" ? "Full administrative access" : "View-only access"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "payments", label: "Payments", icon: DollarSign },
            { id: "admins", label: "Admins", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  currentTab === tab.id
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentTab === "overview" && (
            <div>
              {/* Overview Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                  <p className="text-4xl text-gray-900">{users.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-8 h-8 text-violet-600" />
                    <p className="text-sm text-gray-600">Total Posts</p>
                  </div>
                  <p className="text-4xl text-gray-900">{totalPosts}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-8 h-8 text-green-600" />
                    <p className="text-sm text-gray-600">Total Campaigns</p>
                  </div>
                  <p className="text-4xl text-gray-900">{totalCampaigns}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-8 h-8 text-emerald-600" />
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <p className="text-4xl text-gray-900">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl mb-4 text-gray-900">Recent Users</h3>
                  <AdminUserManagement
                    users={users.slice(0, 3)}
                    onViewUser={handleViewUser}
                    onSuspendUser={handleSuspendUser}
                    onActivateUser={handleActivateUser}
                    onDeleteUser={handleDeleteUser}
                    onAddCredits={handleAddCredits}
                    isSubAdmin={currentAdminRole === "sub-admin"}
                  />
                </div>
                <div>
                  <h3 className="text-xl mb-4 text-gray-900">Recent Payments</h3>
                  <AdminPayments payments={mockPayments.slice(0, 3)} />
                </div>
              </div>
            </div>
          )}

          {currentTab === "users" && (
            <AdminUserManagement
              users={users}
              onViewUser={handleViewUser}
              onSuspendUser={handleSuspendUser}
              onActivateUser={handleActivateUser}
              onDeleteUser={handleDeleteUser}
              onAddCredits={handleAddCredits}
              isSubAdmin={currentAdminRole === "sub-admin"}
            />
          )}

          {currentTab === "payments" && currentAdminRole === "admin" && (
            <AdminPayments payments={mockPayments} />
          )}

          {currentTab === "payments" && currentAdminRole === "sub-admin" && (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">You don't have permission to view payments</p>
            </div>
          )}

          {currentTab === "admins" && (
            <AdminManagement
              admins={mockAdmins}
              onDeleteAdmin={(id) => console.log("Delete admin", id)}
              currentAdminRole={currentAdminRole}
            />
          )}
        </motion.div>
      </div>

      {/* Dialogs */}
      {selectedUser && (
        <>
          <AddCreditsDialog
            isOpen={isAddCreditsOpen}
            onClose={() => {
              setIsAddCreditsOpen(false);
              setSelectedUserId(null);
            }}
            userId={selectedUser.id}
            userName={selectedUser.name}
          />
          <ViewUserDialog
            isOpen={isViewUserOpen}
            onClose={() => {
              setIsViewUserOpen(false);
              setSelectedUserId(null);
            }}
            user={selectedUser}
            payments={mockPayments}
          />
        </>
      )}
    </div>
  );
}
