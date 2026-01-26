'use client';

import React, { useRef } from 'react';
import InputGroup from './InputGroup';
import useCoinTransfer from '@/lib/hooks/useCoinTransfer';
import useUserBalance from '@/lib/hooks/useUserBalance';
import { useForm } from 'react-hook-form';
import { formatBalance } from '@/lib/utils';

interface ModalProps {
  id: string;
  nick: string;
}

const Modal = ({ id, nick }: ModalProps) => {
  
  const { transferCoins, isTransferring, error } = useCoinTransfer();
  const userBalance = useUserBalance(); // Fixed: useUserBalance doesn't take ID in the new hook, it uses auth context
  const { register, handleSubmit } = useForm<{ amount: number }>();
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleFormSubmit = (data: { amount: number }) => {
    if (isTransferring) {
      return;
    }
    transferCoins(id, data.amount).finally(() => closeModal());
  };

  const openModal = () => {
    const modal = modalRef.current;
    if (modal) {
      modal.showModal();
    }
  };

  const closeModal = () => {
    const modal = modalRef.current;
    if (modal) {
      modal.close();
    }
  };

  

  return (
    <>
      <button className="btn btn-sm btn-neutral" onClick={openModal}>
        Przelej
      </button>
      <dialog ref={modalRef} id={id} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Przelew</h3>
          <p className="py-1">
            Obecnie Posiadasz:{' '}
            <span className="font-bold text-primary">{formatBalance(userBalance)}</span>
          </p>
          <p className="py-1">
            Odbiorca: <span className="font-bold text-primary">{nick}</span>
          </p>
          <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
            <InputGroup
              name="amount"
              type="number"
              label="Ilość family coinów 👑"
              register={register}
              errorMsg={error || ''}
              rules={{
                required: 'Podaj kwotę',
                min: { value: 0.01, message: 'Minimum 0.01' },
                max: { value: 1000, message: 'Maksimum 1000' }
              }}
            />
            <div className="modal-action">
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-error"
              >
                Anuluj
              </button>
              <button type="submit" className="btn btn-primary" disabled={isTransferring}>
                Przelew
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={closeModal}></div>
      </dialog>
    </>
  );
};

export default Modal;
