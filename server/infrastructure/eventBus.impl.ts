import type { EventBus, CreateEventBus } from "./eventBus.def";
import type { TodoEvent } from "../domain/todo.def";

export type { EventBus } from "./eventBus.def";

/*
 *
 * EventBus
 *
 */

export const createEventBus: CreateEventBus = () => {
  const handlers = new Set<(e: TodoEvent) => void>();
  return {
    publish: (e) => handlers.forEach((h) => h(e)),
    subscribe: (h) => {
      handlers.add(h);
      return () => handlers.delete(h);
    },
  };
};
