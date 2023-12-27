const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a Brand Management Schema
const brandSchema = new Schema({
    brandName: {
        type: String,
        
            },
});

// Create a Brand Management model
const zBrand = mongoose.model('zBrand',brandSchema);

module.exports = zBrand; // Export the model to use in other files if needed
