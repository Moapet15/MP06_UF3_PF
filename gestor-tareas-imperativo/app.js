const { useState, useContext, createContext } = React;

// Contexts
const UserContext = createContext();
const ThemeContext = createContext();

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [theme, setTheme] = useState("light");

  React.useEffect(() => {
  document.body.className = theme;
}, [theme]);

  // Funcions usuaris
  function addUser(name) {
    if (!name.trim()) return;
    setUsers([...users, { name: name.trim(), tasks: [] }]);
  }

  function selectUser(index) {
    setSelectedUserIndex(index);
  }

  function deselectUser() {
    setSelectedUserIndex(null);
  }

  function addTask(text) {
    if (selectedUserIndex === null || !text.trim()) return;
    const newUsers = [...users];
    newUsers[selectedUserIndex].tasks.push({ text: text.trim(), completed: false });
    setUsers(newUsers);
  }

  function toggleTask(taskIndex) {
    if (selectedUserIndex === null) return;
    const newUsers = [...users];
    const task = newUsers[selectedUserIndex].tasks[taskIndex];
    task.completed = !task.completed;
    setUsers(newUsers);
  }

  function deleteTask(taskIndex) {
    if (selectedUserIndex === null) return;
    const newUsers = [...users];
    newUsers[selectedUserIndex].tasks.splice(taskIndex, 1);
    setUsers(newUsers);
  }

  function editTask(taskIndex, newText) {
    if (selectedUserIndex === null) return;
    if (!newText.trim()) return;
    const newUsers = [...users];
    newUsers[selectedUserIndex].tasks[taskIndex].text = newText.trim();
    setUsers(newUsers);
  }

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  const userContextValue = {
    users,
    selectedUserIndex,
    selectUser,
    deselectUser,
    addUser,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <UserContext.Provider value={userContextValue}>
        <div className={`app ${theme}`}>
          <Sidebar />
          <Main />
        </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

function Sidebar() {
  const { users, selectedUserIndex, addUser, selectUser, deselectUser } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [newUserName, setNewUserName] = useState("");

  function handleAddUser() {
    if (newUserName.trim() === "") return;
    addUser(newUserName.trim());
    setNewUserName("");
  }

  return (
    <aside className="sidebar card">
      <h2>Usuarios</h2>
      <ul>
        {users.length === 0 ? (
          <li>No hay usuarios</li>
        ) : (
          users.map((user, index) => (
            <li
              key={index}
              style={{ cursor: "pointer", fontWeight: index === selectedUserIndex ? "bold" : "normal" }}
              onClick={() => selectUser(index)}
            >
              {user.name}
            </li>
          ))
        )}
      </ul>
      <input
        type="text"
        placeholder="Nuevo usuario..."
        value={newUserName}
        onChange={e => setNewUserName(e.target.value)}
      />
      <button onClick={handleAddUser}>Añadir Usuario</button>

      {selectedUserIndex !== null && (
        <div>
          <hr />
          <p>{users[selectedUserIndex].name}</p>
          <p>
            Tareas: {users[selectedUserIndex].tasks.filter(t => t.completed).length} / {users[selectedUserIndex].tasks.length} completadas
          </p>
          <button onClick={deselectUser}>Deseleccionar</button>
        </div>
      )}

      <button onClick={toggleTheme} style={{ marginTop: "auto" }}>
        🌙/☀️ Tema
      </button>
    </aside>
  );
}

function Main() {
  const { selectedUserIndex, users, addTask } = useContext(UserContext);
  const [newTaskText, setNewTaskText] = useState("");

  if (selectedUserIndex === null) {
    return (
      <main className="main">
        <div className="card">
          <h1 id="mainTitle">Selecciona un usuario</h1>
        </div>
      </main>
    );
  }

  const user = users[selectedUserIndex];

  function handleAddTask() {
    addTask(newTaskText);
    setNewTaskText("");
  }

  return (
    <main className="main">
      <div className="card">
        <h1 id="mainTitle">Tareas de {user.name}</h1>
        <div id="taskSection">
          <TaskList tasks={user.tasks} />
          <input
            type="text"
            placeholder="Nueva tarea..."
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
          />
          <button onClick={handleAddTask}>Añadir Tarea</button>
        </div>
      </div>
    </main>
  );
}

function TaskList({ tasks }) {
  const { toggleTask, deleteTask, editTask } = useContext(UserContext);

  if (tasks.length === 0) {
    return <p>No hay tareas</p>;
  }

  return (
    <ul id="taskList">
      {tasks.map((task, i) => (
        <TaskItem
          key={i}
          task={task}
          index={i}
          onToggle={() => toggleTask(i)}
          onDelete={() => deleteTask(i)}
          onEdit={() => {
            const newText = prompt("Editar tarea:", task.text);
            if (newText !== null) editTask(i, newText);
          }}
        />
      ))}
    </ul>
  );
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  return (
    <li className={task.completed ? "completed" : ""}>
      <span style={{ cursor: "pointer" }} onClick={onToggle}>
        {task.text}
      </span>
      <div className="actions">
        <button onClick={onEdit}>✏️</button>
        <button onClick={onDelete}>🗑️</button>
      </div>
    </li>
  );
}

// ReactDOM render
const app = document.getElementById('root');
const root = ReactDOM.createRoot(app);
root.render(<App />);
