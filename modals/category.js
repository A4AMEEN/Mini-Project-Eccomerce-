const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a Product Schema
const categorySchema = new Schema({
    name:{type :String,
        required:true,
    },
    offer:{
        type :Number,
        default:0,
    },
});

// Create a Product model
const yCategory = mongoose.model('yCategory', categorySchema);

module.exports = {yCategory}