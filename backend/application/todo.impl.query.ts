import type { GetAll } from "./todo.def";
import { m } from "#shared";
import { toDTO } from "../domain/todo.impl";

export type { GetAll } from "./todo.def";

/*
 *
 * Queries
 *
 */

export const getAll: GetAll = (repo) => (excludeArchived) =>
  m(repo.findAll(), (todos) =>
    todos
      .filter((t) => !excludeArchived || t.status !== "Archived")
      .sort((a, b) => +b.createdAt - +a.createdAt)
      .map(toDTO),
  );
