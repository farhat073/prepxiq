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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Subject } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

const subjectSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
  onSubmit: (data: SubjectFormValues) => Promise<void>;
}

export function SubjectFormDialog({ open, onOpenChange, subject, onSubmit }: SubjectFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!subject;

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "", code: "", description: "", is_active: true,
    },
  });

  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name,
        code: subject.code || "",
        description: subject.description || "",
        is_active: subject.is_active,
      });
    } else {
      form.reset({ name: "", code: "", description: "", is_active: true });
    }
  }, [subject, form]);

  const handleSubmit = async (data: SubjectFormValues) => {
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
          <DialogTitle>{isEdit ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the subject details below." : "Create a new subject for the curriculum."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Subject Name <span className="text-destructive">*</span></Label>
            <Input {...form.register("name")} placeholder="e.g. Mathematics" className={form.formState.errors.name ? "border-destructive" : ""} />
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Subject Code</Label>
            <Input {...form.register("code")} placeholder="e.g. MATH101" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...form.register("description")} placeholder="Brief description of the subject..." />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="is_active" 
              checked={form.watch("is_active")}
              onCheckedChange={(checked) => form.setValue("is_active", checked as boolean)}
            />
            <Label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Active Subject
            </Label>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
