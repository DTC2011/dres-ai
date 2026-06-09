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

/* ======================================
   DRES AI - BLOQUE 2
   Chat principal + IA
====================================== */

let isThinking = false;


/* ===== SUGERENCIAS ===== */

function useSuggestion(text) {

    const input = document.getElementById("chatInput");

    if (!input) return;

    input.value = text;
    input.focus();
}


/* ===== RENDER CHAT ===== */

function renderChat() {

    const chatBox = document.getElementById("chatBox");

    if (!chatBox) return;

    chatBox.innerHTML = "";

    if (chatHistory.length === 0) {

        chatBox.innerHTML = `
            <div class="ai-message welcome">
                👋 Hola. Soy DRES AI.<br><br>
                Estoy listo para ayudarte.
            </div>
        `;

        return;
    }

    chatHistory.forEach(msg => {

        const div = document.createElement("div");

        div.className =
            msg.role === "user"
                ? "user-message"
                : "ai-message";

        div.innerHTML = msg.content
            .replace(/\n/g, "<br>");

        chatBox.appendChild(div);

    });

    chatBox.scrollTop = chatBox.scrollHeight;
}


/* ===== ENVIAR MENSAJE ===== */

async function sendMessage() {

    if (isThinking) return;

    const input = document.getElementById("chatInput");

    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    isThinking = true;

    const sendBtn =
        document.getElementById("sendBtn");

    const typing =
        document.getElementById("typingIndicator");

    sendBtn.disabled = true;

    typing.classList.remove("hidden");


    /* Usuario */

    chatHistory.push({
        role: "user",
        content: message
    });

    totalMessages++;

    renderChat();

    input.value = "";


    try {

        const response = await fetch("/api/ai", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                prompt: message
            })

        });


        const data = await response.json();

        const reply =
            data.reply ||
            data.error ||
            "Sin respuesta";


        chatHistory.push({

            role: "assistant",

            content: reply

        });


    } catch (error) {

        console.error(error);

        chatHistory.push({

            role: "assistant",

            content:
                "❌ Ocurrió un error al contactar a DRES AI."

        });

    }


    saveData();

    renderChat();

    updateDashboard();


    typing.classList.add("hidden");

    sendBtn.disabled = false;

    isThinking = false;
}


/* ===== ENTER PARA ENVIAR ===== */

document.addEventListener(

    "keydown",

    function(e) {

        const input =
            document.getElementById("chatInput");

        if (!input) return;

        if (
            document.activeElement === input &&
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            sendMessage();

        }

    }

);


/* ===== RESTAURAR CHAT ===== */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        renderChat();

    }

);

/* ======================================
   DRES AI - BLOQUE 3
   Sistema de tareas GOD
====================================== */

/* ===== RENDER TAREAS ===== */

function renderTasks() {

    const container =
        document.getElementById("tasksList");

    if (!container) return;

    container.innerHTML = "";

    tasks.forEach((task, index) => {

        const card = document.createElement("div");

        card.className = "task-card";

        card.dataset.index = index;

        card.innerHTML = `
            <h3>${escapeHTML(task.title)}</h3>

            <p>${escapeHTML(task.description || "")}</p>

            <small>
                Estado:
                ${task.completed ? "✅ Completada" : "🕒 Pendiente"}
            </small>

            <div class="task-actions">

                <button onclick="askTaskAI(${index})">
                    🧠 Consultar IA
                </button>

                <button onclick="toggleTask(${index})">
                    ${task.completed ? "↩️ Reabrir" : "✅ Completar"}
                </button>

                <button onclick="deleteTask(${index})">
                    🗑️ Eliminar
                </button>

            </div>

            <div id="task-chat-${index}"></div>
        `;

        container.appendChild(card);

    });

}


/* ===== AGREGAR ===== */

function addTask() {

    const titleInput =
        document.getElementById("taskTitle");

    const descInput =
        document.getElementById("taskDescription");

    const title =
        titleInput.value.trim();

    const description =
        descInput.value.trim();

    if (!title) return;

    tasks.push({

        title,

        description,

        completed: false

    });

    titleInput.value = "";

    descInput.value = "";

    saveData();

    renderTasks();

    updateDashboard();

}


/* ===== COMPLETAR ===== */

function toggleTask(index) {

    tasks[index].completed =
        !tasks[index].completed;

    saveData();

    renderTasks();

    updateDashboard();

}


/* ===== ELIMINAR ===== */

function deleteTask(index) {

    const card =
        document.querySelector(
            `[data-index="${index}"]`
        );

    if (card) {

        card.style.transition =
            "all 0.4s ease";

        card.style.transform =
            "translateX(100%)";

        card.style.opacity = "0";

    }

    setTimeout(() => {

       tasks.splice(index, 1);

delete taskChats[index];

        saveData();

        renderTasks();

        updateDashboard();

    }, 400);

}


/* ===== CONSULTAR IA ===== */

async function askTaskAI(index) {

    const task = tasks[index];

    if (!task) return;

    const prompt = `
Título:
${task.title}

Descripción:
${task.description}

Explícame esta tarea de forma clara,
estructurada y breve.
`;

    try {

        const response =
            await fetch("/api/ai", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    prompt

                })

            });

        const data =
            await response.json();

        const reply =
            data.reply ||
            data.error ||
            "Sin respuesta";

        const chat =
            document.getElementById(
                `task-chat-${index}`
            );

        if (chat) {

            chat.innerHTML = `
                <div class="ai-message"
                     style="margin-top:15px;">
                    ${escapeHTML(reply)
                        .replace(/\n/g,"<br>")}
                </div>
            `;
        }

    } catch (error) {

        console.error(error);

    }

}


/* ===== SEGURIDAD HTML ===== */

function escapeHTML(text = "") {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ===== RESTAURAR ===== */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        renderTasks();

    }

);
