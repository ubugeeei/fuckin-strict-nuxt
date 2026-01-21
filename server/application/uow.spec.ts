import { describe, it, expect, vi } from "vitest";
import { createUoW } from "./uow.impl";
import { createEventBus } from "../infrastructure/eventBus.impl";
import { todoId, todoEvent } from "../domain/todo.impl";

describe("UnitOfWork", () => {
  it("collects events", () => {
    const bus = createEventBus();
    const uow = createUoW(bus);

    const id = todoId.generate();
    uow.events.push(todoEvent.created(id));
    uow.events.push(todoEvent.completed(id));

    expect(uow.events).toHaveLength(2);
  });

  it("commit publishes all events", () => {
    const bus = createEventBus();
    const handler = vi.fn();
    bus.subscribe(handler);
    const uow = createUoW(bus);

    const id = todoId.generate();
    uow.events.push(todoEvent.created(id));
    uow.events.push(todoEvent.completed(id));
    uow.commit();

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("commit clears events", () => {
    const bus = createEventBus();
    const uow = createUoW(bus);

    uow.events.push(todoEvent.created(todoId.generate()));
    uow.commit();

    expect(uow.events).toHaveLength(0);
  });

  it("multiple commits work independently", () => {
    const bus = createEventBus();
    const handler = vi.fn();
    bus.subscribe(handler);
    const uow = createUoW(bus);

    uow.events.push(todoEvent.created(todoId.generate()));
    uow.commit();

    uow.events.push(todoEvent.completed(todoId.generate()));
    uow.commit();

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
