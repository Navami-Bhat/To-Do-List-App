const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const dueDateInput = document.getElementById("dueDate");

const addTaskBtn = document.getElementById("addTask");

const searchInput = document.getElementById("searchInput");
const sortTasks = document.getElementById("sortTasks");

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completionRate = document.getElementById("completionRate");

const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";

const filters = document.querySelectorAll(".filter");

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const rate =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    completionRate.textContent = `${rate}%`;
}

function getPriorityWeight(priority) {

    switch(priority){

        case "High":
            return 3;

        case "Medium":
            return 2;

        case "Low":
            return 1;

        default:
            return 0;
    }
}

function renderTasks() {

    let filtered = [...tasks];

    const searchTerm =
        searchInput.value.toLowerCase();

    filtered = filtered.filter(task =>
        task.text.toLowerCase().includes(searchTerm)
    );

    if(currentFilter === "active"){
        filtered =
        filtered.filter(task => !task.completed);
    }

    if(currentFilter === "completed"){
        filtered =
        filtered.filter(task => task.completed);
    }

    if(sortTasks.value === "oldest"){
        filtered.sort(
            (a,b) => a.createdAt - b.createdAt
        );
    }

    if(sortTasks.value === "newest"){
        filtered.sort(
            (a,b) => b.createdAt - a.createdAt
        );
    }

    if(sortTasks.value === "priority"){
        filtered.sort(
            (a,b) =>
            getPriorityWeight(b.priority) -
            getPriorityWeight(a.priority)
        );
    }

    taskList.innerHTML = "";

    if(filtered.length === 0){

        taskList.innerHTML = `
        <div class="empty-state">
            <h3>No tasks found</h3>
            <p>Create a task to get started.</p>
        </div>
        `;

        updateStats();
        return;
    }

    filtered.forEach(task => {

        const li = document.createElement("li");

        li.classList.add("task");

        li.innerHTML = `
            <input
                type="checkbox"
                ${task.completed ? "checked" : ""}
            >

            <div class="task-name ${
                task.completed ? "completed" : ""
            }">
                ${task.text}
            </div>

            <div class="priority ${task.priority.toLowerCase()}">
                ${task.priority}
            </div>

            <div class="category">
                ${task.category}
            </div>

            <div>
                ${task.dueDate || "-"}
            </div>

            <div class="actions">

                <button class="edit-btn">
                    Edit
                </button>

                <button class="delete-btn">
                    Delete
                </button>

            </div>
        `;

        const checkbox =
            li.querySelector("input");

        checkbox.addEventListener("change", () => {

            task.completed =
                !task.completed;

            saveTasks();
            renderTasks();
        });

        li.querySelector(".delete-btn")
        .addEventListener("click", () => {

            const confirmDelete =
                confirm(
                    "Delete this task?"
                );

            if(!confirmDelete) return;

            tasks = tasks.filter(
                t => t.id !== task.id
            );

            saveTasks();
            renderTasks();
        });

        li.querySelector(".edit-btn")
        .addEventListener("click", () => {

            const newText =
                prompt(
                    "Edit Task",
                    task.text
                );

            if(
                newText &&
                newText.trim()
            ){

                task.text =
                    newText.trim();

                saveTasks();
                renderTasks();
            }
        });

        taskList.appendChild(li);
    });

    updateStats();
}

function addTask() {

    const text =
        taskInput.value.trim();

    if(!text){

        alert(
            "Please enter a task."
        );

        return;
    }

    tasks.push({

        id: Date.now(),

        text,

        priority:
            priorityInput.value,

        category:
            categoryInput.value,

        dueDate:
            dueDateInput.value,

        completed: false,

        createdAt: Date.now()
    });

    saveTasks();

    taskInput.value = "";
    dueDateInput.value = "";

    renderTasks();
}

addTaskBtn.addEventListener(
    "click",
    addTask
);

taskInput.addEventListener(
    "keydown",
    e => {

        if(e.key === "Enter"){
            addTask();
        }
    }
);

searchInput.addEventListener(
    "input",
    renderTasks
);

sortTasks.addEventListener(
    "change",
    renderTasks
);

filters.forEach(btn => {

    btn.addEventListener(
        "click",
        () => {

            filters.forEach(
                item =>
                item.classList.remove("active")
            );

            btn.classList.add("active");

            currentFilter =
                btn.dataset.filter;

            renderTasks();
        }
    );
});

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

        const isDark =
            document.body.classList.contains(
                "dark"
            );

        localStorage.setItem(
            "theme",
            isDark ? "dark" : "light"
        );

        themeToggle.textContent =
            isDark ? "☀️" : "🌙";
    }
);

function loadTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if(savedTheme === "dark"){

        document.body.classList.add(
            "dark"
        );

        themeToggle.textContent =
            "☀️";
    }
}

loadTheme();
renderTasks();