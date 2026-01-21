import { describe, it, expect } from "vitest";
import * as Command from "./todo.impl.cmd";
import * as Query from "./todo.impl.query";
import { createTodoRepository } from "../infrastructure/todoRepository.impl";
import { createEventBus } from "../infrastructure/eventBus.impl";
import { createUoW } from "./uow.impl";
import { todoId, todoTitle, timestamp, createTodo, completeTodo } from "../domain/todo.impl";
import type { ArchivedTodo } from "../domain/todo.def";

/*
 *
 * create
 *
 */

describe("create", () => {
  const setup = () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const uow = createUoW(bus);
    return { repo, bus, uow, workflow: Command.create(repo)(uow) };
  };

  it("creates todo with valid input", async () => {
    const { workflow, uow } = setup();
    const r = await workflow({ title: "Test", priority: "High" }).run();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.title).toBe("Test");
      expect(r.value.priority).toBe("High");
      expect(r.value.status).toBe("Active");
    }
    expect(uow.events).toHaveLength(1);
    expect(uow.events[0]!.type).toBe("Created");
  });

  it("fails with empty title", async () => {
    const { workflow } = setup();
    const r = await workflow({ title: "" }).run();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error._tag).toBe("Validation");
      if (r.error._tag === "Validation") {
        expect(r.error.errors).toContainEqual({
          field: "title",
          message: "Title required",
        });
      }
    }
  });

  it("fails with invalid priority", async () => {
    const { workflow } = setup();
    const r = await workflow({ title: "Test", priority: "Invalid" }).run();
    expect(r.ok).toBe(false);
  });
});

/*
 *
 * complete
 *
 */

describe("complete", () => {
  const setup = async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = todoId.generate();
    const title = todoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    await repo.save(todo).run();
    const uow = createUoW(bus);
    return {
      repo,
      bus,
      uow,
      id: todoId.unwrap(id),
      workflow: Command.complete(repo)(uow),
    };
  };

  it("completes active todo", async () => {
    const { uow, id, workflow } = await setup();
    const r = await workflow(id).run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.status).toBe("Completed");
    expect(uow.events).toHaveLength(1);
    expect(uow.events[0]!.type).toBe("Completed");
  });

  it("fails for non-existent todo", async () => {
    const { workflow } = await setup();
    const r = await workflow("todo-nonexistent-abc").run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error._tag).toBe("NotFound");
  });

  it("fails for invalid id format", async () => {
    const { workflow } = await setup();
    const r = await workflow("invalid").run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error._tag).toBe("InvalidId");
  });
});

/*
 *
 * reopen
 *
 */

describe("reopen", () => {
  const setup = async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = todoId.generate();
    const title = todoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    const completed = completeTodo(todo);
    await repo.save(completed).run();
    const uow = createUoW(bus);
    return {
      repo,
      bus,
      uow,
      id: todoId.unwrap(id),
      workflow: Command.reopen(repo)(uow),
    };
  };

  it("reopens completed todo", async () => {
    const { uow, id, workflow } = await setup();
    const r = await workflow(id).run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.status).toBe("Active");
    expect(uow.events[0]!.type).toBe("Reopened");
  });

  it("fails for active todo", async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = todoId.generate();
    const title = todoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    await repo.save(todo).run();
    const uow = createUoW(bus);
    const r = await Command.reopen(repo)(uow)(todoId.unwrap(id)).run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error._tag).toBe("InvalidState");
  });
});

/*
 *
 * archive
 *
 */

describe("archive", () => {
  it("archives active todo", async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = todoId.generate();
    const title = todoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    await repo.save(todo).run();
    const uow = createUoW(bus);
    const r = await Command.archive(repo)(uow)(todoId.unwrap(id)).run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.status).toBe("Archived");
  });

  it("fails for already archived", async () => {
    const repo = createTodoRepository();
    const bus = createEventBus();
    const id = todoId.generate();
    const title = todoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(id, title.value, undefined, "Medium");
    const archived: ArchivedTodo = {
      _tag: "Archived",
      id: todo.id,
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      createdAt: todo.createdAt,
      archivedAt: timestamp.now(),
    };
    await repo.save(archived).run();
    const uow = createUoW(bus);
    const r = await Command.archive(repo)(uow)(todoId.unwrap(id)).run();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error._tag).toBe("InvalidState");
  });
});

/*
 *
 * getAll
 *
 */

describe("getAll", () => {
  it("returns all todos sorted by createdAt", async () => {
    const repo = createTodoRepository();
    const title1 = todoTitle.create("First");
    const title2 = todoTitle.create("Second");
    if (!title1.ok || !title2.ok) throw new Error();

    const todo1 = createTodo(todoId.generate(), title1.value, undefined, "Low");
    await new Promise((r) => setTimeout(r, 10));
    const todo2 = createTodo(todoId.generate(), title2.value, undefined, "High");

    await repo.save(todo1).run();
    await repo.save(todo2).run();

    const r = await Query.getAll(repo)(false).run();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toHaveLength(2);
      expect(r.value[0]!.title).toBe("Second");
    }
  });

  it("excludes archived by default", async () => {
    const repo = createTodoRepository();
    const title = todoTitle.create("Test");
    if (!title.ok) throw new Error();
    const todo = createTodo(todoId.generate(), title.value, undefined, "Medium");
    const archived: ArchivedTodo = {
      _tag: "Archived",
      id: todo.id,
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      createdAt: todo.createdAt,
      archivedAt: timestamp.now(),
    };
    await repo.save(archived).run();

    const r = await Query.getAll(repo)(true).run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toHaveLength(0);
  });
});
