import { useState, useEffect } from "react";
import TodoItem from "./TodoItem";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `${todos.length} tasks remaining`;
  }, [todos]);

  async function fetchTodos() {
    setLoading(true);
    const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
    const data = await response.json();
    const formatted = data.map(item => ({ text: item.title, done: item.completed }));
    setTodos([...todos, ...formatted]);
    setLoading(false);
   }

  function addTodo() {
    if (input.trim() === "") return;
    setTodos([...todos, { text: input, done: false }]);
    setValue("");
  }

  function toggleTodo(index) {
    setTodos(todos.map((todo, i) =>
      i === index ? { ...todo, done: !todo.done } : todo
    ));
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
      <button onClick={fetchTodos}>
        {loading ? "Loading..." : "Fetch Tasks from API"}
      </button>

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