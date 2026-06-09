/* ======================================
   DRES AI - BLOQUE 1
   Estado + Navegación + Persistencia
====================================== */

/* ===== ESTADO GLOBAL ===== */

let tasks = JSON.parse(localStorage.getItem("dres_tasks")) || [];

let chatHistory = JSON.parse(localStorage.getItem("dres_chat")) || [];

let taskChats = JSON.parse(localStorage.getItem("dres_task_chats")) || {};

let totalMessages =
    parseInt(localStorage.getItem("dres_total_messages")) || 0;


/* ===== GUARDADO ===== */

function saveData() {

    localStorage.setItem(
        "dres_tasks",
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        "dres_chat",
        JSON.stringify(chatHistory)
    );

    localStorage.setItem(
        "dres_task_chats",
        JSON.stringify(taskChats)
    );

    localStorage.setItem(
        "dres_total_messages",
        totalMessages
    );
}


/* ===== NAVEGACIÓN ===== */

function showSection(section) {

    document
        .querySelectorAll(".section")
        .forEach(sec => sec.classList.add("hidden"));

    document
        .querySelectorAll(".nav-btn")
        .forEach(btn => btn.classList.remove("active"));

    document
        .getElementById(section + "-section")
        .classList.remove("hidden");

    const navButtons = document.querySelectorAll(".nav-btn");

    if (section === "chat") {
        navButtons[0].classList.add("active");
    }

    if (section === "tasks") {
        navButtons[1].classList.add("active");
    }

    if (section === "dashboard") {
        navButtons[2].classList.add("active");
    }

    updateDashboard();
}


/* ===== DASHBOARD ===== */

function updateDashboard() {

    const totalTasksElement =
        document.getElementById("totalTasks");

    const completedTasksElement =
        document.getElementById("completedTasks");

    const chatCountElement =
        document.getElementById("chatCount");

    if (totalTasksElement) {

        totalTasksElement.textContent =
            tasks.length;
    }

    if (completedTasksElement) {

        const completed =
            tasks.filter(t => t.completed).length;

        completedTasksElement.textContent =
            completed;
    }

    if (chatCountElement) {

        chatCountElement.textContent =
            totalMessages;
    }
}


/* ===== BIENVENIDA ===== */

function initializeApp() {

    showSection("chat");

    updateDashboard();

    console.log("🤖 DRES AI iniciado");

}


/* ===== INICIO ===== */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
