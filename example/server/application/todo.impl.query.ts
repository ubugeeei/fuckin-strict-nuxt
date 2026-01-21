export type { GetAll } from "./todo.def";

import type { GetAll } from "./todo.def";
import { Eff } from "../../shared/index.impl";
import { toDTO } from "../domain/todo.impl";

/*
 *
 * Queries
 *
 */

export const getAll: GetAll = (repo) => (excludeArchived) =>
  Eff.map(repo.findAll(), (todos) =>
    todos
      .filter((t) => !excludeArchived || t._tag !== "Archived")
      .sort((a, b) => +b.createdAt - +a.createdAt)
      .map(toDTO),
  );
