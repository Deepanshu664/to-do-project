const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// Load tasks from backend (Flask + MongoDB)
window.addEventListener("DOMContentLoaded", () => {
  fetch("/get-tasks")
    .then((res) => res.json())
    .then((tasks) => {
      tasks.forEach((task) => addTask(task.content, task.completed, task.id));
    });
});

// Add task on button click
addBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  // Send to Flask to save in MongoDB
  fetch("/add-task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: taskText }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        addTask(data.content, false, data.id); // Add to DOM
        taskInput.value = "";
        taskInput.focus();
      }
    });
});
// Add task on Enter key
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addBtn.click();
  }
});

// Create a task item
function addTask(text, isCompleted, id) {
  const li = document.createElement("li");
  li.classList.add("task-item", "animate");

  const taskSpan = document.createElement("span");
  taskSpan.textContent = text;
  taskSpan.classList.add("task-text");
  if (isCompleted) taskSpan.classList.add("completed");

  // Done button
  const doneBtn = document.createElement("button");
  doneBtn.textContent = "Done";
  doneBtn.classList.add("action-btn", "done-btn");
  if (isCompleted) doneBtn.classList.add("active");

  doneBtn.addEventListener("click", () => {
    fetch(`/toggle-complete/${id}`, { method: "POST" }).then(() =>
      location.reload()
    );
  });

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("action-btn", "edit-btn");

  const btnGroup = document.createElement("div");
  btnGroup.classList.add("btn-group");
  btnGroup.appendChild(doneBtn);
  btnGroup.appendChild(editBtn);

  editBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = taskSpan.textContent;
    input.classList.add("edit-input");

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.classList.add("action-btn", "save-btn");

    li.replaceChild(input, taskSpan);
    btnGroup.replaceChild(saveBtn, editBtn);

    saveBtn.addEventListener("click", () => {
      const newText = input.value.trim();
      if (newText !== "") {
        fetch(`/edit-task/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newText }),
        }).then(() => location.reload());
      }
    });
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("action-btn", "delete-btn");
  deleteBtn.addEventListener("click", () => {
    fetch(`/delete/${id}`, { method: "POST" }).then(() => location.reload());
  });

  btnGroup.appendChild(deleteBtn);

  li.appendChild(taskSpan);
  li.appendChild(btnGroup);
  taskList.appendChild(li);
}

// Clear all tasks
const clearAllBtn = document.getElementById("clearAllBtn");
clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    fetch("/clear-all", { method: "POST" }).then(() => location.reload());
  }
});

// Dark mode
const toggle = document.getElementById("darkModeToggle");
toggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
});
