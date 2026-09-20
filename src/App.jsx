import { useState, useEffect, useRef } from 'react'
import './App.css'

const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem("todos")) || []
    return saved.map((t) => ({ ...t, id: t.id ?? newId() }))
  } catch {
    return []
  }
}

function filterFromHash() {
  const h = window.location.hash.replace("#/", "")
  return h === "active" || h === "completed" ? h : "all"
}

function App() {
  const [input, setInput] = useState("")
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState(filterFromHash)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")
  const cancelled = useRef(false)

  useEffect(() => {
    try {
      localStorage.setItem("todos", JSON.stringify(todos))
    } catch {}
  }, [todos])

  useEffect(() => {
    const onHashChange = () => setFilter(filterFromHash())
    window.addEventListener("hashchange", onHashChange)

    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  function changeFilter(next) {
    window.location.hash = next === "all" ? "/" : `/${next}`
  }

  function addTodo() {
    const text = input.trim()

    if (!text) return

    setTodos([
      ...todos,
      {
        id: newId(),
        text,
        completed: false,
      },
    ])

    setInput("")
  }

  function toggleTodo(id) {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    )
  }

  function deleteTodo(id) {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  function clearCompleted() {
    setTodos(todos.filter((todo) => !todo.completed))
  }
  
  function toggleAll() {
  const allCompleted = todos.every((todo) => todo.completed)
  setTodos(todos.map((todo) => ({ ...todo, completed: !allCompleted })))
}
  function startEdit(todo) {
    cancelled.current = false
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  function saveEdit(id) {
    if (cancelled.current) return

    const text = editText.trim()

    if (text) {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, text } : todo
        )
      )
    }

    setEditingId(null)
  }

  function cancelEdit() {
    cancelled.current = true
    setEditingId(null)
  }

  const itemsLeft = todos.filter((todo) => !todo.completed).length

  const visibleTodos = todos.filter(
    (todo) =>
      filter === "all" ||
      (filter === "active" && !todo.completed) ||
      (filter === "completed" && todo.completed)
  )

  return (
    <div>
      <h1>todos</h1>
      <button onClick={toggleAll}>Toggle all</button>

      <input
        type="text"
        placeholder="What needs to be done?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTodo()}
      />

      <button onClick={() => changeFilter("all")}>
        All
      </button>

      <button onClick={() => changeFilter("active")}>
        Active
      </button>

      <button onClick={() => changeFilter("completed")}>
        Completed
      </button>

      <ul>
        {visibleTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />

            {editingId === todo.id ? (
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => saveEdit(todo.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur()
                  } else if (e.key === "Escape") {
                    cancelEdit()
                  }
                }}
                autoFocus
              />
            ) : (
              <span
                style={{
                  textDecoration: todo.completed
                    ? "line-through"
                    : "none",
                }}
              >
                {todo.text}
              </span>
            )}

            <button onClick={() => deleteTodo(todo.id)}>
              Delete
            </button>

            <button onClick={() => startEdit(todo)}>
              Edit
            </button>
          </li>
        ))}
      </ul>

      <p>{itemsLeft} items left</p>

      <button onClick={clearCompleted}>
        Clear completed
      </button>
    </div>
  )
}

export default App