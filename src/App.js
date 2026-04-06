import { useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setValue] = useState("");

  function addTodo() {
    if (input.trim() === "") return;
    setTodos([...todos, input]);
    setValue("");
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
            {todo} <button onClick={() => deleteTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;