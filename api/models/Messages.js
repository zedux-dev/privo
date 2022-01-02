/**
 * Messages.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    
    sender: {
      model: "user"
    },

    receiver: {
      model: "user"
    },

    read: {
      type: "boolean"
    },

    body: {
      type: "string"
    },

  },

};

