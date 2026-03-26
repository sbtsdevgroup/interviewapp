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

  const displayMetrics = useMemo(
    () => [
      {
        title: "Total Students",
        value: totalStudentsCount.toString(),
        chipClass: "bg-blue-100 text-blue-700",
        svg: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_2693_8260)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.0056 0.416504C4.70935 0.416504 0.416016 4.70984 0.416016 10.0061C0.416016 14.6873 3.77018 18.5844 8.20643 19.4269C8.72602 19.5257 9.17185 19.1153 9.17185 18.6169V16.7828C9.17185 16.3786 8.88643 16.0515 8.51977 15.9603C5.84893 15.2961 3.86977 12.8815 3.86977 10.0061C3.86977 6.61734 6.61685 3.87067 10.0056 3.87067C12.9156 3.87067 15.3531 5.89692 15.9827 8.6165C16.0689 8.98859 16.3985 9.28192 16.8085 9.28192H18.6364C19.131 9.28192 19.5393 8.84275 19.4481 8.32609C18.6539 3.83109 14.7289 0.416504 10.0056 0.416504ZM14.1389 15.4273C13.8564 15.1444 13.4281 15.1123 13.1056 15.3019C12.6017 15.5978 12.0578 15.8195 11.4906 15.9603C11.1239 16.0515 10.8389 16.3786 10.8389 16.7828V18.6169C10.8389 19.1153 11.2848 19.5253 11.8043 19.4269C13.0621 19.1879 14.259 18.6982 15.3235 17.9869C15.766 17.6915 15.7939 17.0819 15.4393 16.7273L14.1389 15.4273ZM15.9377 11.5778C16.0364 11.2219 16.3589 10.9486 16.7543 10.9486H18.5952C19.0973 10.9486 19.5093 11.4011 19.4031 11.9236C19.1453 13.1949 18.6305 14.4001 17.8902 15.4653C17.5902 15.8978 16.9889 15.9203 16.6385 15.5698L15.3448 14.2761C15.0585 13.9898 15.0293 13.5565 15.2248 13.2332L15.2348 13.2153C15.2869 13.1223 15.3383 13.029 15.3889 12.9353C15.4831 12.7611 15.5848 12.5653 15.6398 12.4382C15.6952 12.3107 15.7689 12.0994 15.8319 11.9082C15.8661 11.8049 15.8994 11.7012 15.9318 11.5973L15.9377 11.5778Z"
                fill="#0D62D1"
              />
            </g>
            <defs>
              <clipPath id="clip0_2693_8260">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        ),
      },
      {
        title: "Average Score",
        value: analytics
          ? `${(
              analytics.programPerformance.reduce(
                (acc: number, curr: any) => acc + curr.averageScore,
                0
              ) / (analytics.programPerformance.length || 1)
            ).toFixed(1)}%`
          : "0%",
        chipClass: "bg-amber-100 text-amber-700",
        svg: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_2693_8264)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.0056 0.416504C4.70935 0.416504 0.416016 4.70984 0.416016 10.0061C0.416016 14.6873 3.77018 18.5844 8.20643 19.4269C8.72602 19.5257 9.17185 19.1153 9.17185 18.6169V16.7828C9.17185 16.3786 8.88643 16.0515 8.51977 15.9603C5.84893 15.2961 3.86977 12.8815 3.86977 10.0061C3.86977 6.61734 6.61685 3.87067 10.0056 3.87067C12.9156 3.87067 15.3531 5.89692 15.9827 8.6165C16.0689 8.98859 16.3985 9.28192 16.8085 9.28192H18.6364C19.131 9.28192 19.5393 8.84275 19.4481 8.32609C18.6539 3.83109 14.7289 0.416504 10.0056 0.416504ZM14.1389 15.4273C13.8564 15.1444 13.4281 15.1123 13.1056 15.3019C12.6017 15.5978 12.0578 15.8195 11.4906 15.9603C11.1239 16.0515 10.8389 16.3786 10.8389 16.7828V18.6169C10.8389 19.1153 11.2848 19.5253 11.8043 19.4269C13.0621 19.1879 14.259 18.6982 15.3235 17.9869C15.766 17.6915 15.7939 17.0819 15.4393 16.7273L14.1389 15.4273ZM15.9377 11.5778C16.0364 11.2219 16.3589 10.9486 16.7543 10.9486H18.5952C19.0973 10.9486 19.5093 11.4011 19.4031 11.9236C19.1453 13.1949 18.6305 14.4001 17.8902 15.4653C17.5902 15.8978 16.9889 15.9203 16.6385 15.5698L15.3448 14.2761C15.0585 13.9898 15.0293 13.5565 15.2248 13.2332L15.2348 13.2153C15.2869 13.1223 15.3383 13.029 15.3889 12.9353C15.4831 12.7611 15.5848 12.5653 15.6398 12.4382C15.6952 12.3107 15.7689 12.0994 15.8319 11.9082C15.8661 11.8049 15.8994 11.7012 15.9318 11.5973L15.9377 11.5778Z"
                fill="#E58411"
              />
            </g>
            <defs>
              <clipPath id="clip0_2693_8264">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        ),
      },
      {
        title: "Programs Active",
        value: (analytics?.programPerformance?.length || 0).toString(),
        chipClass: "bg-green-100 text-green-700",
        svg: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_2693_8268"
              maskUnits="userSpaceOnUse"
              x="1"
              y="0"
              width="18"
              height="20"
            >
              <path
                d="M10.0001 1.6665L12.1889 3.26317L14.8985 3.25817L15.7305 5.8365L17.9255 7.42484L17.0835 9.99984L17.9255 12.5748L15.7305 14.1632L14.8985 16.7415L12.1889 16.7365L10.0001 18.3332L7.81137 16.7365L5.10179 16.7415L4.26971 14.1632L2.07471 12.5748L2.91679 9.99984L2.07471 7.42484L4.26971 5.8365L5.10179 3.25817L7.81137 3.26317L10.0001 1.6665Z"
                fill="white"
                stroke="white"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7.0835 9.99984L9.16683 12.0832L13.3335 7.9165"
                stroke="black"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </mask>
            <g mask="url(#mask0_2693_8268)">
              <path d="M0 0H20V20H0V0Z" fill="#018A13" />
            </g>
          </svg>
        ),
      },
      {
        title: "Status Varieties",
        value: (analytics?.statusDistribution?.length || 0).toString(),
        chipClass: "bg-fuchsia-100 text-fuchsia-700",
        svg: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_2693_8237)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.0056 0.416504C4.70935 0.416504 0.416016 4.70984 0.416016 10.0061C0.416016 14.6873 3.77018 18.5844 8.20643 19.4269C8.72602 19.5257 9.17185 19.1153 9.17185 18.6169V16.7828C9.17185 16.3786 8.88643 16.0515 8.51977 15.9603C5.84893 15.2961 3.86977 12.8815 3.86977 10.0061C3.86977 6.61734 6.61685 3.87067 10.0056 3.87067C12.9156 3.87067 15.3531 5.89692 15.9827 8.6165C16.0689 8.98859 16.3985 9.28192 16.8085 9.28192H18.6364C19.131 9.28192 19.5393 8.84275 19.4481 8.32609C18.6539 3.83109 14.7289 0.416504 10.0056 0.416504ZM14.1389 15.4273C13.8564 15.1444 13.4281 15.1123 13.1056 15.3019C12.6017 15.5978 12.0578 15.8195 11.4906 15.9603C11.1239 16.0515 10.8389 16.3786 10.8389 16.7828V18.6169C10.8389 19.1153 11.2848 19.5253 11.8043 19.4269C13.0621 19.1879 14.259 18.6982 15.3235 17.9869C15.766 17.6915 15.7939 17.0819 15.4393 16.7273L14.1389 15.4273ZM15.9377 11.5778C16.0364 11.2219 16.3589 10.9486 16.7543 10.9486H18.5952C19.0973 10.9486 19.5093 11.4011 19.4031 11.9236C19.1453 13.1949 18.6305 14.4001 17.8902 15.4653C17.5902 15.8978 16.9889 15.9203 16.6385 15.5698L15.3448 14.2761C15.0585 13.9898 15.0293 13.5565 15.2248 13.2332L15.2348 13.2153C15.2869 13.1223 15.3383 13.029 15.3889 12.9353C15.4831 12.7611 15.5848 12.5653 15.6398 12.4382C15.6952 12.3107 15.7689 12.0994 15.8319 11.9082C15.8661 11.8049 15.8994 11.7012 15.9318 11.5973L15.9377 11.5778Z"
                fill="#9A0367"
              />
            </g>
            <defs>
              <clipPath id="clip0_2693_8237">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        ),
      },
    ],
    [analytics, totalStudentsCount]
  );

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
                <CardContent>
                  <div className="h-56">
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
                  </div>
                  <div className="mt-3">
                    <div className="mx-auto w-full max-w-[520px]">
                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-600">
                        {departmentDistributionData.map((item: any) => (
                          <div
                            key={item.name}
                            className="inline-flex items-center gap-2 min-w-0"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="truncate max-w-[140px] sm:max-w-none">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
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

