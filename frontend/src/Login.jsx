import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api'; 

function Login({ setKorisnik }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); 
  const [formData, setFormData] = useState({ ime: '', email: '', lozinka: '' });
  const [greska, setGreska] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGreska('');

    try {
      if (isLogin) {
        // POZIV ZA LOGOVANJE
        const res = await API.post('/auth/login', {
        email: formData.email,
        lozinka: formData.lozinka 
        });

        localStorage.setItem('token', res.data.token);

        const podaciKorisnika = res.data.korisnik;
        const korisnikZaSkladiste = {
        ...podaciKorisnika,
        _id: podaciKorisnika._id || podaciKorisnika.id
        };

        localStorage.setItem('user', JSON.stringify(korisnikZaSkladiste));
        setKorisnik(korisnikZaSkladiste);

        if (korisnikZaSkladiste.uloga === 'Admin') {
        navigate('/admin');
        } else {
        navigate('/profile');
        }
      } else {
        // POZIV ZA REGISTRACIJU
        await API.post('/auth/register', {
          ime: formData.ime,
          email: formData.email,
          lozinka: formData.lozinka
        });
        alert('Registracija uspješna! Sada se možete ulogovati.');
        setIsLogin(true);
      }
    } catch (err) {
      setGreska(err.response?.data?.message || 'Došlo je do greške. Pokušajte ponovo.');
    }
  };

  return (
    <div className="p-8 bg-stone-950 min-h-screen text-stone-100 flex items-center justify-center font-serif">
      <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800 shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-amber-400 text-center tracking-wide uppercase mb-2">
          {isLogin ? 'Prijava na profil' : 'Kreiraj Nalog'}
        </h2>
        <p className="text-stone-400 text-xs text-center mb-6">
          {isLogin ? 'Unesite svoje podatke za pristup arsenalu.' : 'Postanite dio istorijskog saveza kolekcionara.'}
        </p>

        {greska && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs mb-4 text-center">
            {greska}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Ime i prezime</label>
              <input 
                type="text" 
                required
                value={formData.ime}
                onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
                className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
                placeholder="Kralj Artur"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase">Email adresa</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              placeholder="artur@okruglisto.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase">Lozinka</label>
            <input 
              type="password" 
              required
              value={formData.lozinka}
              onChange={(e) => setFormData({ ...formData, lozinka: e.target.value })}
              className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold p-3 rounded-xl text-sm transition-colors cursor-pointer mt-2"
          >
            {isLogin ? 'Uloguj se' : 'Registruj se'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-stone-400 hover:text-amber-400 underline transition-colors cursor-pointer"
          >
            {isLogin ? 'Nemate nalog? Registrujte se' : 'Već imate nalog? Ulogujte se'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;