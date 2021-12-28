var socket = io();

var selectedChat = -1;

socket.emit("loadChats");

socket.on("getChats", (chats, messages) => {
  generateChats(chats, messages);
});

socket.on("getHistory", (history) => {
  generateHistory(history);
});

function niceDate(data) {
    let today = todayDate().split("/");

    let finalDate = "";

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    // if the year is the same of today date...
    if(data[0] == today[2]) {
        // if month and day are the same of today date...
        if(data[2] == today[1] && data[1] == today[0]) {
            finalDate = "Today";

        // if month and day are the same of yesterday date (today - 1 day)...
        } else if(data[2] == (today[1] - 1) && data[1] == today[0]) {
            finalDate = "Yesterday";
        } else {
            finalDate = today[1] + " " + months[parseInt(today[0]) - 1];
        }
    } else {
        finalDate = today[1] + " " + months[parseInt(today[0]) - 1] + " " + today[2];
    }

    return finalDate;
}

function sqlToJsTime(message) {
    let time = message.split("T")[1];
    time = time.substring(0, time.length - 8);
    return time.split(":");
}

function sqlToJsDate(message) {
    let date = message.split("T")[0];
    return date.split("-");
}

function todayDate() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    return today;
}

function dateDifference(date1, date2) {
    const date_today = new Date(date1);
    const date_send = new Date(date2);

    const diffTime = Math.abs(date_today - date_send);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    return diffDays;
}

function selectChat(chat) {
    selectedChat = parseInt(chat.dataset.chatid);

    socket.emit('readAll', localStorage.getItem("uid"), chat.dataset.chatid);
    document.getElementById("chat-editor").innerHTML = `<input type="text" class="form-control" id="body-editor" placeholder="Message..."><button class="btn btn-primary" id="send-btn" onclick="sendMessage(document.getElementById('body-editor').value, ` + chat.dataset.chatid + `);"><i style="color: #2072e6; font-size: 20px;" class="fas fa-paper-plane"></i></button>`;

    let chat_list = document.getElementsByClassName("chat");
    let black_p_list = document.getElementsByClassName("black-p");
    let grey_p_list = document.getElementsByClassName("grey-p");

    chat.getElementsByClassName("mess-count")[0].style.display = "none";

    for(const chat of chat_list) {
        chat.style.backgroundColor = "white";
    }

    for(const black_p of black_p_list) {
        black_p.style.color = "black";
    }

    for(const grey_p of grey_p_list) {
        grey_p.style.color = "#9a9a9a";
    }

    chat.style.backgroundColor = "#1c74fc";

    for(const black_p of chat.getElementsByClassName("black-p")) {
        black_p.style.color = "white";
    }

    for(const grey_p of chat.getElementsByClassName("grey-p")) {
        grey_p.style.color = "#efefef";
    }

    generateInfo();
}


// Chat block hover & unhover styling
////////////////////
function hover(select) {
    if(select.style.backgroundColor != "rgb(28, 116, 252)") {
        select.style.backgroundColor = "#e9e9e9";
    }
}

function unhover(select) {
    if(select.style.backgroundColor != "rgb(28, 116, 252)") {
        select.style.backgroundColor = "white";
    }
}

function chatScrollDown() {
    document.getElementById("messages-history").scrollTo(0, document.getElementById("messages-history").scrollHeight);
}