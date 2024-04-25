// TASK: import helper functions from utils
// TASK: import initialData

import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/
//localStorage.clear();
// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}
initializeData();

// TASK: Get elements from the DOM

const elements = {
  // Navigation Sidebar elements
  sideBar: document.querySelector(".side-bar"),
  logo: document.getElementById("logo"),
  boardsNavLinks: document.getElementById("boards-nav-links-div"),
  darkThemeIcon: document.getElementById("icon-dark"),
  themeSwitch: document.getElementById("switch"),
  lightThemeIcon: document.getElementById("icon-light"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),

  // Header
  headerBoardName: document.getElementById("header-board-name"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),
  editBoardBtn: document.getElementById("edit-board-btn"),

  // Task Columns
  columnDivs: document.querySelectorAll(".column-div"),
  todoColumn: document.querySelector('.column-div[data-status="todo"]'),
  doingColumn: document.querySelector('.column-div[data-status="doing"]'),
  doneColumn: document.querySelector('.column-div[data-status="done"]'),
  filterDiv: document.getElementById("filterDiv"),

  // New Task Modal
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  selectStatus: document.getElementById("select-status"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  newTaskModal: document.getElementById("new-task-modal-window"),
  modalWindow: document.getElementById("new-task-modal-window"),

  // Edit Task Modal
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),

  // Filter
  filterDiv: document.getElementById("filterDiv"),
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      // Use 'addEventListener' to attach click event listener
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Corrected assignment syntax
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName); // Use strict equality operator '===' instead of assignment '='

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        // Use strict equality operator '===' instead of assignment '='
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          // Use 'addEventListener' instead of 'click' and remove '=>' arrow function
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(
    '.column-div[data-status="${task.status}"]'
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild();
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none"; // Fixed ternary operator syntax
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/
// Function to add a task
function addTask(event) {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Extract user input to create a task object
  const task = {
    title: document.getElementById("title-input").value, // Get title input value
    description: document.getElementById("desc-input").value, // Get description input value
    status: document.getElementById("select-status").value, // Get status input value
    board: activeBoard, // Assign active board to the task
  };

  // Create a new task object based on the extracted data
  const newTask = createNewTask(task);

  // If a new task is successfully created
  if (newTask) {
    // Add the new task to the UI
    addTaskToUI(newTask);

    // Close the modal dialog box
    toggleModal(false);

    // Update the board for the new task
    newTask.board = activeBoard;

    // Add the new task to the initial data array
    initialData.push(newTask);

    // Hide the filter overlay
    elements.filterDiv.style.display = "none";

    // Reset the form inputs
    event.target.reset();

    // Update local storage with the updated task data
    localStorage.setItem("tasks", JSON.stringify(initialData));

    // Refresh the UI to reflect the changes
    refreshTasksUI();
  }
}

// Function of sidebar
function toggleSidebar(show) {
  if (show) {
    // If the parameter 'show' is true:
    elements.sideBar.style.display = "flex"; // Display the sidebar by setting its CSS display property to "flex"
    elements.showSideBarBtn.style.display = "none"; // Hide the button that toggles the sidebar
  } else {
    // If the parameter 'show' is false:
    elements.sideBar.style.display = "none"; // Hide the sidebar by setting its CSS display property to "none"
    elements.showSideBarBtn.style.display = "block"; // Display the button that toggles the sidebar
  }
}
toggleSidebar(true);
// Function of toggleTheme
function toggleTheme() {
  // Toggle the 'light-theme' class on the body element
  document.body.classList.toggle("light-theme");

  // Save the theme preference to localStorage
  localStorage.setItem(
    "light-theme",
    document.body.classList.contains("light-theme") ? "enabled" : "disabled"
  );

  // Get the image element
  const logo = document.getElementById("logo");

  // Check if the body has the 'light-theme' class
  const isLightTheme = document.body.classList.contains("light-theme");

  // Update the src attribute of the image based on the theme
  if (isLightTheme) {
    logo.src = "./assets/logo-light.svg"; // Set the src for light theme
  } else {
    logo.src = "./assets/logo-dark.svg"; // Set the src for dark theme
  }
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");

  // Get button elements from the task modal
  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;

  // Call saveTaskChanges upon click of Save Changes button
  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  saveTaskChangesBtn.addEventListener("click", () => {
    saveTaskChanges(task.id);
    // No need to reload the page, just refresh the UI
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener("click", () => {
    deleteTask(task.id);
    // No need to reload the page, just refresh the UI
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  });

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

// Function to save changes to a task
function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = document.getElementById("edit-task-title-input").value;
  const updatedDescription = document.getElementById(
    "edit-task-desc-input"
  ).value;
  const updatedStatus = document.getElementById("edit-select-status").value;

  // Get the tasks from local storage
  let tasks = getTasks();

  // Check if a task with the same ID already exists
  const existingTaskIndex = tasks.findIndex((task) => task.id === taskId);

  if (existingTaskIndex !== -1) {
    // If the task already exists, update its properties
    tasks[existingTaskIndex].title = updatedTitle;
    tasks[existingTaskIndex].description = updatedDescription;
    tasks[existingTaskIndex].status = updatedStatus;
  } else {
    // If the task doesn't exist, create a new task object
    const newTask = {
      id: taskId,
      title: updatedTitle,
      description: updatedDescription,
      status: updatedStatus,
    };

    // Add the new task to the tasks array
    tasks.push(newTask);
  }

  // Save the updated tasks array back to local storage
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // Call putTask to update the task in your storage mechanism
  putTask(taskId, tasks[existingTaskIndex]);

  // Refresh the UI to reflect the changes
  refreshTasksUI();

  // Close the modal
  toggleModal(false, elements.editTaskModal);
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
