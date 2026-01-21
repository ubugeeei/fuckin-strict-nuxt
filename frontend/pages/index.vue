<script setup lang="ts">
/**
 * Main page - Todo application following DMMF principles
 *
 * - State machines: Form and Async states are explicit
 * - Type-safe actions: Operations are constrained by todo state
 * - Result types: Errors are values, not exceptions
 * - Colocation: All todo-related code in features/todo/
 */

import { useAsyncData } from "#app";
import { assertNever } from "#shared";
import {
  createTodoApi,
  useTodos,
  useTodoForm,
  TodoFormView,
  TodoFilters,
  TodoList,
} from "~/features/todo";
import type { Todo } from "~/features/todo";

const api = createTodoApi($fetch);
const todos = useTodos(api);
const form = useTodoForm(api, () => todos.refresh());

await useAsyncData("todos", () => todos.fetch());

function handleComplete(todo: Todo): void {
  switch (todo.status) {
    case "Active":
      todos.complete(todo);
      break;
    case "Completed":
    case "Archived":
      console.warn(`Cannot complete todo: expected Active status, got ${todo.status}`);
      break;
    default:
      assertNever(todo);
  }
}

function handleReopen(todo: Todo): void {
  switch (todo.status) {
    case "Completed":
      todos.reopen(todo);
      break;
    case "Active":
    case "Archived":
      console.warn(`Cannot reopen todo: expected Completed status, got ${todo.status}`);
      break;
    default:
      assertNever(todo);
  }
}

function handleArchive(todo: Todo): void {
  switch (todo.status) {
    case "Active":
    case "Completed":
      todos.archive(todo);
      break;
    case "Archived":
      console.warn(`Cannot archive todo: already archived`);
      break;
    default:
      assertNever(todo);
  }
}
</script>

<template>
  <div class="container">
    <header>
      <h1>DMMF Todo App</h1>
      <p>Functional Domain Modeling with TypeScript</p>
    </header>

    <TodoFormView
      v-bind="form.derived.value"
      @update:title="form.setTitle"
      @update:description="form.setDescription"
      @update:priority="form.setPriority"
      @submit="form.submit"
    />

    <TodoFilters
      :current-filter="todos.filter.value"
      :counts="todos.derived.value.filtered.counts"
      @change="todos.setFilter"
    />

    <TodoList
      v-bind="todos.derived.value"
      @retry="todos.fetch"
      @complete="handleComplete"
      @reopen="handleReopen"
      @archive="handleArchive"
    />

    <footer>
      <h2>DMMF Concepts Applied</h2>
      <ul>
        <li><strong>State Machines:</strong> Form and Async states are explicit types</li>
        <li>
          <strong>Make Illegal States Unrepresentable:</strong>
          Actions constrained by todo state
        </li>
        <li><strong>Result Types:</strong> Errors as values, not exceptions</li>
        <li><strong>Smart Constructors:</strong> Validated value objects</li>
        <li><strong>Colocation:</strong> Feature-based code organization</li>
      </ul>
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;

  p {
    color: #666;
  }
}

footer {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;

  ul {
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }
}
</style>
