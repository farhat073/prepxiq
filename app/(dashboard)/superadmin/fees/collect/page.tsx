"use client";

import { useState } from "react";
import { DollarSign, Search, ChevronLeft, Save, Loader2, User } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import { useFeeRecords, useUpdateFeeRecord, useStudents } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminCollectFeePage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const { data: students } = useStudents();
  const { data: feeRecords, isLoading: loadingFees } = useFeeRecords(studentId || undefined);
  const updateFeeMutation = useUpdateFeeRecord();

  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");

  const selectedRecord = feeRecords?.find((r: any) => r.id === selectedRecordId);
  const pendingAmount = selectedRecord ? (selectedRecord.amount_due - (selectedRecord.amount_paid || 0)) : 0;

  const handleCollect = async () => {
    if (!selectedRecordId || !amount) {
      toast.error("Please select a record and enter amount");
      return;
    }

    try {
      const paidAmt = parseFloat(amount);
      await updateFeeMutation.mutateAsync({
        id: selectedRecordId,
        amount_paid: (selectedRecord.amount_paid || 0) + paidAmt,
        status: paidAmt >= pendingAmount ? "paid" : "partial",
        payment_method: method,
        paid_date: new Date().toISOString(),
      });
      router.push("/admin/fees");
    } catch (err) {
      // Handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title="Collect Fee"
          subtitle="Record manual fee payments and issue receipts."
          icon={DollarSign}
        />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Search Student</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={studentId} onValueChange={(val) => { setStudentId(val as string); setSelectedRecordId(""); }}>
                <SelectTrigger>
                  <User className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Choose student..." />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((s: any) => (
                    <SelectItem key={s.id} value={s.profile_id}>{s.profile?.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {studentId && (
              <div className="space-y-2 pt-2">
                <Label>Select Pending Fee</Label>
                <Select value={selectedRecordId} onValueChange={(v) => setSelectedRecordId(v as string)}>
                  <SelectTrigger><SelectValue placeholder="Choose fee record..." /></SelectTrigger>
                  <SelectContent>
                    {feeRecords?.filter((r: any) => r.status !== 'paid').map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.structure?.name || "Fee"} — Due ₹{r.amount_due - (r.amount_paid || 0)}
                      </SelectItem>
                    ))}
                    {feeRecords?.filter((r: any) => r.status !== 'paid').length === 0 && (
                      <SelectItem value="none" disabled>No pending fees found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedRecordId && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Payment Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount Paying (₹)</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={pendingAmount.toString()} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as string)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI / Online</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-2" onClick={handleCollect} disabled={updateFeeMutation.isPending}>
                {updateFeeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Record Payment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
