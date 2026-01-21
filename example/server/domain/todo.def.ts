import type { NewType, Result, Eff } from "../../shared/index.def";

/*
 *
 * Value Objects
 *
 * Immutable, validated domain primitives.
 * Each value object encapsulates validation rules
 * and ensures type-safe domain operations.
 *
 */

/**
 * Unique identifier for a todo.
 *
 * Validation:
 * - Format: todo-{timestamp}-{random}
 * - Must start with "todo-" prefix
 */
export type TodoId = NewType<string, "TodoId">;

/**
 * Todo title (required).
 *
 * Validation:
 * - Required (non-empty after trim)
 * - Max length: 100 characters
 * - Auto-trimmed on creation
 */
export type TodoTitle = NewType<string, "TodoTitle">;

/**
 * Todo description (optional).
 *
 * Validation:
 * - Optional (undefined allowed)
 * - Max length: 500 characters
 * - Auto-trimmed on creation
 * - Empty string treated as undefined
 */
export type TodoDescription = NewType<string, "TodoDescription">;

/**
 * Task priority level.
 *
 * Validation:
 * - Valid values: "Low" | "Medium" | "High"
 * - Default: "Medium" when undefined
 */
export type Priority = "Low" | "Medium" | "High";

/**
 * Domain timestamp for temporal events.
 * Wraps Date for type safety.
 */
export type Timestamp = NewType<Date, "Timestamp">;

/*
 *
 * Entities
 *
 * Todo entity follows a state machine pattern.
 *
 * State Transitions:
 *   [create] -> Active
 *   Active -[complete]-> Completed
 *   Completed -[reopen]-> Active
 *   Active -[archive]-> Archived
 *   Completed -[archive]-> Archived
 *
 * Business Rules:
 * - Only Active todos can be completed
 * - Only Completed todos can be reopened
 * - Archived is terminal state (cannot be restored)
 *
 */

/**
 * A todo that is pending completion.
 * Initial state for all new todos.
 */
export type ActiveTodo = {
  _tag: "Active";
  id: TodoId;
  title: TodoTitle;
  description?: TodoDescription;
  priority: Priority;
  createdAt: Timestamp;
};

/**
 * A todo that has been marked as done.
 * Can be reopened to return to Active state.
 */
export type CompletedTodo = Omit<ActiveTodo, "_tag"> & {
  _tag: "Completed";
  completedAt: Timestamp;
};

/**
 * A todo that has been soft-deleted.
 * Terminal state - cannot be restored.
 */
export type ArchivedTodo = {
  _tag: "Archived";
  id: TodoId;
  title: TodoTitle;
  description?: TodoDescription;
  priority: Priority;
  createdAt: Timestamp;
  archivedAt: Timestamp;
};

/**
 * Discriminated union of all todo states.
 */
export type Todo = ActiveTodo | CompletedTodo | ArchivedTodo;

/*
 *
 * DTO
 *
 */

export type TodoDTO = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: string;
  createdAt: string;
  completedAt?: string;
  archivedAt?: string;
};

/*
 *
 * Events
 *
 * Domain events capture state changes.
 * Published via EventBus for side effects.
 *
 */

export type TodoEvent = {
  type: string;
  todoId: TodoId;
  at: Timestamp;
};

/*
 *
 * Repository
 *
 */

export type TodoRepository = {
  findById: (id: TodoId) => Eff<Todo | undefined, never>;
  findAll: () => Eff<Todo[], never>;
  save: (t: Todo) => Eff<Todo, never>;
};

/*
 *
 * Smart Constructors
 *
 */

export type TodoIdOps = {
  generate: () => TodoId;
  parse: (v: string) => Result<TodoId, string>;
  unwrap: (id: TodoId) => string;
};

export type TodoTitleOps = {
  create: (v: string) => Result<TodoTitle, string>;
  unwrap: (t: TodoTitle) => string;
};

export type TodoDescriptionOps = {
  create: (v?: string) => Result<TodoDescription | undefined, string>;
  unwrap: (d: TodoDescription) => string;
};

export type PriorityOps = {
  create: (v?: string) => Result<Priority, string>;
};

export type TimestampOps = {
  now: () => Timestamp;
  toISO: (t: Timestamp) => string;
};

export type TodoEventOps = {
  created: (id: TodoId) => TodoEvent;
  completed: (id: TodoId) => TodoEvent;
  reopened: (id: TodoId) => TodoEvent;
  archived: (id: TodoId) => TodoEvent;
};

/*
 *
 * State Transitions
 *
 */

export type CreateTodo = (
  id: TodoId,
  title: TodoTitle,
  description: TodoDescription | undefined,
  priority: Priority,
) => ActiveTodo;

export type CompleteTodo = (t: ActiveTodo) => CompletedTodo;

export type ReopenTodo = (t: CompletedTodo) => ActiveTodo;

export type ArchiveTodo = (t: ActiveTodo | CompletedTodo) => ArchivedTodo;

export type ToDTO = (t: Todo) => TodoDTO;
