const Article = require('../models/Article');

exports.getArticles = async (req, res) => {
    try {
        const artikli = await Article.find();
        res.status(200).json(artikli);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createArticle = async (req, res) => {
    try {
        const noviArtikal = new Article(req.body);
        const sacuvaniArtikal = await noviArtikal.save();
        res.status(201).json(sacuvaniArtikal);
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 zbog toga sto obicno korisnik zaboravio da popuni neko polje
    }
};
exports.deleteArticle = async (req, res) => {
    try {
        const idClanka = req.params.id;
        const obrisanPodatak = await Article.findByIdAndDelete(idClanka);

        if (!obrisanPodatak) {
            return res.status(404).json({ message: "Članak nije pronađen." });
        }

        res.status(200).json({ message: "Članak uspješno obrisan." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const clanak = await Article.findById(req.params.id);
        if (!clanak)
        {
            return res.status(404).json({ message: "Članak nije pronađen." });
        }
        res.status(200).json(clanak);
    } catch (error) {
       res.status(500).json({ message: error.message }); 
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const azuriranClanak = await Article.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!azuriranClanak) {
            return res.status(404).json({ message: "Članak nije pronađen." });
        }

        res.status(200).json(azuriranClanak);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
