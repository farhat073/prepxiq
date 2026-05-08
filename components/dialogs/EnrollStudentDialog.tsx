import { useEffect } from "react";
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
import { useUnassignedStudents, useEnrollStudentInBatch, useBatches } from "@/lib/supabase/hooks";

const enrollSchema = z.object({
  student_id: z.string().min(1, "Please select a student"),
  batch_id: z.string().min(1, "Please select a batch"),
});

type EnrollFormValues = z.infer<typeof enrollSchema>;

interface EnrollStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultBatchId?: string;
  allowedBatches?: { id: string; name: string }[];
}

export function EnrollStudentDialog({ open, onOpenChange, defaultBatchId, allowedBatches }: EnrollStudentDialogProps) {
  const { data: allBatches, isLoading: batchesLoading } = useBatches();
  const { data: students, isLoading: studentsLoading } = useUnassignedStudents();
  const enrollMutation = useEnrollStudentInBatch();

  const form = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      student_id: "",
      batch_id: defaultBatchId || (allowedBatches?.[0]?.id ?? ""),
    },
  });

  useEffect(() => {
    if (open && defaultBatchId) {
      form.setValue("batch_id", defaultBatchId);
    }
  }, [open, defaultBatchId, form]);

  const batchesToDisplay = allowedBatches || allBatches;

  const onSubmit = async (data: EnrollFormValues) => {
    try {
      await enrollMutation.mutateAsync({
        student_id: data.student_id,
        batch_id: data.batch_id,
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
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>
            Add an unassigned student to a batch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          
          <div className="space-y-2">
            <Label>Student</Label>
            <Select onValueChange={(val) => form.setValue("student_id", val as string)} value={form.watch("student_id")} disabled={studentsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students?.length === 0 && <SelectItem value="none" disabled>No unassigned students found</SelectItem>}
                {students?.map((student) => (
                  <SelectItem key={student.profile_id} value={student.profile_id}>
                    {student.profile?.full_name} ({student.admission_number || "No ID"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.student_id && (
              <p className="text-[0.8rem] font-medium text-destructive">{form.formState.errors.student_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Batch</Label>
            <Select onValueChange={(val) => form.setValue("batch_id", val as string)} value={form.watch("batch_id")} disabled={!batchesToDisplay}>
              <SelectTrigger>
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {batchesToDisplay?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.batch_id && (
              <p className="text-[0.8rem] font-medium text-destructive">{form.formState.errors.batch_id.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={enrollMutation.isPending || !students || students.length === 0}>
              {enrollMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enroll
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
