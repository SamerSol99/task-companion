import { useCallback, useSyncExternalStore } from "react";
import type { Task } from "@/types/task";

const STORAGE_KEY = "task-tracker-tasks";

let tasks: Task[] = loadFromStorage();
let listeners: Array<() => void> = [];

function loadFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function emitChange() {
  persist();
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return tasks;
}

export function useTaskStore() {
  const currentTasks = useSyncExternalStore(subscribe, getSnapshot);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    tasks = [newTask, ...tasks];
    emitChange();
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
      tasks = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      emitChange();
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    tasks = tasks.filter((t) => t.id !== id);
    emitChange();
  }, []);

  const getTask = useCallback(
    (id: string) => currentTasks.find((t) => t.id === id),
    [currentTasks]
  );

  return { tasks: currentTasks, addTask, updateTask, deleteTask, getTask };
}
