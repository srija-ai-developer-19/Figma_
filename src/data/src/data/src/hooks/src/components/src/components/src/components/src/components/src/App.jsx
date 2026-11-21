import { useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import TaskCard from "./components/TaskCard";
import TaskForm from "./components/TaskForm";
import FocusCarousel from "./components/FocusCarousel";
import { initialTasks } from "./data/tasks";
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function App() {
  const [tasks, setTasks] = useLocalStorage("focusboard-tasks", initialTasks);
  const [currentView, setCurrentView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingTask, setEditingTask] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || task.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks(tasks.map((t) => t.id === editingTask.id ? { ...t, ...taskData } : t));
      setEditingTask(null);
    } else {
      setTasks([{ id: Date.now(), ...taskData }, ...tasks]);
    }
  };

  const handleDelete = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const handleEdit = (task) => setEditingTask(task);
  const handleStatusChange = (id, newStatus) => setTasks(tasks.map((t) => t.id === id ? { ...t, status: newStatus } : t));

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="app">
      <div className={mobileMenu ? "sidebar-wrapper open" : "sidebar-wrapper"}>
        <Sidebar currentView={currentView} setCurrentView={(v) => { setCurrentView(v); setMobileMenu(false); }} />
      </div>

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
          <div className="user">B</div>
        </header>

        <section className="stats">
          <div className="stat-card"><h4>Total Tasks</h4><p>{total}</p></div>
          <div className="stat-card"><h4>Completed</h4><p>{completed}</p></div>
          <div className="stat-card"><h4>In Progress</h4><p>{tasks.filter(t => t.status === "In progress").length}</p></div>
          <div className="stat-card"><h4>Progress</h4><p>{progress}%</p><div className="progress-bar"><div style={{ width: `${progress}%` }}></div></div></div>
        </section>

        <FocusCarousel />

        <div className="content-grid">
          <div className="left-section">
            <div className="tabs">
              {["All", "To do", "In progress", "Completed"].map((s) => (
                <button key={s} className={statusFilter === s ? "tab active" : "tab"} onClick={() => setStatusFilter(s)}>{s}</button>
              ))}
            </div>
            <div className="task-list">
              {filteredTasks.length === 0 ? <p className="empty">No tasks found. Create one!</p> : filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>
          <div className="right-section">
            <TaskForm onSave={handleSaveTask} editingTask={editingTask} onCancel={() => setEditingTask(null)} />
          </div>
        </div>
      </main>
    </div>
  );
                                                         }
