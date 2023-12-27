const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'userDetails' },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    quantity: Number,
    price: Number,
    images: [String],
    deliveryStatus: { type: String, default: "Pending" }, // Add the deliveryStatus field here
  }],
  address: { type: Schema.Types.ObjectId, ref: 'Address' },
  orderDate: { type: Date, default: Date.now },
});

const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);
     
module.exports = OrderHistory;
