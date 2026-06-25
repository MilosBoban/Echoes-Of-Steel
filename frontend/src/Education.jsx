import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Education() {
  const [clanci, setClanci] = useState([]);
  const [aktivnaEra, setAktivnaEra] = useState(null); // Kreće kao null dok se baza ne učita
  const [učitava, setUčitava] = useState(true);
  const [greška, setGreška] = useState(null);
  const [promoKodovi, setPromoKodovi] = useState([]);
  const [izvuceniKod, setIzvuceniKod] = useState(null);
  const navigate = useNavigate();

  // KVIZ PITANJA
  const KVIZ_PITANJA = [
    {
      pitanje: "Koji je bio primarni kratki mač rimskih legionara?",
      opcije: ["Ksifos", "Gladius", "Katana", "Dvoručni mač"],
      tacanOdgovor: "Gladius"
    },
    {
      pitanje: "Šta znači čuvena spartanska izreka „Sa štitom ili na njemu“?",
      opcije: ["Vrati se kao pobjednik ili pogini u borbi", "Ponesi rezervni štit", "Pobjegni sa bojišta", "Pokloni štit neprijatelju"],
      tacanOdgovor: "Vrati se kao pobjednik ili pogini u borbi"
    },
    {
      pitanje: "Koliko je otprilike težio kompletan viteški oklop u Srednjem vijeku?",
      opcije: ["Oko 5 kg", "Oko 25 kg", "Oko 70 kg", "Preko 100 kg"],
      tacanOdgovor: "Oko 25 kg"
    },
    {
      pitanje: "Koji japanski ratnici su poznati po nošenju katane i striktnom kodeksu Bušido?",
      opcije: ["Nindže", "Samuraji", "Gladijatori", "Hopliti"],
      tacanOdgovor: "Samuraji"
    },
    {
      pitanje: "Šta je to 'falanga'?",
      opcije: ["Vrsta srednjovjekovnog šlema", "Vojna formacija u Antičkoj Grčkoj", "Rimski zlatni novčić", "Sprava za kovanje mačeva"],
      tacanOdgovor: "Vojna formacija u Antičkoj Grčkoj"
    },
    {
      pitanje: "Iz koje ere potiče čuveni dvoručni mač korigovan za sječenje teških oklopa?",
      opcije: ["Stari Egipat", "Srednji Vijek", "Feudalni Japan", "Rimsko Carstvo"],
      tacanOdgovor: "Srednji Vijek"
    }
  ];

  // Kviz logika
  const generisiNasumicnaPitanja = () => {
    return [...KVIZ_PITANJA].sort(() => 0.5 - Math.random()).slice(0, 5);
  };

  const [aktivnaPitanja, setAktivnaPitanja] = useState(generisiNasumicnaPitanja());
  const [indeksPitanja, setIndeksPitanja] = useState(0);
  const [bodovi, setBodovi] = useState(0);
  const [kvizZavrsen, setKvizZavrsen] = useState(false);

  // POVLACENJE ARTIKALA I PROMO KODOVA IZ BAZE
  useEffect(() => {
    const dobaviPodatke = async () => {
      try {
        setUčitava(true);
        const [odgovorClanci, odgovorKodovi] = await Promise.all([
          fetch('http://localhost:5000/api/articles'),
          fetch('http://localhost:5000/api/promoCode')
        ]);
        if (!odgovorClanci.ok) {
          throw new Error('Neuspješno preuzimanje istorijskih zapisa.');
        }
        let podaciClanci = await odgovorClanci.json();

        // Hronolosko sortiranje na osnovu prvog taga godine
        podaciClanci.sort((a, b) => {
          const godinaA = a.tagovi && a.tagovi[0] ? parseInt(a.tagovi[0], 10) : 0;
          const groupB = b.tagovi && b.tagovi[0] ? parseInt(b.tagovi[0], 10) : 0;
          return godinaA - groupB;
        });
        setClanci(podaciClanci);
        
        if (podaciClanci.length > 0) {
          setAktivnaEra(podaciClanci[0]);
        }

        if (odgovorKodovi.ok) {
          const podaciKodovi = await odgovorKodovi.json();
          // Filtriranje samo kodova koji su aktivni i upotebljivi
          const validniKodovi = podaciKodovi.filter(kod => kod.aktivan === true && kod.brojKoriscenja > 0);
          setPromoKodovi(validniKodovi);
        }
      } catch (err) {
        setGreška(err.message);
      } finally {
        setUčitava(false);
      }
    };

    dobaviPodatke();
  }, []);

  const DOZVOLJENI_PERIODI = ["Rimsko Carstvo", "Antička Grčka", "Srednji Vijek", "Feudalni Japan"];
  const vodiUProdavnicu = () => {
    if (aktivnaEra && DOZVOLJENI_PERIODI.includes(aktivnaEra.naslov)) {
    navigate('/shop', { state: { selektovanaEra: aktivnaEra.naslov } });
  }
  };

  const handleOdgovor = (izabranaOpcija) => {
    let trenutniBodovi = bodovi;
    if (izabranaOpcija === aktivnaPitanja[indeksPitanja].tacanOdgovor) {
      trenutniBodovi = bodovi + 1;
      setBodovi(trenutniBodovi);
    }

    const sledecePitanje = indeksPitanja + 1;
    if (sledecePitanje < aktivnaPitanja.length) {
      setIndeksPitanja(sledecePitanje);
    } else {
      if (trenutniBodovi === aktivnaPitanja.length && promoKodovi.length > 0) {
        const randomIndeks = Math.floor(Math.random() * promoKodovi.length);
        setIzvuceniKod(promoKodovi[randomIndeks]);
      }
      setKvizZavrsen(true);
    }
  };

  const restartujKviz = () => {
    setAktivnaPitanja(generisiNasumicnaPitanja());
    setIndeksPitanja(0);
    setBodovi(0);
    setKvizZavrsen(false);
    setIzvuceniKod(null);
  };

  // Ucitavanje i greska
  if (učitava) return (
    <div className="pt-40 text-center bg-stone-950 min-h-screen text-amber-400 text-xl animate-pulse">
      Otvarajući drevne svitke iz baze...
    </div>
  );

  if (greška) return (
    <div className="pt-40 text-center bg-stone-950 min-h-screen text-red-400 text-xl">
      Greška u hronologiji: {greška}
    </div>
  );

  if (clanci.length === 0) return (
    <div className="pt-40 text-center bg-stone-950 min-h-screen text-stone-400 text-xl">
      Trenutno nema istorijskih zapisa u kovačnici.
    </div>
  );

  return (
    <div className="pt-25 pb-20 bg-stone-950 min-h-screen text-stone-100 font-serif">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-400 tracking-wider mb-2 text-center">VAVILONSKA BIBLIOTEKA</h1>
        <p className="text-stone-400 text-center mb-12">Prošetajte kroz istoriju i otkrijte mnoge tajne koje čekaju da budu prisjećene.</p>

        {/* TIMELINE */}
        <div className="relative my-24 max-w-6xl mx-auto px-2">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-800 transform -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-amber-500 transform -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${(clanci.findIndex(e => e._id === aktivnaEra._id) / (clanci.length - 1)) * 100}%` 
            }}
          />

          <div className="relative flex justify-between items-center z-10">
            {clanci.map((era, indeks) => {
              const jeAktivna = era._id === aktivnaEra._id;
              const jeProslaIliAktivna = clanci.findIndex(e => e._id === aktivnaEra._id) >= indeks;
              const jeIznad = indeks % 2 === 0;

              return (
                <div key={era._id} className="relative flex flex-col items-center">
                  <button
                    onClick={() => setAktivnaEra(era)}
                    className={`absolute whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 shadow-md cursor-pointer hover:scale-105 ${
                      jeIznad ? '-top-16' : 'top-8'
                    } ${
                      jeAktivna
                        ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-amber-500/20 scale-105'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {era.naslov.length > 15 ? `${era.naslov.substring(0, 15)}...` : era.naslov}
                    
                    <div className={`absolute left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
                      jeIznad ? '-bottom-1 border-stone-800' : '-top-1 border-stone-800 rotate-[225deg]'
                    } ${jeAktivna ? 'bg-amber-500 border-none' : 'bg-stone-900'}`} />
                  </button>

                  <div 
                    onClick={() => setAktivnaEra(era)}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-500 cursor-pointer ${
                      jeProslaIliAktivna ? 'bg-amber-500 border-amber-300 scale-125' : 'bg-stone-950 border-stone-700'
                    }`}
                  />
                  
                  <span className={`absolute text-[10px] font-mono text-stone-500 ${jeIznad ? 'top-5' : '-top-7'}`}>
                        {(() => {
                            const god = era.tagovi && era.tagovi[0] ? parseInt(era.tagovi[0], 10) : null;
                            if (god === null || isNaN(god)) return "Istorija";
                            return god < 0 ? `${Math.abs(god)} p.n.e.` : `${god} n.e.`;
                        })()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRIKAZ SADRZAJA SELEKTOVANE ERE */}
        <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800 shadow-2xl transition-all duration-300">
          <div className="flex justify-between items-baseline border-b border-stone-800 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-amber-400 tracking-wide">{aktivnaEra.naslov}</h2>
            <span className="text-md font-mono text-stone-500">Autor: {aktivnaEra.autor}</span>
          </div>

          {aktivnaEra.slikaUrl && (
            <div className="w-120 h-90 overflow-hidden rounded-xl mb-6 border border-stone-800 bg-stone-950 flex items-center float-right ml-6">
              <img src={aktivnaEra.slikaUrl} alt={aktivnaEra.naslov} className="w-full h-full object-fill opacity-90 " />
            </div>
          )}

          <p className="text-stone-300 leading-relaxed text-base mb-6 whitespace-pre-line">
            {aktivnaEra.sadrzaj}
          </p>
          <div className="clear-both"></div>

          {aktivnaEra.tagovi && aktivnaEra.tagovi.length > 0 && (
            <div className="flex gap-2 mb-8 flex-wrap">
              {aktivnaEra.tagovi.map((tag, i) => (
                <span key={i} className="bg-stone-950 text-amber-500/80 border border-amber-500/20 px-3 py-1 rounded-lg text-xs font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Dugme unutar sadrzaja ere  */}
            <div className="text-right">
            {(() => {
                const jePeriodPodrzan = aktivnaEra && DOZVOLJENI_PERIODI.includes(aktivnaEra.naslov);
                
                return (
                <button 
                    onClick={vodiUProdavnicu}
                    disabled={!jePeriodPodrzan}
                    className={`font-bold px-6 py-3 rounded-xl text-sm transition-all inline-flex items-center gap-2 ${
                    jePeriodPodrzan 
                        ? "bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30 hover:shadow-lg cursor-pointer" 
                        : "bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed opacity-50"
                    }`}
                >
                    {jePeriodPodrzan ? "Pogledaj arsenal ovog perioda →" : "Arsenal nedostupan za ovaj period"}
                </button>
                );
            })()}
            </div>
        </div>

        {/* KVIZ  */}
        <div className="mt-12 max-w-5xl mx-auto bg-stone-900 p-8 rounded-2xl border border-stone-800 shadow-2xl">
          <h2 className="text-2xl font-bold text-amber-400 tracking-wide mb-2 text-center">KVIZ ZNANJA</h2>
          <p className="text-stone-400 text-sm text-center mb-6">Tačno odgovorite na sva pitanja koje vam postavlja čuvar biblioteke i osvojite tajni kod za popust u arsenalu!</p>

          {!kvizZavrsen ? (
            <div>
              <div className="flex justify-between items-center text-xs text-stone-500 font-mono mb-4">
                <span>Pitanje {indeksPitanja + 1} od {aktivnaPitanja.length}</span>
                <span>Tačni odgovori: {bodovi}</span>
              </div>
              
              <h3 className="text-lg font-medium text-stone-200 mb-6 bg-stone-950/40 p-4 rounded-xl border border-stone-800/50">
                {aktivnaPitanja[indeksPitanja].pitanje}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aktivnaPitanja[indeksPitanja].opcije.map((opcija, i) => (
                  <button
                    key={i}
                    onClick={() => handleOdgovor(opcija)}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium p-4 rounded-xl text-sm border border-stone-700/50 hover:border-amber-500/50 transition-all text-left cursor-pointer active:scale-98"
                  >
                    {opcija}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <h3 className="text-xl font-bold text-stone-200 mb-2">Kviz gotov!</h3>
              <p className="text-stone-400 mb-6">
                Odgovorili ste tačno na <span className="text-amber-400 font-bold">{bodovi} od {aktivnaPitanja.length}</span> pitanja.
              </p>

              {bodovi === aktivnaPitanja.length ? (
                <div className="bg-amber-950/30 border border-amber-500/30 p-6 rounded-2xl max-w-sm mx-auto animate-bounce mt-10">
                  <span className="text-xs text-amber-500 font-bold uppercase tracking-widest block mb-2">Svaka čast na mudrosti, izvoli:</span>

                  <span className="text-2xl font-mono font-bold text-amber-400 bg-stone-950 px-4 py-2 rounded-lg tracking-wider border border-amber-500/20">
                    {izvuceniKod ? izvuceniKod.kod : "ANTIKA10"}
                  </span>
                  
                  <p className="text-[11px] text-stone-500 mt-3">
                    Iskoristite ovaj kod za {izvuceniKod ? izvuceniKod.procenatPopusta : 10}% popusta pri kupovini.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-red-400 text-sm mb-4">Morate tačno odgovoriti na sva pitanja da biste dobili nagradni kod.</p>
                  <button
                    onClick={restartujKviz}
                    className="bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold px-5 py-2.5 rounded-xl text-xs border border-amber-500/20 cursor-pointer transition-colors"
                  >
                    Čuvar bibllioteke ti nudi još jednu šansu.
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Education;