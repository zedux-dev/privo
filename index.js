// importo i moduli necessari
const path =            require("path");
const http =            require("http");
const express =         require("express");
const socketio =        require("socket.io");
const formatMessage =   require("./utils/messages");
const { 
        userJoin, 
        getCurrentUser, 
        userLeave, 
        getRoomUsers 
      } =               require("./utils/users");

// inizializzo express, il server http e socket.io
const app =             express();
const server =          http.createServer(app);
const io =              socketio(server);

// variabili globali di configurazione
const PORT =            3000 || process.env.PORT; // porta di default 3000, altrimenti quella imposta dall'ambiente di sviluppo
const botName =         "Privo Bot"; // nome del bot che invia messaggi a tutti gli utenti

// imposto express per usare file statici nella cartella public (proteggendo quella node.js)
app.use(express.static(path.join(__dirname, "public")));

// stampo info utili a console
console.clear();
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
#  Server 1.0
#  
#  Davide Nadin
#  5CIA
#  24/01/2022
`);

// quando l'utente si connette...
io.on("connection", socket => {

    // se invia un messaggio...
    socket.on("chatMessage", (msg) => {
        // ottengo l'id utente
        const user = getCurrentUser(socket.id);

        // stampo il messaggio usando l'username scelto, nella stanza di appartenenza
        io.to(user.room).emit("message", formatMessage(`${user.username}`, msg));
    });

    // faccio entrare il client in una stanza col suo username
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        // sfrutto il concetto di socket join per creare le stanze
        socket.join(user.room);

        // faccio stampare al bot un messaggio di benvenuto all'utente entrato
        socket.emit("message", formatMessage(botName, "Benvenuto su Privo!"));

        // faccio stampare al bot un messaggio di avviso di entrata di un utente agli altri nella stanza
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} si è unito alla chat...`));

        // invio all'utente la lista degli utenti nella stanza
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // quando l'utente esce...
    socket.on("disconnect", () => {
        // disconnetto l'utente dalla stanza
        const user = userLeave(socket.id);

        // se è andato a buon fine...
        if(user) {
            // avviso tutti che l'utente si è disconnesso
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} ha abbandonato la chat...`));

            // aggiorno la lista utenti
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

// avvio il server web
server.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});