# AI Agent Guidelines

## Architecture Principles

### Domain Modeling Made Functional (DMMF)

This project follows DMMF principles:

- **Make Illegal States Unrepresentable**: Use discriminated unions for state machines
- **Type-safe State Transitions**: Constrain operations by current state
- **Result Types**: Errors are values, not exceptions
- **Smart Constructors**: Validate at construction time

### CQRS (Command Query Responsibility Segregation)

Separate read and write operations:

- **Commands**: Mutate state, return `Result<void, Error>` or `Result<T, Error>`
- **Queries**: Read state, never mutate, return data directly
- Keep command handlers and query handlers separate

```typescript
// Commands (write) - define as types in .def.ts
type CreateTodo = (title: string, priority: Priority) => Result<Todo, ValidationError>;
type CompleteTodo = (id: TodoId) => Result<void, NotFoundError>;

// Queries (read) - pure functions defined as types
type GetTodos = (filter: TodoFilter) => Todo[];
type GetTodoById = (id: TodoId) => Todo | undefined;
```

### File Structure

```
frontend/
  features/
    <feature>/
      index.ts          # Public API exports only
      domain/
        <name>.def.ts   # Type definitions (NEVER modify structure)
        <name>.impl.ts  # Implementation
        <name>.test.ts  # Unit tests
      api/
        <name>.def.ts   # API type definitions
        <name>.impl.ts  # API implementation
      use/
        use<Name>.ts    # Vue composables
      <Name>.vue        # Vue components (colocated at feature root)
      <Name>.test.ts    # Component browser tests

backend/
  api/
    <route>/
      index.ts          # API route handlers

shared/
  index.def.ts          # Shared type definitions
  index.impl.ts         # Shared implementations
```

## Implementation Rules

### 1. Preserve Definition Files

**NEVER modify `.def.ts` files** unless explicitly requested. These files define the contract.

- `.def.ts` = Type definitions (contract)
- `.impl.ts` = Implementation (can be modified)

### 2. Top-Down Implementation

Implement from abstract to concrete:

1. Define types in `.def.ts`
2. Implement in `.impl.ts`
3. Write tests in `.test.ts`
4. Export public API in `index.ts`

### 3. Colocation

All related code must be colocated within the feature:

```
features/todo/
  index.ts           # Exports
  domain/            # Domain logic
  api/               # API layer
  use/               # Composables
  TodoItem.vue       # Components at feature root
  TodoItem.test.ts   # Component tests
```

Do NOT use generic directories like `components/`, `hooks/`, `utils/`.

### 4. Always Write Tests

Every `.impl.ts` requires a corresponding `.test.ts`:

- Domain logic: Unit tests with vitest
- Components: Browser tests with vitest browser mode

### 5. Verification Commands

**ALWAYS run these commands before completing any task:**

```bash
# Lint
pnpm lint

# Type check
pnpm check

# Run tests
pnpm test:run
```

All commands must pass with zero errors.

## Code Style

### TypeScript

- Use discriminated unions for state machines
- Prefer `type` over `interface`
- No `is` type predicates (TypeScript infers narrowing)
- Use branded types for domain IDs: `type TodoId = newType<string, "TodoId">`
- **Always annotate function return types explicitly**

### Vue

- Use `<script setup lang="ts">`
- Disable auto-imports (explicit imports required)
- All buttons must have `type="button"` or `type="submit"`
- Use CSS nesting (Lightning CSS)

### Naming

- Types: PascalCase (`Todo`, `ActiveTodo`)
- Functions: camelCase (`createTodo`, `todoGuards`)
- Files: kebab-case for definitions (`todo.def.ts`), PascalCase for components (`TodoItem.vue`)

## Testing

### Domain Tests

```typescript
import { describe, it, expect } from "vitest";
import { functionUnderTest } from "./module.impl";

describe("functionUnderTest", () => {
  it("should do something", () => {
    expect(functionUnderTest()).toBe(expected);
  });
});
```

### Component Tests (Browser Mode)

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Component from "./Component.vue";

describe("Component", () => {
  it("renders correctly", () => {
    const wrapper = mount(Component, { props: { ... } });
    expect(wrapper.text()).toContain("expected");
  });
});
```

## CQRS Examples

### Command (Write Operation)

```typescript
// domain/todo.def.ts
type CreateTodo = (
  title: string,
  description: string | undefined,
  priority: Priority,
) => Result<Todo, ValidationError>;

// domain/todo.impl.ts
export const createTodo: CreateTodo = (title, description, priority) => {
  // Validate input
  // Create entity
  // Return result
};
```

### Query (Read Operation)

```typescript
// domain/todo.def.ts
type FilterTodos = (todos: Todo[], filter: TodoFilter) => FilteredTodos;

// domain/todo.impl.ts
export const filterTodos: FilterTodos = (todos, filter) => {
  // Pure function, no side effects
  // Just read and transform data
};
```

## Checklist

Before completing any task:

- [ ] Types defined in `.def.ts`
- [ ] Implementation in `.impl.ts`
- [ ] Tests in `.test.ts`
- [ ] Public API exported in `index.ts`
- [ ] Commands and queries separated (CQRS)
- [ ] `pnpm fmt` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm check` passes
- [ ] `pnpm test:run` passes
