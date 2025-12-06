import { motion } from "motion/react";
import { Shield, UserPlus, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sub-admin";
  permissions: string[];
  joinedDate: string;
  lastActive: string;
}

interface AddAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (admin: { name: string; email: string; role: "admin" | "sub-admin" }) => void;
}

function AddAdminDialog({ isOpen, onClose, onAdd }: AddAdminDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "sub-admin">("sub-admin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, email, role });
    setName("");
    setEmail("");
    setRole("sub-admin");
    onClose();
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <h3 className="text-2xl mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Add Admin
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "sub-admin")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="sub-admin">Sub Admin (View Only)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white"
              >
                Add Admin
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}

interface AdminManagementProps {
  admins: Admin[];
  onDeleteAdmin: (adminId: string) => void;
  currentAdminRole: "admin" | "sub-admin";
}

export function AdminManagement({
  admins,
  onDeleteAdmin,
  currentAdminRole,
}: AdminManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [adminList, setAdminList] = useState(admins);

  const handleAddAdmin = (newAdmin: { name: string; email: string; role: "admin" | "sub-admin" }) => {
    const admin: Admin = {
      id: Date.now().toString(),
      ...newAdmin,
      permissions: newAdmin.role === "admin" 
        ? ["Full Access"]
        : ["View Only", "No Payment Access", "No Credit Management"],
      joinedDate: new Date().toLocaleDateString(),
      lastActive: "Just now",
    };
    setAdminList([...adminList, admin]);
  };

  const canModify = currentAdminRole === "admin";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Admin Management
          </h3>
          <p className="text-gray-600">Manage admin and sub-admin accounts</p>
        </div>
        {canModify && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Admin
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Admins</p>
          <p className="text-3xl text-gray-900">{adminList.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Full Admins</p>
          <p className="text-3xl text-violet-600">
            {adminList.filter((a) => a.role === "admin").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Sub Admins</p>
          <p className="text-3xl text-blue-600">
            {adminList.filter((a) => a.role === "sub-admin").length}
          </p>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Admin</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Last Active</TableHead>
              {canModify && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminList.map((admin, index) => (
              <motion.tr
                key={admin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <TableCell>
                  <div>
                    <div className="text-gray-900">{admin.name}</div>
                    <div className="text-sm text-gray-500">{admin.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={admin.role === "admin" ? "default" : "secondary"}
                  >
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {admin.permissions.map((perm, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {admin.joinedDate}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {admin.lastActive}
                </TableCell>
                {canModify && (
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete admin ${admin.name}?`)) {
                            setAdminList(adminList.filter((a) => a.id !== admin.id));
                            onDeleteAdmin(admin.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddAdminDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddAdmin}
      />
    </div>
  );
}
