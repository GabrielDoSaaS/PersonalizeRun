const mongoose = require('mongoose');

const databasePayersSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true }, // <-- Aqui está a garantia
    personalized: { type: String, required: true },
    code: { type: String, required: true },
    blood: { type: String
     },
    arlegies: { type: String },
    afterOffer: { type: Boolean, default: true }
});

module.exports = mongoose.model('DatabasePayers', databasePayersSchema);