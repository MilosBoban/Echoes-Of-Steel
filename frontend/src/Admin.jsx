import React, { useState, useEffect } from 'react';
import API from './api';

function Admin() {
  const [activeTab, setActiveTab] = useState('proizvodi');

  const [proizvodi, setProizvodi] = useState([]);
  const [korisnici, setKorisnici] = useState([]);
  const [porudzbine, setPorudzbine] = useState([]);
  const [edukacija, setEdukacija] = useState([]);
  const [promoKodovi, setPromoKodovi] = useState([]); 

  const [editId, setEditId] = useState(null);
  const [itemForm, setItemForm] = useState({
    naziv: '', opis: '', kategorija: 'Oružje', podKategorija: '', period: '', cijena: '', slikaUrl: '', zaliha: 1
  });

  const [editEduId, setEditEduId] = useState(null);
  const [eduForm, setEduForm] = useState({ 
    naslov: '', sadrzaj: '', autor: 'Istoričar Aplikacije', slikaUrl: '', tagoviInput: '' 
  });

  const [editPromoId, setEditPromoId] = useState(null);
  const [promoForm, setPromoForm] = useState({
    kod: '', procenatPopusta: '', datumIsteka: '', aktivan: true, brojKoriscenja: 10
  });

  useEffect(() => {
    fetchPodatke();
  }, []);

  const fetchPodatke = async () => {
    try {
      const resItems = await API.get('/items').catch(() => ({ data: [] }));
      setProizvodi(Array.isArray(resItems.data) ? resItems.data : (resItems.data.items || []));
    } catch (e) {}

    try {
      const resUsers = await API.get('/users').catch(() => ({ data: [] }));
      setKorisnici(Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data.users || []));
    } catch (e) {}

    try {
      const resOrders = await API.get('/orders').catch(() => ({ data: [] }));
      setPorudzbine(Array.isArray(resOrders.data) ? resOrders.data : (resOrders.data.orders || []));
    } catch (e) {}

    try {
      const resEdu = await API.get('/articles').catch(() => ({ data: [] }));
      setEdukacija(Array.isArray(resEdu.data) ? resEdu.data : (resEdu.data.articles || []));
    } catch (e) {}

    try {
      const resPromo = await API.get('/promoCode').catch(() => ({ data: [] }));
      setPromoKodovi(Array.isArray(resPromo.data) ? resPromo.data : (resPromo.data.promoCodes || []));
    } catch (e) {}
  };

  // CRUD: PROIZVODI
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/items/${editId}`, itemForm);
        alert('Proizvod uspješno izmijenjen!');
      } else {
        await API.post('/items', itemForm);
        alert('Novi proizvod iskovan u bazi!');
      }
      setItemForm({ naziv: '', opis: '', kategorija: 'Oružje', podKategorija: '', period: '', cijena: '', slikaUrl: '', zaliha: 1 });
      setEditId(null);
      fetchPodatke();
    } catch (err) { alert('Greška pri čuvanju proizvoda!'); }
  };

  const handleItemDelete = async (id) => {
    if (window.confirm('Da li ste sigurni?')) {
      try { await API.delete(`/items/${id}`); fetchPodatke(); } catch (err) { alert('Greška.'); }
    }
  };

  // CRUD: EDUKACIJA
  const handleEduSubmit = async (e) => {
    e.preventDefault();
    const pripremljeniTagovi = eduForm.tagoviInput ? eduForm.tagoviInput.split(',').map(tag => tag.trim()) : [];
    const podaciZaSlanje = {
      naslov: eduForm.naslov, sadrzaj: eduForm.sadrzaj, autor: eduForm.autor, slikaUrl: eduForm.slikaUrl || undefined, tagovi: pripremljeniTagovi
    };
    try {
      if (editEduId) {
        await API.put(`/articles/${editEduId}`, podaciZaSlanje);
        alert('Članak uspješno ažuriran!');
      } else {
        await API.post('/articles', podaciZaSlanje);
        alert('Novi istorijski članak zapisan!');
      }
      setEduForm({ naslov: '', sadrzaj: '', autor: 'Istoričar Aplikacije', slikaUrl: '', tagoviInput: '' });
      setEditEduId(null);
      fetchPodatke();
    } catch (err) { alert('Greška pri čuvanju članka.'); }
  };

  const handleEduDelete = async (id) => {
    if (window.confirm('Obrisati ovaj članak?')) {
      try { await API.delete(`/articles/${id}`); fetchPodatke(); } catch (err) { alert('Greška.'); }
    }
  };

  // CRUD: PROMO KODOVI
  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editPromoId) {
        await API.put(`/promoCode/${editPromoId}`, promoForm);
        alert('Promo kod uspešno izmenjen!');
      } else {
        await API.post('/promoCode', promoForm);
        alert('Novi Carski vaučer upisan u bazu!');
      }
      setPromoForm({ kod: '', procenatPopusta: '', datumIsteka: '', aktivan: true, brojKoriscenja: 10 });
      setEditPromoId(null);
      fetchPodatke();
    } catch (err) {
      alert('Greška pri čuvanju promo koda. (Kod mora biti jedinstven)');
    }
  };

  const handlePromoDelete = async (id) => {
    if (window.confirm('Obrisati ovaj promo kod trajno?')) {
      try {
        await API.delete(`/promoCode/${id}`);
        fetchPodatke();
      } catch (err) {
        alert('Greška pri brisanju.');
      }
    }
  };

  // PORUDŽBINE STATUS
  const handleStatusChange = async (orderId, noviStatus) => {
    try {
      await API.put(`/orders/${orderId}`, { status: noviStatus });
      alert('Status porudžbine ažuriran!');
      fetchPodatke();
    } catch (err) { alert('Greška pri izmjeni statusa.'); }
  };

  // KORISNICI: BRISANJE
  const handleUserDelete = async (id) => {
    if (window.confirm('Da li ste sigurni?')) {
      try { await API.delete(`/users/${id}`); fetchPodatke(); } catch (err) { alert('Greška.'); }
    }
  };

  return (
    <div className="bg-stone-950 min-h-screen text-stone-100 p-6 font-serif">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="border-b border-stone-800 pb-4">
          <h1 className="text-3xl font-bold tracking-wider text-amber-400 uppercase">Admin Panel</h1>
        </div>

        {/* TAB NAVIGACIJA */}
        <div className="flex flex-wrap gap-2 border-b border-stone-900 pb-2">
          {['proizvodi', 'edukacija', 'korisnici', 'porudzbine', 'promoKodovi'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab ? 'bg-amber-600 text-stone-950 shadow-lg' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
              }`}
            >
              {tab === 'porudzbine' ? 'Porudžbine' : tab === 'korisnici' ? 'Korisnici' : tab === 'edukacija' ? 'Biblioteka' : tab === 'promoKodovi' ? 'Promo Kodovi' : 'Proizvodi'}
            </button>
          ))}
        </div>

        {/* TAB: PROIZVODI */}
        {activeTab === 'proizvodi' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl h-fit">
              <h2 className="text-lg font-bold text-amber-400 uppercase mb-4">{editId ? 'Uredi Relikviju' : 'Iskuj Novi Predmet'}</h2>
              <form onSubmit={handleItemSubmit} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Naziv proizvoda</label>
                  <input type="text" required value={itemForm.naziv} onChange={(e) => setItemForm({...itemForm, naziv: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Opis</label>
                  <textarea required rows="2" value={itemForm.opis} onChange={(e) => setItemForm({...itemForm, opis: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Kategorija</label>
                    <select value={itemForm.kategorija} onChange={(e) => setItemForm({...itemForm, kategorija: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-300 focus:outline-none">
                      <option value="Oružje">Oružje</option>
                      <option value="Oklop">Oklop</option>
                      <option value="Relik">Relik</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Podkategorija</label>
                    <input type="text" required value={itemForm.podKategorija} onChange={(e) => setItemForm({...itemForm, podKategorija: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Cijena (EUR)</label>
                    <input type="number" required value={itemForm.cijena} onChange={(e) => setItemForm({...itemForm, cijena: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Zaliha</label>
                    <input type="number" required value={itemForm.zaliha} onChange={(e) => setItemForm({...itemForm, zaliha: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Period</label>
                    <input type="text" required value={itemForm.period} onChange={(e) => setItemForm({...itemForm, period: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">URL Slike</label>
                  <input type="text" value={itemForm.slikaUrl} onChange={(e) => setItemForm({...itemForm, slikaUrl: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" />
                </div>
                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold p-3 rounded-xl cursor-pointer uppercase">Sačuvaj</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase font-mono text-[10px]">
                    <th className="pb-3">Slika</th>
                    <th className="pb-3">Naziv</th>
                    <th className="pb-3">Kategorija</th>
                    <th className="pb-3">Cijena</th>
                    <th className="pb-3">Zaliha</th>
                    <th className="pb-3 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {proizvodi.map((prod) => (
                    <tr key={prod._id} className="border-b border-stone-800/40 hover:bg-stone-950/20">
                      <td className="py-2"><img src={prod.slikaUrl} className="w-8 h-8 object-cover rounded" alt="" /></td>
                      <td className="py-2 font-bold text-stone-200">{prod.naziv}</td>
                      <td className="py-2 text-stone-400">{prod.kategorija}</td>
                      <td className="py-2 font-mono text-amber-400">{prod.cijena} EUR</td>
                      <td className="py-2">{prod.zaliha} kom</td>
                      <td className="py-2 text-right space-x-2">
                        <button onClick={() => { setEditId(prod._id); setItemForm(prod); }} className="text-amber-500 cursor-pointer">Uredi</button>
                        <button onClick={() => handleItemDelete(prod._id)} className="text-red-500 cursor-pointer">Briši</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: EDUKACIJA */}
        {activeTab === 'edukacija' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl h-fit">
              <h2 className="text-lg font-bold text-amber-400 uppercase mb-4">{editEduId ? 'Uredi Članak' : 'Novi Istorijski Svitak'}</h2>
              <form onSubmit={handleEduSubmit} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Naslov</label>
                  <input type="text" required value={eduForm.naslov} onChange={(e) => setEduForm({...eduForm, naslov: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Autor</label>
                  <input type="text" required value={eduForm.autor} onChange={(e) => setEduForm({...eduForm, autor: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Sadržaj Članka</label>
                  <textarea required rows="5" value={eduForm.sadrzaj} onChange={(e) => setEduForm({...eduForm, sadrzaj: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200 resize-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">URL Slike Članka</label>
                  <input type="text" value={eduForm.slikaUrl} onChange={(e) => setEduForm({...eduForm, slikaUrl: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Tagovi (odvojite zarezom)</label>
                  <input type="text" value={eduForm.tagoviInput} onChange={(e) => setEduForm({...eduForm, tagoviInput: e.target.value})} className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" placeholder="Sparta, Macevi" />
                </div>
                <button type="submit" className="w-full bg-amber-600 text-stone-950 font-bold p-3 rounded-xl cursor-pointer uppercase">Objavi</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl">
              <div className="space-y-4">
                {edukacija.map((edu) => (
                  <div key={edu._id} className="p-4 bg-stone-950 rounded-xl border border-stone-800 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex gap-1.5 flex-wrap">
                        {edu.tagovi?.map((t, idx) => (
                          <span key={idx} className="text-[9px] bg-stone-900 text-stone-400 px-1.5 py-0.5 rounded border border-stone-800">{t}</span>
                        ))}
                      </div>
                      <h4 className="text-sm font-bold text-stone-200">{edu.naslov}</h4>
                      <p className="text-stone-400 text-xs line-clamp-2">{edu.sadrzaj}</p>
                      <span className="text-[10px] text-amber-500 block">Autor: {edu.autor}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => { setEditEduId(edu._id); setEduForm({...edu, tagoviInput: edu.tagovi?.join(', ')}); }} className="text-amber-500 cursor-pointer">Uredi</button>
                      <button onClick={() => handleEduDelete(edu._id)} className="text-red-500 cursor-pointer">Ukloni</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: KORISNICI */}
        {activeTab === 'korisnici' && (
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase font-mono text-[10px]">
                  <th className="pb-3">Ime</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Telefon</th>
                  <th className="pb-3">Uloga</th>
                  <th className="pb-3">Adresa</th>
                  <th className="pb-3 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {korisnici.map((u) => (
                  <tr key={u._id} className="border-b border-stone-800/40 hover:bg-stone-950/20">
                    <td className="py-3 font-bold text-stone-200">{u.ime}</td>
                    <td className="py-3 font-mono text-stone-400">{u.email}</td>
                    <td className="py-3 font-mono text-amber-500">{u.telefon || 'Nije unesen'}</td>
                    <td className="py-3"><span className="px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800">{u.uloga}</span></td>
                    <td className="py-3 text-stone-400">{u.adresa || 'Nema'}</td>
                    <td className="py-3 text-right space-x-2">
                        <button onClick={() => handleUserDelete(u._id)} className="text-red-500 cursor-pointer">Briši</button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: PORUDŽBINE */}
        {activeTab === 'porudzbine' && (
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase font-mono text-[10px]">
                  <th className="pb-3">ID Porudžbine</th>
                  <th className="pb-3">Korisnik</th>
                  <th className="pb-3">Adresa</th>
                  <th className="pb-3">Promo Kod</th>
                  <th className="pb-3">Ukupna Cijena</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {porudzbine.map((order) => (
                  <tr key={order._id} className="border-b border-stone-800/40 hover:bg-stone-950/20">
                    <td className="py-3 font-mono text-stone-500">{order._id}</td>
                    <td className="py-3 font-mono text-stone-400">{korisnici.find(k => k._id === order.korisnik)?.ime || 'Nepoznat korisnik'}</td>
                    <td className="py-3 text-stone-200">{order.adresa}</td>
                    <td className="py-3 font-mono text-amber-500">{order.korisceniPromoKod || 'Nema'}</td>
                    <td className="py-3 font-mono text-amber-400">{order.ukupnaCijena} EUR</td>
                    <td className="py-3">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-stone-950 border border-stone-800 p-1.5 text-xs rounded text-stone-300"
                      >
                        <option value="Na čekanju">Na čekanju</option>
                        <option value="Spakovano">Spakovano</option>
                        <option value="U transportu">U transportu</option>
                        <option value="Dostavljeno">Dostavljeno</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: PROMO KODOVI */}
        {activeTab === 'promoKodovi' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Forma za dodavanje/uređivanje */}
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl h-fit">
              <h2 className="text-lg font-bold text-amber-400 uppercase mb-4">
                {editPromoId ? 'Uredi Promo Kod' : 'Novi Promo Vaučer'}
              </h2>
              <form onSubmit={handlePromoSubmit} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Kod (Jedinstven)</label>
                  <input 
                    type="text" required 
                    value={promoForm.kod} 
                    onChange={(e) => setPromoForm({...promoForm, kod: e.target.value})} 
                    className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500" 
                    placeholder="Npr. IMPERATOR20" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Popust (%)</label>
                    <input 
                      type="number" required min="1" max="100"
                      value={promoForm.procenatPopusta} 
                      onChange={(e) => setPromoForm({...promoForm, procenatPopusta: e.target.value})} 
                      className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Broj Korišćenja</label>
                    <input 
                      type="number" required 
                      value={promoForm.brojKoriscenja} 
                      onChange={(e) => setPromoForm({...promoForm, brojKoriscenja: e.target.value})} 
                      className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-200" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Datum Isteka</label>
                  <input 
                    type="date" required 
                    value={promoForm.datumIsteka ? promoForm.datumIsteka.substring(0, 10) : ''} 
                    onChange={(e) => setPromoForm({...promoForm, datumIsteka: e.target.value})} 
                    className="bg-stone-950 border border-stone-800 p-3 rounded-xl text-stone-300 focus:outline-none" 
                  />
                </div>
                <div className="flex items-center gap-2 py-1">
                  <input 
                    type="checkbox" 
                    id="aktivan"
                    checked={promoForm.aktivan} 
                    onChange={(e) => setPromoForm({...promoForm, aktivan: e.target.checked})} 
                    className="accent-amber-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="aktivan" className="text-[10px] font-bold text-stone-300 uppercase cursor-pointer">Kod je trenutno aktivan</label>
                </div>
                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold p-3 rounded-xl cursor-pointer uppercase">
                  {editPromoId ? 'Ažuriraj Kod' : 'Aktiviraj Vaučer'}
                </button>
              </form>
            </div>

            {/* Tabela svih aktivnih/neaktivnih promo kodova */}
            <div className="lg:col-span-2 bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase font-mono text-[10px]">
                    <th className="pb-3">Kod</th>
                    <th className="pb-3">Popust</th>
                    <th className="pb-3">Preostalo Korišćenja</th>
                    <th className="pb-3">Ističe</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {promoKodovi.map((promo) => (
                    <tr key={promo._id} className="border-b border-stone-800/40 hover:bg-stone-950/20">
                      <td className="py-3 font-bold tracking-wider text-stone-200 font-mono uppercase">{promo.kod}</td>
                      <td className="py-3 font-mono text-amber-400 text-sm font-bold">{promo.procenatPopusta}%</td>
                      <td className="py-3 font-mono text-stone-400">{promo.brojKoriscenja} puta</td>
                      <td className="py-3 font-mono text-stone-400">
                        {new Date(promo.datumIsteka).toLocaleDateString('sr-RS')}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          promo.aktivan ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' : 'bg-red-950/40 text-red-400 border border-red-900'
                        }`}>
                          {promo.aktivan ? 'Aktivan' : 'Ugašen'}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button onClick={() => { setEditPromoId(promo._id); setPromoForm(promo); }} className="text-amber-500 cursor-pointer">Uredi</button>
                        <button onClick={() => handlePromoDelete(promo._id)} className="text-red-500 cursor-pointer">Briši</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;