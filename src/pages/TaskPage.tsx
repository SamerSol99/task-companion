import { useParams, useNavigate } from "react-router-dom";
import { useTaskStore } from "@/hooks/useTaskStore";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TaskPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addTask, updateTask, getTask } = useTaskStore();
  const isNew = id === "new";
  const task = !isNew && id ? getTask(id) : undefined;

  if (!isNew && !task) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {isNew ? "Neue Aufgabe erstellen" : "Aufgabe bearbeiten"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm
              initialData={task}
              onSubmit={(data) => {
                if (isNew) {
                  addTask(data);
                } else {
                  updateTask(id!, data);
                }
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TaskPage;
