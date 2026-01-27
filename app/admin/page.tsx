'use client';

import AdminRoute from '@/components/auth/AdminRoute';
import useUsers from '@/lib/hooks/useUsers';
import { db, storage } from '@/lib/firebase/config';
import { 
  doc, 
  updateDoc, 
  writeBatch, 
  increment, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteField,
  deleteDoc,
  onSnapshot,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useState, useEffect } from 'react';
import { formatBalance } from '@/lib/utils';
import Nav from '@/components/Nav';
import { Task, ShopItem, AvailableTask, Transaction } from '@/lib/types';
import Image from 'next/image';

type AdminTab = 'approvals' | 'shop' | 'tasks' | 'users' | 'police' | 'rules';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('approvals');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <AdminRoute>
      <div className="p-4 sm:p-10 max-w-5xl mx-auto pb-32 ">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">Panel Admina</h1>
        </div>
        
        {message && (
          <div className="alert alert-info mb-6 shadow-lg animate-bounce">
            <span className="font-bold">{message}</span>
            <button onClick={() => setMessage('')} className="btn btn-ghost btn-xs">X</button>
          </div>
        )}

        {/* Admin Submenu */}
        <div className="tabs tabs-boxed mb-8 bg-base-300 p-1 flex-wrap h-auto rounded-2xl">
          <button 
            className={`tab flex-1 min-w-[100px] h-12 font-bold ${activeTab === 'approvals' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            ✅ Zatwierdzenia
          </button>
          <button 
            className={`tab flex-1 min-w-[100px] h-12 font-bold ${activeTab === 'shop' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            🛒 Sklep
          </button>
          <button 
            className={`tab flex-1 min-w-[100px] h-12 font-bold ${activeTab === 'tasks' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            📋 Zadania
          </button>
          <button 
            className={`tab flex-1 min-w-[100px] h-12 font-bold ${activeTab === 'users' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Ludzie
          </button>
          <button 
            className={`tab flex-1 min-w-[100px] h-12 font-bold ${activeTab === 'police' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('police')}
          >
            👮 Policja
          </button>
          <button 
            className={`tab flex-1 min-w-[100px] h-12 font-bold ${activeTab === 'rules' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            ⚖️ Zasady
          </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'approvals' && (
            <section>
              <PendingTasks setMessage={setMessage} />
              <div className="text-center p-10 opacity-30 italic">System czeka na Twoje decyzje...</div>
            </section>
          )}

          {activeTab === 'shop' && <ShopManager setMessage={setMessage} />}

          {activeTab === 'tasks' && <AvailableTaskManager setMessage={setMessage} />}
          
          {activeTab === 'users' && <UsersManager setMessage={setMessage} />}

          {activeTab === 'police' && <PoliceManager setMessage={setMessage} />}

          {activeTab === 'rules' && <RulesSection />}
        </div>
      </div>
      <Nav />
    </AdminRoute>
  );
}

// --- SUBCOMPONENTS ---

const ShopManager = ({ setMessage }: { setMessage: (msg: string) => void }) => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: 10, description: '', icon: '🎁', isHidden: false });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'shop_items'));
    return onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShopItem));
      setItems(fetched);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'shop_items', editingId), newItem);
        setMessage(`Zaktualizowano: ${newItem.name}`);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'shop_items'), newItem);
        setMessage(`Dodano do sklepu: ${newItem.name}`);
      }
      setNewItem({ name: '', price: 10, description: '', icon: '🎁', isHidden: false });
    } catch (e: any) {
      setMessage('Błąd: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleHide = async (item: ShopItem) => {
    if (!item.id) return;
    try {
      await updateDoc(doc(db, 'shop_items', item.id), { isHidden: !item.isHidden });
      setMessage(item.isHidden ? 'Przedmiot jest teraz widoczny' : 'Przedmiot został ukryty');
    } catch (e: any) {
      setMessage('Błąd: ' + e.message);
    }
  };

  const startEdit = (item: ShopItem) => {
    setNewItem({ 
      name: item.name, 
      price: item.price, 
      description: item.description, 
      icon: item.icon || '🎁',
      isHidden: item.isHidden || false 
    });
    setEditingId(item.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <div className="card bg-base-200 shadow-xl border-t-4 border-primary">
        <div className="card-body">
          <h2 className="card-title">{editingId ? 'Edytuj Przedmiot' : 'Dodaj Nowy Przedmiot'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input className="input input-bordered w-full" placeholder="Nazwa" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
            <div className="flex gap-2">
              <input className="input input-bordered flex-1" placeholder="Opis" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
              <input className="input input-bordered w-20 text-center" placeholder="Ikona" value={newItem.icon} onChange={e => setNewItem({...newItem, icon: e.target.value})} />
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">Cena:</span>
              <input type="number" className="input input-bordered w-full" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} required />
            </div>
            <div className="flex justify-end gap-2">
              {editingId && <button type="button" onClick={() => {setEditingId(null); setNewItem({ name: '', price: 10, description: '', icon: '🎁', isHidden: false });}} className="btn btn-ghost">Anuluj</button>}
              <button type="submit" className="btn btn-primary" disabled={loading}>{editingId ? 'Zapisz' : 'Dodaj'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className={`card card-side bg-base-100 shadow-md border ${item.isHidden ? 'opacity-50 border-dashed border-error' : 'border-base-300'}`}>
            <figure className="bg-base-200 p-6 text-4xl">{item.icon || '📦'}</figure>
            <div className="card-body p-4 justify-between">
              <div>
                <h3 className="font-bold">{item.name} {item.isHidden && <span className="badge badge-error badge-xs">Ukryty</span>}</h3>
                <p className="text-xs opacity-60">{item.description}</p>
                <div className="text-primary font-black mt-1">{item.price} FC</div>
              </div>
              <div className="card-actions justify-end">
                <button onClick={() => startEdit(item)} className="btn btn-xs btn-outline">Edytuj</button>
                <button onClick={() => toggleHide(item)} className={`btn btn-xs ${item.isHidden ? 'btn-success' : 'btn-warning'}`}>
                  {item.isHidden ? 'Pokaż' : 'Ukryj'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AvailableTaskManager = ({ setMessage }: { setMessage: (msg: string) => void }) => {
  const [tasks, setTasks] = useState<AvailableTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextTask, setNextTask] = useState<AvailableTask>({ description: '', reward: 10, icon: '⭐', isDaily: false });

  useEffect(() => {
    const q = query(collection(db, 'available_tasks'), orderBy('reward', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AvailableTask));
      setTasks(fetched);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'available_tasks'), { ...nextTask, createdAt: Date.now() });
      setMessage(`Dodano zadanie: ${nextTask.description}`);
      setNextTask({ description: '', reward: 10, icon: '⭐', isDaily: false });
    } catch (e: any) {
      setMessage('Błąd: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const removeTask = async (id: string) => {
    if (!confirm('Usunąć to zadanie z listy dostępnych?')) return;
    try {
      await deleteDoc(doc(db, 'available_tasks', id));
      setMessage('Zadanie usunięte.');
    } catch (e: any) { setMessage(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-base-200 shadow-xl border-t-4 border-warning">
        <div className="card-body">
          <h2 className="card-title">Stwórz Zadanie Publiczne 📜</h2>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <input className="input input-bordered w-full" placeholder="Opis zadania..." value={nextTask.description} onChange={e => setNextTask({...nextTask, description: e.target.value})} required />
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span>Nagroda:</span>
                <input type="number" className="input input-bordered w-24" value={nextTask.reward} onChange={e => setNextTask({...nextTask, reward: Number(e.target.value)})} />
              </div>
              <div className="flex items-center gap-2">
                <span>Ikona:</span>
                <input className="input input-bordered w-16 text-center" value={nextTask.icon} onChange={e => setNextTask({...nextTask, icon: e.target.value})} />
              </div>
              <label className="label cursor-pointer gap-2 bg-base-100 p-2 rounded-lg border border-base-300">
                <span className="label-text font-bold">Zadanie Codzienne</span>
                <input type="checkbox" className="checkbox checkbox-primary" checked={nextTask.isDaily} onChange={e => setNextTask({...nextTask, isDaily: e.target.checked})} />
              </label>
              <button type="submit" className="btn btn-warning flex-1" disabled={loading}>Dodaj Zadanie</button>
            </div>
          </form>
        </div>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
        <table className="table">
          <thead>
            <tr>
              <th>Zadanie</th>
              <th>Nagroda</th>
              <th>Typ</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td><span className="mr-2">{t.icon}</span>{t.description}</td>
                <td className="font-bold text-success">{t.reward} FC</td>
                <td>{t.isDaily ? <span className="badge badge-info text-[9px]">CODZIENNE</span> : <span className="badge badge-ghost text-[9px]">JEDNORAZOWE</span>}</td>
                <td>
                  <button onClick={() => removeTask(t.id!)} className="btn btn-ghost btn-xs text-error">Usuń</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UsersManager = ({ setMessage }: { setMessage: (msg: string) => void }) => {
  const users = useUsers();
  const [loading, setLoading] = useState(false);

  const approveUser = async (userId: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', userId), { isApproved: true });
      setMessage(`Użytkownik zatwierdzony.`);
    } catch (e: any) { setMessage(e.message); } finally { setLoading(false); }
  };

  const deleteUser = async (u: any) => {
    if (!confirm(`Czy usunąć ${u.data.nickName}?`)) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', u.id));
      setMessage('Usunięto.');
    } catch (e: any) { setMessage(e.message); } finally { setLoading(false); }
  };

  const resetAll = async (val: number) => {
    if (!confirm(`Zresetować wszystkich do ${val}?`)) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      users.forEach(u => batch.update(doc(db, 'users', u.id), { balance: val }));
      await batch.commit();
      setMessage('Zaktualizowano bilanse.');
    } catch (e: any) { setMessage(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-base-200 p-5 shadow-lg">
        <h2 className="font-bold mb-4">Masowe Działania ⚡</h2>
        <div className="flex gap-4">
          <button onClick={() => resetAll(100)} className="btn btn-outline btn-sm">Reset do 100 FC</button>
          <button onClick={() => resetAll(0)} className="btn btn-outline btn-error btn-sm">Zeruj Wszystkich</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Użytkownik</th>
              <th>Bilans</th>
              <th>Status</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="font-bold text-sm">{u.data.nickName}</div>
                  <div className="text-[10px] opacity-60">{u.data.email}</div>
                </td>
                <td className="font-black">{formatBalance(u.data.balance)}</td>
                <td>
                  {u.data.isApproved ? <span className="badge badge-success badge-xs">OK</span> : <span className="badge badge-warning badge-xs">CZEKA</span>}
                  {u.data.isAdmin && <span className="badge badge-info badge-xs ml-1">ADMIN</span>}
                </td>
                <td className="flex gap-1">
                  {!u.data.isApproved && <button onClick={() => approveUser(u.id)} className="btn btn-xs btn-success">V</button>}
                  {!u.data.isAdmin && <button onClick={() => deleteUser(u)} className="btn btn-xs btn-error btn-outline">X</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PoliceManager = ({ setMessage }: { setMessage: (msg: string) => void }) => {
  const users = useUsers();
  const [loading, setLoading] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState('');

  const issueFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || amount <= 0 || !reason) return;
    setLoading(true);
    try {
      const user = users.find(u => u.id === targetId);
      if (!user) throw new Error("Wybierz użytkownika");

      await runTransaction(db, async (transaction: any) => {
        const userRef = doc(db, 'users', targetId);
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();
        if (!userData) throw new Error("Błąd danych");

        const newBalance = (userData.balance || 0) - amount;
        transaction.update(userRef, { balance: newBalance });

        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          userId: targetId,
          amount: -amount,
          type: 'fine',
          description: `Mandat 👮: ${reason}`,
          createdAt: Date.now()
        });
      });

      setMessage(`Wystawiono mandat: ${amount} FC dla ${user.data.nickName}`);
      setReason('');
    } catch (e: any) {
      setMessage('Błąd: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="card bg-error/10 border-2 border-error shadow-2xl">
        <div className="card-body">
          <h2 className="card-title text-error font-black text-2xl">Wystaw Mandat 👮🚨</h2>
          <form onSubmit={issueFine} className="space-y-4">
            <select className="select select-bordered w-full" value={targetId} onChange={e => setTargetId(e.target.value)} required>
              <option value="">Wybierz "przestępcę"...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.data.nickName} ({u.data.balance} FC)</option>)}
            </select>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="label-text font-bold">Wysokość mandatu (FC)</label>
                <input type="number" className="input input-bordered w-full text-xl font-bold" value={amount} onChange={e => setAmount(Number(e.target.value))} min="1" max="100" />
              </div>
              <div className="flex-[2]">
                <label className="label-text font-bold">Powód (np. przezywanie)</label>
                <input className="input input-bordered w-full" placeholder="Dlaczego ten mandat?" value={reason} onChange={e => setReason(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-error w-full font-black text-lg" disabled={loading}>NAKRZYCZ I UKARZ! 📢</button>
          </form>
        </div>
      </div>
      
      <div className="bg-base-200 p-6 rounded-2xl border border-base-300">
        <h3 className="font-bold mb-2">Jak to działa?</h3>
        <p className="text-sm opacity-70">Wystawienie mandatu odejmuje monety z konta użytkownika i dodaje wpis do jego historii jako "Mandat 👮". Użytkownik widzi to natychmiast.</p>
      </div>
    </div>
  );
};

const RulesSection = () => {
  const rules = [
    { title: "Bądź miły", desc: "Zakaz wyzywania, przedrzeźniania i dokuczania.", fine: "1-5 FC" },
    { title: "Szczerość", desc: "Zgłaszaj zadania tylko wtedy, gdy faktycznie je wykonałeś.", fine: "Cofnięcie nagrody + 10 FC mandatu" },
    { title: "Zasady Sklepu", desc: "Nagrody ze sklepu realizujemy po uzgodnieniu z rodzicami.", fine: "-" },
    { title: "Czystość", desc: "Dbaj o porządek w pokoju i częściach wspólnych.", fine: "Konfiskata 2 FC" }
  ];

  return (
    <div className="card bg-neutral text-neutral-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl font-black mb-4 underline decoration-warning">REGULAMIN RODZINNY ⚖️</h2>
        <div className="grid gap-4">
          {rules.map((rule, i) => (
            <div key={i} className="bg-base-100/10 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-lg">{i+1}. {rule.title}</h4>
                  <p className="text-sm opacity-80">{rule.desc}</p>
                </div>
                {rule.fine !== '-' && <div className="badge badge-warning font-bold">Mandat: {rule.fine}</div>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-warning/20 border border-warning/30 rounded-lg text-sm italic">
          Admin (Policjant) ma zawsze ostateczne zdanie w kwestii interpretacji zasad!
        </div>
      </div>
    </div>
  );
};

// Subcomponent for Tasks to keep file clean
const PendingTasks = ({ setMessage }: { setMessage: (msg: string) => void }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number>(10);

  const fetchTasks = async () => {
    try {
      const q = query(collection(db, 'tasks'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const fetchedTasks: Task[] = [];
      snapshot.forEach(doc => fetchedTasks.push({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetchedTasks);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleApprove = async (task: Task) => {
    if (!task.id) return;
    setLoading(true);
    try {
      const finalReward = task.reward || rewardAmount;
      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', task.userId);
      batch.update(userRef, { 
        balance: increment(finalReward) 
      });

      // 2. Add Transaction Log (Reward)
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, {
        userId: task.userId,
        amount: finalReward,
        type: 'earn',
        description: `Zadanie: ${task.description}`,
        createdAt: Date.now()
      });

      // 3. Update Task (Approved) and Delete Photo URL from doc (log only)
      const taskRef = doc(db, 'tasks', task.id);
      batch.update(taskRef, {
        status: 'approved',
        photoUrl: deleteField(),
        reward: finalReward
      });

      await batch.commit();

      // 4. Delete Image from Storage
      if (task.photoUrl) {
         try {
           const imageRef = ref(storage, task.photoUrl);
           await deleteObject(imageRef);
         } catch (err) {
           console.error("Failed to delete image: ", err);
           // Don't fail the whole process if image delete fails
         }
      }

      setMessage(`Zadanie zatwierdzone! Przyznano ${finalReward} monet.`);
      fetchTasks();
    } catch (e: any) {
      console.error(e);
      setMessage('Błąd: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (task: Task) => {
    if (!task.id) return;
    if (!confirm('Czy na pewno chcesz odrzucić to zadanie?')) return;
    setLoading(true);
    try {
      // DELETE task or mark rejected? User said "zostają tylko logi" for approved. 
      // For rejected, maybe just delete or mark rejected?
      // Let's mark rejected.
      const taskRef = doc(db, 'tasks', task.id);
      
      await updateDoc(taskRef, { status: 'rejected' });
      
      if (task.photoUrl) {
        try {
          const imageRef = ref(storage, task.photoUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error(err);
        }
      }
      setMessage('Zadanie odrzucone.');
      fetchTasks();
    } catch (e: any) {
      setMessage('Błąd: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div className="mb-10 p-5 bg-base-200 rounded-xl border-l-4 border-primary">
      <h2 className="text-xl font-bold mb-4">Oczekujące Zadania ({tasks.length})</h2>
      <div className="grid gap-4">
         {tasks.map(task => (
           <div key={task.id} className="card bg-base-100 shadow-sm p-4 flex-row gap-4 items-start">
             {task.photoUrl && (
               <div className="relative w-24 h-24 shrink-0">
                 <Image src={task.photoUrl} alt="Dowód" fill className="object-cover rounded" />
                 <a href={task.photoUrl} target="_blank" className="absolute bottom-0 right-0 bg-base-300 text-xs p-1 opacity-80">Zoom</a>
               </div>
             )}
             <div className="flex-1">
               <div className="font-bold">{task.userName || 'Nieznany'}</div>
               <p className="text-sm">{task.description}</p>
               <div className="text-xs opacity-50 mt-1">{new Date(task.createdAt).toLocaleString()}</div>
             </div>
             <div className="flex flex-col gap-2 items-end">
               {task.reward ? (
                 <div className="badge badge-primary gap-1 p-3">
                   {task.reward} monet
                 </div>
               ) : (
                 <div className="join">
                   <input 
                     className="input input-xs input-bordered w-16 join-item" 
                     type="number" 
                     value={rewardAmount} 
                     onChange={(e) => setRewardAmount(Number(e.target.value))}
                   />
                   <button className="btn btn-xs join-item">Monet</button>
                 </div>
               )}
               <div className="flex gap-1">
                 <button 
                   onClick={() => handleApprove(task)} 
                   className="btn btn-sm btn-success" 
                   disabled={loading}
                 >
                   V
                 </button>
                 <button 
                   onClick={() => handleReject(task)} 
                   className="btn btn-sm btn-error"
                   disabled={loading}
                 >
                   X
                 </button>
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};
