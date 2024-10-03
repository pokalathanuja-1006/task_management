let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let showingPending = true;

document.addEventListener("DOMContentLoaded", () => {
  let name = localStorage.getItem("name");
  if (!name) {
    Swal.fire({
      title: "Enter your name:",
      input: "text",
      inputPlaceholder: "Your name",
      showCancelButton: true,
      confirmButtonText: "OK",
    }).then((result) => {
      if (result.isConfirmed) {
        name = result.value;
        localStorage.setItem("name", name);
        document.getElementById("greeting").innerText = `Hello, ${name}!`;
      }
    });
  } else {
    document.getElementById("greeting").innerText = `Hello, ${name}!`;
  }

  renderTasks(true);
  updateProgress();

  document.getElementById("task-form").addEventListener("submit", addTask);
  document.getElementById("name-form").addEventListener("submit", updateName);
  document
    .getElementById("toggle-theme")
    .addEventListener("click", toggleTheme);

  document
    .getElementById("view-pending")
    .addEventListener("click", () => renderTasks(true));
  document
    .getElementById("view-completed")
    .addEventListener("click", () => renderTasks(false));
});

function renderTasks(showPending) {
  showingPending = showPending;
  const taskTable = document.getElementById("task-table");
  taskTable.innerHTML = "";

  const filteredTasks = tasks.filter(
    (task) => task.completed !== showingPending
  );

  filteredTasks.forEach((task) => {
    let statusText = task.completed
      ? "Completed"
      : `Pending (${task.progress}%)`;

    taskTable.innerHTML += `
            <tr>
                <td><input type="text" id="task-${task.id}" value="${
      task.name
    }" readonly></td>
                <td>
                    <input type="checkbox" id="checkbox-${
                      task.id
                    }" onchange="toggleTaskStatus(${task.id})" ${
      task.completed ? "checked" : ""
    }>
                    <input type="range" min="0" max="100" value="${
                      task.progress
                    }" class="progress-range" onchange="updateTaskProgress(${
      task.id
    }, this.value)" disabled>
                    <span>${statusText}</span>
                </td>
                <td>
                    <div class="d-flex">
                      <button onclick="editTask(${
                        task.id
                      })" class="btn btn-secondary me-3">Edit</button>
                      <button onclick="saveTask(${
                        task.id
                      })" class="btn btn-success me-3">Save</button>
                      <button onclick="confirmDeleteTask(${
                        task.id
                      })" class="btn btn-danger">Delete</button>
                    </div>
                </td>
            </tr>`;
  });
}

function editTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);

  Swal.fire({
    title: "Edit Task",
    html: `
      <input type="text" id="swal-task-name" class="swal2-input" value="${task.name}">
      <input type="range" id="swal-task-progress" min="0" max="100" value="${task.progress}">
      <span>Progress: <span id="swal-progress-value">${task.progress}%</span></span>
    `,
    showCancelButton: true,
    confirmButtonText: "Save",
    preConfirm: () => {
      const updatedName = document.getElementById("swal-task-name").value;
      const updatedProgress =
        document.getElementById("swal-task-progress").value;
      return { updatedName, updatedProgress };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const { updatedName, updatedProgress } = result.value;

      task.name = updatedName;
      task.progress = updatedProgress;
      task.completed = updatedProgress == 100;

      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks(showingPending);
      updateProgress();
    }
  });

  const swalProgress = document.getElementById("swal-task-progress");
  if (swalProgress) {
    swalProgress.addEventListener("input", function () {
      document.getElementById(
        "swal-progress-value"
      ).innerText = `${this.value}%`;
    });
  }
}

function saveTask(taskId) {
  Swal.fire({
    title: "Do you want to save the changes?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Save",
    denyButtonText: `Don't save`,
  }).then((result) => {
    if (result.isConfirmed) {
      const task = tasks.find((t) => t.id === taskId);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks(showingPending);
      updateProgress();

      Swal.fire("Saved!", "Your task has been saved.", "success");
    } else if (result.isDenied) {
      Swal.fire("Changes are not saved", "", "info");
    }
  });
}

function confirmDeleteTask(taskId) {
  Swal.fire({
    title: "Are you sure you want to delete this task?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Delete",
    denyButtonText: `Don't delete`,
  }).then((result) => {
    if (result.isConfirmed) {
      deleteTask(taskId);
      Swal.fire("Deleted!", "Your task has been deleted.", "success");
    } else if (result.isDenied) {
      Swal.fire("Your task is safe!", "", "info");
    }
  });
}

function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks(showingPending);
  updateProgress();
}

function addTask(e) {
  e.preventDefault();
  const taskName = document.getElementById("task-name").value;
  if (taskName) {
    const task = {
      id: Date.now(),
      name: taskName,
      completed: false,
      progress: 0,
    };
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    document.getElementById("task-form").reset();
    renderTasks(showingPending);
    updateProgress();
  } else {
    Swal.fire("Error", "Task name cannot be empty", "error");
  }
}

function toggleTaskStatus(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  task.completed = !task.completed;
  task.progress = task.completed ? 100 : task.progress;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks(showingPending);
  updateProgress();
}

function updateTaskProgress(taskId, progressValue) {
  const task = tasks.find((t) => t.id === taskId);
  task.progress = progressValue;
  task.completed = progressValue == 100;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks(showingPending);
  updateProgress();
}

function updateProgress() {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  document.getElementById("progress-bar").style.width = `${progressPercent}%`;
}

function updateName(e) {
  e.preventDefault();
  const newName = document.getElementById("user-name").value;
  if (newName) {
    localStorage.setItem("name", newName);
    document.getElementById("greeting").innerText = `Hello, ${newName}!`;
    document.getElementById("name-form").reset();
  } else {
    Swal.fire("Error", "Name cannot be empty", "error");
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}
