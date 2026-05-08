"use client";

import { useState } from "react";
import { UserPlus, Search, Filter, Phone, Mail, Calendar, CheckCircle2, XCircle, Clock, MoreVertical, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAdmissions, useUpdateAdmission } from "@/lib/supabase/hooks";
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

export default function AdminAdmissionsPage() {
  const { data: admissions, isLoading } = useAdmissions();
  const updateAdmissionMutation = useUpdateAdmission();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (isLoading) return <LoadingSkeleton variant="table" />;

  const filteredAdmissions = admissions?.filter((a: any) => {
    const matchesSearch = a.student_name?.toLowerCase().includes(search.toLowerCase()) || 
                         a.phone_number?.includes(search);
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateAdmissionMutation.mutateAsync({ id, status: newStatus });
      toast.success(`Inquiry marked as ${newStatus}`);
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions & Inquiries"
        subtitle="Manage student applications and enrollment pipeline."
        icon={UserPlus}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            New Inquiry
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">New Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admissions?.filter((a: any) => a.status === 'pending').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Followed Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admissions?.filter((a: any) => a.status === 'followed_up').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{admissions?.filter((a: any) => a.status === 'enrolled').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {admissions?.length ? Math.round((admissions.filter((a: any) => a.status === 'enrolled').length / admissions.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or phone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="followed_up">Followed Up</option>
            <option value="enrolled">Enrolled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/50 border-b border-border/50">
              <tr>
                <th className="text-left p-4 font-medium">Student Name</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Branch/Level</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredAdmissions && filteredAdmissions.length > 0 ? (
                filteredAdmissions.map((admission: any) => (
                  <tr key={admission.id} className="hover:bg-accent/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{admission.student_name}</div>
                      <div className="text-xs text-muted-foreground">Guardian: {admission.parent_name || "—"}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{admission.phone_number}</span>
                        </div>
                        {admission.email && (
                          <div className="flex items-center gap-2 text-xs">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span>{admission.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-medium">{admission.branch?.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{admission.level?.name}</div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {format(new Date(admission.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-center">
                      <Badge 
                        variant="outline"
                        className={`capitalize text-[10px] ${
                          admission.status === "enrolled" ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/5" :
                          admission.status === "pending" ? "border-amber-500/50 text-amber-600 bg-amber-500/5" :
                          admission.status === "followed_up" ? "border-blue-500/50 text-blue-600 bg-blue-500/5" :
                          "border-muted text-muted-foreground"
                        }`}
                      >
                        {admission.status.replace('_', ' ')}
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
                          <DropdownMenuItem onClick={() => handleStatusUpdate(admission.id, 'followed_up')}>
                            <Clock className="w-4 h-4 mr-2" />
                            Mark Followed Up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(admission.id, 'enrolled')} className="text-emerald-600">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Enrollment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(admission.id, 'cancelled')} className="text-destructive">
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Inquiry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                    No admission inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
