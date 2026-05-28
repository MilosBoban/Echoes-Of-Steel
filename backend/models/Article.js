const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    naslov: { type: String, required: true },
    sadrzaj: { type: String, required: true },
    autor: { type: String, default: 'Istoričar Aplikacije' },
    slikaUrl: { type: String, default: 'https://via.placeholder.com/300' },
    tagovi: [{ type: String }], // Npr. ["Kovani mačevi", "Sparta", "Taktike"]
}, { timestamps: true});

module.exports = mongoose.model('Article', ArticleSchema);