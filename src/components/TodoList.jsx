import TodoItem from './TodoItem.jsx';

export default function TodoList({
  todos,
  editingId,
  editingText,
  cancelEditRef,
  onToggle,
  onDelete,
  onStartEditing,
  onChangeEditingText,
  onSaveEdit,
  onCancelEdit,
}) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isEditing={editingId === todo.id}
          editingText={editingText}
          cancelEditRef={cancelEditRef}
          onToggle={onToggle}
          onDelete={onDelete}
          onStartEditing={onStartEditing}
          onChangeEditingText={onChangeEditingText}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </ul>
  );
}
