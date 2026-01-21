import type { GetAll } from "./todo.def";
import { eff } from "../../shared/index.impl";
import { toDTO } from "../domain/todo.impl";

export type { GetAll } from "./todo.def";

/*
 *
 * Queries
 *
 */

export const getAll: GetAll = (repo) => (excludeArchived) =>
  eff.map(repo.findAll(), (todos) =>
    todos
      .filter((t) => !excludeArchived || t._tag !== "Archived")
      .sort((a, b) => +b.createdAt - +a.createdAt)
      .map(toDTO),
  );
