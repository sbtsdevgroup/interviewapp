'use client';

import { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  CircleDot,
  GraduationCap,
  RefreshCcw,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminAPI } from '@/services/admin-service';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

const STATUS_FRIENDLY_LABELS: Record<string, string> = {
  'APPLIED': 'Applied',
  'ENROLLED': 'Enrolled',
  'INTERVIEW_SCHEDULED': 'Scheduled',
  'INTERVIEW_COMPLETED': 'Completed',
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'students' | 'score'>('students');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timeRange, setTimeRange] = useState('30d');

  const loadAnalyticsData = async () => {
    setRefreshing(true);
    try {
      const data = await adminAPI.getAnalytics();
      if (data) {
        const excluded = [
          'Regulatory Technology (RT Series)',
          'Technical Infrastructure (TI Series)',
          'Training & Capacity Building (TC Series)',
          'Emerging Technologies (ET Series)',
          'Professional Certification Prep (PC Series)',
          'Cybersecurity',
          'Business Process & Operations (BPO)',
          'Project & Program Management',
          'Software Development',
          'Unassigned',
          'AI & Machine Learning',
          'General Studies'
        ];
        if (data.programPerformance) {
          data.programPerformance = data.programPerformance.filter((p: any) => !excluded.includes(p.name));
        }
        if (data.departmentDistribution) {
          data.departmentDistribution = data.departmentDistribution.filter((d: any) => !excluded.includes(d.name));
        }
      }
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // Compute total student candidate pool
  const totalStudentsCount = useMemo(() => {
    return analytics?.programPerformance?.reduce((acc: number, curr: any) => acc + curr.students, 0) || 0;
  }, [analytics]);

  // Compute student-weighted average score (only including tracks with students and assessments)
  const weightedAverageScore = useMemo(() => {
    if (!analytics?.programPerformance || analytics.programPerformance.length === 0) return 0;
    
    let totalWeightedScore = 0;
    let totalScoredStudents = 0;
    
    analytics.programPerformance.forEach((p: any) => {
      if (p.averageScore > 0 && p.students > 0) {
        totalWeightedScore += p.averageScore * p.students;
        totalScoredStudents += p.students;
      }
    });
    
    if (totalScoredStudents === 0) return 0;
    return totalWeightedScore / totalScoredStudents;
  }, [analytics]);

  // Find the top performing program track
  const topProgram = useMemo(() => {
    if (!analytics?.programPerformance || analytics.programPerformance.length === 0) return null;
    let topProg: any = null;
    let maxScore = -1;
    analytics.programPerformance.forEach((p: any) => {
      if (p.averageScore > maxScore && p.students > 0) {
        maxScore = p.averageScore;
        topProg = p;
      }
    });
    return maxScore > 0 ? topProg : null;
  }, [analytics]);

  // Calculate completed interviews from statusDistribution
  const completedInterviewsCount = useMemo(() => {
    if (!analytics?.statusDistribution) return 0;
    const completedObj = analytics.statusDistribution.find(
      (s: any) => s.status === 'INTERVIEW_COMPLETED' || s.status === 'COMPLETED'
    );
    return completedObj ? completedObj.count : 0;
  }, [analytics]);

  // Filter and sort the program performance data
  const filteredAndSortedPrograms = useMemo(() => {
    let list = (analytics?.programPerformance || []).map((p: any) => ({
      ...p,
      percentTotal: totalStudentsCount > 0 ? (p.students / totalStudentsCount) * 100 : 0,
    }));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p: any) => p.name.toLowerCase().includes(q));
    }

    list.sort((a: any, b: any) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'students') {
        comparison = a.students - b.students;
      } else if (sortBy === 'score') {
        comparison = (a.averageScore || 0) - (b.averageScore || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [analytics, searchQuery, sortBy, sortOrder, totalStudentsCount]);

  const toggleSort = (field: 'name' | 'students' | 'score') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const performanceTrendData = useMemo(() => {
    return (analytics?.statusDistribution || []).map((s: any) => ({
      label: STATUS_FRIENDLY_LABELS[s.status] || s.status.replace('_', ' '),
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading analytics dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl border border-slate-50 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              Analytics & Insights
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor candidate distributions, performance trends, and dynamic assessment statistics
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-100 bg-slate-50 text-slate-700">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              disabled={refreshing}
              onClick={loadAnalyticsData}
              className="h-10 px-4 rounded-xl text-white font-medium gap-2 shadow-sm transition-all hover:scale-[1.02] flex items-center"
              style={{
                background: "linear-gradient(135deg, #155dfc 0%, #0d4bc4 100%)",
              }}
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-400 to-blue-600" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Enrolled
                </CardTitle>
                <span className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4 text-blue-600" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">{totalStudentsCount.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <span className="text-emerald-500 font-semibold flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +5.2%
                </span>
                since last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  AI Weighted Average
                </CardTitle>
                <span className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="h-4 w-4 text-amber-600" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">
                {weightedAverageScore > 0 ? `${weightedAverageScore.toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 truncate">
                {topProgram ? `Top track: ${topProgram.name}` : 'No active tracks scored'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Tracks
                </CardTitle>
                <span className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">
                {(analytics?.programPerformance?.length || 0).toString()}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Programs with enrolled students
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-violet-50 to-white hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-violet-400 to-violet-600" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Completed Assessments
                </CardTitle>
                <span className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CircleDot className="h-4 w-4 text-violet-600" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">{completedInterviewsCount}</div>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <span className="font-semibold text-slate-600">
                  {totalStudentsCount > 0 ? `${Math.round((completedInterviewsCount / totalStudentsCount) * 100)}%` : '0%'}
                </span>
                total completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Program Performance Table Section */}
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-slate-700" />
                  Program Track Performance
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Detailed distribution and average AI score metrics per program
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search program names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl bg-slate-50 border-none h-10 w-full text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="w-[80px] pl-6 font-semibold text-slate-600">Rank</TableHead>
                    <TableHead 
                      className="font-semibold text-slate-600 cursor-pointer hover:bg-slate-100/50 transition-colors"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Program Name
                        {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-slate-600 cursor-pointer hover:bg-slate-100/50 transition-colors"
                      onClick={() => toggleSort('students')}
                    >
                      <div className="flex items-center gap-1">
                        Candidates
                        {sortBy === 'students' && (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600">Distribution %</TableHead>
                    <TableHead 
                      className="font-semibold text-slate-600 cursor-pointer hover:bg-slate-100/50 transition-colors"
                      onClick={() => toggleSort('score')}
                    >
                      <div className="flex items-center gap-1">
                        Avg AI Score
                        {sortBy === 'score' && (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                      </div>
                    </TableHead>
                    <TableHead className="pr-6 font-semibold text-slate-600">Status Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPrograms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                        No program tracks found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedPrograms.map((program: any, index: number) => {
                      const isTopTrack = topProgram && program.name === topProgram.name;
                      return (
                        <TableRow key={program.name} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="pl-6 font-semibold text-slate-500">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{program.name}</span>
                              {isTopTrack && (
                                <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200 text-[10px] py-0.5 px-2 rounded-full gap-1">
                                  <Sparkles className="h-2.5 w-2.5" /> Top Track
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-700">
                            {program.students}
                          </TableCell>
                          <TableCell className="w-[200px]">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ width: `${program.percentTotal}%` }} 
                                />
                              </div>
                              <span className="text-xs text-slate-500 font-medium min-w-[32px] text-right">
                                {program.percentTotal.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {program.averageScore > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      program.averageScore >= 75 ? 'bg-emerald-500' : program.averageScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${program.averageScore}%` }} 
                                  />
                                </div>
                                <span className={`font-bold text-sm ${
                                  program.averageScore >= 75 ? 'text-emerald-600' : program.averageScore >= 50 ? 'text-amber-600' : 'text-rose-500'
                                }`}>
                                  {program.averageScore.toFixed(1)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="pr-6">
                            {program.averageScore > 0 ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium hover:bg-emerald-50">
                                Evaluated
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-50 text-slate-500 border border-slate-100 font-medium hover:bg-slate-50">
                                Pending Data
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recharts Visualizations Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Performance Trends Chart */}
          <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
            <CardHeader className="pb-4 px-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Cohort Distribution
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Distribution of enrolled candidates per cohort
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceTrendData}>
                  <defs>
                    <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="#94a3b8"
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                    labelClassName="font-semibold text-slate-800"
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#pipelineGradient)"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Participant Growth Area Chart */}
          <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
            <CardHeader className="pb-4 px-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Monthly Growth
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Registration trend analysis over past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={participantGrowthData}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="#94a3b8"
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                    labelClassName="font-semibold text-slate-800"
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#growthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Distribution Donut Chart */}
          <Card className="border-none shadow-sm bg-white rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <CardHeader className="pb-2 px-2">
                <CardTitle className="text-base font-bold text-slate-900">
                  Location Distribution
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Overall distribution of enrolled candidate locations
                </CardDescription>
              </CardHeader>
              <CardContent className="h-52 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {departmentDistributionData.map((entry: any) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total overlays in the center of the Donut */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                  <span className="text-xl font-black text-slate-900">{totalStudentsCount}</span>
                </div>
              </CardContent>
            </div>
            
            {/* Elegant Legend Grid */}
            <div className="px-2 pt-2 pb-1 border-t border-slate-50">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] text-slate-500">
                {departmentDistributionData.slice(0, 5).map((item: any) => (
                  <div key={item.name} className="inline-flex items-center gap-1 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate max-w-[90px] font-medium">
                      {item.name}
                    </span>
                  </div>
                ))}
                {departmentDistributionData.length > 5 && (
                  <span className="font-semibold text-slate-400">+{departmentDistributionData.length - 5} more</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
