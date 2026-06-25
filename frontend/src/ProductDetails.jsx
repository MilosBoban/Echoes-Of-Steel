import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from './context/CartContext';

const ProductDetails = () => {
  const { id } = useParams(); // Uzima ID predmeta iz URL-a
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Funkcija iz korpe
  const [predmet, setPredmet] = useState(null);
  const [učitava, setUčitava] = useState(true);
  const [greška, setGreška] = useState(null);

  useEffect(() => {
    const dobaviPredmet = async () => {
      try {
        setUčitava(true);
        const odgovor = await fetch(`http://localhost:5000/api/items/${id}`);
        if (!odgovor.ok) throw new Error('Neuspješno učitavanje relikvije.');
        
        const podaci = await odgovor.json();
        setPredmet(podaci);
      } catch (err) {
        setGreška(err.message);
      } finally {
        setUčitava(false);
      }
    };

    dobaviPredmet();
  }, [id]);

  if (učitava) return <div className="text-center py-20 font-mono text-stone-400">Učitavanje tajni iz kovačnice...</div>;
  if (greška) return <div className="text-center py-20 text-red-500 font-mono">{greška}</div>;
  if (!predmet) return <div className="text-center py-20 text-stone-500">Relikvija nije pronađena.</div>;

  return (
    <div className="bg-stone-950 pt-20 min-h-screen mx-auto px-4 py-12 font-serif">
      {/* Dugme za nazad */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="w-full md:w-auto font-bold uppercase text-xs tracking-wider py-2 px-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-600 shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all duration-300 cursor-pointer text-center"
        >
          ← Nazad u arsenal
        </button>
      </div>

      <div className="font-serif grid grid-cols-1 max-w-6xl mx-auto md:grid-cols-2 gap-12 bg-stone-900/40 p-8 rounded-2xl border border-stone-800">
        {/* Lijeva strana: Slika */}
        <div className="w-full h-96 overflow-hidden rounded-xl border border-stone-800 bg-stone-950 flex items-center justify-center">
          <img 
            src={predmet.slikaUrl || predmet.slika} 
            alt={predmet.naziv} 
            className="w-full h-full object-contain p-4 opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Desna strana: Detalji */}
        <div className="flex flex-col justify-between font-serif">
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-md">
              {predmet.period || (predmet.tagovi && predmet.tagovi[0]) || 'Drevno'}
            </span>
            <h1 className="text-3xl font-bold text-stone-100 mt-4 tracking-wide">{predmet.naziv}</h1>
            
            <div className="text-2xl font-bold text-amber-400 mt-2">
              {predmet.cijena} EUR
            </div>
            <div className="text-md text-stone-400">
              Zaliha: {predmet.zaliha}
            </div>
            <div className="text-md text-stone-400 mb-6">
              {predmet.podKategorija}
            </div>

            <p className="text-stone-300 leading-relaxed text-base whitespace-pre-line mb-6">
              {predmet.opis || "Ova drevna relikvija krije vjekovne tajne kovača. Svaki detalj na njoj izrađen je sa posebnom istorijskom preciznošću."}
            </p>
          </div>

          {/* DUGME ZA DODAVANJE U KORPU */}
          <button
            onClick={() => addToCart(predmet)}
            disabled={predmet.zaliha <= 0} 
            className={`w-full md:w-auto font-bold uppercase tracking-wider py-4 px-8 rounded-xl transition-colors ${
              predmet.zaliha <= 0 
                ? 'bg-stone-700 text-stone-400 cursor-not-allowed opacity-50' // Stilovi kada nema yaliha
                : 'bg-amber-500 text-stone-950 hover:bg-amber-600'            // Stilovi kada ima zaliha
            }`}
          >
            {predmet.zaliha <= 0 ? 'Rasprodano / Nema na stanju' : 'Dodaj relikviju u korpu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;