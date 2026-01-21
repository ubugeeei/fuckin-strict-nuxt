/**
 * Todo domain implementation
 */

import { unsafeCoerce } from "#shared";
import type {
  Todo,
  TodoId,
  TodoTitle,
  TodoDescription,
  Timestamp,
  ActiveTodo,
  CompletedTodo,
  ArchivedTodo,
  TodoGuards,
  TodoFilter,
  FilteredTodos,
} from "./todo.def";

/*
 *
 * Type Guards
 *
 */

export const todoGuards: TodoGuards = {
  isActive: (todo: Todo) => todo.status === "Active",
  isCompleted: (todo: Todo) => todo.status === "Completed",
  isArchived: (todo: Todo) => todo.status === "Archived",
};

/*
 *
 * DTO Conversion
 *
 */

type TodoDTO = {
  id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  status: string;
  createdAt: string;
  completedAt?: string;
  archivedAt?: string;
};

export const fromDTO = (dto: TodoDTO): Todo => {
  const base = {
    id: unsafeCoerce<string, "TodoId">(dto.id),
    title: unsafeCoerce<string, "TodoTitle">(dto.title),
    description: dto.description
      ? unsafeCoerce<string, "TodoDescription">(dto.description)
      : undefined,
    priority: dto.priority,
    createdAt: unsafeCoerce<Date, "Timestamp">(new Date(dto.createdAt)),
  };

  switch (dto.status) {
    case "Active":
      return { ...base, status: "Active" } as ActiveTodo;
    case "Completed":
      return {
        ...base,
        status: "Completed",
        completedAt: unsafeCoerce<Date, "Timestamp">(new Date(dto.completedAt!)),
      } as CompletedTodo;
    case "Archived":
      return {
        ...base,
        status: "Archived",
        archivedAt: unsafeCoerce<Date, "Timestamp">(new Date(dto.archivedAt!)),
      } as ArchivedTodo;
    default:
      throw new Error(`Unknown status: ${dto.status}`);
  }
};

/*
 *
 * Filtering
 *
 */

export const filterTodos = (todos: Todo[], filter: TodoFilter): FilteredTodos => {
  const filtered =
    filter === "all" ? todos : todos.filter((t) => t.status.toLowerCase() === filter);

  return {
    filter,
    todos: filtered,
    counts: {
      all: todos.length,
      active: todos.filter(todoGuards.isActive).length,
      completed: todos.filter(todoGuards.isCompleted).length,
    },
  };
};

/*
 *
 * Display Helpers
 *
 */

export const priorityColor = (priority: "Low" | "Medium" | "High"): string => {
  switch (priority) {
    case "High":
      return "#e74c3c";
    case "Medium":
      return "#f39c12";
    case "Low":
      return "#27ae60";
  }
};

export const unwrapId = (id: TodoId): string => id as string;
export const unwrapTitle = (title: TodoTitle): string => title as string;
export const unwrapDescription = (desc: TodoDescription): string => desc as string;
export const unwrapTimestamp = (ts: Timestamp): Date => ts as Date;
