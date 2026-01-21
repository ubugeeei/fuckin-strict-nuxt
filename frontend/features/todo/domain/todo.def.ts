/**
 * Frontend Todo domain types
 *
 * Defines types based on server TodoDTO for frontend use.
 * Follows "Make illegal states unrepresentable" principle
 * by constraining state transitions at the type level.
 */

import type { newType } from "#shared";

/*
 *
 * Value Objects
 *
 */

export type TodoId = newType<string, "TodoId">;
export type TodoTitle = newType<string, "TodoTitle">;
export type TodoDescription = newType<string, "TodoDescription">;
export type Timestamp = newType<Date, "Timestamp">;
export type Priority = "Low" | "Medium" | "High";
export type TodoStatus = "Active" | "Completed" | "Archived";

/*
 *
 * Entities (View Models)
 *
 * Each state is represented as a separate type,
 * constraining operations based on the current state.
 *
 */

type TodoBase = {
  id: TodoId;
  title: TodoTitle;
  description?: TodoDescription;
  priority: Priority;
  createdAt: Timestamp;
};

export type ActiveTodo = TodoBase & {
  status: "Active";
};

export type CompletedTodo = TodoBase & {
  status: "Completed";
  completedAt: Timestamp;
};

export type ArchivedTodo = TodoBase & {
  status: "Archived";
  archivedAt: Timestamp;
};

export type Todo = ActiveTodo | CompletedTodo | ArchivedTodo;

/*
 *
 * Type Guards
 *
 */

export type TodoGuards = {
  isActive: (todo: Todo) => boolean;
  isCompleted: (todo: Todo) => boolean;
  isArchived: (todo: Todo) => boolean;
};

/*
 *
 * Allowed Actions per State
 *
 * Constrains allowed actions at the type level.
 *
 */

export type ActiveTodoActions = {
  complete: (todo: ActiveTodo) => Promise<CompletedTodo>;
  archive: (todo: ActiveTodo) => Promise<ArchivedTodo>;
};

export type CompletedTodoActions = {
  reopen: (todo: CompletedTodo) => Promise<ActiveTodo>;
  archive: (todo: CompletedTodo) => Promise<ArchivedTodo>;
};

// ArchivedTodo has no actions (terminal state)

/*
 *
 * Filter
 *
 */

export type TodoFilter = "all" | "active" | "completed";

export type FilteredTodos = {
  filter: TodoFilter;
  todos: Todo[];
  counts: {
    all: number;
    active: number;
    completed: number;
  };
};
