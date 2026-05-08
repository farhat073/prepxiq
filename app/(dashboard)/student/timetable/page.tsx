"use client";

import { Clock, Calendar, MapPin, User, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useStudentTimetable, useStudentProfile } from "@/lib/supabase/hooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function StudentTimetablePage() {
  const profile = useAppStore((s) => s.profile);
  const { data: studentProf } = useStudentProfile(profile?.id || "");
  const { data: timetable, isLoading } = useStudentTimetable(studentProf?.current_batch_id || "");

  const today = format(new Date(), 'eeee').toLowerCase();
  const initialTab = DAYS.includes(today) ? today : "monday";

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Class Timetable" 
        subtitle="Your weekly schedule of classes and subjects."
      />

      <Card className="border-none bg-transparent shadow-none">
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8 bg-card border">
            {DAYS.map((day) => (
              <TabsTrigger key={day} value={day} className="capitalize py-3">
                {day.slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {DAYS.map((day) => {
            const dayClasses = timetable?.filter((t: any) => t.day_of_week === day) || [];
            
            return (
              <TabsContent key={day} value={day} className="mt-0 space-y-4 outline-none">
                {dayClasses.length > 0 ? (
                  dayClasses.map((slot: any, idx: number) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-48 bg-muted/30 p-5 flex md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r gap-2">
                              <div className="flex items-center gap-2 text-primary font-bold">
                                <Clock className="w-4 h-4" />
                                <span>{slot.start_time?.slice(0, 5)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest">to</div>
                              <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                                <Clock className="w-4 h-4 opacity-0 md:hidden" />
                                <span>{slot.end_time?.slice(0, 5)}</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-bold text-foreground">{slot.subject?.name}</h3>
                                  <Badge variant="outline" className="text-[10px] h-5">Core</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    {slot.teacher?.full_name}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Room {slot.room_number || "N/A"}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5 px-4" nativeButton={false} render={<a href="/student/materials">...</a>} />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-24 text-center border-2 border-dashed rounded-2xl bg-muted/10 flex flex-col items-center">
                    <Calendar className="w-16 h-16 text-muted-foreground mb-4 opacity-10" />
                    <h3 className="text-lg font-medium capitalize">No classes on {day}</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-1 text-sm text-balance">
                      Enjoy your day off! Use this time for self-study or catching up on homework.
                    </p>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </Card>
    </div>
  );
}
