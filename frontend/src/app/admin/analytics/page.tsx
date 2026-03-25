'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  CircleDot,
  Clock3,
  Gauge,
  GraduationCap,
  RefreshCcw,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '@/services/admin-service';

const COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#7c3aed', '#db2777', '#0891b2', '#4f46e5'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminAPI.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalStudentsCount = useMemo(() => {
    return analytics?.programPerformance?.reduce((acc: number, curr: any) => acc + curr.students, 0) || 0;
  }, [analytics]);

  const displayMetrics = useMemo(() => [
    {
      title: "Total Students",
      value: totalStudentsCount.toString(),
      chipClass: "bg-blue-100 text-blue-700",
      svg: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0056 0.416504C4.70935 0.416504 0.416016 4.70984 0.416016 10.0061C0.416016 14.6873 3.77018 18.5844 8.20643 19.4269C8.72602 19.5257 9.17185 19.1153 9.17185 18.6169V18.6169Z" fill="#0D62D1"/></g></svg>
      ),
    },
    {
      title: "Average Score",
      value: analytics ? `${(analytics.programPerformance.reduce((acc: number, curr: any) => acc + curr.averageScore, 0) / (analytics.programPerformance.length || 1)).toFixed(1)}%` : "0%",
      chipClass: "bg-amber-100 text-amber-700",
      svg: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0056 0.416504C4.70935 0.416504 0.416016 4.70984 0.416016 10.0061V10.0061Z" fill="#E58411"/></g></svg>
      ),
    },
    {
      title: "Programs Active",
      value: (analytics?.programPerformance?.length || 0).toString(),
      chipClass: "bg-green-100 text-green-700",
      svg: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0056 0.416504C4.70935 0.416504 0.416016 4.70984 0.416016 10.0061V10.0061Z" fill="#018A13"/></g></svg>
      ),
    },
    {
      title: "Status Varieties",
      value: (analytics?.statusDistribution?.length || 0).toString(),
      chipClass: "bg-fuchsia-100 text-fuchsia-700",
      svg: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0056 0.416504V10.0061Z" fill="#9A0367"/></g></svg>
      ),
    },
  ], [analytics, totalStudentsCount]);

  const programPerformanceData = useMemo(() => {
    return (analytics?.programPerformance || []).map((p: any) => ({
      ...p,
      averageScore: `${p.averageScore.toFixed(1)}%`,
      percentTotal: totalStudentsCount > 0 ? `${Math.round((p.students / totalStudentsCount) * 100)}%` : '0%',
    }));
  }, [analytics, totalStudentsCount]);

  const performanceTrendData = useMemo(() => {
    return (analytics?.statusDistribution || []).map((s: any) => ({
      label: s.status.substring(0, 2).toUpperCase(),
      value: s.count,
    }));
  }, [analytics]);

  const participantGrowthData = useMemo(() => {
    return analytics?.growthByMonth || [];
  }, [analytics]);

  const departmentDistributionData = useMemo(() => {
    return (analytics?.departmentDistribution || []).map((d: any, index: number) => ({
      name: d.name,
      value: d.value,
      color: COLORS[index % COLORS.length],
    }));
  }, [analytics]);
  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card className="border-none bg-transparent space-y-6 shadow-none">
          <div className=" bg-white p-6 rounded-xl space-y-6">
            <CardHeader className="pb-3 p-0">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold text-slate-900">
                    Analytics & Insights
                  </CardTitle>
                  <CardDescription className="text-slate-500 mt-1">
                    Track performance metrics and assessment analytics.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="30d">
                    <SelectTrigger className="w-[140px] h-9 rounded-lg border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="h-9 rounded-lg bg-[#155dfc] hover:bg-[#0d4bc4]">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {displayMetrics.map((metric: any) => (
                <Card key={metric.title} className="border-none bg-[#F6F7F9]">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      {metric.icon}
                      <span className="text-sm">{metric.title}</span>
                    </div>
                    <div
                      className={`mt-4 w-fit rounded-full px-3 py-1 text-sm font-semibold flex justify-center items-center gap-2 ${metric.chipClass}`}
                    >
                      {metric.svg}
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <CardContent className="space-y-6 p-0 border-none">
            <Card className="border-none rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-700" />
                  <CardTitle className="text-xl text-slate-900">
                    Program Performance
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-500">
                  Student distribution performance across programs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {programPerformanceData.map((program: any, index: number) => (
                  <div
                    key={program.name}
                    className="grid grid-cols-12 items-center rounded-lg border border-none bg-[#F6F7F9] px-4 py-3 gap-2 text-sm"
                  >
                    <div className="col-span-1 text-slate-500 font-medium">
                      {index + 1}
                    </div>
                    <div className="col-span-5 font-semibold text-slate-900 truncate">
                      {program.name}
                    </div>
                    <div className="col-span-2 text-slate-700">
                      {program.students} students
                    </div>
                    <div className="col-span-2 text-slate-700">
                      {program.averageScore} Average Score
                    </div>
                    <div className="col-span-2 text-slate-700">
                      {program.percentTotal} of total
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="border-none rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900">
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceTrendData}>
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#155dfc"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900">
                    Participant Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={participantGrowthData}>
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#155dfc"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900">
                    Department Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {departmentDistributionData.map((entry: any) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-600 mt-2">
                    {departmentDistributionData.map((item: any) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-1.5"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

