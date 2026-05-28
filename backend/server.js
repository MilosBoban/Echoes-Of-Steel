const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');

// Učitavanje varijabli
dotenv.config();

// Povezivanje sa bazom podataka
connectDB();

const app = express();

// Middleware 
app.use(cors());
app.use(express.json()); // Omogućava aplikaciji da čita JSON podatke iz zahteva

// Prva testna ruta
app.get('/', (req, res) => {
    res.send('Backend uspešno radi!');
});

//Rute redom za article, item, auth, order, promo kodove
app.use('/api/articles', articleRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promoCode', promoCodeRoutes);

// Pokretanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server je pokrenut na portu ${PORT}`);
});

//http://localhost:5000/