import { useCallback, useSyncExternalStore } from "react";
import type {
  Task, Project, TeamMember, Comment, Category, TaskCategory, TimeEntry,
} from "@/types/task";

// ── Storage helpers ──
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Seed data ──
const SEED_MEMBERS: TeamMember[] = [
  { id: "m1", name: "Anna Müller", email: "anna@example.com", role: "manager", avatarColor: "#6366f1", department: "Projektleitung" },
  { id: "m2", name: "Ben Schmidt", email: "ben@example.com", role: "developer", avatarColor: "#f59e0b", department: "Entwicklung" },
  { id: "m3", name: "Clara Weber", email: "clara@example.com", role: "designer", avatarColor: "#ec4899", department: "Design" },
  { id: "m4", name: "David Koch", email: "david@example.com", role: "qa", avatarColor: "#10b981", department: "Qualitätssicherung" },
];

const SEED_PROJECTS: Project[] = [
  { id: "p1", name: "Website Redesign", description: "Kompletter Relaunch der Unternehmenswebsite", startDate: "2025-01-15", endDate: "2025-06-30", status: "active", responsibleId: "m1" },
  { id: "p2", name: "Mobile App MVP", description: "Erste Version der mobilen App für Kunden", startDate: "2025-03-01", endDate: "2025-09-30", status: "active", responsibleId: "m2" },
];

const SEED_CATEGORIES: Category[] = [
  { id: "c1", name: "Bug", color: "#ef4444", icon: "Bug" },
  { id: "c2", name: "Feature", color: "#3b82f6", icon: "Sparkles" },
  { id: "c3", name: "Docs", color: "#8b5cf6", icon: "FileText" },
  { id: "c4", name: "Design", color: "#ec4899", icon: "Palette" },
];

const SEED_TASKS: Task[] = [
  { id: "t1", title: "Homepage Layout erstellen", description: "Wireframe und Layout für die neue Homepage entwerfen", status: "done", priority: "high", dueDate: "2025-03-15", createdAt: "2025-01-20", projectId: "p1", assigneeId: "m3", estimatedHours: 16, categoryIds: ["c4"] },
  { id: "t2", title: "REST API entwickeln", description: "Backend-Endpoints für Benutzerverwaltung implementieren", status: "in-progress", priority: "high", dueDate: "2025-04-10", createdAt: "2025-02-01", projectId: "p1", assigneeId: "m2", estimatedHours: 24, categoryIds: ["c2"] },
  { id: "t3", title: "Login-Seite implementieren", description: "Login mit E-Mail und Passwort umsetzen", status: "in-progress", priority: "medium", dueDate: "2025-04-20", createdAt: "2025-02-10", projectId: "p1", assigneeId: "m2", estimatedHours: 8, categoryIds: ["c2"] },
  { id: "t4", title: "Unit Tests schreiben", description: "Tests für die Kernmodule erstellen", status: "open", priority: "medium", dueDate: "2025-05-01", createdAt: "2025-02-15", projectId: "p1", assigneeId: "m4", estimatedHours: 12, categoryIds: ["c3"] },
  { id: "t5", title: "App-Navigation designen", description: "Bottom-Navigation und Tab-Struktur definieren", status: "done", priority: "high", dueDate: "2025-03-20", createdAt: "2025-03-05", projectId: "p2", assigneeId: "m3", estimatedHours: 10, categoryIds: ["c4"] },
  { id: "t6", title: "Push-Benachrichtigungen", description: "Firebase Push-Notifications integrieren", status: "open", priority: "low", dueDate: "2025-07-15", createdAt: "2025-03-10", projectId: "p2", assigneeId: "m2", estimatedHours: 6, categoryIds: ["c2"] },
  { id: "t7", title: "Responsive Bugfix Header", description: "Header bricht auf kleinen Bildschirmen um", status: "open", priority: "high", dueDate: "2025-03-25", createdAt: "2025-03-12", projectId: "p1", assigneeId: "m2", estimatedHours: 3, categoryIds: ["c1"] },
  { id: "t8", title: "Onboarding-Flow", description: "Willkommens-Screens für neue Nutzer erstellen", status: "in-progress", priority: "medium", dueDate: "2025-05-10", createdAt: "2025-03-15", projectId: "p2", assigneeId: "m3", estimatedHours: 14, categoryIds: ["c2", "c4"] },
];

