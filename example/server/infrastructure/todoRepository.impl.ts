import { Eff } from "../../shared/index.impl";
import type { Todo, TodoId, TodoRepository } from "../domain/todo.def";
import { TodoId as TID } from "../domain/todo.impl";

/*
 *
 * TodoRepository
 *
 */

export type CreateTodoRepository = () => TodoRepository;

export const createTodoRepository: CreateTodoRepository = () => {
  const store = new Map<string, Todo>();
  return {
    findById: (id: TodoId) => Eff.succeed(store.get(TID.unwrap(id))),
    findAll: () => Eff.succeed([...store.values()]),
    save: (t: Todo) => {
      store.set(TID.unwrap(t.id), t);
      return Eff.succeed(t);
    },
  };
};
