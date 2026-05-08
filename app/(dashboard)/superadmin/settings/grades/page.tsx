"use client";

import { Trophy, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSystemConfig } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GradeSettingsPage() {
  const { isLoading } = useSystemConfig(); // Just using it for loading state for now

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const dummyGrades = [
    { grade: "A+", min_percent: 95, max_percent: 100, points: 10, color: "text-emerald-600 bg-emerald-50" },
    { grade: "A", min_percent: 85, max_percent: 94.9, points: 9, color: "text-emerald-500 bg-emerald-50" },
    { grade: "B", min_percent: 75, max_percent: 84.9, points: 8, color: "text-blue-600 bg-blue-50" },
    { grade: "C", min_percent: 60, max_percent: 74.9, points: 7, color: "text-amber-600 bg-amber-50" },
    { grade: "D", min_percent: 35, max_percent: 59.9, points: 5, color: "text-orange-600 bg-orange-50" },
    { grade: "F", min_percent: 0, max_percent: 34.9, points: 0, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grade Configuration"
        subtitle="Set up grading scales, grade points, and passing thresholds."
        icon={Trophy}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Grading Scale</CardTitle>
          <CardDescription>This scale will be applied to all examinations for calculating student results.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/50 border-y border-border/50">
                <tr>
                  <th className="text-left p-4 font-medium">Grade</th>
                  <th className="text-center p-4 font-medium">Min %</th>
                  <th className="text-center p-4 font-medium">Max %</th>
                  <th className="text-center p-4 font-medium">Grade Points</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {dummyGrades.map((g) => (
                  <tr key={g.grade} className="hover:bg-accent/5 transition-colors">
                    <td className="p-4">
                       <span className={`px-2.5 py-1 rounded font-black text-sm border ${g.color}`}>{g.grade}</span>
                    </td>
                    <td className="p-4 text-center font-medium">{g.min_percent}%</td>
                    <td className="p-4 text-center font-medium">{g.max_percent}%</td>
                    <td className="p-4 text-center font-bold">{g.points}</td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
