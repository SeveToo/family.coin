'use client';

import { useForm } from 'react-hook-form';
import InputGroup from '@/components/InputGroup';
import { register as validationRules } from '@/lib/validation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PublicRoute from '@/components/auth/PublicRoute';
import Link from 'next/link';

const { email, password } = validationRules;

const LoginPage = () => {
  const router = useRouter();
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  const {
    register,
    handleSubmit,
  } = useForm();

  const onSubmit = (data: any) => {
    setErrorEmail('');
    setErrorPassword('');
    
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => {
        router.push('/');
      })
      .catch((error) => {
        console.log(error.code);

        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          setErrorPassword('Invalid password or email');
        } else if (error.code === 'auth/user-not-found') {
          setErrorEmail('Invalid email');
        } else {
          setErrorEmail('Unknown database error');
        }
      });
  };

  return (
    <PublicRoute>
      <div className="hero min-h-screen bg-base-200">
        <div className="w-full hero-content flex-col lg:flex-row-reverse gap-20">
          <div className="text-center lg:text-left max-w-3xl">
            <h1 className="text-5xl font-bold">Family Coin</h1>
            <p className="py-6">
              Zaloguj się aby zacząć zarządzać <br /> swoimi coinami
            </p>
            <p className="py-6">Nie masz jeszcze konta?</p>
            <Link href="/rejestracja" className="btn btn-neutral">
              Zarejestruj
            </Link>
          </div>
          <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100 md:w-[30rem]">
            <div className="card-body">
              <h2 className="card-title ">Logowanie</h2>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <InputGroup
                  name="email"
                  label="Email"
                  type="email"
                  register={register}
                  rules={email.rules}
                  errorMsg={errorEmail}
                />
                <InputGroup
                  name="password"
                  label="Hasło"
                  type="password"
                  register={register}
                  rules={{ required: true }}
                  errorMsg={errorPassword}
                />
                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary">
                    Zaloguj
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default LoginPage;
