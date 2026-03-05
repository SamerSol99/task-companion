import { Link } from "react-router-dom";
import { useMemberStore, useTaskStore } from "@/hooks/useStore";
import { ROLE_LABELS } from "@/types/task";
import MemberAvatar from "@/components/MemberAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TeamPage = () => {
  const { members } = useMemberStore();
  const { tasks } = useTaskStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Team</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => {
          const assignedTasks = tasks.filter((t) => t.assigneeId === m.id);
          return (
            <Link to={`/team/${m.id}`} key={m.id}>
              <Card className="transition-shadow hover:shadow-md h-full">
                <CardContent className="flex items-center gap-4 p-5">
                  <MemberAvatar name={m.name} color={m.avatarColor} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-card-foreground">{m.name}</h3>
                    <p className="text-sm text-muted-foreground">{m.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{ROLE_LABELS[m.role]}</Badge>
                      <Badge variant="outline">{m.department}</Badge>
                      <Badge variant="outline">{assignedTasks.length} Tasks</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TeamPage;