const SEED_COMMENTS: Comment[] = [
  { id: "cm1", text: "Wireframe ist fertig, bitte Review machen.", createdAt: "2025-02-20T10:00:00Z", createdBy: "m3", taskId: "t1" },
  { id: "cm2", text: "Sieht super aus! Freigabe erteilt.", createdAt: "2025-02-21T14:30:00Z", createdBy: "m1", taskId: "t1" },
  { id: "cm3", text: "Erste Endpoints sind deployed, bitte testen.", createdAt: "2025-03-10T09:00:00Z", createdBy: "m2", taskId: "t2" },
  { id: "cm4", text: "Login-Flow Prototyp steht, Feedback willkommen.", createdAt: "2025-03-18T16:00:00Z", createdBy: "m2", taskId: "t3" },
];

const SEED_TIME_ENTRIES: TimeEntry[] = [
  { id: "te1", taskId: "t1", memberId: "m3", date: "2025-02-18", hours: 4, description: "Wireframe erstellt" },
  { id: "te2", taskId: "t1", memberId: "m3", date: "2025-02-19", hours: 6, description: "Layout finalisiert" },
  { id: "te3", taskId: "t2", memberId: "m2", date: "2025-03-05", hours: 8, description: "Auth-Endpoints implementiert" },
  { id: "te4", taskId: "t2", memberId: "m2", date: "2025-03-08", hours: 5, description: "User-CRUD fertiggestellt" },
  { id: "te5", taskId: "t3", memberId: "m2", date: "2025-03-15", hours: 4, description: "Login-Formular erstellt" },
  { id: "te6", taskId: "t5", memberId: "m3", date: "2025-03-12", hours: 3, description: "Tab-Navigation designed" },
  { id: "te7", taskId: "t8", memberId: "m3", date: "2025-03-16", hours: 5, description: "Onboarding Screens entworfen" },
];

const SEED_TASK_CATEGORIES: TaskCategory[] = [
  { taskId: "t1", categoryId: "c4" },
  { taskId: "t2", categoryId: "c2" },
  { taskId: "t3", categoryId: "c2" },
  { taskId: "t4", categoryId: "c3" },
  { taskId: "t5", categoryId: "c4" },
  { taskId: "t6", categoryId: "c2" },
  { taskId: "t7", categoryId: "c1" },
  { taskId: "t8", categoryId: "c2" },
  { taskId: "t8", categoryId: "c4" },
];

// ── Keys ──
const KEYS = {
  tasks: "pm-tasks",
  projects: "pm-projects",
  members: "pm-members",
  comments: "pm-comments",
  categories: "pm-categories",
  taskCategories: "pm-task-categories",
  timeEntries: "pm-time-entries",
  seeded: "pm-seeded",
} as const;

// ── Init seed ──
function initSeed() {
  if (localStorage.getItem(KEYS.seeded)) return;
  save(KEYS.tasks, SEED_TASKS);
  save(KEYS.projects, SEED_PROJECTS);
  save(KEYS.members, SEED_MEMBERS);
  save(KEYS.comments, SEED_COMMENTS);
  save(KEYS.categories, SEED_CATEGORIES);
  save(KEYS.taskCategories, SEED_TASK_CATEGORIES);
  save(KEYS.timeEntries, SEED_TIME_ENTRIES);
  localStorage.setItem(KEYS.seeded, "1");
}
initSeed();

// ── Reactive store factory ──
type Listener = () => void;

function createStore<T extends { id: string }>(key: string) {
  let items: T[] = load<T[]>(key, []);
  let listeners: Listener[] = [];

  function emit() {
    save(key, items);
    listeners.forEach((l) => l());
  }

  return {
    subscribe(l: Listener) {
      listeners = [...listeners, l];
      return () => { listeners = listeners.filter((x) => x !== l); };
    },
    getSnapshot: () => items,
    add(item: T) { items = [item, ...items]; emit(); },
    update(id: string, updates: Partial<T>) {
      items = items.map((i) => (i.id === id ? { ...i, ...updates } : i));
      emit();
    },
    remove(id: string) { items = items.filter((i) => i.id !== id); emit(); },
    set(newItems: T[]) { items = newItems; emit(); },
  };
}

// Junction table store (no id field)
function createJunctionStore(key: string) {
  let items: TaskCategory[] = load<TaskCategory[]>(key, []);
  let listeners: Listener[] = [];

  function emit() {
    save(key, items);
    listeners.forEach((l) => l());
  }

  return {
    subscribe(l: Listener) {
      listeners = [...listeners, l];
      return () => { listeners = listeners.filter((x) => x !== l); };
    },
    getSnapshot: () => items,
    setForTask(taskId: string, categoryIds: string[]) {
      items = [...items.filter((i) => i.taskId !== taskId), ...categoryIds.map((categoryId) => ({ taskId, categoryId }))];
      emit();
    },
    getForTask(taskId: string) { return items.filter((i) => i.taskId === taskId).map((i) => i.categoryId); },
    removeForTask(taskId: string) { items = items.filter((i) => i.taskId !== taskId); emit(); },
  };
}

