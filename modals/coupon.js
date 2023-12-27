const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const couponSchema = new Schema({
  code: { type: String, required: true, unique: true }, // Unique coupon code
  active: { type: Boolean, default: true },
  offer :{
    type : Number,
    default : 0
  }, // Whether the coupon is currently active
  discription:{
    type : String,
  },
  amount:{
    type : Number,
    default : 0
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
