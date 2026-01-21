import { createEventBus } from "./infrastructure/eventBus.impl";
import { createTodoRepository } from "./infrastructure/todoRepository.impl";
import { createUoW } from "./application/uow.impl";
import * as Command from "./application/todo.impl.cmd";
import * as Query from "./application/todo.impl.query";

/*
 *
 * Container
 *
 */

const repo = createTodoRepository();
const bus = createEventBus();

bus.subscribe((e) => console.log(`[Event] ${e.type}:`, e.todoId));

export const container = {
  createUoW: () => createUoW(bus),
  command: {
    create: Command.create(repo),
    complete: Command.complete(repo),
    reopen: Command.reopen(repo),
    archive: Command.archive(repo),
  },
  query: {
    getAll: Query.getAll(repo),
  },
};