// ── Store instances ──
const taskStore = createStore<Task>(KEYS.tasks);
const projectStore = createStore<Project>(KEYS.projects);
const memberStore = createStore<TeamMember>(KEYS.members);
const commentStore = createStore<Comment>(KEYS.comments);
const categoryStore = createStore<Category>(KEYS.categories);
const timeEntryStore = createStore<TimeEntry>(KEYS.timeEntries);
const taskCategoryStore = createJunctionStore(KEYS.taskCategories);

// ── Hooks ──
export function useTaskStore() {
  const tasks = useSyncExternalStore(taskStore.subscribe, taskStore.getSnapshot);
  return {
    tasks,
    addTask: useCallback((task: Omit<Task, "id" | "createdAt">) => {
      taskStore.add({ ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    }, []),
    updateTask: useCallback((id: string, updates: Partial<Task>) => taskStore.update(id, updates), []),
    deleteTask: useCallback((id: string) => {
      taskStore.remove(id);
      taskCategoryStore.removeForTask(id);
    }, []),
    getTask: useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]),
  };
}

export function useProjectStore() {
  const projects = useSyncExternalStore(projectStore.subscribe, projectStore.getSnapshot);
  return {
    projects,
    addProject: useCallback((p: Omit<Project, "id">) => projectStore.add({ ...p, id: crypto.randomUUID() }), []),
    updateProject: useCallback((id: string, u: Partial<Project>) => projectStore.update(id, u), []),
    deleteProject: useCallback((id: string) => projectStore.remove(id), []),
    getProject: useCallback((id: string) => projects.find((p) => p.id === id), [projects]),
  };
}

export function useMemberStore() {
  const members = useSyncExternalStore(memberStore.subscribe, memberStore.getSnapshot);
  return {
    members,
    addMember: useCallback((m: Omit<TeamMember, "id">) => memberStore.add({ ...m, id: crypto.randomUUID() }), []),
    updateMember: useCallback((id: string, u: Partial<TeamMember>) => memberStore.update(id, u), []),
    deleteMember: useCallback((id: string) => memberStore.remove(id), []),
    getMember: useCallback((id: string) => members.find((m) => m.id === id), [members]),
  };
}

export function useCommentStore() {
  const comments = useSyncExternalStore(commentStore.subscribe, commentStore.getSnapshot);
  return {
    comments,
    addComment: useCallback((c: Omit<Comment, "id" | "createdAt">) => {
      commentStore.add({ ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    }, []),
    getCommentsForTask: useCallback((taskId: string) => comments.filter((c) => c.taskId === taskId), [comments]),
  };
}

export function useCategoryStore() {
  const categories = useSyncExternalStore(categoryStore.subscribe, categoryStore.getSnapshot);
  return {
    categories,
    addCategory: useCallback((c: Omit<Category, "id">) => categoryStore.add({ ...c, id: crypto.randomUUID() }), []),
    updateCategory: useCallback((id: string, u: Partial<Category>) => categoryStore.update(id, u), []),
    deleteCategory: useCallback((id: string) => categoryStore.remove(id), []),
  };
}

export function useTimeEntryStore() {
  const entries = useSyncExternalStore(timeEntryStore.subscribe, timeEntryStore.getSnapshot);
  return {
    entries,
    addEntry: useCallback((e: Omit<TimeEntry, "id">) => timeEntryStore.add({ ...e, id: crypto.randomUUID() }), []),
    getEntriesForTask: useCallback((taskId: string) => entries.filter((e) => e.taskId === taskId), [entries]),
    getEntriesForMember: useCallback((memberId: string) => entries.filter((e) => e.memberId === memberId), [entries]),
  };
}

export function useTaskCategoryStore() {
  const items = useSyncExternalStore(taskCategoryStore.subscribe, taskCategoryStore.getSnapshot);
  return {
    taskCategories: items,
    setForTask: useCallback((taskId: string, categoryIds: string[]) => taskCategoryStore.setForTask(taskId, categoryIds), []),
    getForTask: useCallback((taskId: string) => items.filter((i) => i.taskId === taskId).map((i) => i.categoryId), [items]),
  };
}
