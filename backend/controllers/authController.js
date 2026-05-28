const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { ime, email, lozinka } = req.body;
        const vecPostoji = await User.findOne({email});
        if(vecPostoji)
        {
            return res.status(400).json({message: "Korisnik sa ovim emailom vec postoji."});
        }

        const hashLozinka = await bcrypt.hash(lozinka, 10);

        const noviKorisnik = new User({
            ime,
            email,
            lozinka: hashLozinka
        });
        await noviKorisnik.save();

        res.status(201).json({ message: "Korisnik uspješno registrovan!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, lozinka } = req.body;
        const korisnik = await User.findOne({email});
        if(!korisnik)
        {
            return res.status(400).json({message: "Pogrešan email ili lozinka."});
        }

        const tacnaLozinka = await bcrypt.compare(lozinka, korisnik.lozinka);
        if (!tacnaLozinka)
        {
            return res.status(400).json({message: "Pogrešan email ili lozinka."});
        }

        const token = jwt.sign(
            { id: korisnik._id, uloga: korisnik.uloga },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Uspješan login!",
            token: token,
            korisnik: {
                id: korisnik._id,
                ime: korisnik.ime,
                email: korisnik.email,
                uloga: korisnik.uloga
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};