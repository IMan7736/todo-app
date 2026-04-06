import { useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setValue] = useState("");

  function addTodo() {
    if (input.trim() === "") return;
    setTodos([...todos, { text: input, done: false }]);
    setValue("");
  }

  function toggleTodo(index) {
    setTodos(todos.map((todo, i) =>
        i === index ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  function deleteTodo(index) {
    setTodos(todos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <h1>To-Do List</h1>
      <input
        value={input}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a task..."
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            <span
              onClick={() => toggleTodo(index)}
              style={{ textDecoration: todo.done ? "line-through" : "none", cursor: "pointer" }}
            >
              {todo.text}
              </span>
            <button onClick={() => deleteTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;