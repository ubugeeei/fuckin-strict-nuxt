import { describe, it, expect } from "vitest";
import {
  TodoId,
  TodoTitle,
  TodoDescription,
  Priority,
  Timestamp,
  createTodo,
  completeTodo,
  reopenTodo,
  archiveTodo,
  toDTO,
  TodoEvent,
} from "./todo.impl";

describe("TodoId", () => {
  it("generate creates valid id", () => {
    const id = TodoId.generate();
    expect(TodoId.unwrap(id)).toMatch(/^todo-\d+-\w+$/);
  });

  it("parse validates format", () => {
    const r1 = TodoId.parse("todo-123-abc");
    expect(r1.ok).toBe(true);

    const r2 = TodoId.parse("invalid-id");
    expect(r2.ok).toBe(false);
  });
});

describe("TodoTitle", () => {
  it("create trims and validates", () => {
    const r1 = TodoTitle.create("  Test  ");
    expect(r1.ok).toBe(true);
    if (r1.ok) expect(TodoTitle.unwrap(r1.value)).toBe("Test");
  });

  it("rejects empty title", () => {
    const r = TodoTitle.create("   ");
    expect(r.ok).toBe(false);
  });

  it("rejects too long title", () => {
    const r = TodoTitle.create("a".repeat(101));
    expect(r.ok).toBe(false);
  });
});

describe("TodoDescription", () => {
  it("allows undefined", () => {
    const r = TodoDescription.create(undefined);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeUndefined();
  });

  it("creates valid description", () => {
    const r = TodoDescription.create("Test description");
    expect(r.ok).toBe(true);
  });

  it("rejects too long description", () => {
    const r = TodoDescription.create("a".repeat(501));
    expect(r.ok).toBe(false);
  });
});

describe("Priority", () => {
  it("defaults to Medium", () => {
    const r = Priority.create(undefined);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("Medium");
  });

  it("accepts valid priorities", () => {
    expect(Priority.create("Low").ok).toBe(true);
    expect(Priority.create("High").ok).toBe(true);
  });

  it("rejects invalid priority", () => {
    const r = Priority.create("Invalid");
    expect(r.ok).toBe(false);
  });
});

describe("Entity State Transitions", () => {
  const makeActive = () => {
    const id = TodoId.generate();
    const title = TodoTitle.create("Test");
    if (!title.ok) throw new Error();
    return createTodo(id, title.value, undefined, "Medium");
  };

  it("createTodo creates ActiveTodo", () => {
    const todo = makeActive();
    expect(todo._tag).toBe("Active");
  });

  it("completeTodo transitions to Completed", () => {
    const active = makeActive();
    const completed = completeTodo(active);
    expect(completed._tag).toBe("Completed");
    expect(completed.completedAt).toBeDefined();
  });

  it("reopenTodo transitions back to Active", () => {
    const active = makeActive();
    const completed = completeTodo(active);
    const reopened = reopenTodo(completed);
    expect(reopened._tag).toBe("Active");
    expect("completedAt" in reopened).toBe(false);
  });

  it("archiveTodo from Active", () => {
    const active = makeActive();
    const archived = archiveTodo(active);
    expect(archived._tag).toBe("Archived");
    expect(archived.archivedAt).toBeDefined();
  });

  it("archiveTodo from Completed", () => {
    const active = makeActive();
    const completed = completeTodo(active);
    const archived = archiveTodo(completed);
    expect(archived._tag).toBe("Archived");
    expect("completedAt" in archived).toBe(false);
  });
});

describe("toDTO", () => {
  it("converts ActiveTodo to DTO", () => {
    const id = TodoId.generate();
    const title = TodoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "High");
    const dto = toDTO(todo);

    expect(dto.id).toBe(TodoId.unwrap(id));
    expect(dto.title).toBe("Test");
    expect(dto.priority).toBe("High");
    expect(dto.status).toBe("Active");
    expect(dto.createdAt).toBeDefined();
  });

  it("includes completedAt for CompletedTodo", () => {
    const id = TodoId.generate();
    const title = TodoTitle.create("Test");
    if (!title.ok) throw new Error();
    const active = createTodo(id, title.value, undefined, "Medium");
    const completed = completeTodo(active);
    const dto = toDTO(completed);

    expect(dto.status).toBe("Completed");
    expect(dto.completedAt).toBeDefined();
  });
});

describe("TodoEvent", () => {
  it("created event", () => {
    const id = TodoId.generate();
    const e = TodoEvent.created(id);
    expect(e.type).toBe("Created");
    expect(e.todoId).toBe(id);
  });

  it("completed event", () => {
    const id = TodoId.generate();
    const e = TodoEvent.completed(id);
    expect(e.type).toBe("Completed");
  });

  it("reopened event", () => {
    const id = TodoId.generate();
    const e = TodoEvent.reopened(id);
    expect(e.type).toBe("Reopened");
  });

  it("archived event", () => {
    const id = TodoId.generate();
    const e = TodoEvent.archived(id);
    expect(e.type).toBe("Archived");
  });
});
