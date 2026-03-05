import { useParams, useNavigate } from "react-router-dom";
import { useTaskStore, useProjectStore, useMemberStore, useCategoryStore, useTaskCategoryStore, useTimeEntryStore } from "@/hooks/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskForm from "@/components/TaskForm";
import CommentSection from "@/components/CommentSection";
import TimeEntrySection from "@/components/TimeEntrySection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import type { Task } from "@/types/task";

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addTask, updateTask, getTask } = useTaskStore();
  const { projects } = useProjectStore();
  const { members } = useMemberStore();
  const { categories } = useCategoryStore();
  const { getForTask, setForTask } = useTaskCategoryStore();
  const { getEntriesForTask } = useTimeEntryStore();
  const isNew = id === "new";
  const task = !isNew && id ? getTask(id) : undefined;

  if (!isNew && !task) { navigate("/tasks"); return null; }

  const selectedCategoryIds = task ? getForTask(task.id) : [];
  const actualHours = task ? getEntriesForTask(task.id).reduce((s, e) => s + e.hours, 0) : 0;

  return (
    <div className="space-y-6 mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/tasks")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Zurück
      </Button>

      {task && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Geschätzt: {task.estimatedHours}h</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Tatsächlich: {actualHours.toFixed(1)}h</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Neue Aufgabe erstellen" : "Aufgabe bearbeiten"}</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            initialData={task}
            projects={projects}
            members={members}
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onSubmit={(data: Omit<Task, "id" | "createdAt">, categoryIds: string[]) => {
              if (isNew) {
                addTask(data);
              } else {
                updateTask(id!, data);
                setForTask(id!, categoryIds);
              }
            }}
          />
        </CardContent>
      </Card>

      {!isNew && task && (
        <>
          <Card>
            <CardContent className="p-5">
              <CommentSection taskId={task.id} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <TimeEntrySection taskId={task.id} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TaskDetailPage;
