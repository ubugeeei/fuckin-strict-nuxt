import { describe, it, expect, vi } from "vitest";
import { createEventBus } from "./eventBus.impl";
import { todoId, todoEvent } from "../domain/todo.impl";

describe("EventBus", () => {
  it("publishes events to subscribers", () => {
    const bus = createEventBus();
    const handler = vi.fn();
    bus.subscribe(handler);

    const id = todoId.generate();
    const event = todoEvent.created(id);
    bus.publish(event);

    expect(handler).toHaveBeenCalledWith(event);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("supports multiple subscribers", () => {
    const bus = createEventBus();
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.subscribe(h1);
    bus.subscribe(h2);

    const event = todoEvent.created(todoId.generate());
    bus.publish(event);

    expect(h1).toHaveBeenCalledWith(event);
    expect(h2).toHaveBeenCalledWith(event);
  });

  it("unsubscribe removes handler", () => {
    const bus = createEventBus();
    const handler = vi.fn();
    const unsub = bus.subscribe(handler);

    unsub();

    bus.publish(todoEvent.created(todoId.generate()));
    expect(handler).not.toHaveBeenCalled();
  });

  it("handles multiple events", () => {
    const bus = createEventBus();
    const handler = vi.fn();
    bus.subscribe(handler);

    const id = todoId.generate();
    bus.publish(todoEvent.created(id));
    bus.publish(todoEvent.completed(id));
    bus.publish(todoEvent.archived(id));

    expect(handler).toHaveBeenCalledTimes(3);
  });
});
