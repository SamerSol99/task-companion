import { useParams, useNavigate, Link } from "react-router-dom";
import { useMemberStore, useTaskStore, useTimeEntryStore, useProjectStore } from "@/hooks/useStore";
import { ROLE_LABELS, STATUS_LABELS, PRIORITY_LABELS } from "@/types/task";
import MemberAvatar from "@/components/MemberAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";

const MemberDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMember } = useMemberStore();
  const { tasks } = useTaskStore();
  const { getEntriesForMember } = useTimeEntryStore();
  const { projects } = useProjectStore();

  const member = id ? getMember(id) : undefined;
  if (!member) { navigate("/team"); return null; }

  const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
  const memberEntries = getEntriesForMember(member.id);
  const totalHours = memberEntries.reduce((s, e) => s + e.hours, 0);
  const memberProjectIds = [...new Set(memberTasks.map((t) => t.projectId))];
  const memberProjects = projects.filter((p) => memberProjectIds.includes(p.id));

  return (
    <div className="space-y-6 mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/team")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Zurück
      </Button>

      <div className="flex items-center gap-4">
        <MemberAvatar name={member.name} color={member.avatarColor} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
          <p className="text-muted-foreground">{member.email}</p>
          <div className="mt-1 flex gap-2">
            <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
            <Badge variant="outline">{member.department}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Zugewiesene Tasks</p>
          <p className="text-2xl font-bold text-card-foreground">{memberTasks.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Geleistete Stunden</p>
          <p className="text-2xl font-bold text-card-foreground">{totalHours.toFixed(1)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Projekte</p>
          <p className="text-2xl font-bold text-card-foreground">{memberProjects.length}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Aufgaben</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {memberTasks.map((t) => (
            <Link to={`/tasks/${t.id}`} key={t.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground truncate">{t.title}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{STATUS_LABELS[t.status]}</span>
                  <span>·</span>
                  <span>{PRIORITY_LABELS[t.priority]}</span>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Projekte</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {memberProjects.map((p) => (
            <Link to={`/projects/${p.id}`} key={p.id} className="rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium text-card-foreground hover:bg-muted">
              {p.name}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberDetailPage;
