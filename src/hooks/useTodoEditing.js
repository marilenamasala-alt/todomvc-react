import { useRef, useState } from 'react';

export default function useTodoEditing(onSave) {
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const cancelEditRef = useRef(false);

  const startEditing = (todo) => {
    cancelEditRef.current = false;
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = (id) => {
    onSave(id, editingText.trim());
    stopEditing();
  };

  const cancelEdit = () => {
    cancelEditRef.current = true;
    stopEditing();
  };

  return {
    editingId,
    editingText,
    cancelEditRef,
    setEditingText,
    startEditing,
    stopEditing,
    saveEdit,
    cancelEdit,
  };
}
