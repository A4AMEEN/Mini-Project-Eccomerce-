const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    pincode: {
        type: String,
        required: true
    }
});

const Address = mongoose.model('Address', addressSchema);


module.exports = Address;
