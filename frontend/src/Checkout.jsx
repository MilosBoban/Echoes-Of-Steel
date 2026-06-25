import React, { useState, useEffect } from 'react';
import { useCart } from './context/CartContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [korisnik, setKorisnik] = useState(null);
  const [loading, setLoading] = useState(true);
   
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

  const [adresa, setAdresa] = useState('');
  const [promoKod, setPromoKod] = useState('');
  const [učitava, setUčitava] = useState(false);
  const [aktivanKod, setAktivankod] = useState(null);
  const [poruka, setPoruka] = useState({ tip: '', tekst: '' });
  const trenutniDatum = new Date();

  const [nacinPlacanja, setNacinPlacanja] = useState('gotovina');
  const [brojKartice, setBrojKartice] = useState('');
  const [datumIstekaKartice, setDatumIstekaKartice] = useState('');
  const [cvc, setCvc] = useState('');

  const osnovnaCijena = cartItems.reduce((acc, item) => acc + (item.cijena * (item.kolicina || 1)), 0);
  
  useEffect(() => {
    // Ako korisnik jos nista nije ukucao resetuj stanje i ne salji zahtjev
    if (!promoKod.trim()) {
      setAktivankod(null);
      return;
    }
    // Logika za promo kod
    const dobaviKod = async () => {
      try {
        setUčitava(true);
        const izvuceniKod = await fetch(`http://localhost:5000/api/promoCode/${promoKod}`);
        
        if (!izvuceniKod.ok) {
          throw new Error('Neuspješno preuzimanje koda.');
        }
        let podaci = await izvuceniKod.json();

        setAktivankod(podaci);
      } catch (err) { setAktivankod(null); }
      finally {
        setUčitava(false);
      }
    };

    // DEBOUNCE Mali tajmer da ne salje fetch za svako jedno slovo
    const tajmer = setTimeout(() => {
      dobaviKod();
    }, 500);

    return () => clearTimeout(tajmer);
  }, [promoKod]);

  const popustProcenat = aktivanKod?.procenatPopusta ? aktivanKod.procenatPopusta / 100 : 0;
  const iznosPopusta = osnovnaCijena * popustProcenat;
  const ukupnaCijena = osnovnaCijena - iznosPopusta;

  const handleSubmitNarudžbinu = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setPoruka({ tip: 'greška', tekst: 'Vaša korpa je prazna. Nemate šta kupiti.' });
      return;
    }

    // Frontend validacija kartice prije slanja na backend
    if (nacinPlacanja === 'kartica') {
      if (brojKartice.replace(/\s/g, '').length !== 16) {
        setPoruka({ tip: 'greška', tekst: 'Broj kartice mora imati tačno 16 cifara.' });
        return;
      }
      if (!datumIstekaKartice.includes('/')) {
        setPoruka({ tip: 'greška', tekst: 'Unesite rok trajanja u formatu MM/GG.' });
        return;
      }
      if (cvc.length !== 3) {
        setPoruka({ tip: 'greška', tekst: 'CVC kod mora imati tačno 3 cifre.' });
        return;
      }
    }

    try {
      setUčitava(true);
      setPoruka({ tip: '', tekst: '' });

      // Mapiranje stavki iz korpe u format koji OrderSchema eksplicitno trazi
      const artikliPayload = cartItems.map(item => ({
        artikal: item._id || item.id,
        kolicina: item.kolicina || 1,
        cijenaPoKomadu: item.cijena
      }));

      // Priprema kompletnog payloada za backend
      const narudzbinaPodaci = {
        korisnik: korisnik?.id || korisnik?._id,
        artikli: artikliPayload,
        adresa: adresa,
        ukupnaCijena: ukupnaCijena,
        popust: iznosPopusta,
        korisceniPromoKod: promoKod || null,
        nacinPlacanja: nacinPlacanja,
        // U realnom sistemu ovdje bi isao token kartice (Stripe/Braintree)
        detaljiPlacanja: nacinPlacanja === 'kartica' ? { zadnjeČetiriCifre: brojKartice.slice(-4) } : null
      };

      const token = localStorage.getItem('token'); 

      // Slanje POST zahtjeva na backend rutu za narudzbine
      const odgovor = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'application-Type': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(narudzbinaPodaci)
      });

      const rezultat = await odgovor.json();

      if (!odgovor.ok) {
        throw new Error(rezultat.poruka || 'Došlo je do greške prilikom kreiranja narudžbine. Provjerite promoKod i da li kolicina u korpi ne prelazi zalihu proizvoda.');
      }

      setPoruka({ tip: 'uspjeh', tekst: nacinPlacanja === 'kartica' ? 'Uplata uspješna! Narudžbina je kreirana, kovači kuju tvoj arsenal.' : 'Narudžbina je uspješno kreirana! Kovači već pakuju tvoj arsenal u kočije.' });
      clearCart();
      
      setTimeout(() => {
        navigate('/profile');
      }, 3000);

    } catch (err) {
      setPoruka({ tip: 'greška', tekst: err.message });
    } finally {
      setUčitava(false);
    }
  };

  return (
    <div className="bg-mist-950 min-h-screen pt-25 mx-auto px-4 py-12 font-serif">
      <h1 className="text-3xl font-bold text-amber-400 mb-8 tracking-wide uppercase">Pakovanje arsenala u kočije</h1>

      {poruka.tekst && (
        <div className={`p-4 rounded-xl mb-6 border text-sm ${
          poruka.tip === 'uspjeh' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-red-950/40 border-red-900 text-red-400'
        }`}>
          {poruka.tekst}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LIJEVA STRANA: Forma za dostavu i placanje */}
        <div className="bg-stone-900/40 p-6 rounded-2xl border border-stone-800">
          <h2 className="text-xl font-bold text-stone-200 mb-6 border-b border-stone-800 pb-2">Podaci za isporuku i plaćanje</h2>
          
          <form onSubmit={handleSubmitNarudžbinu} className="space-y-6">
            <div>
              <label className="block text-xs text-stone-400 uppercase tracking-wider mb-2">Adresa za dostavu *</label>
              <input
                type="text"
                required
                value={adresa}
                onChange={(e) => setAdresa(e.target.value)}
                placeholder="Npr. Cara Dušana 45, Beograd"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            {/* Selektor nacina placanja */}
            <div className="bg-stone-950/40 p-4 rounded-xl border border-stone-800/80 space-y-3">
              <label className="block text-xs text-stone-400 uppercase tracking-wider mb-1">Način plaćanja *</label>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-stone-200 cursor-pointer">
                  <input
                    type="radio"
                    name="nacinPlacanja"
                    value="gotovina"
                    checked={nacinPlacanja === 'gotovina'}
                    onChange={() => setNacinPlacanja('gotovina')}
                    className="accent-amber-500"
                  />
                  Plaćanje pouzećem (Keš)
                </label>

                <label className="flex items-center gap-2 text-sm text-stone-200 cursor-pointer">
                  <input
                    type="radio"
                    name="nacinPlacanja"
                    value="kartica"
                    checked={nacinPlacanja === 'kartica'}
                    onChange={() => setNacinPlacanja('kartica')}
                    className="accent-amber-500"
                  />
                  Plaćanje karticom
                </label>
              </div>
            </div>

            {/* Uslovna polja za unos kartice - Prikazuju se samo ako je odabrana kartica */}
            {nacinPlacanja === 'kartica' && (
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-4 transition-all duration-300 animate-fadeIn">
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Podaci sa bankovne kartice</p>
                
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Broj kartice *</label>
                  <input
                    type="text"
                    maxLength="19"
                    required={nacinPlacanja === 'kartica'}
                    value={brojKartice}
                    onChange={(e) => setBrojKartice(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())} // Auto-razmak na svake 4 cifre
                    placeholder="1234 5678 9876 5432"
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 text-xs mb-1">Rok trajanja *</label>
                    <input
                      type="text"
                      maxLength="5"
                      required={nacinPlacanja === 'kartica'}
                      value={datumIstekaKartice}
                      onChange={(e) => setDatumIstekaKartice(e.target.value)}
                      placeholder="MM/GG"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-xs mb-1">CVC / CVV *</label>
                    <input
                      type="password"
                      maxLength="3"
                      required={nacinPlacanja === 'kartica'}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} // Dozvoljava samo brojeve
                      placeholder="123"
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-sm text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Promo kod */}
            <div>
              <label className="block text-xs text-stone-400 uppercase tracking-wider mb-2">Promo Kod (Opciono)</label>
              <input
                type="text"
                value={promoKod}
                onChange={(e) => setPromoKod(e.target.value)}
                placeholder="Unesi kod za popust (npr. RELIQA10)"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-sm"
              />
              {aktivanKod?.aktivan === false && <p className="text-xs text-red-400 mt-1">✖ Promo kod nije važeći.</p>}
              {aktivanKod?.aktivan === true && aktivanKod?.datumIsteka > trenutniDatum.toISOString() && aktivanKod?.brojKoriscenja > 0 && <p className="text-xs text-emerald-400 mt-1">✓ Aktivan popust od {aktivanKod.procenatPopusta}%!</p>}
              {aktivanKod?.datumIsteka < trenutniDatum.toISOString() && <p className="text-xs text-red-400 mt-1">✖ Promo kod je istekao.</p>}
              {aktivanKod?.brojKoriscenja <= 0 && <p className="text-xs text-red-400 mt-1">✖ Promo kod je dostigao maksimalan broj korišćenja.</p>}
            </div>

            <button
              type="submit"
              disabled={učitava || cartItems.length === 0 || !korisnik}
              className="w-full font-bold uppercase tracking-wider py-4 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center text-sm"
            >
              {učitava ? 'Zapisivanje u knjigu narudžbina...' : `Potvrdi kupovinu (${ukupnaCijena} EUR)`}
            </button>
            {!korisnik && <p className="text-md text-red-400">Nijste ulogovani.</p>}
          </form>
        </div>

        {/* DESNA STRANA: Pregled Korpe */}
        <div className="bg-stone-900/20 p-6 rounded-2xl border border-stone-800/60 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-200 mb-6 border-b border-stone-800 pb-2">Tvoj Arsenal</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item._id || item.id} className="flex justify-between items-center text-sm bg-stone-950/60 p-3 rounded-lg border border-stone-900">
                  <div>
                    <p className="text-stone-200 font-bold">{item.naziv}</p>
                    <p className="text-xs text-stone-500">Količina u korpi: {item.kolicina || 1}</p>
                    <p className="text-xs text-stone-500">Zaliha proizvoda: {item.zaliha}</p>
                  </div>
                  <span className="text-amber-500 font-bold">{item.cijena * (item.kolicina || 1)} EUR</span>
                </div>
              ))}
              {cartItems.length === 0 && <p className="text-stone-500 text-sm">Korpa je prazna.</p>}
            </div>
          </div>

          {/* Cijene */}
          <div className="mt-8 border-t border-stone-800 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-stone-400">
              <span>Cijena artikala:</span>
              <span>{osnovnaCijena} EUR</span>
            </div>
            {iznosPopusta > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Popust:</span>
                <span>-{iznosPopusta} EUR</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-stone-100 pt-2 border-t border-stone-900">
              <span>Ukupno za uplatu:</span>
              <span className="text-amber-400 text-lg">{ukupnaCijena} EUR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;