import { useEffect, useRef, useState } from 'react';
import TodoControls from './components/TodoControls.jsx';
import TodoFooter from './components/TodoFooter.jsx';
import TodoInput from './components/TodoInput.jsx';
import TodoList from './components/TodoList.jsx';
import { getFilterFromHash } from './todoUtils.js';
import './App.css';

const STORAGE_KEY = 'todomvc-react.todos';

const getStoredTodos = () => {
  try {
    const rawTodos = window.localStorage.getItem(STORAGE_KEY);
    return rawTodos ? JSON.parse(rawTodos) : [];
  } catch {
    return [];
  }
};

export default function App() {
  // Step 1: things the app remembers (the list, the typed text, the filter, the todo being edited).
  const [todos, setTodos] = useState(getStoredTodos);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState(() => getFilterFromHash(window.location.hash));
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const cancelEditRef = useRef(false);
  const newTodoInputRef = useRef(null);

  // Step 2: save the list in the browser every time it changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // Ignore localStorage write failures.
    }
  }, [todos]);

  // Step 3: keep the filter and the web address the same.
  useEffect(() => {
    const syncFilterFromHash = () => {
      const nextFilter = getFilterFromHash(window.location.hash);
      setFilter((currentFilter) =>
        currentFilter === nextFilter ? currentFilter : nextFilter
      );
    };

    syncFilterFromHash();
    window.addEventListener('hashchange', syncFilterFromHash);

    return () => window.removeEventListener('hashchange', syncFilterFromHash);
  }, []);

  useEffect(() => {
    const nextHash = filter === 'all' ? '#/' : `#/${filter}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }, [filter]);

  // Step 4: work out which todos to show and how many are left.
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;
  const allCompleted = todos.length > 0 && activeCount === 0;

  // Step 5: what happens when you add, tick, delete or edit a todo.
  const handleSubmit = (event) => {
    event.preventDefault();
    const text = newTodo.trim();
    if (!text) return;

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: crypto.randomUUID(), text, completed: false },
    ]);
    setNewTodo('');
    newTodoInputRef.current?.focus();
  };

  const toggleTodo = (id) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
  };

  const clearCompleted = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
    if (filter === 'completed') {
      setFilter('all');
    }
  };

  const startEditing = (todo) => {
    cancelEditRef.current = false;
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveTodoEdit = (id) => {
    const text = editingText.trim();

    setTodos((currentTodos) =>
      text
        ? currentTodos.map((todo) =>
            todo.id === id ? { ...todo, text } : todo
          )
        : currentTodos.filter((todo) => todo.id !== id)
    );
    setEditingId(null);
    setEditingText('');
  };

  const cancelTodoEdit = () => {
    cancelEditRef.current = true;
    setEditingId(null);
    setEditingText('');
  };

  const activateEditHint = () => {
    const todoToEdit = filteredTodos[0] ?? todos[0];
    if (!todoToEdit) {
      newTodoInputRef.current?.focus();
      return;
    }

    if (filteredTodos.length === 0) {
      setFilter('all');
    }
    startEditing(todoToEdit);
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

  // Step 6: put the pieces on the screen. Each piece is its own file in the components folder.
  return (
    <div className="page-layout">
      <main className="main-content">
        <div className="todo-app">
          <h1>todos</h1>

          <div className="todo-panel">
            <TodoInput
              hasTodos={todos.length > 0}
              allCompleted={allCompleted}
              newTodo={newTodo}
              inputRef={newTodoInputRef}
              onChange={setNewTodo}
              onSubmit={handleSubmit}
              onToggleAll={toggleAllTodos}
            />

            {todos.length > 0 && (
              <>
                <TodoList
                  todos={filteredTodos}
                  editingId={editingId}
                  editingText={editingText}
                  cancelEditRef={cancelEditRef}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onStartEditing={startEditing}
                  onChangeEditingText={setEditingText}
                  onSaveEdit={saveTodoEdit}
                  onCancelEdit={cancelTodoEdit}
                />
                <TodoControls
                  activeCount={activeCount}
                  completedCount={completedCount}
                  filter={filter}
                  onChangeFilter={setFilter}
                  onClearCompleted={clearCompleted}
                />
              </>
            )}
          </div>

          <TodoFooter onActivateEditHint={activateEditHint} />
        </div>
      </main>
    </div>
  );
}
