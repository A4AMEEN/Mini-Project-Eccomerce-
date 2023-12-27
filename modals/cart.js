const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'userDetails' 
        },
    
    Cart: {

    items:
    
    [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            productName:{
                type:String
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            price: {
                type: Number,
                required: true
            },
            stocks: {
                type: Number,
                required: true
            },
          
            images:[{
                    type:String
                }],
            totalAmount:{
                type:Number
                },
        }
    ]},
   
});
module.exports = Cart = mongoose.model('Cart', CartSchema);