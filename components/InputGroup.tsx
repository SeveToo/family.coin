import React from 'react';
import { UseFormRegister, FieldValues, RegisterOptions } from 'react-hook-form';

interface InputGroupProps {
  name: string;
  register: UseFormRegister<any>; // Using any for flexibility or generic FieldValues
  errorMsg?: string;
  rules?: RegisterOptions;
  type?: string;
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputGroup = ({
  name,
  register,
  errorMsg,
  rules,
  type = 'text',
  label = '',
  onChange,
}: InputGroupProps) => {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text capitalize">{label}</span>
      </label>
      <input
        {...register(name, rules)}
        type={type}
        min={rules?.min ? (typeof rules.min === 'object' ? rules.min.value : rules.min) : undefined}
        max={rules?.max ? (typeof rules.max === 'object' ? rules.max.value : rules.max) : undefined}
        step="0.01"
        // placeholder="email"
        className="input input-bordered"
        onChange={(e) => {
          register(name).onChange(e); // Ensure react-hook-form's onChange is called
          if (onChange) onChange(e);
        }}
      />

      {errorMsg && (
        <label className="label">
          <span className="label-text-alt text-error">{errorMsg}</span>
        </label>
      )}
    </div>
  );
};

export default InputGroup;
