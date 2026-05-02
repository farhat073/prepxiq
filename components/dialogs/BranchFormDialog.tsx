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
import type { Branch } from "@/lib/types";

const branchSchema = z.object({
  name: z.string().min(2, "Name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  is_active: z.boolean(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch | null; // null = create mode, Branch = edit mode
  onSubmit: (data: BranchFormValues) => Promise<void>;
}

export function BranchFormDialog({ open, onOpenChange, branch, onSubmit }: BranchFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!branch;

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "", address: "", city: "", state: "", pincode: "", phone: "", email: "", is_active: true,
    },
  });

  useEffect(() => {
    if (branch) {
      form.reset({
        name: branch.name,
        address: branch.address || "",
        city: branch.city || "",
        state: branch.state || "",
        pincode: branch.pincode || "",
        phone: branch.phone || "",
        email: branch.email || "",
        is_active: branch.is_active,
      });
    } else {
      form.reset({ name: "", address: "", city: "", state: "", pincode: "", phone: "", email: "", is_active: true });
    }
  }, [branch, form]);

  const handleSubmit = async (data: BranchFormValues) => {
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Branch" : "Add New Branch"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the branch details below." : "Fill in the details to create a new branch."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Branch Name <span className="text-destructive">*</span></Label>
              <Input {...form.register("name")} placeholder="e.g. Main Center" className={form.formState.errors.name ? "border-destructive" : ""} />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Input {...form.register("address")} placeholder="Street address" />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...form.register("city")} placeholder="e.g. Srinagar" />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input {...form.register("state")} placeholder="e.g. J&K" />
            </div>
            <div className="space-y-2">
              <Label>Pincode</Label>
              <Input {...form.register("pincode")} placeholder="e.g. 190001" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...form.register("phone")} placeholder="e.g. 9876543210" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Email</Label>
              <Input {...form.register("email")} type="email" placeholder="e.g. branch@prepxiq.com" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
