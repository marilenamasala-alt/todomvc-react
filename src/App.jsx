import { useRef, useState } from 'react';
import TodoControls from './components/TodoControls.jsx';
import TodoFooter from './components/TodoFooter.jsx';
import TodoHeader from './components/TodoHeader.jsx';
import TodoInput from './components/TodoInput.jsx';
import TodoList from './components/TodoList.jsx';
import useFilter from './hooks/useFilter.js';
import useTodoEditing from './hooks/useTodoEditing.js';
import useTodos from './hooks/useTodos.js';

export default function App() {
  // Step 1: the list of todos and the things we can do with it.
  const {
    todos,
    addTodo,
    toggleTodo,
    toggleAllTodos,
    deleteTodo,
    updateTodoText,
    clearCompleted,
  } = useTodos();

  // Step 2: the chosen filter (all, active or completed).
  const [filter, setFilter] = useFilter();

  // Step 3: which todo is being edited.
  const editing = useTodoEditing(updateTodoText);

  // Step 4: the text in the "new todo" box.
  const [newTodo, setNewTodo] = useState('');
  const newTodoInputRef = useRef(null);

  // Step 5: work out what to show and the numbers.
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;
  const allCompleted = todos.length > 0 && activeCount === 0;

  // Step 6: what happens when you click or type.
  const handleSubmit = (event) => {
    event.preventDefault();
    const text = newTodo.trim();
    if (!text) return;

    addTodo(text);
    setNewTodo('');
    newTodoInputRef.current?.focus();
  };

  const handleDelete = (id) => {
    deleteTodo(id);
    if (editing.editingId === id) {
      editing.stopEditing();
    }
  };

  const handleClearCompleted = () => {
    clearCompleted();
    if (filter === 'completed') {
      setFilter('all');
    }
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
    editing.startEditing(todoToEdit);
  };

  // Step 7: put the pieces on the screen.
  return (
    <div className="page-layout">
      <main className="main-content">
        <div className="todo-app">
          <TodoHeader />

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
                  editingId={editing.editingId}
                  editingText={editing.editingText}
                  cancelEditRef={editing.cancelEditRef}
                  onToggle={toggleTodo}
                  onDelete={handleDelete}
                  onStartEditing={editing.startEditing}
                  onChangeEditingText={editing.setEditingText}
                  onSaveEdit={editing.saveEdit}
                  onCancelEdit={editing.cancelEdit}
                />
                <TodoControls
                  activeCount={activeCount}
                  completedCount={completedCount}
                  filter={filter}
                  onChangeFilter={setFilter}
                  onClearCompleted={handleClearCompleted}
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
