"use client";

import { useState } from "react";
import { Plus, Bell, Megaphone, Calendar, Pin, Info, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useAnnouncements, useBranches } from "@/lib/supabase/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function TeacherAnnouncementsPage() {
  const profile = useAppStore((s) => s.profile);
  const { data: announcements, isLoading, refetch } = useAnnouncements('teacher', profile?.branch_id);
  const { data: branches } = useBranches();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    target_role: ["student", "teacher"],
    is_pinned: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("announcements").insert({
        ...formData,
        branch_id: profile.branch_id,
        published_by: profile.id,
      });

      if (error) throw error;
      
      toast.success("Announcement published");
      setIsDialogOpen(false);
      setFormData({ title: "", content: "", type: "general", target_role: ["student", "teacher"], is_pinned: false });
      refetch();
    } catch (err: any) {
      toast.error("Failed to publish", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "urgent": return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" /> Urgent</Badge>;
      case "event": return <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20"><Calendar className="w-3 h-3" /> Event</Badge>;
      case "exam": return <Badge variant="secondary" className="gap-1 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20"><Info className="w-3 h-3" /> Exam</Badge>;
      default: return <Badge variant="secondary" className="gap-1"><Bell className="w-3 h-3" /> General</Badge>;
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Announcements" 
          subtitle="View and manage campus-wide announcements."
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2">
              <Plus className="w-4 h-4" /> New Announcement
            </Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="atitle">Title</Label>
                <Input 
                  id="atitle" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({ ...formData, type: v as string })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="exam">Exam Related</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="acontent">Content</Label>
                <Textarea 
                  id="acontent" 
                  value={formData.content} 
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="pinned" 
                  checked={formData.is_pinned} 
                  onCheckedChange={(v) => setFormData({ ...formData, is_pinned: !!v })}
                />
                <Label htmlFor="pinned" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Pin this announcement
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish Announcement"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements?.map((a: any) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className={`${a.is_pinned ? "border-primary/30 bg-primary/5" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(a.type)}
                      {a.is_pinned && (
                        <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                          <Pin className="w-3 h-3" /> Pinned
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{a.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {a.content}
                    </p>
                    <div className="flex items-center gap-4 pt-3 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                         Published {format(new Date(a.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <Megaphone className={`w-10 h-10 opacity-10 shrink-0 ${a.is_pinned ? "text-primary opacity-20" : ""}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {announcements?.length === 0 && (
          <div className="py-20 text-center border rounded-xl bg-muted/20">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No announcements found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              There are no campus-wide announcements for your role at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
