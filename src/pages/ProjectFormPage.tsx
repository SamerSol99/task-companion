import { useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectStore, useMemberStore } from "@/hooks/useStore";
import type { ProjectStatus } from "@/types/task";
import { PROJECT_STATUS_LABELS } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProjectFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addProject, updateProject, getProject } = useProjectStore();
  const { members } = useMemberStore();
  const isNew = id === "new";
  const existing = !isNew && id ? getProject(id) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [startDate, setStartDate] = useState(existing?.startDate ?? "");
  const [endDate, setEndDate] = useState(existing?.endDate ?? "");
  const [status, setStatus] = useState<ProjectStatus>(existing?.status ?? "active");
  const [responsibleId, setResponsibleId] = useState(existing?.responsibleId ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isNew && !existing) { navigate("/projects"); return null; }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name ist Pflichtfeld.";
    if (!startDate) errs.startDate = "Startdatum ist erforderlich.";
    if (!endDate) errs.endDate = "Enddatum ist erforderlich.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const data = { name: name.trim(), description: description.trim(), startDate, endDate, status, responsibleId };
    if (isNew) addProject(data);
    else updateProject(id!, data);
    navigate("/projects");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Neues Projekt erstellen" : "Projekt bearbeiten"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? "border-destructive" : ""} />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Beschreibung</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Startdatum *</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={errors.startDate ? "border-destructive" : ""} />
              </div>
              <div className="space-y-1.5">
                <Label>Enddatum *</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={errors.endDate ? "border-destructive" : ""} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Verantwortlicher</Label>
                <Select value={responsibleId} onValueChange={setResponsibleId}>
                  <SelectTrigger><SelectValue placeholder="Auswählen..." /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{isNew ? "Erstellen" : "Speichern"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/projects")}>Abbrechen</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectFormPage;
