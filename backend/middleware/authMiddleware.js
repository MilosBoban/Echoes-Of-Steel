const jwt = require('jsonwebtoken');

// Da li je korisnik ulogovan/ima token
exports.protect = (req, res, next) => {
    let token;

    // Token bude u Headers pod kljucem Authorization i pocinje sa Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Uzima se token i brise Bearer
            token = req.headers.authorization.split(' ')[1];

            // Desifruje se pomocu kljuca iz .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Dodaju se podaci iz tokena id i ulogu u req objekat kako bi kontroleri znali ko salje zahtjev
            req.user = decoded;

            return next();
        } catch (error) {
            return res.status(401).json({ message: "Token nije validan, pristup odbijen." });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Nema tokena, niste autorizovani." });
    }
};

// Ogranicavanje na odredjenu ulogu
exports.restrictTo = (...dozvoljeneUloge) => {
    return (req, res, next) => {
        // req.user iz protect
        if (!dozvoljeneUloge.includes(req.user.uloga)) {
            return res.status(403).json({ message: "Nemate dozvolu za ovu akciju (Samo za admine)." });
        }
        next();
    };
};