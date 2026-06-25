const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const korisnici = await User.find();
        res.status(200).json(korisnici);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUsers = async (req, res) => {
    try {
        const idKorinika = req.params.id;
        const obrisanPodatak = await User.findByIdAndDelete(idKorinika);

        if (!obrisanPodatak) {
            return res.status(404).json({ message: "Korisnik nije pronađen." });
        }

        res.status(200).json({ message: "Korisnik uspješno obrisan." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const korisnik = await User.findById(req.params.id);
        if (!korisnik)
        {
            return res.status(404).json({ message: "Korisnik nije pronađen." });
        }
        res.status(200).json(korisnik);
    } catch (error) {
       res.status(500).json({ message: error.message }); 
    }
};

exports.updateUser = async (req, res) => {
  try {
    // Hvatamo ID iz URL-a (req.params.id)
    const { id } = req.params; 
    
    // Provjeravamo da li nam stižu telefon i adresa iz req.body
    const { telefon, adresa } = req.body;

    // Pronalazimo korisnika i ažuriramo ga u MongoDB-ju
    const azuriraniKorisnik = await User.findByIdAndUpdate(
      id, 
      { telefon, adresa }, 
      { new: true, runValidators: true } // new: true vraća modifikovani dokument nazad
    );

    if (!azuriraniKorisnik) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }

    // Vraćamo ažuriranog korisnika nazad frontend-u
    res.status(200).json(azuriraniKorisnik);
  } catch (error) {
    res.status(400).json({ message: "Greška pri ažuriranju baze", error: error.message });
  }
};