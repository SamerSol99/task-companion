import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Priority, Status, Project, TeamMember, Category } from "@/types/task";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskFormProps {
  initialData?: Task;
  projects?: Project[];
  members?: TeamMember[];
  categories?: Category[];
  selectedCategoryIds?: string[];
  onSubmit: (data: Omit<Task, "id" | "createdAt">, categoryIds: string[]) => void;
  backPath?: string;
}

const TaskForm = ({ initialData, projects = [], members = [], categories = [], selectedCategoryIds = [], onSubmit, backPath = "/tasks" }: TaskFormProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [status, setStatus] = useState<Status>(initialData?.status ?? "open");
  const [priority, setPriority] = useState<Priority>(initialData?.priority ?? "medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : undefined
  );
  const [projectId, setProjectId] = useState(initialData?.projectId ?? "");
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId ?? "");
  const [estimatedHours, setEstimatedHours] = useState(String(initialData?.estimatedHours ?? ""));
  const [catIds, setCatIds] = useState<string[]>(selectedCategoryIds);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Titel ist ein Pflichtfeld.";
    if (!dueDate) {
      newErrors.dueDate = "Fälligkeitsdatum ist erforderlich.";
    } else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const selected = new Date(dueDate); selected.setHours(0, 0, 0, 0);
      if (selected < today) newErrors.dueDate = "Das Datum darf nicht in der Vergangenheit liegen.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate!.toISOString(),
      projectId,
      assigneeId,
      estimatedHours: parseFloat(estimatedHours) || 0,
      categoryIds: catIds,
    }, catIds);
    navigate(backPath);
  };

  const toggleCategory = (id: string) => {
    setCatIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Titel *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Aufgabentitel eingeben..." className={errors.title ? "border-destructive" : ""} />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beschreibe die Aufgabe..." rows={3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.entries(STATUS_LABELS) as [Status, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Priorität</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.length > 0 && (
          <div className="space-y-1.5">
            <Label>Projekt</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        {members.length > 0 && (
          <div className="space-y-1.5">
            <Label>Zugewiesen an</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Fälligkeitsdatum *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground", errors.dueDate && "border-destructive")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "dd.MM.yyyy") : "Datum wählen..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Geschätzte Stunden</Label>
          <Input type="number" step="0.5" min="0" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} placeholder="z.B. 8" />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="space-y-2">
          <Label>Kategorien</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted" style={{ borderColor: catIds.includes(c.id) ? c.color : undefined, backgroundColor: catIds.includes(c.id) ? c.color + "15" : undefined }}>
                <Checkbox checked={catIds.includes(c.id)} onCheckedChange={() => toggleCategory(c.id)} className="h-3.5 w-3.5" />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1 sm:flex-none">{initialData ? "Speichern" : "Erstellen"}</Button>
        <Button type="button" variant="outline" onClick={() => navigate(backPath)} className="flex-1 sm:flex-none">Abbrechen</Button>
      </div>
    </form>
  );
};

export default TaskForm;
