const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if(urlParams.get("username") === null && urlParams.get("room") === null) {
    window.location.href = "/";
}

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

socket.emit("joinRoom", { username, room });

socket.on("message", message => {
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", e => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    socket.emit("chatMessage", msg);

    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

function outputMessage(message) {
    const template = `
        <div class="message">
            <p class="meta">${message.username} - <span>${message.time}</span></p>

            <p class="text">${message.text}</p>
        </div>
    `;

    chatMessages.insertAdjacentHTML("beforeend", template);
}

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

function outputRoomName(room) {
    roomName.value = room;
}

function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li><p class="user">${user.username}</p></li>`).join("")}
    `;
}

document.getElementById('leave-btn').addEventListener('click', () => {
    Swal.fire({
        title: 'Sei sicuro?',
        text: "Perderai i messaggi presenti nella chat...",
        icon: 'question',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Si, esci'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/";
        }
    })

});

document.getElementById("copy").addEventListener("click", () => {
    let copyText = document.getElementById("room-name");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    document.getElementsByClassName("copy-popup")[0].style.opacity = 1;
    
    let inter = setInterval(() => {
        document.getElementsByClassName("copy-popup")[0].style.opacity = 0;
        clearInterval(inter);
    }, 2000);
});