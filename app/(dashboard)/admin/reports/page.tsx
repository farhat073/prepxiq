"use client";

import { useState } from "react";
import { BarChart3, Download, TrendingUp, Users, GraduationCap, DollarSign, Calendar, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDashboardStats, useFeeCollectionTrend, useBatchDistribution, useEnrollmentTrend } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, PieChart, Pie, Cell 
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminReportsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: feeTrend, isLoading: feeLoading } = useFeeCollectionTrend();
  const { data: batchDist, isLoading: batchLoading } = useBatchDistribution();
  const { data: enrollmentTrend, isLoading: enrollmentLoading } = useEnrollmentTrend();

  if (statsLoading || feeLoading || batchLoading || enrollmentLoading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Analytics"
        subtitle="Performance metrics and financial reports for your center."
        icon={BarChart3}
        actions={
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Generate PDF
          </Button>
        }
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-accent/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600"><GraduationCap className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Students</p>
                    <p className="text-xl font-bold">{stats?.totalStudents.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600"><DollarSign className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Fee Collected</p>
                    <p className="text-xl font-bold">₹{stats?.revenueThisMonth.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600"><Users className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Teachers</p>
                    <p className="text-xl font-bold">{stats?.totalTeachers.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600"><Calendar className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Active Batches</p>
                    <p className="text-xl font-bold">{batchDist?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Enrollment Growth</CardTitle>
                <CardDescription>Cumulative student growth over current year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Batch Distribution</CardTitle>
                <CardDescription>Number of students per batch</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={batchDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="students" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6 mt-6">
           <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Fee Collection Trend</CardTitle>
                <CardDescription>Monthly collected vs pending payments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={feeTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6 mt-6">
          <div className="py-20 text-center border border-dashed rounded-xl bg-accent/5">
             <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
             <h3 className="text-lg font-medium">Academic Reports</h3>
             <p className="text-muted-foreground max-w-xs mx-auto mt-1">
               Aggregated exam performance and subject-wise analysis will be available here.
             </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
