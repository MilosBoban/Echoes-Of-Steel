const PromoCode = require('../models/PromoCode');

exports.getPromoCode = async (req, res) => {
    try {
        const promoKod = await PromoCode.find();
        res.status(200).json(promoKod);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createPromoCode = async (req, res) => {
    try {
        const noviKod = new PromoCode(req.body);
        const sacuvaniKod = await noviKod.save();
        res.status(201).json(sacuvaniKod);
    } catch (error) {
        res.status(400).json({ message: "Nisu tačno uneseni podaci.", error: error.message }); // 400 zbog toga sto obicno korisnik zaboravio da popuni neko polje
    }
};
exports.deletePromoCode = async (req, res) => {
    try {
        const idKoda = req.params.id;
        const obrisanPodatak = await PromoCode.findByIdAndDelete(idKoda);

        if (!obrisanPodatak) {
            return res.status(404).json({ message: "Promo kod nije pronađen." });
        }

        res.status(200).json({ message: "Promo kod uspjeŠno obrisan." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePromoCode = async (req, res) => {
    try {
        const azuriranKod = await PromoCode.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!azuriranKod) {
            return res.status(404).json({ message: "Promo kod nije pronađen." });
        }

        res.status(200).json(azuriranKod);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getPromoCodeByString = async (req, res) => {
  try {
    // 1. Uzimamo string iz URL-a (npr. /api/promo/kod/RELIQA10)
    const unijetiKod = req.params.kod.toUpperCase(); 

    // 2. Koristimo findOne i prosbjeđujemo objekat sa uslovom { naziv_polja_u_bazi: vrijednost }
    const pronadjeniKod = await PromoCode.findOne({ kod: unijetiKod });

    // 3. Ako kod ne postoji u bazi, vraćamo 404
    if (!pronadjeniKod) {
      return res.status(404).json({ poruka: 'Promo kod nije pronađen u knjigama.' });
    }

    // 4. Ako postoji, šaljemo ga frontendu
    res.status(200).json(pronadjeniKod);

  } catch (error) {
    console.error(error);
    res.status(500).json({ poruka: 'Greška na serveru prilikom pretrage koda.' });
  }
};

