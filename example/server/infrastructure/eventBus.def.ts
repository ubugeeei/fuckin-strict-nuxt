import type { TodoEvent } from "../domain/todo.def";

/*
 *
 * EventBus
 *
 */

export type EventBus = {
  publish: (e: TodoEvent) => void;
  subscribe: (h: (e: TodoEvent) => void) => () => void;
};

export type CreateEventBus = () => EventBus;
