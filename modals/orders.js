const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'userDetails' },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    quantity: Number,
    price: Number,
    paymentMethod: String,
    images: [String],
    deliveryStatus: { type: String, default: "Pending" }, // Add the deliveryStatus field here
  }],
  address: { type: Schema.Types.ObjectId, ref: 'Address' },
  orderDate: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
