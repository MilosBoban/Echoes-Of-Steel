const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
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
        },
        cijenaPoKomadu: { type: Number, required: true }
    }
    ],
    adresa: { type: String, required: true },
    status: { 
        type: String,
        enum: ['Na čekanju', 'Spakovano', 'U transportu', 'Dostavljeno'],
        default: 'Na čekanju'
    },
    ukupnaCijena: { type: Number },
    popust: { type: Number, default: 0 },
    korisceniPromoKod: { type: String }

}, { timestamps: true});

module.exports = mongoose.model('Order', OrderSchema);