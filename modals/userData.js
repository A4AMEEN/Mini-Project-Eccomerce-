const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const userSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    wallet: {
        type: Number,
        default: 0,
    },
    referralCode: {
        type: String,
        unique: true,
    },
    transactions: [
        {
            type: {
                type: String,
                enum: ['debit', 'credit']
            },
            amount: Number,
            description: String,
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
});


const Usercollection = mongoose.model('userDetails', userSchema);



module.exports = {Usercollection}