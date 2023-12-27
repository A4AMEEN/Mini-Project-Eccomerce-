const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a Product Schema
const productSchema = new Schema({
    Brand: {
        type: Schema.Types.ObjectId,
        ref: 'zBrand',
    },
    Category:{
        type: Schema.Types.ObjectId,
        ref: 'yCategory',
    },
    name: { type : String,
        required: true,},

    price: {type : Number,
        required: true,},
        
    offer: {
        type : Number,
        
    }, 
    discount: {
        type : Number,
    },

    stocks:{
            type:Number,
            required:true,
        }, 
        quantity: {
            type: Number,
            default: 1,
            required: true,
        },

    brand:{type : String,
        required: true,},

    catagory:{type :String,
        required: true
    },

    images:[{
        type:String,
        required: true,
    }]
});

// Create a Product model
const Product = mongoose.model('Product', productSchema);

module.exports = {Product}
