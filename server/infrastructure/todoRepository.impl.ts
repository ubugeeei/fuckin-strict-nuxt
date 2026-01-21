import { eff } from "../../shared/index.impl";
import type { Todo, TodoId, TodoRepository } from "../domain/todo.def";
import { todoId } from "../domain/todo.impl";

/*
 *
 * TodoRepository
 *
 */

export type CreateTodoRepository = () => TodoRepository;

export const createTodoRepository: CreateTodoRepository = () => {
  const store = new Map<string, Todo>();
  return {
    findById: (id: TodoId) => eff.succeed(store.get(todoId.unwrap(id))),
    findAll: () => eff.succeed([...store.values()]),
    save: (t: Todo) => {
      store.set(todoId.unwrap(t.id), t);
      return eff.succeed(t);
    },
  };
};
