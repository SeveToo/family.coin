import { db } from './config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Transaction } from '../types';

export const addTransaction = async (
  userId: string,
  amount: number,
  type: Transaction['type'],
  description: string
) => {
  try {
    await addDoc(collection(db, 'transactions'), {
      userId,
      amount,
      type,
      description,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};
