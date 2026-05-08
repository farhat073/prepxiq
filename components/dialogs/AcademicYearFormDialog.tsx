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
import { Loader2 } from "lucide-react";
import type { AcademicYear } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

const academicYearSchema = z.object({
  name: z.string().min(2, "Name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  is_current: z.boolean(),
});

type AcademicYearFormValues = z.infer<typeof academicYearSchema>;

interface AcademicYearFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYear?: AcademicYear | null;
  onSubmit: (data: AcademicYearFormValues) => Promise<void>;
}

export function AcademicYearFormDialog({ open, onOpenChange, academicYear, onSubmit }: AcademicYearFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!academicYear;

  const form = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: "", start_date: "", end_date: "", is_current: false,
    },
  });

  useEffect(() => {
    if (academicYear) {
      form.reset({
        name: academicYear.name,
        start_date: academicYear.start_date.split("T")[0],
        end_date: academicYear.end_date.split("T")[0],
        is_current: academicYear.is_current,
      });
    } else {
      form.reset({ name: "", start_date: "", end_date: "", is_current: false });
    }
  }, [academicYear, form]);

  const handleSubmit = async (data: AcademicYearFormValues) => {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Academic Year" : "Add Academic Year"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the academic year details." : "Create a new academic year."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Year Name <span className="text-destructive">*</span></Label>
            <Input {...form.register("name")} placeholder="e.g. 2026-2027" className={form.formState.errors.name ? "border-destructive" : ""} />
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date <span className="text-destructive">*</span></Label>
              <Input type="date" {...form.register("start_date")} />
              {form.formState.errors.start_date && <p className="text-xs text-destructive">{form.formState.errors.start_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>End Date <span className="text-destructive">*</span></Label>
              <Input type="date" {...form.register("end_date")} />
              {form.formState.errors.end_date && <p className="text-xs text-destructive">{form.formState.errors.end_date.message}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="is_current" 
              checked={form.watch("is_current")}
              onCheckedChange={(checked) => form.setValue("is_current", checked as boolean)}
            />
            <Label htmlFor="is_current" className="text-sm font-medium leading-none">
              Set as Current Academic Year
            </Label>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Year"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
