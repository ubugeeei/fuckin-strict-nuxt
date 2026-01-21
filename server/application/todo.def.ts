import type { Eff } from "../../shared/index.def";
import type { TodoRepository, TodoDTO } from "../domain/todo.def";
import type { UoW } from "./uow.def";

/*
 *
 * Input Types
 *
 */

export type CreateInput = {
  title: string;
  description?: string;
  priority?: string;
};

/*
 *
 * Command Types
 *
 */

export type Create = (
  repo: TodoRepository,
) => (uow: UoW) => (input: CreateInput) => Eff<TodoDTO, CommandError>;

export type Complete = (
  repo: TodoRepository,
) => (uow: UoW) => (todoId: string) => Eff<TodoDTO, CommandError>;

export type Reopen = (
  repo: TodoRepository,
) => (uow: UoW) => (todoId: string) => Eff<TodoDTO, CommandError>;

export type Archive = (
  repo: TodoRepository,
) => (uow: UoW) => (todoId: string) => Eff<TodoDTO, CommandError>;

/*
 *
 * Query Types
 *
 */

export type GetAll = (repo: TodoRepository) => (excludeArchived: boolean) => Eff<TodoDTO[], never>;

/*
 *
 * Error Types
 *
 */

export type CommandError = ValidationError | InvalidIdError | NotFoundError | InvalidStateError;

export type ValidationError = {
  _tag: "Validation";
  errors: { field: string; message: string }[];
};

export type InvalidIdError = {
  _tag: "InvalidId";
  message: string;
};

export type NotFoundError = {
  _tag: "NotFound";
};

export type InvalidStateError = {
  _tag: "InvalidState";
  expected: string;
  actual: string;
};
