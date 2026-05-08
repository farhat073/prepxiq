"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  FolderOpen, 
  FileText, 
  Video, 
  ExternalLink, 
  Trash2, 
  Search,
  Filter,
  MoreVertical,
  MonitorPlay,
  Cloud,
  FileCode,
  Globe,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { 
  useStudyMaterials, 
  useCreateStudyMaterial, 
  useTeacherAssignments,
  useDeleteStudyMaterial
} from "@/lib/supabase/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

const getIcon = (type: string, url: string) => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return <MonitorPlay className="w-5 h-5 text-red-500" />;
  if (url.includes("drive.google.com")) return <Cloud className="w-5 h-5 text-blue-500" />;
  
  switch (type) {
    case "pdf": return <FileText className="w-5 h-5 text-rose-500" />;
    case "video": return <Video className="w-5 h-5 text-amber-500" />;
    case "link": return <Globe className="w-5 h-5 text-indigo-500" />;
    case "doc": return <FileCode className="w-5 h-5 text-blue-600" />;
    default: return <FolderOpen className="w-5 h-5 text-gray-500" />;
  }
};

export default function TeacherMaterialsPage() {
  const profile = useAppStore((s) => s.profile);
  const { data: assignments, isLoading: assignmentsLoading } = useTeacherAssignments(profile?.id || "");
  const createMaterial = useCreateStudyMaterial();
  const deleteMaterial = useDeleteStudyMaterial();

  // Derive batch IDs for fetching materials
  const assignedBatchIds = useMemo(() => {
    if (!assignments) return [];
    return [...new Set(assignments.map((a: any) => a.batch_id))];
  }, [assignments]);

  const assignmentOptions = useMemo(() => {
    if (!assignments) return [];
    return assignments.map((a: any) => ({
      id: a.id,
      batch_id: a.batch_id,
      batch_name: a.batch?.name || "Unknown",
      subject_id: a.subject_id,
      subject_name: a.subject?.name || "Unknown",
    }));
  }, [assignments]);

  // Fetch materials for all assigned batches
  const { data: materials, isLoading: materialsLoading } = useStudyMaterials();

  // Filter materials to only show ones from assigned batches
  const scopedMaterials = useMemo(() => {
    if (!materials || assignedBatchIds.length === 0) return [];
    return materials.filter((m: any) => assignedBatchIds.includes(m.batch_id));
  }, [materials, assignedBatchIds]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignment, setFilterAssignment] = useState("all");
  
  // Auto-select assignment if only one
  const [selectedAssignment, setSelectedAssignment] = useState("");
  useEffect(() => {
    if (assignmentOptions.length === 1 && !selectedAssignment) {
      setSelectedAssignment(assignmentOptions[0].id);
    }
  }, [assignmentOptions, selectedAssignment]);

  const currentAssignment = assignmentOptions.find((a: any) => a.id === selectedAssignment);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pdf",
    file_url: "",
    external_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !currentAssignment) {
      toast.error("Please select an assignment first");
      return;
    }

    try {
      await createMaterial.mutateAsync({
        ...formData,
        uploaded_by: profile.id,
        batch_id: currentAssignment.batch_id,
        subject_id: currentAssignment.subject_id,
      });
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", type: "pdf", file_url: "", external_url: "" });
      toast.success("Material shared successfully");
    } catch (error) {
      toast.error("Failed to share material");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteMaterial.mutateAsync(id);
        toast.success("Material deleted");
      } catch (error) {
        toast.error("Failed to delete material");
      }
    }
  };

  const filteredMaterials = scopedMaterials?.filter((m: any) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterAssignment === "all") return matchesSearch;
    const fa = assignmentOptions.find((a: any) => a.id === filterAssignment);
    return matchesSearch && fa && m.batch_id === fa.batch_id && m.subject_id === fa.subject_id;
  });

  if (assignmentsLoading || materialsLoading) return <LoadingSkeleton />;

  // No assignments
  if (!assignments || assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold">No Assignments Yet</h2>
        <p className="text-muted-foreground max-w-sm">
          You haven&apos;t been assigned to any batches yet. Materials can only be shared for assigned batches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Resource Library" 
          subtitle="Share materials with students in your assigned batches."
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 shadow-sm gap-2">
              <Plus className="w-4 h-4" /> Share Resource
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Share New Resource</DialogTitle>
              <CardDescription>Upload a document or share a link. It will be shared with your assigned batch.</CardDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider">Resource Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Physics Chapter 4 Notes"
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Resource Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v) => setFormData({ ...formData, type: v as string })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="link">External Link / Drive</SelectItem>
                      <SelectItem value="video">Video URL (YouTube)</SelectItem>
                      <SelectItem value="doc">Word / Doc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Assignment</Label>
                  {assignmentOptions.length === 1 ? (
                    <div className="p-2 rounded-md bg-accent/50 text-sm font-medium border">
                      {assignmentOptions[0].batch_name} — {assignmentOptions[0].subject_name}
                    </div>
                  ) : (
                    <Select 
                      value={selectedAssignment} 
                      onValueChange={(v) => setSelectedAssignment(v as string)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignmentOptions.map((a: any) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.batch_name} — {a.subject_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid gap-2 p-3 bg-accent/30 rounded-lg border border-dashed">
                <Label htmlFor="url" className="text-xs font-bold uppercase tracking-wider text-primary">
                  {formData.type === 'link' ? 'Paste Link (Drive/Dropbox/Web)' : formData.type === 'video' ? 'YouTube/Video URL' : 'File URL'}
                </Label>
                <Input 
                  id="url" 
                  placeholder={formData.type === 'link' ? "https://drive.google.com/..." : "https://..."}
                  className="bg-background"
                  value={formData.type === 'link' || formData.type === 'video' ? formData.external_url : formData.file_url} 
                  onChange={(e) => {
                    if (formData.type === 'link' || formData.type === 'video') setFormData({ ...formData, external_url: e.target.value });
                    else setFormData({ ...formData, file_url: e.target.value });
                  }} 
                  required 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider">Notes for Students</Label>
                <Textarea 
                  id="description" 
                  placeholder="Tell students what to focus on..."
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  rows={2}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full" disabled={createMaterial.isPending || !selectedAssignment}>
                  {createMaterial.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Share with Batch
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-3 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title..." 
            className="pl-9 h-10 border-none bg-transparent focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-px h-6 bg-border hidden sm:block" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select value={filterAssignment} onValueChange={(v) => setFilterAssignment(v as string)}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 border-none bg-transparent focus-visible:ring-0">
              <SelectValue placeholder="All Assignments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              {assignmentOptions.map((a: any) => (
                <SelectItem key={a.id} value={a.id}>{a.batch_name} — {a.subject_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredMaterials?.map((m: any) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full hover:border-primary/40 transition-all group overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="pb-3 space-y-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2.5 bg-accent/50 rounded-xl group-hover:scale-110 transition-transform">
                      {getIcon(m.type, m.external_url || m.file_url || "")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px] bg-background">
                        {m.subject?.name}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => handleDelete(m.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardTitle className="text-sm font-bold leading-tight line-clamp-2 min-h-[40px]">
                    {m.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-[13px] text-muted-foreground line-clamp-2 min-h-[38px] leading-relaxed">
                    {m.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-border/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Added On</span>
                      <span className="text-[11px] font-semibold">{format(new Date(m.created_at), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Access</span>
                      <Badge variant="secondary" className="text-[10px] py-0 h-5">
                        {m.type === 'link' ? 'External' : m.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <a href={m.file_url || m.external_url} target="_blank" rel="noopener noreferrer" className="block">
                    <Button 
                      className="w-full h-10 gap-2 bg-accent hover:bg-primary hover:text-white text-foreground transition-colors" 
                      variant="ghost"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Resource
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMaterials?.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-3xl bg-accent/5">
            <div className="w-20 h-20 rounded-full bg-accent/50 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No resources found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
              {searchQuery || filterAssignment !== "all" 
                ? "Try adjusting your filters to find what you're looking for." 
                : "Your resource library is empty. Click 'Share Resource' to add notes or links."}
            </p>
            {searchQuery || filterAssignment !== "all" ? (
              <Button variant="link" onClick={() => { setSearchQuery(""); setFilterAssignment("all"); }} className="mt-4">
                Clear Filters
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
