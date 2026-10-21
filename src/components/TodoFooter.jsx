export default function TodoFooter({ onActivateEditHint }) {
  return (
    <footer className="todo-footer">
      <p>
        <button
          type="button"
          className="edit-hint"
          onClick={onActivateEditHint}
        >
          Double-click to edit a todo
        </button>
      </p>
      <p>Created by the TodoMVC Team</p>
      <p>Part of TodoMVC</p>
    </footer>
  );
}
