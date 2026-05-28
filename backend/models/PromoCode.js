const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema({
    kod: {
        type: String,
        required: true,
        unique: true, // Samo unikatni kodovi
        trim: true, //Brise sve razmake i tabove
        uppercase: true // Da vi kodovi budu velikim slovima
    },
    procenatPopusta: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    datumIsteka: {
        type: Date,
        required: true
    },
    aktivan: {
        type: Boolean,
        default: true // Mogucnost gasenja kao admin
    },
    brojKoriscenja: {
        type: Number,
        required: true,
        default: 10
    }
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', PromoCodeSchema);