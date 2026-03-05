import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjectStore, useTaskStore, useMemberStore, useTimeEntryStore } from "@/hooks/useStore";
import { PROJECT_STATUS_LABELS, STATUS_LABELS, PRIORITY_LABELS } from "@/types/task";
import MemberAvatar from "@/components/MemberAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject } = useProjectStore();
  const { tasks } = useTaskStore();
  const { members } = useMemberStore();
  const { entries } = useTimeEntryStore();

  const project = id ? getProject(id) : undefined;
  if (!project) { navigate("/projects"); return null; }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const done = projectTasks.filter((t) => t.status === "done").length;
  const progress = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0;
  const responsible = members.find((m) => m.id === project.responsibleId);
  const totalHours = entries.filter((e) => projectTasks.some((t) => t.id === e.taskId)).reduce((s, e) => s + e.hours, 0);

  const teamMemberIds = [...new Set(projectTasks.map((t) => t.assigneeId))];
  const teamMembers = members.filter((m) => teamMemberIds.includes(m.id));

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Zurück
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Fortschritt</p>
          <p className="text-2xl font-bold text-card-foreground">{progress}%</p>
          <Progress value={progress} className="mt-2 h-2" />
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Tasks</p>
          <p className="text-2xl font-bold text-card-foreground">{done}/{projectTasks.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Gesamtstunden</p>
          <p className="text-2xl font-bold text-card-foreground">{totalHours.toFixed(1)}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Aufgaben</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {projectTasks.map((t) => {
            const assignee = members.find((m) => m.id === t.assigneeId);
            return (
              <Link to={`/tasks/${t.id}`} key={t.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground truncate">{t.title}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{STATUS_LABELS[t.status]}</span>
                    <span>·</span>
                    <span>{PRIORITY_LABELS[t.priority]}</span>
                  </div>
                </div>
                {assignee && <MemberAvatar name={assignee.name} color={assignee.avatarColor} size="sm" />}
              </Link>
            );
          })}
          {projectTasks.length === 0 && <p className="text-sm text-muted-foreground">Keine Aufgaben</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Teammitglieder</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {teamMembers.map((m) => (
            <Link to={`/team/${m.id}`} key={m.id} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 hover:bg-muted">
              <MemberAvatar name={m.name} color={m.avatarColor} size="sm" />
              <span className="text-sm font-medium text-card-foreground">{m.name}</span>
            </Link>
          ))}
          {teamMembers.length === 0 && <p className="text-sm text-muted-foreground">Keine Mitglieder zugewiesen</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailPage;
