"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Batch } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useLevels, useBranches, useAcademicYears } from "@/lib/supabase/hooks";

const batchSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().optional(),
  level_id: z.string().min(1, "Level is required"),
  branch_id: z.string().min(1, "Branch is required"),
  academic_year_id: z.string().min(1, "Academic Year is required"),
  capacity: z.number().min(1, "Must be at least 1"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_active: z.boolean(),
});

type BatchFormValues = z.infer<typeof batchSchema>;

interface BatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch?: Batch | null;
  onSubmit: (data: BatchFormValues) => Promise<void>;
}

export function BatchFormDialog({ open, onOpenChange, batch, onSubmit }: BatchFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!batch;

  const { data: levels } = useLevels();
  const { data: branches } = useBranches();
  const { data: academicYears } = useAcademicYears();

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: "", code: "", level_id: "", branch_id: "", academic_year_id: "",
      capacity: 30, start_date: "", end_date: "", start_time: "", end_time: "", is_active: true,
    },
  });

  useEffect(() => {
    if (batch) {
      form.reset({
        name: batch.name,
        code: batch.code || "",
        level_id: batch.level_id || "",
        branch_id: batch.branch_id || "",
        academic_year_id: batch.academic_year_id || "",
        capacity: batch.capacity || 30,
        start_date: batch.start_date ? batch.start_date.split("T")[0] : "",
        end_date: batch.end_date ? batch.end_date.split("T")[0] : "",
        start_time: batch.start_time || "",
        end_time: batch.end_time || "",
        is_active: batch.is_active,
      });
    } else {
      // Set defaults if lists are available
      const defaultYear = academicYears?.find((y) => y.is_current)?.id || (academicYears?.[0]?.id ?? "");
      const defaultBranch = branches?.[0]?.id ?? "";
      form.reset({ 
        name: "", code: "", level_id: "", 
        branch_id: defaultBranch, 
        academic_year_id: defaultYear,
        capacity: 30, start_date: "", end_date: "", start_time: "", end_time: "", is_active: true 
      });
    }
  }, [batch, form, academicYears, branches]);

  const handleSubmit = async (data: BatchFormValues) => {
    setLoading(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
      form.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Batch" : "Add New Batch"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the batch details below." : "Create a new batch for student enrollment."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch Name <span className="text-destructive">*</span></Label>
              <Input {...form.register("name")} placeholder="e.g. Class 10A" className={form.formState.errors.name ? "border-destructive" : ""} />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Batch Code</Label>
              <Input {...form.register("code")} placeholder="e.g. BATCH-10A" />
            </div>

            <div className="space-y-2">
              <Label>Level <span className="text-destructive">*</span></Label>
              <Select onValueChange={(val) => form.setValue("level_id", val as string)} value={form.watch("level_id")}>
                <SelectTrigger className={form.formState.errors.level_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels?.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.level_id && <p className="text-xs text-destructive">{form.formState.errors.level_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Branch <span className="text-destructive">*</span></Label>
              <Select onValueChange={(val) => form.setValue("branch_id", val as string)} value={form.watch("branch_id")}>
                <SelectTrigger className={form.formState.errors.branch_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.branch_id && <p className="text-xs text-destructive">{form.formState.errors.branch_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Academic Year <span className="text-destructive">*</span></Label>
              <Select onValueChange={(val) => form.setValue("academic_year_id", val as string)} value={form.watch("academic_year_id")}>
                <SelectTrigger className={form.formState.errors.academic_year_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map((y) => (
                    <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.academic_year_id && <p className="text-xs text-destructive">{form.formState.errors.academic_year_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Max Capacity</Label>
              <Input type="number" {...form.register("capacity", { valueAsNumber: true })} placeholder="e.g. 30" />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" {...form.register("start_date")} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" {...form.register("end_date")} />
            </div>
            
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" {...form.register("start_time")} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" {...form.register("end_time")} />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="is_active" 
              checked={form.watch("is_active")}
              onCheckedChange={(checked) => form.setValue("is_active", checked as boolean)}
            />
            <Label htmlFor="is_active" className="text-sm font-medium leading-none">
              Active Batch
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
