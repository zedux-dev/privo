var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};

function encrypt(message, key) {
    return CryptoJS.AES.encrypt(message, key).toString();
}
  
function decrypt(message, key) {
    return CryptoJS.AES.decrypt(message, key).toString(
        CryptoJS.enc.Utf8
    );
}

function generateHistory(history) {
    let keychain = JSON.parse(localStorage.getItem('keychain'));

    document.getElementById("messages-history").innerHTML = "";

    let history_last_date = "";

    for(message of history) {
        let temp = niceDate(sqlToJsDate(message.time));

        if(history_last_date != temp) {
            history_last_date = temp;

            generateDateBlock(temp);
        }

        for(key of keychain) {
            if(key.id === message.id_chat) {
                generateMessage(message.body, message.time, message.status, message.id_member, key.key);
            }
        }
    }

    chatScrollDown();
}

function generateDateBlock(date) {
    let code = `
        <p class="date-block">` + date + `</p>
    `;

    document.getElementById("messages-history").insertAdjacentHTML("beforeend", code);
}

function generateMessage(body, date, status, member, chat_key) {
    let code = `<div class="message container">`;
    body = decrypt(body, chat_key);
    let status_icon = "";
    let time = sqlToJsTime(date);
    let ucolor = "#cacaca";
    time = time[0] + ":" + time[1];

    if(member === localStorage.getItem("uid")) {
        code = `<div class="message own container">`;

        ucolor = "#9dd394";

        if(status == 1) {
            status_icon = `<i style="font-size: 14px; color: #9dd394; margin-right: 10px;" class="status-icon fas fa-check"></i>`;
        } else {
            status_icon = `<i style="font-size: 14px; color: #3390eb; margin-right: 10px;" class="status-icon fas fa-check-double"></i>`;
        }
    } else {
        status_icon = "";
    }

    code += `
            <div class="row">
                <div class="col">
                    <p style="color: black;">` + body + `</p>
                </div>
            </div>

            <div class="row" style="margin-top: -2px;">
                <div class="col"></div>
                <div class="col-3" style="display: flex; justify-content: center; align-items: center;">
                    <p style="font-size: 14px; color: ` + ucolor + `; margin-right: 5px;">` + time + `</p>
                    ` + status_icon + `
                </div>
            </div>
        </div>
    `;

    document.getElementById("messages-history").insertAdjacentHTML("beforeend", code);
}

function generateChats(chats, messages) {
    document.getElementById("chats-list").innerHTML = "";

    if(chats.length == 0) {
        lonelyFriend();
    }
    
    for(chat of chats) {
        let msgs = [];
        
        for(message of messages) {
            if(message.id_chat == chat.id_chat) {
                msgs.push(message);
            }
        }


        if(localStorage.getItem("keychain") != null) {
            for(key of JSON.parse(localStorage.getItem('keychain'))) {
                if(key.id === chat.id_chat) {
                    if(CryptoJS.MD5(key.key) != chat.E2EE_hashed_key) {
                        console.error("Error: invalid E2EE key, please recover it with a backup.");

                        lonelyFriend();
                    } else {
                        let body = decrypt(msgs[msgs.length - 1].body, key.key);
                        let = send_td = "";

                        let date = sqlToJsDate(message.time);
                        let time = sqlToJsTime(message.time);

                        let today = todayDate();

                        if(dateDifference(today, date[1] + "/" + date[2] + "/" + date[0]) == 0) {
                            send_td = time[0] + ":" + time[1];
                        } else {
                            send_td = niceDate(date);
                        }

                        let code = `
                            <div onmouseover="hover(this);" onmouseleave="unhover(this);" onclick="selectChat(this);" style="margin: 10px 0; background-color: white; border-radius: 10px; padding: 12px 18px;" class="container-fluid chat" data-chatid="` + chat.id_chat + `" >
                                <div class="row">
                                    <div class="col" style="max-width: 65px; margin-right: 10px;">
                                        <div style="background-image: url(` + chat.profile_pic_url + `); background-repeat: no-repeat; background-position: center; background-size: cover; border-radius: 100%; width: 60px; height: 60px;"></div>
                                    </div>
                
                                    <div class="col" style="display: flex; flex-direction: column; justify-content: center;">
                                        <div class="row" style="margin-bottom: 5px; height: 25px;">
                                            <div class="col-8">
                                                <p class="black-p" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 17px; font-weight: 500;">` + chat.name + ` ` + chat.surname + `</p>
                                            </div>
                                
                                            <div class="col">
                                                <p class="black-p" style="opacity: 0.3; text-align: right;">` + send_td + `</p>
                                            </div>
                                        </div>
                                
                                        <div class="row">
                                            <div class="col" style="width: 70px;">
                                                <p class="grey-p" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 16px; color: #9a9a9a;">` + body + `</p>
                                            </div>
                
                                            <div class="col" style="max-width: 90px; display: flex; justify-content: flex-end;">
                                                <p class="mess-count white-p" style="display: none;">1</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                
                        document.getElementById("chats-list").insertAdjacentHTML("beforeend", code);

                        if(chat.id_chat == selectedChat) {
                            let chats = document.getElementById("chats-list").getElementsByClassName("chat");
                            selectChat(chats[chats.length - 1]);
                        }
                    }
                }
            }
        } else {
            console.error("Error: invalid E2EE key, please recover it with a backup.");

            lonelyFriend();
        }
    }
}

function generateInfo() {
    
}

function lonelyFriend() {
    document.getElementById("chats-list").innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <div style="width: 150px; height: 150px; opacity: 0.2; background-image: url(images/desert.png); background-size: cover; background-repeat: no-repeat; background-position: center;"></div>
            <p style="font-size: 20px; opacity: 0.2;">Oh snap! Looks like you don't have any chat active...</p>
        </div>
    `;
}

function sendMessage(message, chat_id) {
    if(message != "") {
        for(key of JSON.parse(localStorage.getItem("keychain"))) {
            if(key.id === chat_id) {
                let body_cr = encrypt(message, key.key);
    
                socket.emit("send-message", localStorage.getItem("uid"), chat_id, body_cr);
    
                document.getElementById("body-editor").value = "";
    
                socket.emit("loadChats");
    
                chatScrollDown();
            }
        }
    }
}