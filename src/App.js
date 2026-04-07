import { useState, useEffect } from "react";
import TodoItem from "./TodoItem";
import "./App.css";

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setValue] = useState("");

  useEffect(() => {
    document.title = `${todos.length} tasks remaining`;
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  function addTodo() {
    if (input.trim() === "") return;
    setTodos([...todos, { text: input, done: false, crack: null, warping: false }]);
    setValue("");
  }

  function toggleTodo(index, crackData) {
    setTodos(prev => prev.map((todo, i) =>
      i === index
        ? { ...todo, done: !todo.done, crack: !todo.done ? crackData : null }
        : todo
    ));
  }

  function deleteTodo(index) {
    setTodos(prev => prev.map((todo, i) =>
      i === index ? { ...todo, warping: true } : todo
    ));
    setTimeout(() => {
      setTodos(prev => prev.filter((_, i) => i !== index));
    }, 500);
  }

  return (
    <div className="app">
      <h1>✦ To-Do</h1>
      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a task..."
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo, index) => (
          <TodoItem
            key={index}
            todo={todo}
            index={index}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;