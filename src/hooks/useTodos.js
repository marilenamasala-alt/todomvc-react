import { useEffect, useState } from 'react';

const STORAGE_KEY = 'todomvc-react.todos';

const getStoredTodos = () => {
  try {
    const rawTodos = window.localStorage.getItem(STORAGE_KEY);
    return rawTodos ? JSON.parse(rawTodos) : [];
  } catch {
    return [];
  }
};

export default function useTodos() {
  const [todos, setTodos] = useState(getStoredTodos);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // Ignore localStorage write failures.
    }
  }, [todos]);

  const addTodo = (text) => {
    setTodos((currentTodos) => [
      ...currentTodos,
      { id: crypto.randomUUID(), text, completed: false },
    ]);
  };

  const toggleTodo = (id) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const toggleAllTodos = () => {
    const shouldComplete = todos.some((todo) => !todo.completed);
    setTodos((currentTodos) =>
      currentTodos.map((todo) => ({
        ...todo,
        completed: shouldComplete,
      }))
    );
  };

  const deleteTodo = (id) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  const updateTodoText = (id, text) => {
    setTodos((currentTodos) =>
      text
        ? currentTodos.map((todo) =>
            todo.id === id ? { ...todo, text } : todo
          )
        : currentTodos.filter((todo) => todo.id !== id)
    );
  };

  const clearCompleted = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    toggleAllTodos,
    deleteTodo,
    updateTodoText,
    clearCompleted,
  };
}
