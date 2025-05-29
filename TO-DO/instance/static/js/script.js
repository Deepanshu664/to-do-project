const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// Load tasks from localStorage on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach((task) => addTask(task.text, task.completed));
});

// Add task on button click
addBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;
  addTask(taskText, false);
  taskInput.value = "";
  saveTasks();
});

// Add task on Enter key
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addBtn.click();
  }
});

// Create a task item
function addTask(text, isCompleted) {
  const li = document.createElement("li");
  li.classList.add("task-item", "animate");

  const taskSpan = document.createElement("span");
  taskSpan.textContent = text;
  taskSpan.classList.add("task-text");
  if (isCompleted) taskSpan.classList.add("completed");

  /*add Done,Edit,Delete buttons */
  // Done button
  const doneBtn = document.createElement("button");
  doneBtn.textContent = "Done";
  doneBtn.classList.add("action-btn", "done-btn");
  if (isCompleted) doneBtn.classList.add("active");
  doneBtn.addEventListener("click", () => {
    taskSpan.classList.toggle("completed");
    doneBtn.classList.toggle("active");
    saveTasks();
  });

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("action-btn", "edit-btn");
  editBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = taskSpan.textContent;
    input.classList.add("edit-input");

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.classList.add("action-btn", "save-btn");

    // Replace the span and editBtn with input and saveBtn
    li.replaceChild(input, taskSpan);
    btnGroup.replaceChild(saveBtn, editBtn);

    saveBtn.addEventListener("click", () => {
      const newText = input.value.trim();
      if (newText !== "") {
        taskSpan.textContent = newText;
        li.replaceChild(taskSpan, input);
        btnGroup.replaceChild(editBtn, saveBtn);
        saveTasks();
      }
    });
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("action-btn", "delete-btn");
  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
  });
  const btnGroup = document.createElement("div");
  btnGroup.classList.add("btn-group");
  btnGroup.appendChild(doneBtn);
  btnGroup.appendChild(editBtn);
  btnGroup.appendChild(deleteBtn);

  li.appendChild(taskSpan);
  li.appendChild(btnGroup);
  taskList.appendChild(li);
}

// Save tasks to localStorage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach((li) => {
    const text = li.querySelector(".task-text")?.textContent || "";
    const completed =
      li.querySelector(".task-text")?.classList.contains("completed") || false;
    tasks.push({ text, completed });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/*add all clear button */
const clearAllBtn = document.getElementById("clearAllBtn");

clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    taskList.innerHTML = "";
    localStorage.removeItem("tasks");
  }
});

/*add dark mode */
const toggle = document.getElementById("darkModeToggle");
toggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
});
