import { useState } from "react";
import api from "../services/api";

import reminderBell from "../assets/reminder-bell.svg";
import editIcon from "../assets/edit-icon.svg";
import deleteIcon from "../assets/delete-icon.svg";
import pendingIcon from "../assets/pending-icon.svg";
import completedIcon from "../assets/completed-icon.svg";
import searchIcon from "../assets/search-icon.svg";

function TaskList({ tasks, onTaskDeleted, onTaskUpdated }) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
    filter === "completed"
      ? task.completed
      : filter === "pending"
      ? !task.completed
      : true;

    const matchesSearch = task.title
    .toLowerCase()
    .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;

  });


  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      onTaskDeleted(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task.");
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const response = await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });

      onTaskUpdated(response.data);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task.");
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = async (task) => {
    try {
      const response = await api.put(`/tasks/${task._id}`, {
        title: editTitle,
        description: editDescription,
        completed: task.completed,
      });

      onTaskUpdated(response.data);
      cancelEditing();
    } catch (error) {
      console.error("Error editing task:", error);
      alert("Failed to edit task.");
    }
  };

  return (
    <div className="task-list">
      <h2>My Tasks</h2>

     <div className="task-toolbar">
     <div className="task-filter">
       <button
        className={filter === "all" ? "active-filter" : ""}
        onClick={() => setFilter("all")}
       >All</button>

       <button
        className={filter === "pending" ? "active-filter" : ""}
        onClick={() => setFilter("pending")}
       >Pending</button>
       
       <button
        className={filter === "completed" ? "active-filter" : ""}
        onClick={() => setFilter("completed")}
       >Completed</button>
       
      </div>

      <div className="task-search">
        <img
        src={searchIcon}
        alt="Search"
        className="search-icon"
        />
        <input
        type="text"
        placeholder="Search task....."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="view-buttons">
        <button
        className={viewMode === "list" ? "active-view" : ""}
        onClick={() => setViewMode("list")}
        > List </button>

        <button
        className={viewMode === "card" ? "active-view" : ""}
        onClick={() => setViewMode("card")}
        > Card </button>
      </div>

      </div>

      {filteredTasks.length === 0 ? (
        <p className="no-tasks">No tasks found.</p>
      ) : (
        filteredTasks.map((task) => (
          <div className={viewMode === "list" ? "task-card task-list-view" : "task-card task-card-view"}
           key={task._id}>
            {editingTaskId === task._id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                />

                <textarea
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(event.target.value)
                  }
                />

                <div className="task-buttons">
                  <button
                    className="save-button"
                    onClick={() => saveEdit(task)}
                  >
                    Save
                  </button>

                  <button
                    className="cancel-button"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3>{task.title}</h3>

                <p className="task-description">
                  {task.description || "No description"}
                </p>

                <p className="task-status">
                  Status:{" "}
                  <strong>
                    {task.completed ? "Completed" : "Pending"}
                  </strong>
                </p>

                {!task.completed && (
                  <p className= "task-reminder">
                    <img 
                    src={reminderBell}
                    alt="Reminder"
                    className="reminder-bell"
                    />
                    Reminder: This task is still pending!
                  </p>
                )}

                <div className="task-buttons">
                  <button
                    className="complete-icon-button"
                    onClick={() => handleToggleComplete(task)}
                    aria-label={task.completed ? "Mark as pending" : "Mark as complete"}
                    title={task.completed ? "Mark as pending" : "Mark as complete"}  
                  >
                    <img
                      src={task.completed ? completedIcon : pendingIcon}
                      alt={task.completed ? "Completed" : "Pending"}
                    />
                  </button>

                  <button
                    className="edit-button"
                    onClick={() => startEditing(task)}
                    title="Edit task"
                  >
                  <img src={editIcon} alt="Edit" />
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(task._id)}
                    title="Delete task"
                  >
                  <img src={deleteIcon} alt="Delete" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default TaskList;