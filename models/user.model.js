const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'staff'],
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    aptsuite: {
      type: String
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zip: {
      type: Number,
      required: true
    }
});

module.exports = mongoose.model('User', UserSchema);