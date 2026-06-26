import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './context/CartContext';

function ProductCard({ id, naziv, cijena, period, slika }) {
    const navigate = useNavigate();

  return (
    <div className="bg-stone-900 font-serif text-stone-100 rounded-xl shadow-xl border border-stone-800 flex flex-col justify-between hover:scale-105 transition-transform duration-300 overflow-hidden">
      
      {/* SLIKA */}
      <div className="h-48 w-full overflow-hidden relative bg-stone-800">
        <img 
          src={slika} 
          alt={naziv} 
          className="bg-stone-900 w-full h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
        />
        {/* PERIOD */}
        <span className="absolute bottom-1 right-2 text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-stone-950/80 px-2 py-1 rounded">
          {period}
        </span>
      </div>

      {/* DIO ZA TEKST I DUGME  */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-wide text-stone-200">{naziv}</h3>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-stone-500 block uppercase tracking-wider">Cijena</span>
            <span className="text-base font-bold text-amber-500">{cijena} EUR</span>
          </div>

          <button 
            onClick={() => navigate(`/shop/item/${id}`)}
            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-lg text-xs shadow-md transition-colors cursor-pointer">
            Pogledaj
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;