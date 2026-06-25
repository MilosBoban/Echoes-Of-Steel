import React, { useState, useEffect } from 'react';
import './index.css'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './Home';
import Shop from './Shop';
import Education from './Education';
import Profile from './Profile';
import Admin from './Admin';
import Login from './Login';
import logoNoBg from '/src/assets/logo.png';
import CartWidget from './components/CartWidget';
import { CartProvider } from './context/CartContext.jsx'
import ProductDetails from './ProductDetails';
import Checkout from './Checkout';

function App() {
  // Inicijaliyacija stanja DIREKTNO iz localStoragea pri prvom renderu da nema praznog hoda
  const [korisnik, setKorisnik] = useState(() => {
    const sacuvaniKorisnik = localStorage.getItem('user');
    if (sacuvaniKorisnik && sacuvaniKorisnik !== "undefined") {
      try {
        return JSON.parse(sacuvaniKorisnik);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Provjera validnosti tokena
  useEffect(() => {
    const provjeriKorisnika = async () => {
      const token = localStorage.getItem('token');
      const sacuvaniKorisnik = localStorage.getItem('user'); 
      
      // Ako nemama tokena ili korisnika u memoriji cisti sve
      if (!token || !sacuvaniKorisnik || sacuvaniKorisnik === "undefined") {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setKorisnik(null);
      } else {}
      
      setLoading(false); // Loading se gasi tek kad je sve provjereno
    };

    provjeriKorisnika();
  }, []);
  
  // Funkcija za odjavljivanje korisnika
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    localStorage.removeItem('user'); // Za svaki slučaj
    setKorisnik(null); // Ovo mijenja Navbar izgled
  };

  return (
    <CartProvider>
      <BrowserRouter>
        {/* NAVBAR */}
        <nav className="bg-stone-950 text-amber-400 p-3 flex justify-between items-center shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <img src={logoNoBg} alt="Logo" className="w-12 h-12 object-cover rounded-full overflow-hidden" />
            <div className="font-bold text-xl tracking-wider font-serif">Echoes Of Steel</div>
          </div>
          <div className="flex gap-6 font-medium">
            <Link to="/" className="hover:text-amber-200 transition font-serif">Početna</Link>
            <Link to="/shop" className="hover:text-amber-200 transition font-serif">Arsenal</Link>
            <Link to="/education" className="hover:text-amber-200 transition font-serif">Biblioteka</Link>
            {korisnik ? (
              <div className="flex items-center gap-4">
                {korisnik.uloga === 'Admin' && (
                  <Link to="/admin" className="text-amber-600 hover:text-amber-700 transition font-serif">
                    Admin Panel
                  </Link>
                )}
                <Link to="/profile" className="hover:text-amber-200 transition font-serif">Profil</Link>
              </div>
            ) : (
              <Link to="/login" className="hover:text-amber-200 transition font-serif">Log In</Link>
            )}
          </div>
        </nav>

        {/* RUTE */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/education" element={<Education />} />
          <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
          <Route path="/shop/item/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login setKorisnik={setKorisnik} />} />

          {/* ZAŠTIĆENA RUTA ZA ADMINA */}
          <Route 
            path="/admin" 
            element={korisnik && korisnik.uloga === 'Admin' ? <Admin /> : <Navigate to="/" />} 
          />
        </Routes>

        <CartWidget />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;