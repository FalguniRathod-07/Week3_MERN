import { useState } from "react";
import api from "../services/api";

function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    try {
      const response = await api.post("/tasks", {
        title,
        description,
      });

      onTaskAdded(response.data);

      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task.");
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>

      <div className="form-group">
        <label>Title</label>

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter task title"
        />
      </div>

      <div className="form-group">
        <label>Description</label>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Enter task description"
        />
      </div>

      <button className="add-task-button" type="submit">
        Add Task
      </button>
    </form>
  );
}

export default TaskForm;