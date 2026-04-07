function TodoItem({ todo, index, onToggle, onDelete }) {
  return (
    <li>
      <span
        onClick={() => onToggle(index)}
        style={{ textDecoration: todo.done ? "line-through" : "none", cursor: "pointer" }}
      >
        {todo.text}
      </span>
      <button onClick={() => onDelete(index)}>Delete</button>
    </li>
  );
}

export default TodoItem;