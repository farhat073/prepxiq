"use client";

import { Calendar, Clock, BookOpen, MapPin, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { useTeacherSchedule } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function TeacherClassesPage() {
  const profile = useAppStore((s) => s.profile);
  const { data: schedule, isLoading } = useTeacherSchedule(profile?.id || "");

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const groupedSchedule = DAYS.reduce((acc: any, day) => {
    acc[day] = schedule?.filter((item: any) => item.day_of_week === day) || [];
    return acc;
  }, {});

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Use today as default if valid, otherwise monday
  const defaultTab = DAYS.includes(currentDay) ? currentDay : "monday";

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Classes"
        subtitle="View your weekly class schedule across all assigned batches."
        icon={Calendar}
      />

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full flex overflow-x-auto justify-start bg-accent/20 h-auto p-1 no-scrollbar">
          {DAYS.map((day) => (
            <TabsTrigger 
              key={day} 
              value={day} 
              className="capitalize py-2 px-4 data-[state=active]:bg-background"
            >
              {day} {day === currentDay && "(Today)"}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYS.map((day) => (
          <TabsContent key={day} value={day} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedSchedule[day].length > 0 ? (
                groupedSchedule[day].map((slot: any) => (
                  <Card key={slot.id} className="hover:border-primary/30 transition-all group overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border/50 bg-accent/5">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] flex items-center gap-1 bg-background">
                          <MapPin className="w-3 h-3" />
                          {slot.room_number || "Room TBD"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                           <BookOpen className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                           <h4 className="font-bold text-base group-hover:text-primary transition-colors leading-tight">{slot.subject?.name}</h4>
                           <p className="text-xs text-muted-foreground mt-1 font-medium">{slot.batch?.name}</p>
                         </div>
                      </div>
                      <div className="pt-3 border-t border-dashed border-border/50 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Class Duration</span>
                        <span className="text-xs font-medium">
                          {Math.round((new Date(`1970-01-01T${slot.end_time}`).getTime() - new Date(`1970-01-01T${slot.start_time}`).getTime()) / 60000)} mins
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border border-dashed rounded-xl bg-accent/5">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium capitalize">No Classes Scheduled</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                    You have no classes scheduled for {day}.
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
