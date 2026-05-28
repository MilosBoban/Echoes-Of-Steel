const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    korisnik: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    artikli: [
       { artikal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true
        },
        kolicina: {
            type: Number,
            default: 1,
            required: true
        }
    }
    ]
}, { timestamps: true});

module.exports = mongoose.model('Cart', CartSchema);