const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a Brand Management Schema
const brandSchema = new Schema({
    brandName: {
        type: String,
        required: true,
            },
});

// Create a Brand Management model
const Brand = mongoose.model('Brand',brandSchema);

module.exports = Brand; // Export the model to use in other files if needed
