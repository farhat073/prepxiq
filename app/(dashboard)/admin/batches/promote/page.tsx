"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ArrowRight, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle,
  Search,
  CheckSquare,
  Square,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { 
  useBatches, 
  useLevels, 
  useStudents, 
  usePromoteStudents 
} from "@/lib/supabase/hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function BatchPromotionPage() {
  const router = useRouter();
  
  const { data: batches, isLoading: loadingBatches } = useBatches();
  const { data: levels, isLoading: loadingLevels } = useLevels();
  const { data: allStudents, isLoading: loadingStudents } = useStudents();
  const promoteMutation = usePromoteStudents();

  const [sourceBatchId, setSourceBatchId] = useState("");
  const [targetLevelId, setTargetLevelId] = useState("");
  const [targetBatchId, setTargetBatchId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const sourceBatchStudents = useMemo(() => {
    if (!sourceBatchId || !allStudents) return [];
    return allStudents.filter(s => s.current_batch_id === sourceBatchId);
  }, [sourceBatchId, allStudents]);

  const filteredStudents = useMemo(() => {
    return sourceBatchStudents.filter(s => 
      s.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sourceBatchStudents, searchQuery]);

  const handleToggleStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.profile_id));
    }
  };

  const handlePromote = async () => {
    if (selectedStudents.length === 0 || !targetLevelId || !targetBatchId) {
      toast.error("Please complete all selections");
      return;
    }

    try {
      await promoteMutation.mutateAsync({
        studentIds: selectedStudents,
        targetLevelId,
        targetBatchId
      });
      router.push("/admin/batches");
    } catch (err) {
      toast.error("Promotion failed");
    }
  };

  if (loadingBatches || loadingLevels || loadingStudents) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
          title="Batch Promotion" 
          subtitle="Transition students from one batch/level to another."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1 & 2: Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Step 1: Select Source Batch
              </CardTitle>
              <CardDescription>Select the batch whose students you want to promote.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-2 max-w-sm">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Source Batch</Label>
                <Select value={sourceBatchId} onValueChange={(v) => setSourceBatchId(v as string)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches?.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name} ({b.level?.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {sourceBatchId && (
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Step 2: Select Students</CardTitle>
                    <CardDescription>Choose students to transition to the new level.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-8 text-xs gap-2">
                    {selectedStudents.length === filteredStudents.length ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
                    {selectedStudents.length === filteredStudents.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <div className="p-3 bg-accent/30 border-b flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground ml-2" />
                <Input 
                  placeholder="Filter students by name..."
                  className="border-none bg-transparent focus-visible:ring-0 h-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto divide-y">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className={cn(
                        "p-3 flex items-center gap-4 hover:bg-accent/30 transition-colors cursor-pointer",
                        selectedStudents.includes(student.profile_id) && "bg-primary/5"
                      )}
                      onClick={() => handleToggleStudent(student.profile_id)}
                    >
                      <Checkbox 
                        checked={selectedStudents.includes(student.profile_id)}
                        onCheckedChange={() => handleToggleStudent(student.profile_id)}
                        className="ml-2"
                      />
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {student.profile?.full_name?.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{student.profile?.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{student.admission_number}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-background">
                        {student.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}

                  {filteredStudents.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                      <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No students found in this batch.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="p-3 bg-muted/30 border-t flex justify-between items-center text-xs font-medium">
                <span className="text-muted-foreground">{selectedStudents.length} Students Selected</span>
                <span className="text-primary">{sourceBatchStudents.length} Total in Batch</span>
              </div>
            </Card>
          )}
        </div>

        {/* Step 3: Destination */}
        <div className="space-y-6">
          <Card className={cn(
            "border-border/50 shadow-sm transition-all",
            selectedStudents.length > 0 ? "opacity-100" : "opacity-50 pointer-events-none"
          )}>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-emerald-600" />
                Step 3: Destination
              </CardTitle>
              <CardDescription>Select the target level and batch.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Level</Label>
                <Select value={targetLevelId} onValueChange={(v) => setTargetLevelId(v as string)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels?.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Batch</Label>
                <Select value={targetBatchId} onValueChange={(v) => setTargetBatchId(v as string)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches?.filter(b => b.level_id === targetLevelId).map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                    {targetLevelId && batches?.filter(b => b.level_id === targetLevelId).length === 0 && (
                      <SelectItem value="none" disabled>No batches in this level</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  onClick={handlePromote}
                  disabled={promoteMutation.isPending || selectedStudents.length === 0}
                >
                  {promoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Confirm Promotion
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-3 italic">
                  * This will bulk-update the level and batch for all selected students.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Promotional Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Use this tool at the end of a session to move students to the next grade level. 
              </p>
              <ul className="text-[11px] text-emerald-700 list-disc pl-4 space-y-1">
                <li>Create the <b>Target Batch</b> first before starting.</li>
                <li>Students' <b>Fee Structures</b> may need manual update after promotion.</li>
                <li>History of previous batches is preserved in <b>Audit Logs</b>.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
