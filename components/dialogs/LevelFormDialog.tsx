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
import type { Level } from "@/lib/types";

const levelSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  order_index: z.number().min(0, "Must be positive"),
  min_score_to_promote: z.number().min(0).max(100),
});

type LevelFormValues = z.infer<typeof levelSchema>;

interface LevelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level?: Level | null;
  onSubmit: (data: LevelFormValues) => Promise<void>;
}

export function LevelFormDialog({ open, onOpenChange, level, onSubmit }: LevelFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!level;

  const form = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: "", description: "", order_index: 1, min_score_to_promote: 40,
    },
  });

  useEffect(() => {
    if (level) {
      form.reset({
        name: level.name,
        description: level.description || "",
        order_index: level.order_index || 1,
        min_score_to_promote: level.min_score_to_promote || 40,
      });
    } else {
      form.reset({ name: "", description: "", order_index: 1, min_score_to_promote: 40 });
    }
  }, [level, form]);

  const handleSubmit = async (data: LevelFormValues) => {
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
          <DialogTitle>{isEdit ? "Edit Level" : "Add New Level"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the level details below." : "Create a new educational level or grade."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Level Name <span className="text-destructive">*</span></Label>
            <Input {...form.register("name")} placeholder="e.g. Class 10" className={form.formState.errors.name ? "border-destructive" : ""} />
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...form.register("description")} placeholder="Brief description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Order Index</Label>
              <Input type="number" {...form.register("order_index", { valueAsNumber: true })} placeholder="e.g. 1" />
            </div>
            <div className="space-y-2">
              <Label>Min Score to Promote (%)</Label>
              <Input type="number" {...form.register("min_score_to_promote", { valueAsNumber: true })} placeholder="e.g. 40" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Level"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
