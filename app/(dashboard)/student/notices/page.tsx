"use client";

import { Bell, Pin, Megaphone } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAnnouncements } from "@/lib/supabase/hooks";
import { useAppStore } from "@/store/useAppStore";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function StudentNoticesPage() {
  const { profile } = useAppStore();
  const { data: announcements, isLoading } = useAnnouncements("student", profile?.branch_id || undefined);

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notices & Announcements"
        subtitle="Stay updated with the latest news and alerts from your center."
        icon={Bell}
      />

      <div className="grid grid-cols-1 gap-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((notice: any) => (
            <Card key={notice.id} className={`${notice.is_pinned ? "border-primary/30 bg-primary/5" : "border-border/50"}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {notice.is_pinned && <Pin className="w-4 h-4 text-primary" />}
                      {notice.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{notice.type}</span>
                      <span>•</span>
                      <span>{format(new Date(notice.created_at), "PPP p")}</span>
                    </div>
                  </div>
                  <Badge variant={notice.type === 'urgent' ? 'destructive' : 'secondary'} className="capitalize">
                    {notice.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {notice.content}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-lg font-semibold">No announcements yet</h3>
            <p className="text-sm text-muted-foreground">When your teachers or admins post an update, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
