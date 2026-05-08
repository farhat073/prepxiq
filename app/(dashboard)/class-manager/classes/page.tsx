"use client";

import { useState } from "react";
import { Calendar, Search, Plus, Clock, Users, BookOpen, MapPin, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTimetable, useBatches, useSubjects, useCreateTimetableSlot, useDeleteTimetableSlot } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function ManageClassesPage() {
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const { data: batches } = useBatches();
  const { data: subjects } = useSubjects();
  const { data: timetable, isLoading } = useTimetable(selectedBatch === "all" ? undefined : selectedBatch);
  
  // Fetch teachers for assignment
  const { data: teachers } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("id, full_name").eq("role", "teacher").eq("is_active", true);
      return data || [];
    }
  });

  const createSlot = useCreateTimetableSlot();
  const deleteSlot = useDeleteTimetableSlot();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    batch_id: "",
    subject_id: "",
    teacher_id: "",
    day_of_week: "monday",
    start_time: "",
    end_time: "",
    room_number: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSlot.mutateAsync(formData);
    setIsAddOpen(false);
    setFormData({ ...formData, start_time: "", end_time: "", room_number: "" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this class from the schedule?")) {
      await deleteSlot.mutateAsync(id);
    }
  };

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const groupedTimetable = DAYS.reduce((acc: any, day) => {
    acc[day] = timetable?.filter((item: any) => item.day_of_week === day) || [];
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Manage Classes"
        subtitle="Create and manage the weekly class schedule and assign teachers."
        icon={Calendar}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>Batch</Label>
                  <Select value={formData.batch_id} onValueChange={(v) => setFormData({...formData, batch_id: v || ""})} required>
                    <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
                    <SelectContent>
                      {batches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Select value={formData.subject_id} onValueChange={(v) => setFormData({...formData, subject_id: v || ""})} required>
                    <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Assigned Teacher</Label>
                  <Select value={formData.teacher_id} onValueChange={(v) => setFormData({...formData, teacher_id: v || ""})} required>
                    <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                    <SelectContent>
                      {teachers?.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Day of Week</Label>
                    <Select value={formData.day_of_week} onValueChange={(v) => setFormData({...formData, day_of_week: v || "monday"})} required>
                      <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Room / Link</Label>
                    <Input value={formData.room_number} onChange={(e) => setFormData({...formData, room_number: e.target.value})} placeholder="e.g. Room 101" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} required />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-2" disabled={createSlot.isPending}>
                  {createSlot.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Schedule Class
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <Select value={selectedBatch} onValueChange={(v) => setSelectedBatch(v as string)}>
            <SelectTrigger className="bg-card">
              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches?.map((batch: any) => (
                <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="monday" className="w-full">
        <TabsList className="w-full flex overflow-x-auto justify-start bg-accent/20 h-auto p-1 no-scrollbar">
          {DAYS.map((day) => (
            <TabsTrigger 
              key={day} 
              value={day} 
              className="capitalize py-2 px-4 data-[state=active]:bg-background"
            >
              {day}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYS.map((day) => (
          <TabsContent key={day} value={day} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedTimetable[day].length > 0 ? (
                groupedTimetable[day].map((slot: any) => (
                  <Card key={slot.id} className="hover:border-primary/30 transition-all group overflow-hidden relative">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => handleDelete(slot.id)}
                      disabled={deleteSlot.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <CardHeader className="pb-3 border-b border-border/50 bg-accent/5">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] mr-8">
                          {slot.room_number || "Room TBD"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{slot.subject?.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Batch: {slot.batch?.name}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
                          {slot.teacher?.full_name?.split(" ").map((n: string) => n[0]).join("") || "T"}
                        </div>
                        <span className="text-xs font-medium truncate">{slot.teacher?.full_name || "Unassigned"}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border border-dashed rounded-xl bg-accent/5">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium capitalize">No Classes on {day}</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-1 text-sm">
                    Click "Add Class" to schedule a session for this day.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
