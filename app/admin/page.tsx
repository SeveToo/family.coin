'use client';

import AdminRoute from '@/components/auth/AdminRoute';
import useUsers from '@/lib/hooks/useUsers';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useState } from 'react';
import { formatBalance } from '@/lib/utils';

export default function AdminPage() {
  const users = useUsers(); // This hook updates automatically? No, useUsers currently fetches once on mount. 
  // Ideally useUsers should use onSnapshot for real-time updates in admin panel.
  // For now we might need to refresh manually or update hook.
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const approveUser = async (userId: string) => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isApproved: true
      });
      setMessage(`Użytkownik ${userId} zatwierdzony.`);
      setLoading(false);
      // window.location.reload(); // Simple refresh to see changes if hook doesn't update
    } catch (e: any) {
      console.error(e);
      setMessage('Błąd: ' + e.message);
      setLoading(false);
    }
  };

  const resetAllBalances = async (amount: number) => {
    if (!confirm(`Czy na pewno chcesz ustawić bilans WSZYSTKICH użytkowników na ${amount}?`)) return;
    
    try {
      setLoading(true);
      const batch = writeBatch(db);
      
      users.forEach(user => {
        const userRef = doc(db, 'users', user.id);
        batch.update(userRef, { balance: amount });
      });

      await batch.commit();
      setMessage(`Zaktualizowano bilans dla ${users.length} użytkowników.`);
      setLoading(false);
    } catch (e: any) {
      console.error(e);
      setMessage('Błąd: ' + e.message);
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="p-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Panel Administratora</h1>
        
        {message && (
          <div className="alert alert-info mb-4">
            <span>{message}</span>
          </div>
        )}

        <div className="mb-10 p-5 bg-base-200 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Masowe Operacje</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => resetAllBalances(100)} 
              className="btn btn-warning"
              disabled={loading}
            >
              Ustaw wszystkim 100 Coinów
            </button>
            <button 
              onClick={() => resetAllBalances(0)} 
              className="btn btn-error"
              disabled={loading}
            >
              Wyzeruj wszystkim bilans
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Użytkownicy ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nazwa / Email</th>
                <th>Bilans</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={!user.data.isApproved ? 'bg-error/10' : ''}>
                  <td>
                    <div className="font-bold">{user.data.nickName}</div>
                    <div className="text-sm opacity-50">{user.data.email}</div>
                    <div className="text-xs">{user.id}</div>
                  </td>
                  <td>{formatBalance(user.data.balance)}</td>
                  <td>
                    {user.data.isApproved ? (
                      <span className="badge badge-success">Zatwierdzony</span>
                    ) : (
                      <span className="badge badge-warning">Oczekujący</span>
                    )}
                    {user.data.isAdmin && <span className="badge badge-info ml-2">Admin</span>}
                  </td>
                  <td>
                    {!user.data.isApproved && (
                      <button 
                        onClick={() => approveUser(user.id)}
                        className="btn btn-xs btn-success"
                        disabled={loading}
                      >
                        Zatwierdź
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminRoute>
  );
}
