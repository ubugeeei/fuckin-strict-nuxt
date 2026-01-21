export type {
  TodoId,
  TodoTitle,
  TodoDescription,
  Priority,
  Timestamp,
  ActiveTodo,
  CompletedTodo,
  ArchivedTodo,
  Todo,
  TodoDTO,
  TodoEvent,
  TodoRepository,
} from "./todo.def";

import type {
  TodoId,
  TodoTitle,
  TodoDescription,
  Priority,
  ActiveTodo,
  CompletedTodo,
  ArchivedTodo,
  Todo,
  TodoDTO,
  TodoEvent,
  TodoIdOps,
  TodoTitleOps,
  TodoDescriptionOps,
  PriorityOps,
  TimestampOps,
  TodoEventOps,
  CreateTodo,
  CompleteTodo,
  ReopenTodo,
  ArchiveTodo,
  ToDTO,
} from "./todo.def";
import { unsafeCoerce, unwrap, ok, err } from "../../shared/index.impl";

/*
 *
 * Value Objects
 *
 */

export const TodoId: TodoIdOps = {
  generate: () => unsafeCoerce(`todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`),
  parse: (v) => (v.startsWith("todo-") ? ok(unsafeCoerce(v)) : err("Invalid TodoId")),
  unwrap: (id) => unwrap(id),
};

export const TodoTitle: TodoTitleOps = {
  create: (v) => {
    const t = v.trim();
    if (!t) return err("Title required");
    if (t.length > 100) return err("Title too long");
    return ok(unsafeCoerce(t));
  },
  unwrap: (t) => unwrap(t),
};

export const TodoDescription: TodoDescriptionOps = {
  create: (v) => {
    if (!v?.trim()) return ok(undefined);
    if (v.length > 500) return err("Description too long");
    return ok(unsafeCoerce(v.trim()));
  },
  unwrap: (d) => unwrap(d),
};

export const Priority: PriorityOps = {
  create: (v) => {
    if (!v) return ok("Medium");
    if (["Low", "Medium", "High"].includes(v)) return ok(v as Priority);
    return err("Invalid priority");
  },
};

export const Timestamp: TimestampOps = {
  now: () => unsafeCoerce(new Date()),
  toISO: (t) => unwrap(t).toISOString(),
};

/*
 *
 * State Transitions
 *
 */

export const createTodo: CreateTodo = (id, title, description, priority) => ({
  _tag: "Active",
  id,
  title,
  description,
  priority,
  createdAt: Timestamp.now(),
});

export const completeTodo: CompleteTodo = (t) => ({
  ...t,
  _tag: "Completed",
  completedAt: Timestamp.now(),
});

export const reopenTodo: ReopenTodo = (t) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  priority: t.priority,
  createdAt: t.createdAt,
  _tag: "Active",
});

export const archiveTodo: ArchiveTodo = (t) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  priority: t.priority,
  createdAt: t.createdAt,
  _tag: "Archived",
  archivedAt: Timestamp.now(),
});

export const toDTO: ToDTO = (t) => ({
  id: TodoId.unwrap(t.id),
  title: TodoTitle.unwrap(t.title),
  description: t.description ? TodoDescription.unwrap(t.description) : undefined,
  priority: t.priority,
  status: t._tag,
  createdAt: Timestamp.toISO(t.createdAt),
  completedAt: t._tag === "Completed" ? Timestamp.toISO(t.completedAt) : undefined,
  archivedAt: t._tag === "Archived" ? Timestamp.toISO(t.archivedAt) : undefined,
});

/*
 *
 * Events
 *
 */

export const TodoEvent: TodoEventOps = {
  created: (id) => ({ type: "Created", todoId: id, at: Timestamp.now() }),
  completed: (id) => ({ type: "Completed", todoId: id, at: Timestamp.now() }),
  reopened: (id) => ({ type: "Reopened", todoId: id, at: Timestamp.now() }),
  archived: (id) => ({ type: "Archived", todoId: id, at: Timestamp.now() }),
};
