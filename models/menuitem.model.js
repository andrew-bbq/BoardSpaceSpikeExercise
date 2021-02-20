const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const MenuItem = new Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: mongoose.Decimal128,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    image: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('MenuItem', MenuItem);