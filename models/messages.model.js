const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let MessagesSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    messages: []
});

module.exports = mongoose.model('Messages', MessagesSchema);
