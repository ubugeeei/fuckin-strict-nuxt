import type { TodoEvent } from "../domain/todo.def";
import type { EventBus } from "../infrastructure/eventBus.def";

/*
 *
 * UoW
 *
 */

export type UoW = {
  events: TodoEvent[];
  commit: () => void;
};

export type CreateUoW = (bus: EventBus) => UoW;
