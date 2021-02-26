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
  priority: {
    type: Number,
    default: 1
  },
  time: {
    type: Date,
    required: true
  },
  pickup: {
    type: Boolean,
    required: true
  },
  timetopickup: {
    type: Number,
    required: true,
    default: 15
  },
  car: {
    type: String
  }
});

module.exports = mongoose.model('Order', Order);