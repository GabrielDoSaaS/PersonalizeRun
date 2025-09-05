const mongoose = require('mongoose');

const CupomSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    porcent: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Cupom', CupomSchema);