import './TodoItem.css';

export default function TodoItem({
  todo,
  isEditing,
  editingText,
  cancelEditRef,
  onToggle,
  onDelete,
  onStartEditing,
  onChangeEditingText,
  onSaveEdit,
  onCancelEdit,
}) {
  const className = [
    todo.completed ? 'completed' : '',
    isEditing ? 'editing' : '',
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <li className={className}>
      <div className="todo-item">
        {!isEditing ? (
          <>
            <input
              type="checkbox"
              checked={todo.completed}
              aria-label={
                todo.completed
                  ? `Mark ${todo.text} active`
                  : `Mark ${todo.text} complete`
              }
              onChange={() => onToggle(todo.id)}
            />
            <span
              className="todo-text"
              onDoubleClick={() => onStartEditing(todo)}
            >
              {todo.text}
            </span>
            <button
              type="button"
              className="destroy"
              aria-label={`Delete ${todo.text}`}
              onClick={() => onDelete(todo.id)}
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
            onChange={(event) => onChangeEditingText(event.target.value)}
            onBlur={() => {
              if (cancelEditRef.current) {
                cancelEditRef.current = false;
                return;
              }
              onSaveEdit(todo.id);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                event.currentTarget.blur();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                onCancelEdit();
                event.currentTarget.blur();
              }
            }}
          />
        )}
      </div>
    </li>
  );
}
