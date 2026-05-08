"use client";

import { useState } from "react";
import { Settings, Calendar, BookOpen, Layers, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSystemConfig, useCreateAcademicYear, useUpdateAcademicYear, useCreateSubject, useUpdateSubject, useCreateLevel, useUpdateLevel } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { AcademicYearFormDialog } from "@/components/dialogs/AcademicYearFormDialog";
import { SubjectFormDialog } from "@/components/dialogs/SubjectFormDialog";
import { LevelFormDialog } from "@/components/dialogs/LevelFormDialog";
import type { AcademicYear, Subject, Level } from "@/lib/types";

export default function SystemSettingsPage() {
  const { data: config, isLoading } = useSystemConfig();

  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear();
  
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();

  const createLevel = useCreateLevel();
  const updateLevel = useUpdateLevel();

  const [yearFormOpen, setYearFormOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const [subjectFormOpen, setSubjectFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [levelFormOpen, setLevelFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const handleYearSubmit = async (data: any) => {
    if (editingYear) await updateYear.mutateAsync({ id: editingYear.id, ...data });
    else await createYear.mutateAsync(data);
  };

  const handleSubjectSubmit = async (data: any) => {
    if (editingSubject) await updateSubject.mutateAsync({ id: editingSubject.id, ...data });
    else await createSubject.mutateAsync(data);
  };

  const handleLevelSubmit = async (data: any) => {
    if (editingLevel) await updateLevel.mutateAsync({ id: editingLevel.id, ...data });
    else await createLevel.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        subtitle="Manage academic years, subjects, levels, and institution-wide configurations."
        icon={Settings}
      />

      <Tabs defaultValue="academic-years" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="academic-years" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Years</span>
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Subjects</span>
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Levels</span>
          </TabsTrigger>
        </TabsList>

        {/* Academic Years */}
        <TabsContent value="academic-years" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Academic Years</CardTitle>
                <CardDescription>Define and manage enrollment periods.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingYear(null); setYearFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Year
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config?.academicYears.map((year) => (
                  <div key={year.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-accent/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{year.name}</span>
                        {year.is_current && (
                          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20 text-[10px]">Current</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(year.start_date).toLocaleDateString()} — {new Date(year.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingYear(year); setYearFormOpen(true); }}>Edit</Button>
                  </div>
                ))}
                {config?.academicYears.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No academic years defined.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects */}
        <TabsContent value="subjects" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Subjects</CardTitle>
                <CardDescription>Global library of subjects taught in the institution.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingSubject(null); setSubjectFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config?.subjects.map((subject) => (
                  <div key={subject.id} className="p-4 rounded-lg border border-border/50 bg-accent/5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-mono text-[10px]">{subject.code || "N/A"}</Badge>
                      {!subject.is_active && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{subject.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{subject.description || "No description"}</p>
                    <div className="mt-3 flex justify-end">
                      <Button variant="ghost" size="xs" className="h-7 text-xs" onClick={() => { setEditingSubject(subject); setSubjectFormOpen(true); }}>Edit</Button>
                    </div>
                  </div>
                ))}
                {config?.subjects.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground text-sm">No subjects defined.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Levels */}
        <TabsContent value="levels" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Levels & Grades</CardTitle>
                <CardDescription>Define the educational hierarchy and promotion criteria.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingLevel(null); setLevelFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Level
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config?.levels.map((level) => (
                  <div key={level.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-accent/5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {level.order_index}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{level.name}</h4>
                      <p className="text-xs text-muted-foreground">{level.description || "No description provided"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">Min. Score</p>
                      <p className="text-sm font-bold text-emerald-500">{level.min_score_to_promote}%</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingLevel(level); setLevelFormOpen(true); }}>Edit</Button>
                  </div>
                ))}
                {config?.levels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No levels defined.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AcademicYearFormDialog open={yearFormOpen} onOpenChange={setYearFormOpen} academicYear={editingYear} onSubmit={handleYearSubmit} />
      <SubjectFormDialog open={subjectFormOpen} onOpenChange={setSubjectFormOpen} subject={editingSubject} onSubmit={handleSubjectSubmit} />
      <LevelFormDialog open={levelFormOpen} onOpenChange={setLevelFormOpen} level={editingLevel} onSubmit={handleLevelSubmit} />
    </div>
  );
}
