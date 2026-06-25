const Order = require('../models/Order');
const Item = require('../models/Item');
const PromoCode = require('../models/PromoCode');

exports.getOrders = async (req, res) => {
    try {
    let filter = {};
    
    // 💡 Hvatamo userId iz URL query-ja: /api/orders?userId=NEKI_ID
    if (req.query.userId) {
      filter.korisnik = req.query.userId;
    }

    // Izvlačimo narudžbine i opciono radimo populate artikala ako je potrebno
    const orders = await Order.find(filter).populate('artikli.artikal').sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dobavljanju narudžbina", error: error.message });
  }
};

exports.createOrder = async (req, res) => {
    try {
        // Sa frontenda se uzima artikli, adresa i eventualno promo kod
        const { artikli, adresa, korisceniPromoKod } = req.body;
        const korisnikId = req.user.id; // ID ulogovanog korisnika iz auth middleware

        if (!artikli || artikli.length === 0) {
            return res.status(400).json({ message: "Porudžbina mora sadržati barem jedan artikal." });
        }

        let medjusuma = 0;
        const obradjeniArtikli = [];

        // Prolazak kroz svaki artikal u korpi
        for (let stavka of artikli) {
            const pronadjeniArtikal = await Item.findById(stavka.artikal);
            if (!pronadjeniArtikal) {
                return res.status(404).json({ message: `Artikal sa ID ${stavka.artikal} ne postoji u bazi.` });
            }

            const cijenaPoKomadu = pronadjeniArtikal.cijena;
            medjusuma += cijenaPoKomadu * stavka.kolicina;

            if(pronadjeniArtikal.zaliha < stavka.kolicina) {
                return res.status(400).json({ message: `Nema dovoljno zaliha za artikal ${pronadjeniArtikal.naziv}. Dostupno: ${pronadjeniArtikal.zaliha}, traženo: ${stavka.kolicina}` });
            }

            pronadjeniArtikal.zaliha = pronadjeniArtikal.zaliha - stavka.kolicina; //Smanjivanje zalihe artikla
            await pronadjeniArtikal.save(); // Spremanje promjene u bazi

            obradjeniArtikli.push({
                artikal: stavka.artikal,
                kolicina: stavka.kolicina,
                cijenaPoKomadu: cijenaPoKomadu
            });
        }

        // --- Logika za promo kod ---
        let procenatPopusta = 0;
        
        if (korisceniPromoKod) {
            const kodZaPretragu = korisceniPromoKod.toUpperCase();
            
            const pronadjeniKod = await PromoCode.findOne({ kod: kodZaPretragu });

            // Da li kod postoji u abzi
            if (!pronadjeniKod) {
                return res.status(400).json({ message: "Unijeti promo kod ne postoji." });
            }

            // Da li je aktivan
            if (!pronadjeniKod.aktivan) {
                return res.status(400).json({ message: "Ovaj promo kod više nije aktivan." });
            }

            // Da li je istekao
            const trenutniDatum = new Date();
            if (pronadjeniKod.datumIsteka < trenutniDatum) {
                return res.status(400).json({ message: "Ovaj promo kod je istekao." });
            }

            if (pronadjeniKod.brojKoriscenja <= 0) {
                return res.status(400).json({ message: "Ovaj promo kod je dostigao maksimalan broj korišćenja." });
            }

            procenatPopusta = pronadjeniKod.procenatPopusta;
            pronadjeniKod.brojKoriscenja = pronadjeniKod.brojKoriscenja - 1; // Smanjivanje broja korišćenja koda
            await pronadjeniKod.save(); // Spremanje promjene u bazi
        }
        // --- Logika za promo kod kraj ---

        // Izracunavanje konacnih cijena
        const iznosPopusta = (medjusuma * procenatPopusta) / 100;
        const konacnaCijena = medjusuma - iznosPopusta;

        // Kreiranje narudzbe
        const novaNarudzba = new Order({
            korisnik: korisnikId,
            artikli: obradjeniArtikli,
            adresa: adresa,
            popust: iznosPopusta,
            korisceniPromoKod: korisceniPromoKod || null,
            ukupnaCijena: konacnaCijena
        });

        const sacuvanaNarudzba = await novaNarudzba.save();
        res.status(201).json(sacuvanaNarudzba);

    } catch (error) {
        res.status(500).json({ message: "Greška prilikom kreiranja porudžbine.", error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const idNarudzbe = req.params.id;
        const obrisanPodatak = await Order.findByIdAndDelete(idNarudzbe);

        if (!obrisanPodatak) {
            return res.status(404).json({ message: "Narudžba nije pronađena." });
        }

        res.status(200).json({ message: "Narudžba uspješno obrisana." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const azuriranaNarudzbina = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!azuriranaNarudzbina) {
            return res.status(404).json({ message: "Narudžbina nije pronađena." });
        }

        res.status(200).json(azuriranaNarudzbina);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
