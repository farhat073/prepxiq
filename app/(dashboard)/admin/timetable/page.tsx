"use client";

import { useState } from "react";
import { Calendar, Search, Filter, Plus, Clock, Users, BookOpen, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTimetable, useBatches } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function AdminTimetablePage() {
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const { data: batches } = useBatches();
  const { data: timetable, isLoading } = useTimetable(selectedBatch === "all" ? undefined : selectedBatch);

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const groupedTimetable = DAYS.reduce((acc: any, day) => {
    acc[day] = timetable?.filter((item: any) => item.day_of_week === day) || [];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Timetable"
        subtitle="View and manage weekly class schedules for all batches."
        icon={Calendar}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <Select value={selectedBatch} onValueChange={(v) => setSelectedBatch(v as string)}>
            <SelectTrigger>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTimetable[day].length > 0 ? (
                groupedTimetable[day].map((slot: any) => (
                  <Card key={slot.id} className="hover:border-primary/30 transition-all group">
                    <CardHeader className="pb-3 border-b border-border/50 bg-accent/5">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
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
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                          {slot.teacher?.full_name?.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <span className="text-xs font-medium">{slot.teacher?.full_name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border border-dashed rounded-xl bg-accent/5">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium capitalize">No Classes on {day}</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                    Select a different day or add a new schedule for this batch.
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
