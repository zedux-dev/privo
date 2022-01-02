/**
 * MessagesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    createMessage: function(req, res) {
        var sender = req.param("sender");
        var receiver = req.param("receiver");
        var body = req.param("body"); 

        Messages.create({
            sender: sender.toString(),
            receiver: receiver.toString(),
            read: false,
            body: body
        }).then(function(response) {
            res.send("done");
        });
    },

    getMessagesSent: function(req, res) {
        var user = req.param("user");

        Messages.find({ sender: user.toString() }).exec(function(err, messages) {
            if(err) {
                res.send(500, "Internal Error");
            }

            res.send(messages);
        });
    },

    getMessagesReceived: function(req, res) {
        var user = req.param("user");

        Messages.find({ receiver: user.toString() }).exec(function(err, messages) {
            if(err) {
                res.send(500, "Internal Error");
            }

            res.send(messages);
        });
    },

    getUsers: function(req, res) {
        User.find({}).exec(function(err, users) {
            if(err) {
                res.send(500, "Internal Error");
            }

            res.send(users);
        });
    },

    getUserMessages: async function(req, res) {
        var user_id = req.session.userId.toString();

        User.find({id: user_id}).populate("messagesSent").populate("messagesReceived").exec(function (err, users) {
            return 8
        });

    },

};

