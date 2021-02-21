const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const CreditCard = new Schema({
    userId: {
      type: mongoose.ObjectId,
      required: true
    },
    cardNumber: {
        type: Number,
        required: true
    },
    ccv: {
        type: Number,
        required: true,
    },
    expirationMonth: {
        type: Number,
        required: true
    },
    expirationYear: {
        type: Number,
        required: true
    },
    holderName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('CreditCard', CreditCard);