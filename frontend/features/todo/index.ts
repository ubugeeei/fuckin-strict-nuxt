/**
 * Todo feature public API
 *
 * This module exports all public types and functions for the todo feature.
 * Internal implementation details are not exported.
 */

// Domain types
export type {
  Todo,
  ActiveTodo,
  CompletedTodo,
  ArchivedTodo,
  TodoFilter,
  Priority,
  Timestamp,
} from "./domain/todo.def";
export type { TodoForm, ValidationError } from "./domain/form.def";
export type { Async } from "./domain/async.def";

// Domain functions
export {
  todoGuards,
  priorityColor,
  unwrapId,
  unwrapTitle,
  unwrapDescription,
  unwrapTimestamp,
} from "./domain/todo.impl";

// API
export type { TodoApi, ApiError } from "./api/todoApi.def";
export { createTodoApi } from "./api/todoApi.impl";

// Composables
export { useTodos } from "./use/useTodos";
export { useTodoForm } from "./use/useTodoForm";

// Components
export { default as TodoFormView } from "./TodoForm.vue";
export { default as TodoFilters } from "./TodoFilters.vue";
export { default as TodoList } from "./TodoList.vue";
export { default as TodoItem } from "./TodoItem.vue";
