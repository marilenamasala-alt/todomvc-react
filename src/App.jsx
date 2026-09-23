import { useEffect, useRef, useState } from "react"
import "./App.css"

const newId = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random())

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem("todos")) || []
    return saved.map((todo) => ({
      ...todo,
      id: todo.id ?? newId(),
    }))
  } catch {
    return []
  }
}

function filterFromHash() {
  const hash = window.location.hash.replace("#/", "")
  return hash === "active" || hash === "completed" ? hash : "all"
}

function App() {
  const [input, setInput] = useState("")
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState(filterFromHash)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")
  const cancelled = useRef(false)

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    const onHashChange = () => setFilter(filterFromHash())
    window.addEventListener("hashchange", onHashChange)

    return () =>
      window.removeEventListener("hashchange", onHashChange)
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

    setTodos(
      todos.map((todo) => ({
        ...todo,
        completed: !allCompleted,
      }))
    )
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
    <div className="todo-app">
      <h1>todos</h1>

      <section className="todo-card">
        <div className="input-row">
          <button
            className="toggle-all"
            onClick={toggleAll}
            aria-label="Toggle all"
          >
            ❯
          </button>

          <input
            className="new-todo"
            type="text"
            placeholder="What needs to be done?"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" && addTodo()
            }
          />
        </div>

        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li
              className={todo.completed ? "completed" : ""}
              key={todo.id}
            >
              <input
                className="toggle"
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />

              {editingId === todo.id ? (
                <input
                  className="edit"
                  value={editText}
                  onChange={(event) =>
                    setEditText(event.target.value)
                  }
                  onBlur={() => saveEdit(todo.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.currentTarget.blur()
                    } else if (event.key === "Escape") {
                      cancelEdit()
                    }
                  }}
                  autoFocus
                />
              ) : (
                <span
                  onDoubleClick={() => startEdit(todo)}
                  title="Double-click to edit"
                >
                  {todo.text}
                </span>
              )}

              <button
                className="destroy"
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <footer className="todo-footer">
          <span className="todo-count">
            {itemsLeft} {itemsLeft === 1 ? "item" : "items"} left!
          </span>

          <div className="filters">
            <button
              className={filter === "all" ? "selected" : ""}
              onClick={() => changeFilter("all")}
            >
              All
            </button>

            <button
              className={filter === "active" ? "selected" : ""}
              onClick={() => changeFilter("active")}
            >
              Active
            </button>

            <button
              className={filter === "completed" ? "selected" : ""}
              onClick={() => changeFilter("completed")}
            >
              Completed
            </button>
          </div>

          <button
            className="clear-completed"
            onClick={clearCompleted}
          >
            Clear completed
          </button>
        </footer>
      </section>

      <div className="info">
        <p>Double-click to edit a todo</p>
        <p>Created by the TodoMVC Team</p>
        <p>Part of TodoMVC</p>
      </div>
    </div>
  )
}

export default App