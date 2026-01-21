import { describe, it, expect, vi } from "vitest";
import { createEventBus } from "./eventBus.impl";
import { TodoId, TodoEvent } from "../domain/todo.impl";

describe("EventBus", () => {
  it("publishes events to subscribers", () => {
    const bus = createEventBus();
    const handler = vi.fn();
    bus.subscribe(handler);

    const id = TodoId.generate();
    const event = TodoEvent.created(id);
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

    const event = TodoEvent.created(TodoId.generate());
    bus.publish(event);

    expect(h1).toHaveBeenCalledWith(event);
    expect(h2).toHaveBeenCalledWith(event);
  });

  it("unsubscribe removes handler", () => {
    const bus = createEventBus();
    const handler = vi.fn();
    const unsub = bus.subscribe(handler);

    unsub();

    bus.publish(TodoEvent.created(TodoId.generate()));
    expect(handler).not.toHaveBeenCalled();
  });

  it("handles multiple events", () => {
    const bus = createEventBus();
    const handler = vi.fn();
    bus.subscribe(handler);

    const id = TodoId.generate();
    bus.publish(TodoEvent.created(id));
    bus.publish(TodoEvent.completed(id));
    bus.publish(TodoEvent.archived(id));

    expect(handler).toHaveBeenCalledTimes(3);
  });
});
