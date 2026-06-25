// 1. Uvozimo useEffect i useState kuke
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useNavigate, useLocation } from 'react-router-dom';

function Shop() {
  const [relikvije, setRelikvije] = useState([]); // Početno stanje je prazan niz
  const [učitava, setUčitava] = useState(true);
  const [greška, setGreška] = useState(null);

  const location = useLocation();

  // FILTERI I SORTIRANJE
  const [izabranaKategorija, setIzabranaKategorija] = useState('sve');
  const [izabranaEra, setIzabranaEra] = useState(location.state && location.state.selektovanaEra ? location.state.selektovanaEra : 'sve');
  const [tipSortiranja, setTipSortiranja] = useState('default');
  const navigate = useNavigate();

  // Povlaacenje itema iz baze cim se stranica ucita
  useEffect(() => {
    const dobaviRelikvije = async () => {
      try {
        setUčitava(true);
        const odgovor = await fetch('http://localhost:5000/api/items'); 
        
        if (!odgovor.ok) {
          throw new Error('Nije moguće učitati relikvije iz kovačnice.');
        }
        
        const podaci = await odgovor.json();
        setRelikvije(podaci);
      } catch (err) {
        setGreška(err.message);
      } finally {
        setUčitava(false);
      }
    };

    dobaviRelikvije();
  }, []); // Prazan niz [] osigurava da se funkcija okine samo jednom pri ucitavanju stranice

  // LOGIKA FILTRIRANJA
  let prikazaniProizvodi = relikvije.filter((proizvod) => {
    const poklapaSeKategorija = izabranaKategorija === 'sve' || proizvod.kategorija === izabranaKategorija;
    const poklapaSeEra = izabranaEra === 'sve' || proizvod.period === izabranaEra;
    return poklapaSeKategorija && poklapaSeEra;
  });

  // LOGIKA SORTIRANJA
  if (tipSortiranja === 'jeftinije') {
    prikazaniProizvodi.sort((a, b) => a.cijena - b.cijena);
  } else if (tipSortiranja === 'skuplje') {
    prikazaniProizvodi.sort((a, b) => b.cijena - a.cijena);
  }

  return (
    <div className="bg-stone-950 min-h-screen text-stone-100 pt-25 pb-20 font-serif">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-400 tracking-wider mb-2">ARSENAL OKLOPA I RELIKVIJA</h1>
        <p className="text-stone-400 mb-8">Pronđi tajne koje istorija skriva i ponovi ih oživi.</p>
        
        {/* KONTROLNA TABLA SA FILTERIMA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-stone-900 p-5 rounded-xl border border-stone-800 font-serif">
          {/* FILTER 1: Kategorije */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Kategorija</label>
            <select 
              value={izabranaKategorija} 
              onChange={(e) => setIzabranaKategorija(e.target.value)}
              className="bg-stone-800 text-stone-100 p-2.5 rounded-lg border border-stone-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="sve">Sve Kategorije</option>
              <option value="Oružje">Oružje</option>
              <option value="Oklop">Oklop</option>
              <option value="Relik">Relikvije</option>
            </select>
          </div>

          {/* FILTER 2: Periodi */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Istorijski Period</label>
            <select 
              value={izabranaEra} 
              onChange={(e) => setIzabranaEra(e.target.value)}
              className="bg-stone-800 text-stone-100 p-2.5 rounded-lg border border-stone-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="sve">Svi Periodi</option>
              <option value="Rimsko Carstvo">Rimsko Carstvo</option>
              <option value="Antička Grčka">Antička Grčka</option>
              <option value="Srednji Vijek">Srednji Vijek</option>
              <option value="Feudalni Japan">Feudalni Japan</option>
            </select>
          </div>

          {/* FILTER 3: Sortiranje po cijeni */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Sortiraj po cijeni</label>
            <select 
              value={tipSortiranja} 
              onChange={(e) => setTipSortiranja(e.target.value)}
              className="bg-stone-800 text-stone-100 p-2.5 rounded-lg border border-stone-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="default">Standardno</option>
              <option value="jeftinije">Rastuće ↑</option>
              <option value="skuplje">Opadajuće ↓</option>
            </select>
          </div>
        </div>
        
        {/* Loading, Error, ili Sadržaj */}
        {učitava ? (
          <div className="text-center py-12">
            <p className="text-amber-400 text-xl animate-pulse">Učitavanje arsenala iz baze...</p>
          </div>
        ) : greška ? (
          <div className="text-center py-12 bg-red-950/30 rounded-xl border border-red-900/50">
            <p className="text-red-400 text-lg">Greška: {greška}</p>
          </div>
        ) : prikazaniProizvodi.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {prikazaniProizvodi.map((proizvod) => (
              <ProductCard 
                key={proizvod._id || proizvod.id} 
                id={proizvod._id || proizvod.id}
                naziv={proizvod.naziv}
                cijena={proizvod.cijena}
                period={proizvod.period}
                slika={proizvod.slikaUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-stone-900 rounded-xl border border-stone-800">
            <p className="text-stone-400 text-lg">Nema pronađenih relikvija za izabrane filtere.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;