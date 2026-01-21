import { describe, it, expect } from "vitest";
import { createTodoRepository } from "./todoRepository.impl";
import { todoId, todoTitle, createTodo, completeTodo } from "../domain/todo.impl";

describe("TodoRepository", () => {
  const makeTodo = () => {
    const id = todoId.generate();
    const title = todoTitle.create("Test");
    if (!title.ok) throw new Error();
    return createTodo(id, title.value, undefined, "Medium");
  };

  it("save and findById", async () => {
    const repo = createTodoRepository();
    const todo = makeTodo();

    await repo.save(todo).run();
    const r = await repo.findById(todo.id).run();

    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual(todo);
  });

  it("findById returns undefined for non-existent", async () => {
    const repo = createTodoRepository();
    const id = todoId.generate();

    const r = await repo.findById(id).run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeUndefined();
  });

  it("findAll returns all todos", async () => {
    const repo = createTodoRepository();
    const todo1 = makeTodo();
    const todo2 = makeTodo();

    await repo.save(todo1).run();
    await repo.save(todo2).run();

    const r = await repo.findAll().run();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toHaveLength(2);
  });

  it("save updates existing todo", async () => {
    const repo = createTodoRepository();
    const todo = makeTodo();
    await repo.save(todo).run();

    const completed = completeTodo(todo);
    await repo.save(completed).run();

    const r = await repo.findById(todo.id).run();
    expect(r.ok).toBe(true);
    if (r.ok && r.value) expect(r.value._tag).toBe("Completed");
  });
});
