export const register = {
  nickname: {
    errors: {
      required: 'To pole jest wymagane',
      minLength: 'Minimalna liczba znaków to 1',
      maxLength: 'Maksymalna liczba znaków to 40',
    },
    rules: {
      required: true,
      minLength: 1,
      maxLength: 40,
    },
  },
  firstname: {
    errors: {
      required: 'To pole jest wymagane',
      minLength: 'Minimalna liczba znaków to 3',
      maxLength: 'Maksymalna liczba znaków to 40',
    },
    rules: {
      required: true,
      minLength: 3,
      maxLength: 40,
    },
  },
  email: {
    errors: {
      required: 'To pole jest wymagane',
      minLength: 'Minimalna liczba znaków to 5',
      maxLength: 'Maksymalna liczba znaków to 40',
      pattern: 'Invalid email',
    },
    rules: {
      required: true,
      minLength: 5,
      maxLength: 40,
      pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
    },
  },

  password: {
    errors: {
      required: 'To pole jest wymagane',
      minLength: 'Minimalna liczba znaków to 6',
      maxLength: 'Maksymalna liczba znaków to 30',
      pattern: 'Hasło musi zawierać co najmniej jedną dużą literę',
    },
    rules: {
      required: true,
      minLength: 6,
      maxLength: 30,
      pattern: /(?=.*[A-Z])/,
    },
  },

  repassword: {
    errors: {
      validate: 'Passwords do not match',
    },
    rules: {
      validate: (value: string, values: { password?: string }) => value === values.password,
    },
  },
};
