const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const Order = new Schema({
    userId: {
      type: ObjectId,
      required: true
    },
    menuItems: []
});

module.exports = mongoose.model('Order', Order);