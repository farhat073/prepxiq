"use client";

import { useState } from "react";
import { FolderOpen, FileText, Video, Link as LinkIcon, Download, ExternalLink, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useStudyMaterials, useStudentProfile, useSubjects } from "@/lib/supabase/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function StudentMaterialsPage() {
  const profile = useAppStore((s) => s.profile);
  const { data: studentProf } = useStudentProfile(profile?.id || "");
  const { data: materials, isLoading } = useStudyMaterials(studentProf?.current_batch_id);
  const { data: subjects } = useSubjects();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const filteredMaterials = materials?.filter((m: any) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || m.subject_id === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="w-5 h-5" />;
      case "video": return <Video className="w-5 h-5" />;
      case "link": return <LinkIcon className="w-5 h-5" />;
      default: return <FolderOpen className="w-5 h-5" />;
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Study Materials" 
        subtitle="Access notes, videos, and resources shared by your teachers."
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search materials..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as string)} className="w-full md:w-auto">
          <TabsList className="w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="all">All Subjects</TabsTrigger>
            {subjects?.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>{s.name}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMaterials?.map((m: any) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="h-full hover:shadow-md transition-shadow group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {getIcon(m.type)}
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    {m.subject?.name}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-4 line-clamp-1">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground line-clamp-2 min-h-[40px] text-xs leading-relaxed">
                  {m.description || "No description provided."}
                </p>
                
                <div className="flex flex-col gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  <span className="flex items-center gap-1">Shared by {m.teacher?.full_name}</span>
                  <span>{format(new Date(m.created_at), "MMM d, yyyy")}</span>
                </div>

                <div className="pt-2">
                  <a href={m.file_url || m.external_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full h-9 text-xs gap-2">
                      <ExternalLink className="w-3.5 h-3.5" /> Open Resource
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredMaterials?.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
            <h3 className="text-lg font-medium">No materials found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1 text-sm">
              We couldn't find any materials matching your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
