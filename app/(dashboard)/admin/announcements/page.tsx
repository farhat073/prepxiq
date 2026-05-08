"use client";

import { useState } from "react";
import { Megaphone, Plus, Bell, Pin, Clock, MoreVertical, Trash2, Pencil, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAnnouncements, useCreateAnnouncement } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminAnnouncementsPage() {
  const { profile } = useAppStore();
  const { data: announcements, isLoading } = useAnnouncements('admin', profile?.branch_id);
  const createMutation = useCreateAnnouncement();
  
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    target_role: ["student", "teacher"],
    is_pinned: false,
  });

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        branch_id: profile?.branch_id,
        published_by: profile?.id,
      });
      setIsCreateOpen(false);
      setFormData({ title: "", content: "", type: "general", target_role: ["student", "teacher"], is_pinned: false });
    } catch (err) {
      // Handled by mutation
    }
  };

  const filteredAnnouncements = announcements?.filter((a: any) => 
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Announcements"
        subtitle="Broadcast news, alerts, and event updates to your center."
        icon={Megaphone}
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                  <DialogDescription>Post a notice for students and staff at your branch.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="atitle">Announcement Title</Label>
                    <Input id="atitle" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as string})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Notice</SelectItem>
                        <SelectItem value="urgent">Urgent / Alert</SelectItem>
                        <SelectItem value="event">Event Update</SelectItem>
                        <SelectItem value="holiday">Holiday Notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acontent">Content</Label>
                    <Textarea id="acontent" rows={5} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="apinned" checked={formData.is_pinned} onCheckedChange={(v) => setFormData({...formData, is_pinned: !!v})} />
                    <Label htmlFor="apinned">Pin this announcement to top</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Publishing..." : "Post Announcement"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search announcements..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredAnnouncements && filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((a: any) => (
            <Card key={a.id} className={`${a.is_pinned ? "border-primary/30 bg-primary/5" : "border-border/50"}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={a.type === 'urgent' ? 'destructive' : 'secondary'} className="capitalize h-5 py-0">
                        {a.type}
                      </Badge>
                      {a.is_pinned && (
                        <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-600 bg-amber-500/5 h-5 py-0">
                          <Pin className="w-3 h-3" /> Pinned
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{a.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {a.content}
                    </p>
                    <div className="flex items-center gap-4 pt-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Published {format(new Date(a.created_at), "PPP p")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                       <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center border border-dashed rounded-xl bg-accent/5">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No Announcements</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Start broadcasting important updates to your campus.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
