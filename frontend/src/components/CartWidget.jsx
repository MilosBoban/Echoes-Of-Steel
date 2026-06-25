import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, removeFromCart, ukupnaCijena, ukupanBrojPredmeta, smanjiKolicinu } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* PLUTAJUCE DUGME KORPE */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-amber-500 hover:bg-amber-600 text-stone-950 p-4 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-300 transform hover:scale-110 flex items-center justify-center cursor-pointer"
      >
        {/* Ikona korpe */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        
        {/* Ikona sa brojem proizvoda */}
        {ukupanBrojPredmeta > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {ukupanBrojPredmeta}
          </span>
        )}
      </button>

      {/* POZADINSKA SJENKA */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* BOCNI PANEL KORPE */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-stone-900 border-l border-stone-800 shadow-2xl z-50 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Zaglavlje korpe */}
        <div>
          <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-6 font-serif">
            <h3 className="text-xl font-bold text-amber-400 tracking-wider">KORPA SA RELIKVIJAMA</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-100 text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Lista proizvoda u korpi */}
          <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-2 font-serif">
            {cartItems.length === 0 ? (
              <p className="text-stone-500 text-center py-10 italic">Tvoja korpa je trenutno prazna. Istraži kovačnicu.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3 bg-stone-950/50 p-3 rounded-lg border border-stone-800/60">
                  {/* Mala slika proizvoda */}
                  <img src={item.slikaUrl || item.slika} alt={item.naziv} className="w-12 h-12 object-cover rounded-md border border-stone-800" />
                  
                  {/* Informacije o proizvodu */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-stone-200 truncate">{item.naziv}</h4>
                    <p className="text-xs text-amber-500/80 mt-0.5">
                      {item.kolicina}x {item.cijena} EUR
                    </p>
                  </div>

                  {/* Dugme za smanjivanje kolicine */}
                    <button
                        onClick={() => smanjiKolicinu(item._id)}
                        className="text-stone-500 hover:text-amber-500 p-1 transition-colors cursor-pointer font-bold text-lg"
                        title="Smanji količinu"
                    >
                        -
                    </button>

                  {/* Dugme za brisanje iz korpe */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-stone-500 hover:text-red-500 p-1 transition-colors cursor-pointer"
                    title="Ukloni iz korpe"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Donji dio sa ukupnom cijenom i dugmetom za Checkout */}
        <div className="border-t border-stone-800 pt-4 bg-stone-900 font-serif">
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-400 text-sm">UKUPNO ZA PLAĆANJE:</span>
            <span className="text-xl font-bold text-amber-400">{ukupnaCijena} EUR</span>
          </div>

          <button
            disabled={cartItems.length === 0}
            onClick={() => {
              setIsOpen(false);
              navigate('/checkout');
            }}
            className={`w-full font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer text-center ${cartItems.length > 0 ? 'bg-amber-500 text-stone-950 hover:bg-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.2)]' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}`}
          >
            Idi na plaćanje
          </button>
        </div>
      </div>
    </>
  );
};

export default CartWidget;