"use client";

import { useState } from "react";
import { UserCheck, Search, Plus, MoreVertical, Mail, Phone, BookOpen, Clock, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTeachers, useTeacherBatches } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssignTeacherDialog } from "@/components/dialogs/AssignTeacherDialog";
import { UserFormDialog, EditUserDialog } from "@/components/dialogs/UserFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

function TeacherCard({ teacher, onAssignClick, onEditClick, onDeleteClick }: { 
  teacher: any; 
  onAssignClick: (t: any) => void;
  onEditClick: (t: any) => void;
  onDeleteClick: (t: any) => void;
}) {
  const { data: batches } = useTeacherBatches(teacher.id);

  return (
    <Card className="hover:border-primary/30 transition-all group overflow-hidden flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 bg-accent/5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-blue-500/10 text-blue-600 font-bold">
                {teacher.full_name?.split(" ").map((n: string) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm line-clamp-1">{teacher.full_name}</h4>
              <Badge variant={teacher.is_active ? "default" : "secondary"} 
                className={teacher.is_active ? "text-[10px] h-5 py-0 bg-emerald-500/15 text-emerald-500 border-emerald-500/20" : "text-[10px] h-5 py-0"}>
                {teacher.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAssignClick(teacher)}>
                <BookOpen className="w-4 h-4 mr-2" /> Assign to Batch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditClick(teacher)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDeleteClick(teacher)}>
                <Trash2 className="w-4 h-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
            <span>{teacher.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span>{teacher.phone || "No phone added"}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30">
           <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Batches</span>
           </div>
           <div className="flex flex-wrap gap-1.5">
              {batches && batches.length > 0 ? (
                batches.map((b: any) => (
                  <Badge key={b.id} variant="secondary" className="text-[10px] py-0 bg-accent/50">
                    {b.name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">No batches assigned</span>
              )}
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminTeachersPage() {
  const { data: teachers, isLoading, refetch } = useTeachers();
  const [search, setSearch] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  
  // Add/Edit/Delete states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  if (isLoading) return <LoadingSkeleton variant="cards" />;

  const filteredTeachers = teachers?.filter((t: any) => 
    t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssignClick = (teacher: any) => {
    setSelectedTeacher(teacher);
    setAssignDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/users?id=${deleteTarget.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success("Teacher removed successfully");
      refetch();
    } catch (err: any) {
      toast.error("Failed to remove teacher", { description: err.message });
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Directory"
        subtitle="Manage teaching staff, assignments, and profiles."
        icon={UserCheck}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search teachers by name or email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers && filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher: any) => (
            <TeacherCard 
              key={teacher.id} 
              teacher={teacher} 
              onAssignClick={handleAssignClick}
              onEditClick={(t) => setEditTarget(t)}
              onDeleteClick={(t) => setDeleteTarget(t)}
            />
          ))
        ) : (
          <div className="col-span-full py-24 text-center border border-dashed rounded-xl bg-accent/5">
            <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No Teachers Found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              {search ? "Try a different search term." : "Add your teaching staff to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Assign Teacher to Batch */}
      <AssignTeacherDialog 
        open={assignDialogOpen} 
        onOpenChange={setAssignDialogOpen} 
        teacherId={selectedTeacher?.id} 
        teacherName={selectedTeacher?.full_name}
      />

      {/* Add Teacher — reuses UserFormDialog with teacher role pre-filled */}
      <UserFormDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onSuccess={() => refetch()} 
      />

      {/* Edit Teacher */}
      <EditUserDialog 
        open={!!editTarget} 
        onOpenChange={(open) => !open && setEditTarget(null)} 
        user={editTarget} 
        onSuccess={() => refetch()} 
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Teacher"
        description={`Are you sure you want to remove "${deleteTarget?.full_name}"? This will delete their account and all associated data.`}
        confirmLabel="Remove Teacher"
        onConfirm={handleDelete}
      />
    </div>
  );
}
