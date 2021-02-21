const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const Order = new Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true
  },
  cardId: {
    type: mongoose.ObjectId,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  menuItems: {},
  status: {
    type: String,
    enum: ['preparing', 'delivering', 'complete'],
    required: true
  },
  time: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Order', Order);