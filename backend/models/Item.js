const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    naziv: { type: String, required: true },
    opis: { type: String, required: true },
    kategorija: { 
        type: String, 
        required: true, 
        enum: ['Oružje', 'Oklop', 'Relik'] // Ograničavamo unos na ove tri opcije
    },
    podKategorija: { type: String, required: true },
    period: { type: String, required: true },
    cijena: { type: Number, required: true },
    slikaUrl: { type: String, default: 'https://via.placeholder.com/150' },
    zaliha: { type: Number, default: 1 },
}, { timestamps: true});

module.exports = mongoose.model('Item', ItemSchema);