<script setup lang="ts">
/**
 * メインページ - 本書の概念を反映したTodoアプリ
 *
 * - 状態遷移: Active → Completed → Archived
 * - ワークフロー: 各操作はサーバー側のワークフローを呼び出す
 * - イベント駆動: 操作ごとにドメインイベントが発生（サーバーログで確認可能）
 */

type Todo = {
  id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  status: "Active" | "Completed" | "Archived";
  createdAt: string;
  completedAt?: string;
};

// Todo一覧の取得
const { data: todos, refresh } = await useFetch<Todo[]>("/api/todos");

// フォーム状態
const newTodo = ref({
  title: "",
  description: "",
  priority: "Medium" as const,
});

const errors = ref<{ field: string; message: string }[]>([]);
const isSubmitting = ref(false);

// Todo作成
const createTodo = async () => {
  errors.value = [];
  isSubmitting.value = true;

  try {
    await $fetch("/api/todos", {
      method: "POST",
      body: newTodo.value,
    });
    newTodo.value = { title: "", description: "", priority: "Medium" };
    await refresh();
  } catch (e: any) {
    if (e.data?.data) {
      errors.value = e.data.data;
    } else {
      errors.value = [{ field: "general", message: e.message || "エラーが発生しました" }];
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Todo完了
const completeTodo = async (id: string) => {
  await $fetch(`/api/todos/${id}/complete`, { method: "POST" });
  await refresh();
};

// Todo再開
const reopenTodo = async (id: string) => {
  await $fetch(`/api/todos/${id}/reopen`, { method: "POST" });
  await refresh();
};

// Todoアーカイブ
const archiveTodo = async (id: string) => {
  await $fetch(`/api/todos/${id}/archive`, { method: "POST" });
  await refresh();
};

// フィルター
const filter = ref<"all" | "active" | "completed">("all");

const filteredTodos = computed(() => {
  if (!todos.value) return [];
  switch (filter.value) {
    case "active":
      return todos.value.filter((t) => t.status === "Active");
    case "completed":
      return todos.value.filter((t) => t.status === "Completed");
    default:
      return todos.value;
  }
});

// 優先度の色
const priorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "#e74c3c";
    case "Medium":
      return "#f39c12";
    case "Low":
      return "#27ae60";
    default:
      return "#333";
  }
};
</script>

<template>
  <div class="container">
    <header>
      <h1>DMMF Todo App</h1>
      <p>関数型ドメインモデリングの概念を反映したTodoアプリ</p>
    </header>

    <!-- Todo作成フォーム -->
    <section class="create-form">
      <h2>新規Todo作成</h2>
      <form @submit.prevent="createTodo">
        <div class="form-group">
          <label for="title">タイトル *</label>
          <input
            id="title"
            v-model="newTodo.title"
            type="text"
            placeholder="Todoのタイトル（必須、100文字以内）"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label for="description">説明</label>
          <textarea
            id="description"
            v-model="newTodo.description"
            placeholder="詳細な説明（任意、500文字以内）"
            rows="2"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label for="priority">優先度</label>
          <select id="priority" v-model="newTodo.priority" :disabled="isSubmitting">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <!-- バリデーションエラー表示 -->
        <div v-if="errors.length > 0" class="errors">
          <p v-for="error in errors" :key="error.field" class="error">
            {{ error.message }}
          </p>
        </div>

        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "作成中..." : "Todo作成" }}
        </button>
      </form>
    </section>

    <!-- フィルター -->
    <section class="filters">
      <button :class="{ active: filter === 'all' }" @click="filter = 'all'">すべて</button>
      <button :class="{ active: filter === 'active' }" @click="filter = 'active'">
        アクティブ
      </button>
      <button :class="{ active: filter === 'completed' }" @click="filter = 'completed'">
        完了
      </button>
    </section>

    <!-- Todo一覧 -->
    <section class="todo-list">
      <h2>Todo一覧 ({{ filteredTodos.length }}件)</h2>

      <div v-if="filteredTodos.length === 0" class="empty">Todoがありません</div>

      <article
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="todo-item"
        :class="todo.status.toLowerCase()"
      >
        <div class="todo-header">
          <span class="priority" :style="{ backgroundColor: priorityColor(todo.priority) }">
            {{ todo.priority }}
          </span>
          <span class="status">{{ todo.status }}</span>
        </div>

        <h3 :class="{ completed: todo.status === 'Completed' }">
          {{ todo.title }}
        </h3>

        <p v-if="todo.description" class="description">
          {{ todo.description }}
        </p>

        <div class="todo-actions">
          <button v-if="todo.status === 'Active'" @click="completeTodo(todo.id)">✓ 完了</button>
          <button v-if="todo.status === 'Completed'" @click="reopenTodo(todo.id)">↩ 再開</button>
          <button class="archive" @click="archiveTodo(todo.id)">🗑 アーカイブ</button>
        </div>
      </article>
    </section>

    <!-- 概念説明 -->
    <footer>
      <h2>本書の概念</h2>
      <ul>
        <li><strong>状態遷移:</strong> Active → Completed → Archived（型で制約）</li>
        <li><strong>値オブジェクト:</strong> TodoTitle, Priority など（制約付きの型）</li>
        <li><strong>ワークフロー:</strong> 各操作は検証→変換→イベント発行の流れ</li>
        <li><strong>Result型:</strong> エラーを例外ではなく戻り値で表現</li>
        <li><strong>永続化を端に:</strong> ドメインロジックはストレージに依存しない</li>
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
}

header p {
  color: #666;
}

.create-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.errors {
  background: #fee;
  border: 1px solid #fcc;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.error {
  color: #c00;
  margin: 5px 0;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
}

.filters button.active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.todo-list {
  margin-bottom: 30px;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.todo-item {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.todo-item.completed {
  background: #f0fff0;
}

.todo-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.priority {
  padding: 2px 8px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.status {
  padding: 2px 8px;
  background: #eee;
  border-radius: 4px;
  font-size: 12px;
}

.todo-item h3 {
  margin: 0 0 10px 0;
}

.todo-item h3.completed {
  text-decoration: line-through;
  color: #999;
}

.description {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.todo-actions {
  display: flex;
  gap: 10px;
}

.todo-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.todo-actions button:not(.archive) {
  background: #28a745;
  color: #fff;
}

.todo-actions button.archive {
  background: #dc3545;
  color: #fff;
}

footer {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

footer ul {
  padding-left: 20px;
}

footer li {
  margin-bottom: 8px;
}
</style>
