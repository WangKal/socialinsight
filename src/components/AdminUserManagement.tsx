import { motion } from "motion/react";
import { Users, Eye, Ban, Check, Trash2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "suspended";
  totalPosts: number;
  creditsUsed: number;
  creditsRemaining: number;
  sitesAnalyzed: number;
  campaigns: number;
  joinedDate: string;
  lastActive: string;
}

interface AdminUserManagementProps {
  users: User[];
  onViewUser: (userId: string) => void;
  onSuspendUser: (userId: string) => void;
  onActivateUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddCredits: (userId: string) => void;
  isSubAdmin?: boolean;
}

export function AdminUserManagement({
  users,
  onViewUser,
  onSuspendUser,
  onActivateUser,
  onDeleteUser,
  onAddCredits,
  isSubAdmin = false,
}: AdminUserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;
  const totalCreditsUsed = users.reduce((sum, u) => sum + u.creditsUsed, 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl text-gray-900">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Active Users</p>
          <p className="text-3xl text-green-600">{activeUsers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Suspended Users</p>
          <p className="text-3xl text-red-600">{suspendedUsers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Credits Used</p>
          <p className="text-3xl text-violet-600">{totalCreditsUsed.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Credits Used</TableHead>
              <TableHead>Credits Remaining</TableHead>
              <TableHead>Sites</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <TableCell>
                  <div>
                    <div className="text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "active" ? "default" : "destructive"}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-900">{user.totalPosts}</TableCell>
                <TableCell className="text-gray-900">
                  {user.creditsUsed.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      user.creditsRemaining > 100
                        ? "text-green-600"
                        : user.creditsRemaining > 50
                        ? "text-amber-600"
                        : "text-red-600"
                    }
                  >
                    {user.creditsRemaining}
                  </span>
                </TableCell>
                <TableCell className="text-gray-900">{user.sitesAnalyzed}</TableCell>
                <TableCell className="text-gray-900">{user.campaigns}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {user.lastActive}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewUser(user.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {!isSubAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddCredits(user.id)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        {user.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSuspendUser(user.id)}
                          >
                            <Ban className="w-4 h-4 text-amber-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onActivateUser(user.id)}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
