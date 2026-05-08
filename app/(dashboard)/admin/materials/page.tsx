"use client";

import { useState } from "react";
import { FolderOpen, Plus, Search, Filter, FileText, Globe, Video, MoreVertical, Download, Trash2, BookOpen, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useStudyMaterials, useCreateStudyMaterial, useSubjects, useBatches } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";

export default function AdminMaterialsPage() {
  const { profile } = useAppStore();
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: batches } = useBatches();
  const { data: subjects } = useSubjects();
  const { data: materials, isLoading } = useStudyMaterials(
    selectedBatch === "all" ? undefined : selectedBatch,
    selectedSubject === "all" ? undefined : selectedSubject
  );
  
  const createMaterialMutation = useCreateStudyMaterial();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject_id: "",
    batch_id: "",
    type: "pdf",
    url: "",
  });

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const filteredMaterials = materials?.filter((m: any) => 
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMaterialMutation.mutateAsync({
        ...formData,
        uploaded_by: profile?.id,
      });
      setIsUploadOpen(false);
      setFormData({ title: "", description: "", subject_id: "", batch_id: "", type: "pdf", url: "" });
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials"
        subtitle="Manage academic resources, notes, and video lectures."
        icon={FolderOpen}
        actions={
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleUpload}>
                <DialogHeader>
                  <DialogTitle>Upload Study Material</DialogTitle>
                  <DialogDescription>Add a new resource for students to access.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Select value={formData.subject_id} onValueChange={(v) => setFormData({...formData, subject_id: v as string})}>
                        <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                        <SelectContent>
                          {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Batch</Label>
                      <Select value={formData.batch_id} onValueChange={(v) => setFormData({...formData, batch_id: v as string})}>
                        <SelectTrigger><SelectValue placeholder="Global / Specific" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Batches (Global)</SelectItem>
                          {batches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Resource Type</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as string})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="video">Video Lecture</SelectItem>
                          <SelectItem value="link">External Link</SelectItem>
                          <SelectItem value="image">Image / Diagram</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">Resource URL</Label>
                      <Input id="url" placeholder="https://..." value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMaterialMutation.isPending}>
                    {createMaterialMutation.isPending ? "Uploading..." : "Publish Material"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedBatch} onValueChange={(v) => setSelectedBatch(v as string)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Batch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as string)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials && filteredMaterials.length > 0 ? (
          filteredMaterials.map((material: any) => (
            <Card key={material.id} className="hover:border-primary/30 transition-all group overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50 bg-accent/5">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-background border border-border/50">
                    {material.type === 'pdf' ? <FileText className="w-5 h-5 text-rose-500" /> :
                     material.type === 'video' ? <Video className="w-5 h-5 text-blue-500" /> :
                     <Globe className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{material.title}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-[10px] py-0">{material.subject?.name}</Badge>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{material.type}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                  {material.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                       {material.teacher?.full_name?.split(" ").map((n: string) => n[0]).join("") || "S"}
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{material.teacher?.full_name || "System"}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(material.created_at), "MMM d")}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border border-dashed rounded-xl bg-accent/5">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No Materials Found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Start by uploading your first study resource for this branch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
