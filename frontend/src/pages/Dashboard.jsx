import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";

import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import ImageUpload from "../components/ImageUpload";
import taskAnalysisIcon from "../assets/task-analysis-icon.svg";
import completedIcon from "../assets/completed-icon.svg";
import progressLoadingIcon from "../assets/progress-loading-icon.svg";
import accountIcon from "../assets/account-icon.svg";
import taskManagerLogo from "../assets/task-manager-logo.svg";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [showAccount, setShowAccount] = useState(false);

  const [accountSection, setAccountSection] = useState("details");
  const [showTaskForm, setShowTaskForm] = useState(false);


  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch logged-in user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data.user);
      } catch (error) {
        console.error(
          "Profile error:",
          error.response?.status,
          error.response?.data || error.message
        );
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Fetch user's tasks
  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleTaskAdded = (newTask) => {
    setTasks((currentTasks) => [...currentTasks, newTask]);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task._id !== taskId)
    );
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;
  const overallProgress =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
    : 0;


  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!token) {
    return null;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <img 
        src={taskManagerLogo}
        alt="Task Manager"
        className="task-manager-logo" />

        <div className="header-actions">
          <div className="account-container">
            <button
              className="account-button"
              onClick={() => setShowAccount(!showAccount)}
            >
              Account
            </button>

            {showAccount && (
              <div className="account-dropdown">
                <button
                 className= "account-close-button"
                 onClick={() => setShowAccount(false)}
                >  × </button>

                <div className="account-profile-icon">
                  <img  src={accountIcon}  alt="Account" />
                </div>
                

                <div className="account-menu">
                  <button onClick={() => setAccountSection("details")}>
                   Account Details</button>
                  <button onClick={() => setAccountSection("tasks")}>
                    My Tasks</button>
                  <button onClick={() => setAccountSection("images")}>
                    Uploaded Images</button>
                  <button  onClick={handleLogout}>
                    Logout</button>
                </div>


                {accountSection === "details" && (
                  <>
                  {user ? (
                  <>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </>
                  ) : (
                    <p>Loading account details...</p>
                  )}
                 </>
                )}

                {accountSection === "tasks" && (
                   <div className="account-tasks">
                    <p>
                      <strong>Total Tasks:</strong> {tasks.length}
                    </p>
                    <p>
                      <strong>Completed:</strong>{" "}
                     {tasks.filter((task) => task.completed).length}
                    </p>
                    <p>
                      <strong>Pending:</strong>{" "}
                      {tasks.filter((task) => !task.completed).length}
                    </p>
                  </div>
                )}

                {accountSection === "images" && (
                  <div className="account-images">
                  <p>
                    <strong>Uploaded Images</strong>
                  </p>
                  <p> 
                    Your uploaded images are available in the Image Upload section below.
                  </p>
                  </div>
                )}

              </div>
            )}
          </div>

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>


      <div className="dashboard-content">

        {/* Project Dashboard Header */}

        <div className="project-dashboard-header">
          <div>
            <h2>Task Overview</h2>
            <p>
              Welcome back! Here's an overview of your active tasks and projects.
            </p>
          </div>
         
         <button
          className="new-task-button"
          onClick = {() => setShowTaskForm(true)}>
           + New Task
         </button>
        </div>

         {/* Task Statistics */}

        <div className="task-stats-grid">

        {/* Total Tasks */}
        <div className="stat-card">
         <div className="stat-card-content">
         <span className="stat-title">TOTAL TASKS</span>
         <strong>{tasks.length}</strong>
         <span className="stat-info total-info"> ↑ All your tasks </span>
        </div>

        <div className="stat-icon total-icon">
         <img src={taskAnalysisIcon} alt="Task analysis" />
        </div>
        </div>

       {/* Completed */}
       <div className="stat-card">
       <div className="stat-card-content">
         <span className="stat-title">COMPLETED</span>
         <strong>{completedTasks}</strong>
         <span className="stat-info completed-info">  ✓ Tasks completed </span>
       </div>

       <div className="stat-icon completed-icon">
         <img src={completedIcon} alt="Completed" />
      </div>
      </div>

      {/* In Progress */}
     <div className="stat-card">
     <div className="stat-card-content">
       <span className="stat-title">IN PROGRESS</span>
       <strong>{pendingTasks}</strong>
       <span className="stat-info progress-info">  ◷ Tasks remaining </span>
     </div>

     <div className="stat-icon progress-icon">
      <img
        src={progressLoadingIcon}
        alt="Tasks in progress" />
     </div>
     </div>


     {/* Overall Progress */}
      <div className="stat-card progress-stat-card">
      <div className="stat-card-content">
         <span className="stat-title">OVERALL PROGRESS</span>
         <strong>{overallProgress}%</strong>
         <span className="stat-info"> Completion status </span>
     </div>

      <div className="progress-circle"
      style={{
        "--progress": `${overallProgress * 3.6}deg`,
      }}
      >
      <div className="progress-circle-inner"></div>
      </div>
    </div>

    </div>
        
        {/* New Task Modal */}

        {showTaskForm && (
          <div className="task-modal-overlay">
            <div className="task-modal">

              <div className="task-modal-header">
               <h2>Add New Task</h2>

               <button
                className="task-modal-close"
                onClick={() => setShowTaskForm(false)}
                aria-label="Close"
               > × </button>
              </div>

             <div className="task-modal-body">
              <TaskForm
                onTaskAdded={(newTask) => {
                handleTaskAdded(newTask);
                setShowTaskForm(false); 
              }}
              />
            </div>

          </div>
         </div>
        )}
  
        
        {/* Task List */}

        <section className="task-list-card">
          <TaskList
           tasks={tasks} 
           onTaskDeleted={handleTaskDeleted}
           onTaskUpdated={handleTaskUpdated}
          />
        </section>

        {/* Image Upload */}
        
        <section className="task-list-card">
          <ImageUpload />
        </section>

      </div>
    </div>
  );
}

export default Dashboard;