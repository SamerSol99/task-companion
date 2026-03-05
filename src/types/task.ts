export type Priority = "high" | "medium" | "low";
export type Status = "open" | "in-progress" | "done";
export type ProjectStatus = "active" | "completed" | "paused";
export type TeamRole = "manager" | "developer" | "designer" | "qa";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  createdAt: string;
  projectId: string;
  assigneeId: string;
  estimatedHours: number;
  categoryIds: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  responsibleId: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatarColor: string;
  department: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
  taskId: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface TaskCategory {
  taskId: string;
  categoryId: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  memberId: string;
  date: string;
  hours: number;
  description: string;
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

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Aktiv",
  completed: "Abgeschlossen",
  paused: "Pausiert",
};

export const ROLE_LABELS: Record<TeamRole, string> = {
  manager: "Manager",
  developer: "Developer",
  designer: "Designer",
  qa: "QA",
};
