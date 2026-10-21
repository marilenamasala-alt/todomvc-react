import './TodoInput.css';

export default function TodoInput({
  hasTodos,
  allCompleted,
  newTodo,
  inputRef,
  onChange,
  onSubmit,
  onToggleAll,
}) {
  return (
    <form className={hasTodos ? 'has-todos' : ''} onSubmit={onSubmit}>
      {hasTodos && (
        <button
          type="button"
          className="toggle-all"
          aria-label={
            allCompleted ? 'Mark all todos active' : 'Mark all todos complete'
          }
          aria-pressed={allCompleted}
          onClick={onToggleAll}
        />
      )}
      <input
        ref={inputRef}
        type="text"
        value={newTodo}
        onChange={(event) => onChange(event.target.value)}
        placeholder="What needs to be done?"
        aria-label="New todo"
      />
    </form>
  );
}
