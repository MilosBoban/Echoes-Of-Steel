const Item = require('../models/Item');

exports.getItems = async (req, res) => {
    try {
        let filter = {};
        if (req.query.kategorija)
        {
            filter.kategorija = req.query.kategorija;
        }

        const artikli = await Item.find(filter);
        res.status(200).json(artikli);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createItems = async (req, res) => {
    try {
        const noviArtikal = new Item(req.body);
        const sacuvaniArtikal = await noviArtikal.save();
        res.status(201).json(sacuvaniArtikal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteItems = async (req, res) => {
    try {
        const idArtikla = req.params.id;
        const obrisanPodatak = await Item.findByIdAndDelete(idArtikla);

        if (!obrisanPodatak) {
            return res.status(404).json({ message: "Artikal nije pronađen." });
        }

        res.status(200).json({ message: "Artikal uspješno obrisan." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const artikal = await Item.findById(req.params.id);
        if (!artikal)
        {
            return res.status(404).json({ message: "Artikal nije pronađen." });
        }
        res.status(200).json(artikal);
    } catch (error) {
       res.status(500).json({ message: error.message }); 
    }
};

exports.updateItem = async (req, res) => {
    try {
        const azuriranArtikal = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!azuriranArtikal) {
            return res.status(404).json({ message: "Artikal nije pronađen." });
        }

        res.status(200).json(azuriranArtikal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};