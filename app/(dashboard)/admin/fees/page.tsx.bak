"use client";

import { useState } from "react";
import { DollarSign, Search, Filter, CheckCircle2, AlertCircle, Clock, Receipt, MoreVertical } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useFeeRecords, useUpdateFeeRecord } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminFeesPage() {
  const { data: records, isLoading } = useFeeRecords();
  const updateFeeMutation = useUpdateFeeRecord();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  
  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionId, setTransactionId] = useState("");

  if (isLoading) return <LoadingSkeleton variant="table" />;

  const filteredRecords = records?.filter((r: any) => {
    const matchesSearch = r.student?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                         r.receipt_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = records?.reduce((acc: number, r: any) => acc + (r.amount_paid || 0), 0) || 0;
  const totalPending = records?.filter((r: any) => r.status !== "paid").reduce((acc: number, r: any) => acc + (r.amount_due - r.amount_paid), 0) || 0;

  const handleCollectFee = async () => {
    if (!selectedRecord) return;
    
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const isFullyPaid = paid >= (selectedRecord.amount_due - selectedRecord.amount_paid);
      
      await updateFeeMutation.mutateAsync({
        id: selectedRecord.id,
        amount_paid: (selectedRecord.amount_paid || 0) + paid,
        status: isFullyPaid ? "paid" : "partial",
        payment_method: paymentMethod,
        transaction_id: transactionId,
        paid_date: new Date().toISOString(),
      });
      
      setIsPayDialogOpen(false);
      setSelectedRecord(null);
      setAmountPaid("");
      setTransactionId("");
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        subtitle="Track student payments, dues, and issue receipts."
        icon={DollarSign}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">₹{totalCollected.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Pending Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">₹{totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{records?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or receipt..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as string)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fee Records Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/50 border-b border-border/50">
              <tr>
                <th className="text-left p-4 font-medium">Student</th>
                <th className="text-left p-4 font-medium">Fee Type</th>
                <th className="text-left p-4 font-medium">Due Date</th>
                <th className="text-right p-4 font-medium">Amount</th>
                <th className="text-right p-4 font-medium">Paid</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredRecords && filteredRecords.length > 0 ? (
                filteredRecords.map((record: any) => (
                  <tr key={record.id} className="hover:bg-accent/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{record.student?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{record.receipt_number || "No receipt"}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-medium">{record.structure?.name || "Regular Fee"}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {record.due_date ? format(new Date(record.due_date), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="p-4 text-right font-semibold">₹{record.amount_due.toLocaleString()}</td>
                    <td className="p-4 text-right text-emerald-600 font-medium">₹{(record.amount_paid || 0).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <Badge 
                        variant="outline"
                        className={`capitalize font-medium ${
                          record.status === "paid" ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/5" :
                          record.status === "overdue" ? "border-rose-500/50 text-rose-600 bg-rose-500/5" :
                          record.status === "partial" ? "border-blue-500/50 text-blue-600 bg-blue-500/5" :
                          "border-amber-500/50 text-amber-600 bg-amber-500/5"
                        }`}
                      >
                        {record.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedRecord(record);
                            setAmountPaid((record.amount_due - record.amount_paid).toString());
                            setIsPayDialogOpen(true);
                          }} disabled={record.status === "paid"}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Collect Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Receipt className="w-4 h-4 mr-2" />
                            View Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground italic">
                    {search || statusFilter !== "all" ? "No records match your filters." : "No fee records found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>
              Record a manual payment for {selectedRecord?.student?.full_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Due</Label>
                <div className="p-2 rounded bg-muted font-mono">₹{selectedRecord?.amount_due - (selectedRecord?.amount_paid || 0)}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Paying</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  value={amountPaid} 
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as string)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI / Online</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="txid">Transaction ID / Reference (Optional)</Label>
              <Input 
                id="txid" 
                value={transactionId} 
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. UPI Ref Number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCollectFee} 
              disabled={updateFeeMutation.isPending}
            >
              {updateFeeMutation.isPending ? "Recording..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
