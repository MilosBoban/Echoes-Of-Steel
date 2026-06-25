import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoNoBg from '/src/assets/logo.png';
import API from './api';

function Profil({ onLogout }) {
    const navigate = useNavigate();
    const [selektovanaPorudzbina, setSelektovanaPorudzbina] = useState(null);
    const [korisnik, setKorisnik] = useState(null);
    const [loading, setLoading] = useState(true);
 
    // Provjera pri svakom ucitavanju sajta da li je korisnik ostao ulogovan
    useEffect(() => {
       const sacuvaniKorisnik = localStorage.getItem('user');
       if (sacuvaniKorisnik && sacuvaniKorisnik !== "undefined") {
         setKorisnik(JSON.parse(sacuvaniKorisnik));
       }
    }, []);
 
    useEffect(() => {
        const provjeriKorisnika = async () => {
            const token = localStorage.getItem('token');
            const sacuvaniUser = localStorage.getItem('user');
         
            if (token && sacuvaniUser) {
                try {
                    setKorisnik(JSON.parse(sacuvaniUser));
                } catch (err) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                }
            }
            setLoading(false);
       };
       provjeriKorisnika();
    }, []);

  const userId = korisnik?._id || korisnik?.id;
  const [porudzbine, setPorudzbine] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [profilForm, setProfilForm] = useState({
    telefon: korisnik?.telefon || '',
    adresa: korisnik?.adresa || ''
  });

  // useEffect koji garantovano reaguje cim imamo userId
  useEffect(() => {
    if (userId) {
      fetchProfilIPorudzbine();
    } else {
      console.error("Korisnik ID nije pronađen!");
      setLoading(false);
    }
  }, [userId]);

  const fetchProfilIPorudzbine = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Povlacenje svjezih podataka o korisniku
      const resUser = await API.get(`/users/${userId}`, config); 
      setKorisnik(resUser.data);
      setProfilForm({
        telefon: resUser.data.telefon || '',
        adresa: resUser.data.adresa || ''
      });

      const resOrders = await API.get(`/orders?userId=${userId}`, config);
      const listaPorudzbina = Array.isArray(resOrders.data) ? resOrders.data : (resOrders.data.orders || []);
      setPorudzbine(listaPorudzbina);
    } catch (err) {
      console.error("Greška pri učitavanju podataka profila:", err);
    } finally {
      setLoading(false); 
    }
  };

  const handleProfilSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Greška: Nemate validan korisnički ID!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const resUpdate = await API.put(`/users/${userId}`, profilForm, config);
      const azuriraniPodaci = resUpdate.data.user || resUpdate.data;

      // Spasavamo azuriranog korisnika nazad u Local Storage da podaci ostanu i nakon F5
      const noviKorisnikZaSkladiste = {
        ...azuriraniPodaci,
        _id: azuriraniPodaci._id || azuriraniPodaci.id,
        id: azuriraniPodaci.id || azuriraniPodaci._id
      };
      
      localStorage.setItem('user', JSON.stringify(noviKorisnikZaSkladiste));
      setKorisnik(noviKorisnikZaSkladiste);
      
      setIsEditing(false);
      alert('Vaš profil je uspješno ažuriran!');
    } catch (err) {
      console.error("Greška pri ažuriranju:", err);
      alert('Greška pri ažuriranju podataka.');
    }
  };

  const izracunajProcenatStatusa = (status) => {
    switch (status) {
      case 'Na čekanju': return '0%';
      case 'Spakovano': return '33%';
      case 'U transportu': return '66%';
      case 'Dostavljeno': return '100%';
      default: return '0%';
    }
  };

  if (loading) {
    return (
      <div className="bg-stone-950 min-h-screen flex items-center justify-center text-amber-400 font-mono text-xs uppercase tracking-widest">
        Otvaranje carskih arhiva...
      </div>
    );
  }

  const handleZvanicniLogout = () => {
    if (onLogout) {
      onLogout();     // Pokrece handleLogout iz App.jsx
      navigate('/');  
    }
  };

  return (
    <div className="bg-stone-950 min-h-screen text-stone-100 p-6 pt-30 pb-10 font-serif">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        
        {/* LIJEVA STRANA INFO O KORISNIKU*/}
        <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl h-fit space-y-6 relative">
          <div className="border-b border-stone-800 pb-4 text-center md:text-left">
            <div className="w-16 h-16 bg-amber-600/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-3 text-xl text-amber-400 font-bold overflow-hidden">
              {logoNoBg ? (
                <img src={logoNoBg} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                korisnik?.ime?.charAt(0).toUpperCase()
              )}
            </div>
            
            {/* Prikaz dugmeta za Logout */}
            <div className="items-center gap-4 absolute right-4 border border-stone-800/30 bg-stone-950/40 p-2 rounded-xl shadow-md">
                <button 
                onClick={handleZvanicniLogout} 
                className="text-md font-bold text-red-400 hover:text-red-300 cursor-pointer uppercase tracking-wider font-serif"
                >
                Logout
                </button>
            </div>
          
            <h2 className="text-xl font-bold text-stone-200">{korisnik?.ime}</h2>
            <p className="text-stone-400 text-xs font-mono">{korisnik?.email}</p>
            <span className="text-[10px] text-amber-500/80 block mt-2 uppercase tracking-wider font-mono">
              Član od: {korisnik?.createdAt ? new Date(korisnik.createdAt).toLocaleDateString('sr-RS') : 'Davno'}
            </span>
          </div>
          

          {/* Forma za Telefon i Adresu */}
          <form onSubmit={handleProfilSubmit} className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Isporuka i Kontakt</h3>
              
              {/* Edit dugme*/}
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-amber-500 hover:text-amber-400 underline font-mono text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  Edituj
                </button>
              )}
            </div>
            
            {/* INPUT ZA TELEFON */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Broj Telefona</label>
              <input 
                type="text" 
                disabled={!isEditing}
                readOnly={!isEditing}
                value={profilForm.telefon} 
                onChange={(e) => setProfilForm({...profilForm, telefon: e.target.value})}
                className={`border p-3 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500 font-mono transition-colors ${
                  isEditing ? 'bg-stone-950 border-amber-500/30' : 'bg-stone-950/40 border-stone-800 text-stone-400 cursor-not-allowed'
                }`}
                placeholder={isEditing ? "+387 6X XXX XXX" : "Nije uneseno"}
              />
            </div>

            {/* INPUT ZA ADRESU */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Adresa za dostavu</label>
              <textarea 
                rows="3"
                disabled={!isEditing}
                readOnly={!isEditing}
                value={profilForm.adresa} 
                onChange={(e) => setProfilForm({...profilForm, adresa: e.target.value})}
                className={`border p-3 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500 resize-none transition-colors ${
                  isEditing ? 'bg-stone-950 border-amber-500/30' : 'bg-stone-950/40 border-stone-800 text-stone-400 cursor-not-allowed'
                }`}
                placeholder={isEditing ? "Ulica, Broj, Grad, Poštanski broj" : "Nije uneseno"}
              />
            </div>

            {/* Dugmad se prikazuju samo ako je aktivan isEditing mod */}
            {isEditing && (
              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setProfilForm({
                      telefon: korisnik?.telefon || '',
                      adresa: korisnik?.adresa || ''
                    });
                  }}
                  className="w-1/2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold p-3 rounded-xl cursor-pointer uppercase tracking-wider transition-all"
                >
                  Otkaži
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold p-3 rounded-xl cursor-pointer uppercase tracking-wider transition-all"
                >
                  Sačuvaj
                </button>
              </div>
            )}
          </form>
        </div>

        {/* DESNA STRANA LISTA PORUDZBINA */}
        <div className="md:col-span-2 bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-amber-400 uppercase tracking-wider border-b border-stone-800 pb-3">Istorija Vaših Porudžbina</h2>
          
          {porudzbine.length === 0 ? (
            <p className="text-stone-500 text-xs italic py-8 text-center">Još uvijek niste naručili nijednu relikviju.</p>
          ) : (
            <div className="space-y-3">
              {porudzbine.map((order) => (
                <div 
                  key={order._id}
                  onClick={() => setSelektovanaPorudzbina(order)}
                  className="p-4 bg-stone-950 rounded-xl border border-stone-800/60 hover:border-amber-500/40 transition-all cursor-pointer flex justify-between items-center text-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500">ID: #{order._id ? order._id.substring(18) : 'Nepoznato'}</span>
                    <h4 className="font-bold text-stone-200">
                      Iznos: <span className="text-amber-400 font-mono">{order.ukupnaCijena} EUR</span>
                    </h4>
                    <p className="text-stone-400 text-[11px]">{order.adresa}</p>
                  </div>

                  <div className="text-right space-y-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'Dostavljeno' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' : 'bg-amber-950/40 text-amber-400 border border-amber-900'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-[10px] text-stone-500 block font-mono">Pogledaj detalje &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETALJI PORUDZBINE SA KAMIONCICEM */}
      {selektovanaPorudzbina && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Header modala */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-md font-bold text-amber-400 uppercase">Detalji Porudžbine</h3>
                <span className="text-[10px] font-mono text-stone-500">Kôd: {selektovanaPorudzbina._id}</span>
              </div>
              <button 
                onClick={() => setSelektovanaPorudzbina(null)}
                className="text-stone-400 hover:text-stone-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* VREMENSKA LINJA SA KAMIONCICEM */}
            <div className="space-y-6 py-4 px-2">
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Status Isporuke</h4>
              
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-800 -translate-y-1/2 rounded-full"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-amber-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                  style={{ width: izracunajProcenatStatusa(selektovanaPorudzbina.status) }}
                ></div>

                {/* KAMIONCIC */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -mt-3.5 transition-all duration-1000 ease-out text-base bg-amber-500 text-stone-950 w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20"
                  style={{ 
                    left: izracunajProcenatStatusa(selektovanaPorudzbina.status),
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  🚚
                </div>

                <div className="flex justify-between relative text-[9px] font-bold uppercase tracking-wider text-stone-500 pt-6">
                  <span className={selektovanaPorudzbina.status === 'Na čekanju' ? 'text-amber-400' : 'text-stone-400'}>Na čekanju</span>
                  <span className={selektovanaPorudzbina.status === 'Spakovano' ? 'text-amber-400' : 'text-stone-400'}>Spakovano</span>
                  <span className={selektovanaPorudzbina.status === 'U transportu' ? 'text-amber-400' : 'text-stone-400'}>U transportu</span>
                  <span className={selektovanaPorudzbina.status === 'Dostavljeno' ? 'text-emerald-400' : 'text-stone-400'}>Dostavljeno</span>
                </div>
              </div>
            </div>

            {/* Podaci o artiklima unutar porudzbine */}
            <div className="space-y-3 bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs">
              <h4 className="font-bold text-stone-300 border-b border-stone-900 pb-2">Kupljeni Predmeti:</h4>
              
              {selektovanaPorudzbina.artikli?.map((stavka, index) => (
                <div key={index} className="flex justify-between text-[11px] text-stone-400 py-1">
                  <span>
                    {stavka.artikal?.naziv || stavka.naziv || "Istorijska Relikvija"} (x{stavka.kolicina || 1})
                  </span>
                  <span className="font-mono text-stone-200">{stavka.cijenaPoKomadu * (stavka.kolicina || 1)} EUR</span>
                </div>
              ))}
               
                <div className="flex justify-between text-[11px] text-stone-400 py-1">
                  <span>
                     Popust:
                  </span>
                  <span className="font-mono text-stone-200">-{selektovanaPorudzbina.popust || 0} EUR</span>
                </div>

              <div className="border-t border-stone-900 pt-2 mt-2 flex justify-between font-bold text-sm">
                <span className="text-stone-300">Ukupno plaćeno:</span>
                <span className="text-amber-400 font-mono">{selektovanaPorudzbina.ukupnaCijena} EUR</span>
              </div>
            </div>

            {/* Dodatne info o adresi */}
            <div className="text-[11px] text-stone-400 space-y-1 bg-stone-950/40 p-3 rounded-xl border border-stone-800/40">
              <p><span className="font-bold text-stone-300 uppercase text-[9px] block">Adresa dostave:</span> {selektovanaPorudzbina.adresa}</p>
              {selektovanaPorudzbina.korisceniPromoKod && (
                <p className="pt-2">
                  <span className="font-bold text-amber-500 uppercase text-[9px]">Korišćeni carski popust:</span> {selektovanaPorudzbina.korisceniPromoKod.kod || selektovanaPorudzbina.korisceniPromoKod}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profil;