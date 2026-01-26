'use client';

import { useForm } from 'react-hook-form';
import InputGroup from '@/components/InputGroup';
import { register as validationRules } from '@/lib/validation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useFirestore from '@/lib/hooks/useFirestore';
import PublicRoute from '@/components/auth/PublicRoute';
import Link from 'next/link';

const { email, password, repassword, nickname, firstname } = validationRules;

const RegisterPage = () => {
  const router = useRouter();
  const { storeDateToFirestore } = useFirestore('users'); // Need to pass a collection name, though strictly it's not used by storeDateToFirestore but the hook requires it
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();

  const onSubmit = (data: any) => {
    setError(null);
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        const user = userCredential.user;
        storeDateToFirestore(user.uid, data.nickname, data.firstname);
        // Auth state change will redirect via PublicRoute/PrivateRoute or we can push
        // router.push('/'); 
      })
      .catch((err) => {
        const errorMessage = err.message;
        if (errorMessage.includes('email-already-in-use')) {
          setError('Email jest już zajęty');
        } else {
          setError('Wystąpił błąd podczas rejestracji');
        }
      });
  };

  return (
    <PublicRoute>
      <div className="hero min-h-screen bg-base-200">
        <div className="w-full hero-content flex-col lg:flex-row-reverse gap-20">
          <div className="text-center lg:text-left max-w-3xl">
            <h1 className="text-5xl font-bold">Family Coins</h1>
            <p className="py-6">
              Załóż konto aby otrzymać <br /> 100 coinów na start
            </p>
            <p className="py-6">Masz już konto?</p>
            <Link href="/logowanie" className="btn btn-neutral">
              Zaloguj
            </Link>
          </div>
          <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100 md:w-[30rem]">
            <div className="card-body">
              <h2 className="card-title ">Rejestracja</h2>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <InputGroup
                  name="nickname"
                  label="Nazwa użytkownika"
                  type="text"
                  register={register}
                  rules={nickname.rules}
                  errorMsg={
                    errors.nickname?.type && typeof errors.nickname.type === 'string'
                      ? (nickname.errors as any)[errors.nickname.type]
                      : undefined
                  }
                />
                <InputGroup
                  name="firstname"
                  label="Imię"
                  type="text"
                  register={register}
                  rules={firstname.rules}
                   errorMsg={
                    errors.firstname?.type && typeof errors.firstname.type === 'string'
                      ? (firstname.errors as any)[errors.firstname.type]
                      : undefined
                  }
                />
                <InputGroup
                  name="email"
                  label="Email"
                  type="email"
                  register={register}
                  rules={email.rules}
                  errorMsg={
                    errors.email?.type && typeof errors.email.type === 'string'
                      ? (email.errors as any)[errors.email.type]
                      : undefined
                  }
                />
                {error && (
                  <label className="label">
                    <span className="label-text-alt text-error">{error}</span>
                  </label>
                )}
                <InputGroup
                  name="password"
                  label="Hasło"
                  type="password"
                  register={register}
                  rules={password.rules}
                  errorMsg={
                    errors.password?.type && typeof errors.password.type === 'string'
                      ? (password.errors as any)[errors.password.type]
                      : undefined
                  }
                />
                <InputGroup
                  label="Powtórz hasło"
                  name="repassword"
                  type="password"
                  register={register}
                  rules={{ ...repassword.rules, validate: (val: string) => val === watch('password') || "Passwords do not match" }}
                  errorMsg={
                    errors.repassword?.type && typeof errors.repassword.type === 'string'
                      ? (repassword.errors as any)[errors.repassword.type]
                      : undefined
                  }
                />
                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary">
                    Zarejestruj
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

export default RegisterPage;
