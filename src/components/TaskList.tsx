import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import { ClipboardList } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
}

const TaskList = ({ tasks, onDelete }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16">
        <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-3 text-muted-foreground">Keine Aufgaben gefunden</p>
        <p className="text-sm text-muted-foreground/70">
          Erstelle eine neue Aufgabe, um loszulegen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default TaskList;
