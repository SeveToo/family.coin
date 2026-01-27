'use client';

import React, { useEffect, useState } from 'react';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Nav from '@/components/Nav';
import Wallet from '@/components/Wallet'; // Use the Wallet component for animated balance
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, runTransaction, query, where, orderBy, limit, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { ShopItem, Transaction } from '@/lib/types';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatBalance } from '@/lib/utils';
import useUserBalance from '@/lib/hooks/useUserBalance';
import useCurrentUserDocument from '@/lib/hooks/useCurrentUserDocument';
import TransactionHistory from '@/components/TransactionHistory';

const ShopPage = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const { user } = useAuth();
  const userDoc = useCurrentUserDocument();
  const balance = useUserBalance();
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const SEED_ITEMS: ShopItem[] = [
    { name: 'Granie na komputerze (1h)', price: 10, description: 'Dostęp do komputera na godzinę', icon: '💻' },
    { name: 'Granie na telefonie (1h)', price: 10, description: 'Dostęp do telefonu na godzinę', icon: '📱' },
    { name: 'Wyjście na lody', price: 20, description: 'Sponsorowane wyjście na lody', icon: '🍦' },
    { name: 'Bilet do kina', price: 50, description: 'Wyjście do kina z rodzicami', icon: '🎬' },
  ];

  const EMOJIS = ['🎁', '🍦', '🎬', '🎮', '📱', '💻', '🍕', '🍬', '🎨', '⚽', '📚', '🎸', '👟', '🎭', '🏰', '🎡', '🍩', '🥤', '🚲', '🛹', '🏕️', '🏊', '🍰', '🥓'];

  useEffect(() => {
    const q = query(collection(db, 'shop_items'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shopItems: ShopItem[] = [];
      snapshot.forEach((doc) => {
        shopItems.push({ id: doc.id, ...doc.data() } as ShopItem);
      });
      // Show DB items first, then seed items if list is short or empty
      setItems(shopItems);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddNewItem = async () => {
    try {
      await addDoc(collection(db, 'shop_items'), {
        name: 'Nowy przedmiot',
        price: 10,
        description: 'Opis przedmiotu...',
        icon: '🎁',
        isHidden: false
      });
      setMsg({ type: 'success', text: 'Dodano nowy przedmiot! Możesz go teraz edytować.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć "${name}" ze sklepu?`)) return;
    try {
      await deleteDoc(doc(db, 'shop_items', id));
      setMsg({ type: 'success', text: `Usunięto "${name}" ze sklepu.` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleMigrateSeedItem = async (seedItem: ShopItem) => {
    try {
      await addDoc(collection(db, 'shop_items'), {
        ...seedItem,
        isHidden: false
      });
      setMsg({ type: 'success', text: `Przeniesiono "${seedItem.name}" do bazy danych!` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleUpdateItem = async (id: string | undefined, updates: Partial<ShopItem>) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'shop_items', id), updates);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleBuy = async (item: ShopItem) => {
    if (!user || buying) return;
    if (balance < item.price) {
      setMsg({ type: 'error', text: 'Niewystarczająca ilość środków!' });
      return;
    }

    if (!confirm(`Czy na pewno chcesz kupić "${item.name}" za ${item.price}?`)) return;

    setBuying(item.name);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userDocSnap = await transaction.get(userRef);
        const userData = userDocSnap.data();
        if (!userData || userData.balance < item.price) throw new Error("Insufficient funds");

        transaction.update(userRef, { balance: userData.balance - item.price });
        const newTxRef = doc(collection(db, 'transactions'));
        transaction.set(newTxRef, {
          userId: user.uid,
          amount: -item.price,
          type: 'shop',
          description: `Zakup: ${item.name}`,
          createdAt: Date.now()
        });
      });
      setMsg({ type: 'success', text: `Kupiono: ${item.name}!` });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Błąd' });
    } finally {
      setBuying(null);
    }
  };

  return (
    <PrivateRoute>
      <div className="min-h-screen w-full max-w-xl mx-auto flex flex-col items-center py-5 px-4 pb-32">
        <Wallet />

        <div className="flex w-full items-center gap-2 mt-6 mb-6">
          <div className="tabs tabs-boxed flex-1">
            <button 
              className={`tab flex-1 ${activeTab === 'buy' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('buy')}
            >
              Kup 🛒
            </button>
            <button 
              className={`tab flex-1 ${activeTab === 'history' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Kupione 🗓️
            </button>
          </div>
          {userDoc?.isAdmin && (
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`btn btn-circle btn-sm ${isAdminMode ? 'btn-primary shadow-lg scale-110' : 'btn-ghost opacity-50'}`}
              title="Tryb edycji"
            >
              ⚙️
            </button>
          )}
        </div>

        {msg && (
          <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'} mb-6 shadow-lg`}>
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="btn btn-ghost btn-xs">X</button>
          </div>
        )}

        {activeTab === 'buy' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Add New Item Card (Admin Only) */}
            {isAdminMode && (
              <button 
                onClick={handleAddNewItem}
                className="card bg-primary/10 border-2 border-dashed border-primary h-full min-h-[160px] flex items-center justify-center hover:bg-primary/20 transition-all group active:scale-95"
              >
                <div className="flex flex-col items-center gap-2 text-primary">
                  <span className="text-4xl group-hover:scale-110 transition-transform">➕</span>
                  <span className="font-bold text-sm">Dodaj nowy przedmiot</span>
                </div>
              </button>
            )}

            {/* List items */}
            {[
              ...items, 
              ...(isAdminMode || items.length === 0 
                ? SEED_ITEMS.filter(s => !items.some(i => i.name === s.name)) 
                : []
              )
            ]
            .filter(i => !i.isHidden || userDoc?.isAdmin)
            .map((item, idx) => (
              <div key={item.id || `seed-${idx}`} className={`card bg-base-200 shadow-xl border relative transition-all duration-300 ${item.isHidden ? 'opacity-40 border-dashed border-error grayscale-[0.5]' : 'border-base-300'}`}>
                <div className="card-body p-4 items-center text-center">
                  
                  {/* Emoji Picker Trigger */}
                  <div className="relative">
                    <button 
                      className={`text-5xl mb-2 transition-all ${isAdminMode && item.id ? 'cursor-pointer hover:bg-base-300 p-2 rounded-2xl active:scale-95' : 'cursor-default pointer-events-none'}`}
                      onClick={() => isAdminMode && item.id && setShowEmojiPicker(item.id)}
                    >
                      {item.icon || '🎁'}
                    </button>
                    {showEmojiPicker === item.id && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 z-[100] mt-2 p-2 bg-base-100 border border-base-300 shadow-2xl rounded-2xl animate-in zoom-in fade-in duration-200 w-44">
                        <div className="grid grid-cols-3 gap-2 h-44 overflow-y-auto p-1 custom-scrollbar">
                          {EMOJIS.map(e => (
                            <button 
                              key={e} 
                              onClick={() => {
                                handleUpdateItem(item.id, { icon: e });
                                setShowEmojiPicker(null);
                              }}
                              className="text-2xl hover:bg-primary/20 p-1 rounded-xl transition-colors"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => setShowEmojiPicker(null)} className="btn btn-xs btn-ghost w-full mt-2 font-bold">Zamknij</button>
                      </div>
                    )}
                  </div>

                  {isAdminMode ? (
                    <div className="w-full space-y-2 animate-in fade-in zoom-in duration-300">
                      <input 
                        className="input input-xs input-bordered w-full text-center font-bold" 
                        value={item.name || ''} 
                        onChange={e => handleUpdateItem(item.id, { name: e.target.value })}
                        placeholder="Nazwa..."
                        disabled={!item.id}
                      />
                      <input 
                        className="input input-xs input-bordered w-full text-center text-[10px] opacity-70" 
                        value={item.description || ''} 
                        onChange={e => handleUpdateItem(item.id, { description: e.target.value })}
                        placeholder="Opis (opcjonalny)..."
                        disabled={!item.id}
                      />
                      <div className="flex items-center gap-1 justify-center">
                        <input 
                          type="number" 
                          className="input input-xs input-bordered w-16 text-center font-black" 
                          value={item.price || 0} 
                          onChange={e => handleUpdateItem(item.id, { price: Number(e.target.value) })}
                          disabled={!item.id}
                        />
                        <span className="text-xs font-bold uppercase opacity-50">FC</span>
                      </div>
                      
                      <div className="flex gap-1 mt-1">
                        {item.id ? (
                          <>
                            <button 
                              onClick={() => handleUpdateItem(item.id, { isHidden: !item.isHidden })}
                              className={`btn btn-xs flex-1 ${item.isHidden ? 'btn-error' : 'btn-ghost border-base-300'}`}
                              title={item.isHidden ? 'Pokaż' : 'Ukryj'}
                            >
                              {item.isHidden ? '👁️‍🗨️' : '👁️'}
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id!, item.name || 'bez nazwy')}
                              className="btn btn-xs btn-error btn-outline"
                              title="Usuń na stałe"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleMigrateSeedItem(item)}
                            className="btn btn-primary btn-xs w-full font-bold"
                          >
                            Zapisz w bazie 💾
                          </button>
                        )}
                      </div>
                      {!item.id && <div className="text-[9px] text-primary font-bold animate-pulse">Podgląd (kliknij Zapisz 👆)</div>}
                    </div>
                  ) : (
                    <>
                      <h2 className="card-title text-base leading-tight">
                        {item.name}
                        {item.isHidden && <span className="badge badge-error badge-xs ml-1">UKRYTE</span>}
                      </h2>
                      <p className="text-[11px] opacity-60 leading-tight mb-2 min-h-[2.5em]">{item.description}</p>
                      <button 
                        onClick={() => handleBuy(item)}
                        disabled={buying !== null || balance < item.price || item.isHidden}
                        className="btn btn-primary btn-sm w-full mt-2 font-black shadow-md border-none"
                      >
                        {buying === item.name ? <span className="loading loading-spinner loading-xs"></span> : `KUP ZA ${item.price} FC`}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TransactionHistory type="shop" />
        )}
      </div>
      <Nav />
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </PrivateRoute>
  );
};

export default ShopPage;
