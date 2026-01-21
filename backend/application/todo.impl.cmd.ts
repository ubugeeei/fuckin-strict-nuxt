import type { Eff } from "#shared";
import type { Create, Complete, Reopen, Archive, CommandError } from "./todo.def";
import type { TodoDTO } from "../domain/todo.def";
import { fail, m, fm } from "#shared";
import {
  todoId,
  todoTitle,
  todoDescription,
  priority,
  createTodo,
  completeTodo,
  reopenTodo,
  archiveTodo,
  toDTO,
  todoEvent,
} from "../domain/todo.impl";

export type { CommandError, CreateInput, Create, Complete, Reopen, Archive } from "./todo.def";

/*
 *
 * Commands
 *
 */

export const create: Create = (repo) => (uow) => (input) => {
  const title = todoTitle.create(input.title);
  const desc = todoDescription.create(input.description);
  const prio = priority.create(input.priority);

  if (!title.ok || !desc.ok || !prio.ok) {
    const errs = [
      !title.ok && { field: "title", message: title.error },
      !desc.ok && { field: "description", message: desc.error },
      !prio.ok && { field: "priority", message: prio.error },
    ].filter((e): e is { field: string; message: string } => !!e);
    return fail(Err.validation(errs));
  }

  const todo = createTodo(todoId.generate(), title.value, desc.value, prio.value);
  return m(repo.save(todo), (t) => {
    uow.events.push(todoEvent.created(t.id));
    return toDTO(t);
  });
};

export const complete: Complete = (repo) => (uow) => (id) => {
  const parsed = todoId.parse(id);
  if (!parsed.ok) return fail(Err.invalidId(parsed.error));

  return fm(repo.findById(parsed.value), (t): Eff<TodoDTO, CommandError> => {
    if (!t) return fail(Err.notFound());
    if (t.status !== "Active") return fail(Err.invalidState("Active", t.status));
    return m(repo.save(completeTodo(t)), (s) => {
      uow.events.push(todoEvent.completed(s.id));
      return toDTO(s);
    });
  });
};

export const reopen: Reopen = (repo) => (uow) => (id) => {
  const parsed = todoId.parse(id);
  if (!parsed.ok) return fail(Err.invalidId(parsed.error));

  return fm(repo.findById(parsed.value), (t): Eff<TodoDTO, CommandError> => {
    if (!t) return fail(Err.notFound());
    if (t.status !== "Completed") return fail(Err.invalidState("Completed", t.status));
    return m(repo.save(reopenTodo(t)), (s) => {
      uow.events.push(todoEvent.reopened(s.id));
      return toDTO(s);
    });
  });
};

export const archive: Archive = (repo) => (uow) => (id) => {
  const parsed = todoId.parse(id);
  if (!parsed.ok) return fail(Err.invalidId(parsed.error));

  return fm(repo.findById(parsed.value), (t): Eff<TodoDTO, CommandError> => {
    if (!t) return fail(Err.notFound());
    if (t.status === "Archived") return fail(Err.invalidState("Active|Completed", t.status));
    return m(repo.save(archiveTodo(t)), (s) => {
      uow.events.push(todoEvent.archived(s.id));
      return toDTO(s);
    });
  });
};

/*
 *
 * Error Constructors
 *
 */

const Err = {
  validation: (errors: { field: string; message: string }[]) => ({
    _tag: "Validation" as const,
    errors,
  }),
  invalidId: (message: string) => ({
    _tag: "InvalidId" as const,
    message,
  }),
  notFound: () => ({
    _tag: "NotFound" as const,
  }),
  invalidState: (expected: string, actual: string) => ({
    _tag: "InvalidState" as const,
    expected,
    actual,
  }),
};
