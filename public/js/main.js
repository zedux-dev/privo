const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

console.log(`
#   /$$$$$$$           /$$                    
#  | $$__  $$         |__/                    
#  | $$  \\ $$ /$$$$$$  /$$ /$$    /$$ /$$$$$$ 
#  | $$$$$$$//$$__  $$| $$|  $$  /$$//$$__  $$
#  | $$____/| $$  \\__/| $$ \\  $$/$$/| $$  \\ $$
#  | $$     | $$      | $$  \\  $$$/ | $$  | $$
#  | $$     | $$      | $$   \\  $/  |  $$$$$$/
#  |__/     |__/      |__/    \\_/    \\______/ 
#  
#  Client 1.0
#  
#  Davide Nadin
#  5CIA
#  24/01/2022
`);

// ottengo username e codice stanza dai parametri (GET) dell'url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// se cerco di accedere alla pagina chat.html manualmente (bypassando il login) senza impostare username e stanza, mi reindirizza al login
if(urlParams.get("username") === null && urlParams.get("room") === null) {
    window.location.href = "/";
}

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


// inizializzo la connessione socket col server
const socket = io();

// emetto un evento socket per accedere ad una stanza scelta dall'utente, con l'username scelto
socket.emit("joinRoom", { username, room });

// ogni volta che spawno un messaggio viene spostato lo scroll dei messaggi verso il basso (nascondendo i messaggi vecchi)
socket.on("message", message => {
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// quando clicco invia messaggio, viene fatto scattare un evento socket sul server con il corpo inserito dall'utente
chatForm.addEventListener("submit", e => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    const sanit = msg.toString();

    socket.emit("chatMessage", sanit);

    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

// stampa la nuvoletta col messaggio (con utente e ora) nel pannello dei messaggi
function outputMessage(message) {
    const template = `
        <div class="message">
            <p class="meta">${message.username} - <span>${message.time}</span></p>

            <p class="text">${message.text}</p>
        </div>
    `;

    chatMessages.insertAdjacentHTML("beforeend", template);
}

// ricevo il segnale con le info necessario via socket dal server
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// mostro il nome della stanza in basso
function outputRoomName(room) {
    roomName.innerHTML = `<i class="fas fa-comments"></i>&nbsp; ${room}`;
}

// riempe la lista utenti con gli utenti della stanza
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join("")}
    `;
}

// quando clicco sul tasto esci riporta al login
document.getElementById('leave-btn').addEventListener('click', () => {
    window.location.href = "/";
});

// toggle per mostrare la lista utenti della stanza quando clicco sulla barra in alto
document.getElementsByClassName("users-handle")[0].addEventListener("click", () => {
    document.getElementsByClassName("users")[0].classList.toggle("hidden");
});