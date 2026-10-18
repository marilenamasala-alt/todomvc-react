import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'todomvc-react.todos';
const FILTERS = ['all', 'active', 'completed'];

const getFilterFromHash = (hash) => {
  const value = hash.replace(/^#\/?/, '').trim();
  return FILTERS.includes(value) ? value : 'all';
};

const getStoredTodos = () => {
  try {
    const rawTodos = window.localStorage.getItem(STORAGE_KEY);
    return rawTodos ? JSON.parse(rawTodos) : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [todos, setTodos] = useState(getStoredTodos);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState(() => getFilterFromHash(window.location.hash));
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const cancelEditRef = useRef(false);
  const newTodoInputRef = useRef(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // Ignore localStorage write failures.
    }
  }, [todos]);

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

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;
  const allCompleted = todos.length > 0 && activeCount === 0;

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

  return (
    <div className="page-layout">
      <main className="main-content">
        <div className="todo-app">
          <h1>todos</h1>

          <div className="todo-panel">
            <form
              className={todos.length > 0 ? 'has-todos' : ''}
              onSubmit={handleSubmit}
            >
              {todos.length > 0 && (
                <button
                  type="button"
                  className="toggle-all"
                  aria-label={
                    allCompleted ? 'Mark all todos active' : 'Mark all todos complete'
                  }
                  aria-pressed={allCompleted}
                  onClick={() => {
                    const shouldComplete = todos.some((todo) => !todo.completed);
                    setTodos((currentTodos) =>
                      currentTodos.map((todo) => ({
                        ...todo,
                        completed: shouldComplete,
                      }))
                    );
                  }}
                />
              )}
              <input
                ref={newTodoInputRef}
                type="text"
                value={newTodo}
                onChange={(event) => setNewTodo(event.target.value)}
                placeholder="What needs to be done?"
                aria-label="New todo"
              />
            </form>

            {todos.length > 0 && (
              <ul className="todo-list">
                {filteredTodos.map((todo) => (
                  <li
                    key={todo.id}
                    className={
                      [
                        todo.completed ? 'completed' : '',
                        editingId === todo.id ? 'editing' : '',
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                  >
                    <div className="todo-item">
                      {editingId !== todo.id ? (
                        <>
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            aria-label={
                              todo.completed
                                ? `Mark ${todo.text} active`
                                : `Mark ${todo.text} complete`
                            }
                            onChange={() => toggleTodo(todo.id)}
                          />
                          <span
                            className="todo-text"
                            onDoubleClick={() => startEditing(todo)}
                          >
                            {todo.text}
                          </span>
                          <button
                            type="button"
                            className="destroy"
                            aria-label={`Delete ${todo.text}`}
                            onClick={() => deleteTodo(todo.id)}
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <input
                          className="todo-edit"
                          type="text"
                          value={editingText}
                          autoFocus
                          aria-label={`Edit ${todo.text}`}
                          onChange={(event) => setEditingText(event.target.value)}
                          onBlur={() => {
                            if (cancelEditRef.current) {
                              cancelEditRef.current = false;
                              return;
                            }
                            saveTodoEdit(todo.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              event.currentTarget.blur();
                            }
                            if (event.key === 'Escape') {
                              event.preventDefault();
                              cancelTodoEdit();
                              event.currentTarget.blur();
                            }
                          }}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {todos.length > 0 && (
              <div className="todo-controls">
                <span>
                  {activeCount} item{activeCount === 1 ? '' : 's'} left
                </span>

                <div className="filters" aria-label="Filter todos">
                  {FILTERS.map((filterName) => (
                    <button
                      key={filterName}
                      type="button"
                      className={filter === filterName ? 'active' : ''}
                      aria-pressed={filter === filterName}
                      onClick={() => setFilter(filterName)}
                    >
                      {filterName[0].toUpperCase() + filterName.slice(1)}
                    </button>
                  ))}
                </div>

                {completedCount > 0 && (
                  <button
                    type="button"
                    className="clear-completed"
                    onClick={clearCompleted}
                  >
                    Clear completed
                  </button>
                )}
              </div>
            )}
          </div>

          <footer className="todo-footer">
            <p>
              <button
                type="button"
                className="edit-hint"
                onClick={activateEditHint}
              >
                Double-click to edit a todo
              </button>
            </p>
            <p>Created by the TodoMVC Team</p>
            <p>Part of TodoMVC</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
