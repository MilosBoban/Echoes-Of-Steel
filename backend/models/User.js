const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    ime: { type: String, required: [true, 'Ime je obavezno.']},
    uloga: { 
        type: String,
        required: true,
        enum: ['Korisnik', 'Admin'],
        default: 'Korisnik'
    },
    lozinka: { type: String, required: [true, 'Lozinka je obavezna.'] },
    email: { type: String, required: true, unique: true },
    telefon: {type: String, required: false },
    adresa: {type: String, required: false }
}, { timestamps: true});

module.exports = mongoose.model('User', UserSchema);