import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useProjectStore, useTaskStore, useMemberStore } from "@/hooks/useStore";
import { PROJECT_STATUS_LABELS } from "@/types/task";
import MemberAvatar from "@/components/MemberAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const statusStyles = {
  active: "bg-status-progress-bg text-status-progress",
  completed: "bg-status-done-bg text-status-done",
  paused: "bg-status-open-bg text-status-open",
};

const ProjectsPage = () => {
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  const { members } = useMemberStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projekte</h1>
        <Button asChild>
          <Link to="/projects/new"><Plus className="mr-2 h-4 w-4" /> Neues Projekt</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const projectTasks = tasks.filter((t) => t.projectId === p.id);
          const done = projectTasks.filter((t) => t.status === "done").length;
          const total = projectTasks.length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;
          const responsible = members.find((m) => m.id === p.responsibleId);

          return (
            <Link to={`/projects/${p.id}`} key={p.id}>
              <Card className="transition-shadow hover:shadow-md h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-card-foreground">{p.name}</h3>
                    <Badge variant="secondary" className={statusStyles[p.status]}>
                      {PROJECT_STATUS_LABELS[p.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{done}/{total} Tasks erledigt</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  {responsible && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MemberAvatar name={responsible.name} color={responsible.avatarColor} size="sm" />
                      {responsible.name}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsPage;
