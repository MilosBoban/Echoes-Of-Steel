import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';

function Home() {
  const navigate = useNavigate();
  const [istaknutiPredmeti, setIstaknutiPredmeti] = useState([]);
  const [loading, setLoading] = useState(true);

  // Povlacenje artikala iz baze i odabir 3 random predmeta
  useEffect(() => {
    const fetchRandomArticles = async () => {
      try {
        setLoading(true);
        const response = await API.get('/items'); 
        const sviArtikli = response.data;

        if (Array.isArray(sviArtikli) && sviArtikli.length > 0) {
          // Algoritam za nasumicno mjesanje niza (Fisher-Yates shuffle princip)
          const nasumicni = [...sviArtikli]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
            
          setIstaknutiPredmeti(nasumicni);
        }
      } catch (err) {
        console.error("Greška prilikom povlačenja artikala za početnu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomArticles();
  }, []);

  return (
    <div className="bg-stone-950 min-h-screen text-stone-100 selection:bg-amber-600 selection:text-stone-950 pt-10 font-serif flex flex-col justify-between">
      
      <div>
        {/* BANER */}
        <div className="relative h-[70vh] flex items-center justify-center text-center bg-cover bg-center">
          <div className="max-w-3xl px-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-500 bg-amber-950/40 px-4 py-1.5 rounded-full border border-amber-500/20">
              Kovačnica Istorije & Antikviteta
            </span>
            <h1 className="pt-3 text-4xl sm:text-6xl font-bold tracking-wider text-stone-100">
              POSJEDUJEŠ LI <br />
              <span className="text-amber-400">KOMAD PROŠLOSTI?</span>
            </h1>
            <p className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Dobrodošli u kovačnicu gdje se istorija ne čita – već posjeduje. Istražite autentične relikvije, legendarne mačeve i oklope koji su kovali sudbine carstava.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => navigate('/shop')}
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-8 py-3.5 rounded-xl text-sm shadow-lg shadow-amber-600/10 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                Istraži Arsenal
              </button>
              <button 
                onClick={() => navigate('/education')}
                className="bg-stone-900/80 hover:bg-stone-800 text-amber-400 border border-stone-800 font-bold px-8 py-3.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                Istorijski Centar
              </button>
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative -mt-16 z-10">
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800/80 shadow-xl space-y-3">
            <div className="text-3xl text-amber-500"><img src="https://cdn-icons-png.flaticon.com/512/12110/12110147.png" alt="Autentičnost" className="w-12 h-12 object-cover rounded-xl overflow-hidden" /></div>
            <h3 className="text-lg font-bold text-stone-200">100% Autentičnost</h3>
            <p className="text-stone-400 text-xs leading-relaxed">Svaki komad u našem arsenalu prolazi rigoroznu provjeru istorijskog porijekla i kovačke preciznosti.</p>
          </div>

          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800/80 shadow-xl space-y-3">
            <div className="text-3xl text-amber-500"><img src="https://static.thenounproject.com/png/1724957-200.png" alt="Edukativni Centar" className="w-12 h-12 object-cover rounded-xl overflow-hidden" /></div>
            <h3 className="text-lg font-bold text-stone-200">Edukativni Centar</h3>
            <p className="text-stone-400 text-xs leading-relaxed">Pored kupovine, naučite sve o erama, bitkama i taktikama u kojima je ovo oružje igralo ključnu ulogu.</p>
          </div>

          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800/80 shadow-xl space-y-3">
            <div className="text-3xl text-amber-500"><img src="https://cdn-icons-png.flaticon.com/256/2907/2907213.png" alt="Tajne Kovačnice" className="w-12 h-12 object-cover rounded-xl overflow-hidden" /></div>
            <h3 className="text-lg font-bold text-stone-200">Tajne Kovačnice</h3>
            <p className="text-stone-400 text-xs leading-relaxed">Prikazivanjem mudrosti i pažljivim okom možeš doći do tajni za popust pri kupovini relika.</p>
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end mb-8 border-b border-stone-900 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-wide text-amber-400">IZDVAJAMO IZ ARSENALA</h2>
              <p className="text-stone-500 text-xs mt-1">Nasumično odabrane relikvije iz našeg carskog magacina.</p>
            </div>
            <button 
              onClick={() => navigate('/shop')}
              className="text-xs font-bold text-amber-500 hover:text-amber-400 underline tracking-wider uppercase cursor-pointer"
            >
              Pogledaj sve
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="text-center py-12 text-sm font-mono text-stone-500 uppercase tracking-widest animate-pulse">
              Pretraživanje kovačkih arhiva...
            </div>
          ) : istaknutiPredmeti.length === 0 ? (
            <div className="text-center py-12 text-stone-500 italic text-xs">
              Trenutno nema dostupnih artikala u arsenalu.
            </div>
          ) : (
            /* 3 KARTICE IZ BAZE */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {istaknutiPredmeti.map((predmet) => (
                <div 
                  key={predmet._id || predmet.id} 
                  className="bg-stone-900 border border-stone-800/60 rounded-xl overflow-hidden shadow-md flex flex-col justify-between group"
                >
                  <div className="h-44 overflow-hidden relative bg-stone-950">
                    <img 
                      src={predmet.slikaUrl || "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=500&q=80"} 
                      alt={predmet.naziv} 
                      className="w-full h-full object-contain opacity-75 group-hover:scale-105 transition-transform duration-500"
                    />
                    {predmet.period && (
                      <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest bg-stone-950/80 text-amber-400 px-2 py-0.5 rounded">
                        {predmet.period}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex justify-between items-center bg-stone-900">
                    <div>
                      <h4 className="text-sm font-bold text-stone-200 line-clamp-1">{predmet.naziv}</h4>
                      <span className="text-xs text-amber-500 font-bold mt-0.5 block">{predmet.cijena} EUR</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/shop/item/${predmet._id || predmet.id}`)}
                      className="bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                    >
                      Kupi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-stone-900 border-t border-stone-800 mt-16 py-8 px-6 text-xs text-stone-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-serif">Kovačnica Istorije</h4>
            <p className="leading-relaxed text-stone-400 font-sans">
              Čuvari prošlosti i autentičnih kovačkih relikvija. Naša misija je spajanje kolekcionara sa pravim istorijskim artefaktima.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-serif">Radno Vrijeme</h4>
            <ul className="space-y-1 font-mono text-stone-400">
              <li>Ponedjeljak - Petak: 09:00 - 18:00</li>
              <li>Subota: 10:00 - 15:00</li>
              <li>Nedjelja: Zatvoreno (Kovači odmaraju)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-serif">Kontakt & Lokacija</h4>
            <ul className="space-y-2 font-sans text-stone-400">
              <li className="flex items-center gap-2">📍 <span className="font-mono">Carska Aleja 47, Novi Sad</span></li>
              <li className="flex items-center gap-2">📞 <span className="font-mono">+387 33 XXX XXX</span></li>
              <li className="flex items-center gap-2">✉️ <span className="font-mono">info@kovacnica-istorije.com</span></li>
            </ul>
          </div>

        </div>
        
        {/* Donji dio footera sa copyrightom */}
        <div className="max-w-6xl mx-auto text-center border-t border-stone-800/60 mt-8 pt-4 text-[10px] uppercase font-mono tracking-widest text-stone-500">
          &copy; {new Date().getFullYear()} Kovačnica Istorije. Sva prava zadržana.
        </div>
      </footer>

    </div>
  );
}

export default Home;