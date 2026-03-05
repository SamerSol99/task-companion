import { useMemo } from "react";
import { isPast, isToday, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { AlertTriangle, CheckSquare, Clock, FolderKanban } from "lucide-react";
import { useTaskStore, useProjectStore, useTimeEntryStore, useCommentStore, useMemberStore } from "@/hooks/useStore";
import type { Status } from "@/types/task";
import { STATUS_LABELS } from "@/types/task";
import KPICard from "@/components/KPICard";
import MemberAvatar from "@/components/MemberAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS: Record<Status, string> = {
  open: "hsl(var(--status-open))",
  "in-progress": "hsl(var(--status-progress))",
  done: "hsl(var(--status-done))",
};

const Dashboard = () => {
  const { tasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { entries } = useTimeEntryStore();
  const { comments } = useCommentStore();
  const { members } = useMemberStore();

  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== "done" && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
  ).length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const weekHours = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return entries
      .filter((e) => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((s, e) => s + e.hours, 0);
  }, [entries]);

  const chartData = useMemo(() => {
    return projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.projectId === p.id);
      return {
        name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
        Offen: projectTasks.filter((t) => t.status === "open").length,
        "In Bearbeitung": projectTasks.filter((t) => t.status === "in-progress").length,
        Erledigt: projectTasks.filter((t) => t.status === "done").length,
      };
    });
  }, [projects, tasks]);

  const recentComments = useMemo(
    () => [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [comments]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Offene Tasks" value={openTasks} icon={CheckSquare} />
        <KPICard title="Überfällige Tasks" value={overdueTasks} icon={AlertTriangle} color="text-destructive" />
        <KPICard title="Stunden diese Woche" value={weekHours.toFixed(1)} icon={Clock} color="text-status-progress" />
        <KPICard title="Aktive Projekte" value={activeProjects} icon={FolderKanban} color="text-priority-low" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Tasks pro Projekt</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Offen" fill={COLORS.open} />
                <Bar dataKey="In Bearbeitung" fill={COLORS["in-progress"]} />
                <Bar dataKey="Erledigt" fill={COLORS.done} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Letzte Aktivitäten</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentComments.map((c) => {
              const member = members.find((m) => m.id === c.createdBy);
              const task = tasks.find((t) => t.id === c.taskId);
              return (
                <div key={c.id} className="flex gap-3 text-sm">
                  {member && <MemberAvatar name={member.name} color={member.avatarColor} size="sm" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-card-foreground">
                      <span className="font-medium">{member?.name}</span>{" "}
                      kommentierte bei <span className="font-medium">{task?.title}</span>
                    </p>
                    <p className="truncate text-muted-foreground">{c.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(c.createdAt), "dd. MMM, HH:mm", { locale: de })}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentComments.length === 0 && <p className="text-sm text-muted-foreground">Keine Aktivitäten</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
