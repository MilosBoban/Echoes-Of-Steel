import React, { createContext, useContext, useState, useEffect } from 'react';

  const CartContext = createContext();
export const CartProvider = ({ children }) => {
    // Inicijalizacija korpe iz localStoragea da se podaci ne obrisu na refresh stranice
    const [cartItems, setCartItems] = useState(() => {
      const lokalnaKorpa = localStorage.getItem('vavilonska_korpa');
      return lokalnaKorpa ? JSON.parse(lokalnaKorpa) : [];
    });

    useEffect(() => {
      localStorage.setItem('vavilonska_korpa', JSON.stringify(cartItems));
    }, [cartItems]);

    // Dodavanje u korpu
    const addToCart = (proizvod) => {
      setCartItems((prevItems) => {
        // Provjera da li je proizvod vec u korpi
        const postoji = prevItems.find((item) => item._id === proizvod._id);
        if (postoji) {
          // Ako postoji uvecava mu kolicinu
          return prevItems.map((item) =>
            item._id === proizvod._id ? { ...item, kolicina: item.kolicina + 1 } : item
          );
        }
        // Ako ne postoji dodajemo ga sa kolicinom 1
        return [...prevItems, { ...proizvod, kolicina: 1 }];
      });
    };

    // Brisanje korpe
    const removeFromCart = (id) => {
      setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
    };

    // Smanjivanje kolicine proizvoda u korpi
    const smanjiKolicinu = (id) => {
    setCartItems((prevItems) => {
      // Pronalayi proizvod u korpi da mu provjeri trenutnu kolicinu
      const stavka = prevItems.find((item) => item._id === id);
      // Ako je kolicina 1, naredni klik ga brise u potpunosti iz korpe
      if (stavka && (stavka.kolicina === 1 || stavka.quantity === 1)) {
        return prevItems.filter((item) => item._id !== id);
      }
      // Ako je kolicina veca od 1 samo je smanjuje za jedan
      return prevItems.map((item) =>
        item._id === id 
          ? { ...item, kolicina: (item.kolicina || item.quantity) - 1 } 
          : item
      );
    });
  };

  // Praznjenje korpe nakon uspjesnog placanja
  const clearCart = () => {
    setCartItems([]);
  };

  // Racunanje ukupne cijene
  const ukupnaCijena = cartItems.reduce((acc, item) => acc + item.cijena * item.kolicina, 0);
  // Racunanje ukupnog broja proizvoda za ikonicu
  const ukupanBrojPredmeta = cartItems.reduce((acc, item) => acc + item.kolicina, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, ukupnaCijena, ukupanBrojPredmeta, smanjiKolicinu }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);