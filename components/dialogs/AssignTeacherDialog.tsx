import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBatches, useSubjects, useAssignTeacherToBatch } from "@/lib/supabase/hooks";

const assignSchema = z.object({
  batch_id: z.string().min(1, "Please select a batch"),
  subject_id: z.string().min(1, "Please select a subject"),
});

type AssignFormValues = z.infer<typeof assignSchema>;

interface AssignTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string | null;
  teacherName?: string;
}

export function AssignTeacherDialog({ open, onOpenChange, teacherId, teacherName }: AssignTeacherDialogProps) {
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const assignMutation = useAssignTeacherToBatch();

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      batch_id: "",
      subject_id: "",
    },
  });

  const onSubmit = async (data: AssignFormValues) => {
    if (!teacherId) return;
    try {
      await assignMutation.mutateAsync({
        teacher_id: teacherId,
        batch_id: data.batch_id,
        subject_id: data.subject_id,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Batch to Teacher</DialogTitle>
          <DialogDescription>
            Assign a batch and subject to {teacherName || "this teacher"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Batch</Label>
            <Select onValueChange={(val) => form.setValue("batch_id", val as string)} value={form.watch("batch_id")} disabled={batchesLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name} {batch.level?.name ? `(${batch.level.name})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.batch_id && (
              <p className="text-[0.8rem] font-medium text-destructive">{form.formState.errors.batch_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Select onValueChange={(val) => form.setValue("subject_id", val as string)} value={form.watch("subject_id")} disabled={subjectsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.subject_id && (
              <p className="text-[0.8rem] font-medium text-destructive">{form.formState.errors.subject_id.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={assignMutation.isPending || !teacherId}>
              {assignMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assign Teacher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
