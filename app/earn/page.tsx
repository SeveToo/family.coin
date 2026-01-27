'use client';

import React, { useEffect, useState } from 'react';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Nav from '@/components/Nav';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import InputGroup from '@/components/InputGroup';
import useCurrentUserDocument from '@/lib/hooks/useCurrentUserDocument';
import { v4 as uuidv4 } from 'uuid';
import { AvailableTask, Task } from '@/lib/types';

const EarnPage = () => {
  const { user } = useAuth();
  const userDoc = useCurrentUserDocument();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ description: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTasks, setFetchingTasks] = useState(true);
  const [availableTasks, setAvailableTasks] = useState<AvailableTask[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen to Available Tasks
    const qAvailable = query(collection(db, 'available_tasks'), orderBy('createdAt', 'desc'));
    const unsubAvailable = onSnapshot(qAvailable, (snapshot) => {
      const tasks: AvailableTask[] = [];
      snapshot.forEach(doc => tasks.push({ id: doc.id, ...doc.data() } as AvailableTask));
      setAvailableTasks(tasks);
      setFetchingTasks(false);
    });

    // Listen to current user's tasks (submitted today or pending)
    const qUser = query(
      collection(db, 'tasks'), 
      where('userId', '==', user.uid)
    );
    const unsubUser = onSnapshot(qUser, (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach(doc => tasks.push({ id: doc.id, ...doc.data() } as Task));
      setUserTasks(tasks);
    });

    return () => {
      unsubAvailable();
      unsubUser();
    };
  }, [user]);

  const handleTemplateTask = async (task: AvailableTask) => {
    if (!user || !userDoc || submittingTaskId) return;
    setSubmittingTaskId(task.id || task.description);
    setMsg(null);

    try {
      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        userName: userDoc.nickName,
        description: task.description,
        reward: task.reward,
        taskTemplateId: task.id || null,
        status: 'pending',
        createdAt: Date.now()
      });
      setMsg({ type: 'success', text: `Zgłoszono wykonanie: ${task.description}. Czekaj na zatwierdzenie!` });
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Błąd: ' + err.message });
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const onSubmit = async (data: { description: string }) => {
    if (!user || !userDoc) return;
    if (!file && !data.description) {
      setMsg({ type: 'error', text: 'Dodaj zdjęcie lub opis!' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      let downloadUrl = '';
      if (file) {
        const fileRef = ref(storage, `tasks/${user.uid}/${uuidv4()}-${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        downloadUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        userName: userDoc.nickName,
        description: data.description,
        photoUrl: downloadUrl,
        status: 'pending',
        createdAt: Date.now()
      });

      setMsg({ type: 'success', text: 'Zadanie wysłane do sprawdzenia! 🚀' });
      reset();
      setFile(null);
    } catch (error: any) {
      console.error(error);
      setMsg({ type: 'error', text: 'Błąd wysyłania: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    const today = new Date().setHours(0,0,0,0);
    
    return availableTasks.filter(availableTask => {
      // Find if this task has been submitted already
      const userSubmission = userTasks.find(ut => ut.taskTemplateId === availableTask.id);
      
      if (!userSubmission) return true;

      // If pending - ALWAYS HIDE (prevents spam while waiting for approval)
      const hasPending = userTasks.some(ut => 
        ut.taskTemplateId === availableTask.id && ut.status === 'pending'
      );
      if (hasPending) return false;

      // If it's a daily task, hide if completed today
      if (availableTask.isDaily) {
        const completedToday = userTasks.some(ut => 
          ut.taskTemplateId === availableTask.id && 
          ut.status === 'approved' && 
          ut.createdAt >= today
        );
        return !completedToday;
      }

      // If it's a regular task, hide if already approved at least once
      const alreadyApproved = userTasks.some(ut => 
        ut.taskTemplateId === availableTask.id && ut.status === 'approved'
      );
      return !alreadyApproved;
    });
  };

  return (
    <PrivateRoute>
        <h1 className="text-3xl font-bold mb-6">Zarabiaj 💰</h1>

        <div className="w-full mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>Zadania do zrobienia</span>
            <div className="badge badge-primary">{getFilteredTasks().length}</div>
          </h2>
          
          {fetchingTasks ? (
            <div className="flex justify-center p-10">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : (
            <div className="grid gap-3">
              {getFilteredTasks().length === 0 && (
                <div className="alert bg-base-200">Brak dostępnych zadań od admina.</div>
              )}
              {getFilteredTasks().map(task => (
                <div key={task.id} className="card bg-base-200 shadow-md border border-base-300">
                  <div className="card-body p-4 flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{task.icon || '⭐'}</div>
                      <div>
                        <div className="flex items-center gap-2 leading-tight">
                          <span className="font-bold">{task.description}</span>
                          {task.isDaily && <span className="badge badge-info badge-xs text-[10px] scale-90">CODZIENNE</span>}
                        </div>
                        <div className="text-xs text-primary font-bold">+{task.reward} monety</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTemplateTask(task)}
                      disabled={submittingTaskId === (task.id || task.description)}
                      className="btn btn-primary btn-sm"
                    >
                      {submittingTaskId === (task.id || task.description) ? 
                        <span className="loading loading-spinner loading-xs"></span> : 
                        'Zrobione!'
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider opacity-50">LUB</div>
        
        <div className="card w-full bg-base-200 shadow-xl border border-primary/20">
          <div className="card-body">
            <h2 className="card-title text-lg">Zgłoś coś innego</h2>
            <p className="text-xs opacity-70">Zrobiłeś coś, czego nie ma na liście? Wyślij zdjęcie lub opis!</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <InputGroup 
                name="description" 
                label="Opis (co zrobiłeś?)" 
                register={register} 
                rules={{ required: !file }} 
                errorMsg={errors.description?.message}
              />

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-xs">Zdjęcie (opcjonalne)</span>
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="file-input file-input-bordered file-input-sm w-full" 
                />
              </div>

              <button type="submit" className="btn btn-outline btn-primary w-full mt-2" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Wyślij do sprawdzenia'}
              </button>
            </form>
          </div>
        </div>

        {msg && (
          <div className={`toast toast-top toast-center z-[100] w-full max-w-sm`}>
            <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
              <span>{msg.text}</span>
              <button onClick={() => setMsg(null)} className="btn btn-ghost btn-xs">X</button>
            </div>
          </div>
        )}
    </PrivateRoute>
  );
};

export default EarnPage;
