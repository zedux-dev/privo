/**
 * ChaboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const MessagesController = require("./MessagesController");

module.exports = {
  
    getChatboard: async function (req, res) {
        var userMessages = MessagesController.getUserMessages(req, res);

        res.view("pages/chatboard/chatboard");
    }
};