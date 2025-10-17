"use client";

import { useMemo } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Users,
  FolderKanban,
  BarChart3,
  Activity
} from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "@/contexts/auth-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Priority, IssueStatus, IssueType } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentWorkspace, currentProject, issues, loading } = useWorkspace();

  // Calculate statistics
  const stats = useMemo(() => {
    if (!issues) {
      return {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        byPriority: { high: 0, urgent: 0, medium: 0, low: 0 },
        byType: { bug: 0, feature: 0, task: 0, improvement: 0 },
      };
    }

    const stats = {
      total: issues.length,
      todo: 0,
      inProgress: 0,
      done: 0,
      byPriority: { high: 0, urgent: 0, medium: 0, low: 0 },
      byType: { bug: 0, feature: 0, task: 0, improvement: 0 },
    };

    issues.forEach((issue) => {
      // Count by status
      if (issue.status === "todo") stats.todo++;
      else if (issue.status === "in-progress") stats.inProgress++;
      else if (issue.status === "done") stats.done++;

      // Count by priority
      if (issue.priority in stats.byPriority) {
        stats.byPriority[issue.priority as Priority]++;
      }

      // Count by type
      if (issue.type in stats.byType) {
        stats.byType[issue.type as IssueType]++;
      }
    });

    return stats;
  }, [issues]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.done / stats.total) * 100);
  }, [stats]);

  // Prepare chart data
  const statusChartData = [
    { status: "To Do", count: stats.todo, fill: "var(--chart-1)" },
    { status: "In Progress", count: stats.inProgress, fill: "var(--chart-2)" },
    { status: "Done", count: stats.done, fill: "var(--chart-3)" },
  ];

  const priorityChartData = [
    { priority: "Urgent", count: stats.byPriority.urgent, fill: "var(--chart-1)" },
    { priority: "High", count: stats.byPriority.high, fill: "var(--chart-2)" },
    { priority: "Medium", count: stats.byPriority.medium, fill: "var(--chart-3)" },
    { priority: "Low", count: stats.byPriority.low, fill: "var(--chart-4)" },
  ];

  const typeChartData = [
    { type: "Bug", count: stats.byType.bug },
    { type: "Feature", count: stats.byType.feature },
    { type: "Task", count: stats.byType.task },
    { type: "Improvement", count: stats.byType.improvement },
  ];

  const statusChartConfig = {
    count: {
      label: "Issues",
    },
  } satisfies ChartConfig;

  const priorityChartConfig = {
    count: {
      label: "Issues",
    },
  } satisfies ChartConfig;

  const typeChartConfig = {
    bug: {
      label: "Bug",
      color: "var(--chart-1)",
    },
    feature: {
      label: "Feature",
      color: "var(--chart-2)",
    },
    task: {
      label: "Task",
      color: "var(--chart-3)",
    },
    improvement: {
      label: "Improvement",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}! Here&apos;s your project overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.done}</div>
            <p className="text-xs text-muted-foreground">
              {completionPercentage}% completion rate
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todo}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Issues by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="h-[200px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={statusChartData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={50}
                  strokeWidth={5}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>Issues by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={priorityChartConfig} className="h-[200px] w-full">
              <BarChart data={priorityChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="priority"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4}>
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Types</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={typeChartConfig} className="h-[200px] w-full">
              <BarChart data={typeChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="type"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--chart-1)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project & Workspace Info */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Current Project */}
        {currentProject && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    Current Project
                  </CardTitle>
                  <CardDescription>Active project details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{currentProject.name}</h3>
                <p className="text-sm text-muted-foreground">{currentProject.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {stats.inProgress} Active
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {stats.done} Done
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Workspace */}
        {currentWorkspace && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Current Workspace
                  </CardTitle>
                  <CardDescription>Workspace information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{currentWorkspace.name}</h3>
                {currentWorkspace.icon && (
                  <p className="text-2xl mt-2">{currentWorkspace.icon}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Issues</p>
                  <p className="text-lg font-semibold">{stats.total}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="text-lg font-semibold">{stats.done}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <Badge variant={currentWorkspace.isActive ? "default" : "secondary"}>
                  {currentWorkspace.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity / Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Issues</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.byPriority.urgent}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugs</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.byType.bug}</div>
            <p className="text-xs text-muted-foreground">
              Issues to be fixed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.byType.feature}</div>
            <p className="text-xs text-muted-foreground">
              New functionality
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
