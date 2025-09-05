const mongoose = require('mongoose');

const databasePayersSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    personalized: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    blood: { type: String, required: true },
    arlegies: { type: String },
});

module.exports = mongoose.model('DatabasePayers', databasePayersSchema);