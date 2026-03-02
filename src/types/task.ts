export type Priority = "high" | "medium" | "low";
export type Status = "open" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string; // ISO date string
  createdAt: string;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

export const STATUS_LABELS: Record<Status, string> = {
  open: "Offen",
  "in-progress": "In Bearbeitung",
  done: "Erledigt",
};
