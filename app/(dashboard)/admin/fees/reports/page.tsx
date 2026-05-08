"use client";

import { DollarSign, BarChart3, Download, TrendingUp, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useFeeCollectionTrend, useDashboardStats, useFeeRecords } from "@/lib/supabase/hooks";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Cell, PieChart, Pie
} from "recharts";

export default function AdminFeeReportsPage() {
  const { data: trend, isLoading: loadingTrend } = useFeeCollectionTrend();
  const { data: stats } = useDashboardStats();
  const { data: allRecords } = useFeeRecords();

  if (loadingTrend) return <LoadingSkeleton variant="dashboard" />;

  const methodData = [
    { name: "Cash", value: 45, color: "#10b981" },
    { name: "UPI", value: 35, color: "#2563eb" },
    { name: "Bank", value: 20, color: "#f59e0b" },
  ];

  const overdueTotal = allRecords?.filter((r: any) => r.status === 'overdue').reduce((acc: number, r: any) => acc + (r.amount_due - r.amount_paid), 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports"
        subtitle="Detailed analysis of fee collection and outstanding dues."
        icon={BarChart3}
        actions={
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
           <CardContent className="pt-6 flex justify-between items-start">
             <div>
               <p className="text-xs font-semibold text-emerald-600 uppercase">This Month</p>
               <h3 className="text-2xl font-bold mt-1">₹{stats?.revenueThisMonth.value.toLocaleString()}</h3>
             </div>
             <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600"><ArrowUpRight className="w-4 h-4" /></div>
           </CardContent>
        </Card>
        <Card className="border-rose-500/20 bg-rose-500/5">
           <CardContent className="pt-6 flex justify-between items-start">
             <div>
               <p className="text-xs font-semibold text-rose-600 uppercase">Outstanding</p>
               <h3 className="text-2xl font-bold mt-1">₹{overdueTotal.toLocaleString()}</h3>
             </div>
             <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600"><ArrowDownRight className="w-4 h-4" /></div>
           </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
           <CardContent className="pt-6 flex justify-between items-start">
             <div>
               <p className="text-xs font-semibold text-blue-600 uppercase">Target</p>
               <h3 className="text-2xl font-bold mt-1">₹{(stats?.revenueThisMonth.value || 0 + overdueTotal).toLocaleString()}</h3>
             </div>
             <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600"><TrendingUp className="w-4 h-4" /></div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Collection Trend</CardTitle>
            <CardDescription>Monthly breakdown of collected vs pending fees.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="collected" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Payment Methods</CardTitle>
            <CardDescription>Distribution of collection modes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
               <PieChart>
                  <Pie data={methodData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
               </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-2 w-full mt-4">
               {methodData.map(m => (
                 <div key={m.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                       <span className="text-muted-foreground">{m.name}</span>
                    </div>
                    <span className="font-bold">{m.value}%</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
