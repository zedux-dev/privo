/*

$$$$$$$\            $$\                      
$$  __$$\           \__|                     
$$ |  $$ | $$$$$$\  $$\ $$\    $$\  $$$$$$\  
$$$$$$$  |$$  __$$\ $$ |\$$\  $$  |$$  __$$\ 
$$  ____/ $$ |  \__|$$ | \$$\$$  / $$ /  $$ |
$$ |      $$ |      $$ |  \$$$  /  $$ |  $$ |
$$ |      $$ |      $$ |   \$  /   \$$$$$$  |
\__|      \__|      \__|    \_/     \______/ 

Coded by: Davide Nadin
License: MIT

Institute: J.F.Kennedy (Pordenone, IT)
Class: 5C_IA
Year: 2021/2022

*/

//////////////////////////////////////
//      GLOBAL CONFIG SECTION       //
//////////////////////////////////////

const version = "1.0.0";
const timeZone = "Europe/Rome";
const locale = "it-IT";

const port = 1717;

const db_host = "localhost";
const db_username = "root";
const db_password = "";
const db_database = "privo";

//////////////////////////////////////
//        UTILITIES SECTION         //
//////////////////////////////////////

console.clear();

class log {
  static now_datetime() {
    let stringInput = new Date();
    const dateObject = new Date(stringInput).toLocaleString(locale, { timeZone });

    return dateObject;
  }

  static error(message) {
    
    console.log("\x1b[31m%s", this.now_datetime() + " -> " + message);
  }
  
  static success(message) {
    console.log("\x1b[32m%s", this.now_datetime() + " -> " + message);
  }

  static warning(message) {
    console.log("\x1b[33m%s", this.now_datetime() + " -> " + message);
  }

  static info(message) {
    console.log("\x1b[35m%s", this.now_datetime() + " -> " + message);
  }

  static normal(message) {
    console.log("\x1b[37m%s", this.now_datetime() + " -> " + message);
  }

  static startup() {
    console.log("\x1b[35m%s%c", `$$$$$$$\\            $$\\                      
$$  __$$\\           \\__|                     
$$ |  $$ | $$$$$$\\  $$\\ $$\\    $$\\  $$$$$$\\  
$$$$$$$  |$$  __$$\\ $$ |\\$$\\  $$  |$$  __$$\\ 
$$  ____/ $$ |  \\__|$$ | \\$$\\$$  / $$ /  $$ |
$$ |      $$ |      $$ |  \\$$$  /  $$ |  $$ |
$$ |      $$ |      $$ |   \\$  /   \\$$$$$$  |
\\__|      \\__|      \\__|    \\_/     \\______/ `, "font-family: monospace");

    console.log("\x1b[33m\n%s", "Coded by: Davide Nadin");
    console.log("\x1b[33m%s", "Version: " + version);
    console.log("\x1b[33m%s", "--------------------------------");
    console.log();
  }
}

log.startup();

//////////////////////////////////////
//          IMPORT SECTION          //
//////////////////////////////////////

import express from 'express';
import path from 'path';
import * as Config from "./config.js";
import { Server } from "socket.io";
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { createConnection } from 'mysql';
import { DateTime } from 'luxon';

//////////////////////////////////////
//           AUTH SECTION           //
//////////////////////////////////////

const app = initializeApp(Config.firebaseConfig);
const auth = getAuth();

function login(email, password) {
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
      user = userCredential.user;

      io.emit("login-successful", user.uid);
    })
    .catch((error) => {
      io.emit("login-failed", error.message);
    });
}

//////////////////////////////////////
//         ROUTING SECTION          //
//////////////////////////////////////

const exp = express();
const __dirname = path.resolve();

exp.use(express.static('public'));

const srv = exp.listen(port, () => {
  log.success(`Privo server now active on port: ` + port);
});

exp.get('/', (req, res) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      res.sendFile(path.join(__dirname + '/public/app.html'));
    } else {
      res.sendFile(path.join(__dirname + '/public/login.html'));
    }
  });
});

//////////////////////////////////////
//           DATABASE PART          //
//////////////////////////////////////

let con = createConnection({
  host: db_host,
  user: db_username,
  password: db_password,
  database: db_database
});

con.connect(function(err) {
  if (err) {
    log.error(err);
  };
  
  log.success("Database successfully connected");
});

//////////////////////////////////////
//           SOCKET PART            //
//////////////////////////////////////

const io = new Server(srv);

io.on("connection", function (socket) {
  socket.on("login", function (email, password) {
    
  });

  socket.on("load-active-chats", function (id_member) {
    load_active_chats(id_member);
  });

  socket.on("send-message", function (id_chat, id_member, message_body) {
    send_message(id_chat, id_member, message_body);
  });

  socket.on("load-chat-messages", function (id_chat) {
    load_all_chat_messages(id_chat);
  });

  socket.on("read-chat-messages", function (id_chat, id_member) {
    read_all_chat_messages(id_chat, id_member);
  });

  socket.on("load-last-chat-message", function (id_chat) {
    load_last_chat_message(id_chat);
  });

  socket.on("disconnect", () => {
    io.emit("user disconnected", socket.userId);
  });
});

//////////////////////////////////////
//       CHAT MANAGEMENT PART       //
//////////////////////////////////////

function load_active_chats(id_member) {
  con.query("SELECT DISTINCT members.name, members.surname, members.profile_pic_url, partecipants.id_chat, chats.E2EE_hashed_key FROM chats, partecipants, members WHERE members.uid_members <> '" + id_member + "' AND members.uid_members = partecipants.id_members AND partecipants.id_chat IN (SELECT DISTINCT chats.id_chat FROM chats, members, partecipants WHERE chats.id_chat = partecipants.id_chat AND partecipants.id_members = '" + id_member + "') AND partecipants.id_chat = chats.id_chat;", function (err, active_chats_list, fields) {
    if(err) {
      log.error(err);
    } else {
      io.emit("get_active_chats", active_chats_list);
    }
  });
}

function send_message(id_chat, id_member, message_body) {
  con.query("INSERT INTO messages (messages.id_member, messages.id_chat, messages.status, messages.body, messages.time) VALUES ('" + id_member + "', " + id_chat +", 1, '" + message_body + "', (SELECT NOW()));", function (err, fields) {
    if(err) {
      log.error(err);
    } else {
      load_all_chat_messages(id_chat);
    }
  });
}

function load_last_chat_message(id_chat) {
  con.query("SELECT * FROM messages WHERE messages.id_message = (SELECT MAX(messages.id_message) FROM messages WHERE messages.id_chat = " + id_chat + ");", function (err, last_chat_message, fields) {
    if(err) {
      log.error(err);
    } else {
      io.emit("get_last_chat_message", last_chat_message);
    }
  });
}

function read_all_chat_messages(id_chat, id_member) {
  con.query("UPDATE messages SET messages.status = 2 WHERE messages.id_chat = " + id_chat + " AND messages.id_member = (SELECT DISTINCT members.uid_members FROM members, partecipants, chats WHERE partecipants.id_chat = " + id_chat + " AND partecipants.id_members = members.uid_members AND partecipants.id_members <> '" + id_member + "');", function (err, fields) {
    if(err) {
      log.error(err);
    }
  });
}

function load_all_chat_messages(id_chat) {
  con.query("SELECT DISTINCT * FROM messages WHERE messages.id_chat = " + id_chat + ";", function (err, chat_messages_list, fields) {
    if(err) {
      log.error(err);
    } else {
      io.emit("get_all_chat_messages", chat_messages_list);
    }
  });
}

//test