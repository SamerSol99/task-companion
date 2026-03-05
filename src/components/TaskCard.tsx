import { Calendar, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isPast, isToday } from "date-fns";
import { de } from "date-fns/locale";
import type { Task } from "@/types/task";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

const priorityStyles: Record<Task["priority"], string> = {
  high: "bg-priority-high-bg text-priority-high border-priority-high/20",
  medium: "bg-priority-medium-bg text-priority-medium border-priority-medium/20",
  low: "bg-priority-low-bg text-priority-low border-priority-low/20",
};

const statusStyles: Record<Task["status"], string> = {
  open: "bg-status-open-bg text-status-open",
  "in-progress": "bg-status-progress-bg text-status-progress",
  done: "bg-status-done-bg text-status-done",
};

const TaskCard = ({ task, onDelete }: TaskCardProps) => {
  const dueDate = new Date(task.dueDate);
  const overdue = isPast(dueDate) && !isToday(dueDate) && task.status !== "done";

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/tasks/${task.id}`} className="min-w-0 flex-1">
            <h3 className={`font-semibold text-card-foreground ${task.status === "done" ? "line-through opacity-60" : ""}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
            )}
          </Link>
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.preventDefault(); onDelete(task.id); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={priorityStyles[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
          <Badge variant="secondary" className={statusStyles[task.status]}>{STATUS_LABELS[task.status]}</Badge>
          <span className={`ml-auto flex items-center gap-1 text-xs ${overdue ? "text-priority-high font-medium" : "text-muted-foreground"}`}>
            <Calendar className="h-3 w-3" />
            {format(dueDate, "dd. MMM yyyy", { locale: de })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
