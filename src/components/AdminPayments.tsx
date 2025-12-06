import { motion } from "motion/react";
import { DollarSign, TrendingUp, CreditCard, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  credits: number;
  date: string;
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
}

interface AdminPaymentsProps {
  payments: Payment[];
  selectedUserId?: string;
}

export function AdminPayments({ payments, selectedUserId }: AdminPaymentsProps) {
  const filteredPayments = selectedUserId
    ? payments.filter((p) => p.userId === selectedUserId)
    : payments;

  const totalRevenue = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = filteredPayments.length;
  const completedTransactions = filteredPayments.filter(
    (p) => p.status === "completed"
  ).length;
  const totalCreditsIssued = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.credits, 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <p className="text-3xl text-green-600">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Total Transactions</p>
          <p className="text-3xl text-gray-900">{totalTransactions}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Completed</p>
          <p className="text-3xl text-blue-600">{completedTransactions}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Credits Issued</p>
          <p className="text-3xl text-violet-600">{totalCreditsIssued.toLocaleString()}</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="mb-4 flex justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Transaction ID</TableHead>
              {!selectedUserId && <TableHead>User</TableHead>}
              <TableHead>Amount</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment, index) => (
              <motion.tr
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <TableCell className="text-gray-900">{payment.id}</TableCell>
                {!selectedUserId && (
                  <TableCell>
                    <div>
                      <div className="text-gray-900">{payment.userName}</div>
                      <div className="text-sm text-gray-500">{payment.userEmail}</div>
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-gray-900">${payment.amount}</TableCell>
                <TableCell className="text-gray-900">
                  {payment.credits.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{payment.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    {payment.paymentMethod}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === "completed"
                        ? "default"
                        : payment.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
