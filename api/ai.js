<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>DRES AI</title>

<style>
body{margin:0;font-family:'Segoe UI';background:#0f172a;color:white}
header{background:linear-gradient(90deg,#6366f1,#22c55e);padding:15px;text-align:center}
nav{display:flex;justify-content:center;gap:10px;margin:10px}
button{padding:10px;border:none;border-radius:10px;background:#6366f1;color:white;cursor:pointer}
button:hover{background:#4f46e5}
.container{padding:20px}
input,select{padding:10px;border-radius:8px;border:none;margin:5px}
.card{background:#1e293b;padding:15px;border-radius:15px;margin:10px;transition:.3s}
.card:hover{transform:scale(1.03)}
.high{border-left:5px solid red}
.medium{border-left:5px solid orange}
.low{border-left:5px solid green}
.done{opacity:0.5;text-decoration:line-through}
.hidden{display:none}
.chat{background:#334155;padding:8px;border-radius:8px;margin:5px}
.user{background:#6366f1}
</style>
</head>

<body>

<header>DRES AI</header>

<nav>
<button onclick="show('tasks')">📚 Tareas</button>
<button onclick="show('board')">🧠 Pizarrón</button>
<button onclick="show('chat')">💬 IA</button>
</nav>

<div id="tasks" class="container">
<input id="taskInput" placeholder="Nueva tarea">
<input id="descInput" placeholder="Descripción">

<select id="subject">
<option>Matemáticas</option>
<option>Física</option>
<option>Química</option>
<option>Informática</option>
<option>Historia</option>
</select>

<select id="priority">
<option value="high">Alta</option>
<option value="medium">Media</option>
<option value="low">Baja</option>
</select>

<button onclick="addTask()">Agregar</button>
<div id="taskList"></div>
</div>

<div id="board" class="container hidden">
<button onclick="render()">Todas</button>
<button onclick="filter('Matemáticas')">Mate</button>
<button onclick="filter('Física')">Física</button>
<div id="boardList"></div>
</div>

<div id="chat" class="container hidden">
<input id="chatInput">
<button onclick="send()">Enviar</button>
<div id="chatBox"></div>
</div>

<script>
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function save(){localStorage.setItem("tasks",JSON.stringify(tasks))}

function show(id){
["tasks","board","chat"].forEach(s=>document.getElementById(s).classList.add("hidden"));
document.getElementById(id).classList.remove("hidden");
}

function addTask(){
let text=taskInput.value;
let desc=descInput.value;
let subject=subject.value;
let priority=priority.value;

if(!text)return;

tasks.push({text,desc,subject,priority,done:false});
taskInput.value="";descInput.value="";
save();render();
}

function render(filter=null){
taskList.innerHTML="";
boardList.innerHTML="";

tasks.forEach((t,i)=>{

if(filter && t.subject!==filter) return;

function card(){
let c=document.createElement("div");
c.className="card "+t.priority+(t.done?" done":"");

c.innerHTML=`<b>${t.text}</b><br><small>${t.desc||""}</small><br>${t.subject}<br>`;

let b1=document.createElement("button");
b1.textContent="🧠 IA";
b1.onclick=()=>aiTask(i);

let b2=document.createElement("button");
b2.textContent="✅";
b2.onclick=()=>toggle(i);

c.appendChild(b1);
c.appendChild(b2);

return c;
}

taskList.appendChild(card());
boardList.appendChild(card());

});
}

function filter(sub){render(sub)}

function toggle(i){
tasks[i].done=!tasks[i].done;
save();render();
}

async function aiTask(i){
let t=tasks[i];

let res=await fetch("/api/ai",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({prompt:`Explica paso a paso: ${t.text} ${t.desc}`})
});

let data=await res.json();
alert(data.reply);
}

async function send(){
let msg=chatInput.value;
if(!msg)return;

chatBox.innerHTML+=`<div class="chat user">🧑 ${msg}</div>`;

let res=await fetch("/api/ai",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({prompt:msg})
});

let data=await res.json();

chatBox.innerHTML+=`<div class="chat">🤖 ${data.reply}</div>`;
chatInput.value="";
chatBox.scrollTop = chatBox.scrollHeight;
}

render();
</script>

</body>
</html>