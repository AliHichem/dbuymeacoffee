import classnames from 'classnames';
import React from 'react';

interface InputWrapperProps {
    label?: string;
    rightHelper?: React.ReactNode;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    error?: any;
    helper?: string;
    children: React.ReactNode;
}

function InputWrapper({ label, rightHelper, prefix, suffix, error, helper, children }: InputWrapperProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div>{rightHelper}</div>
      </div>
      <div className="flex my-2 rounded">
        {prefix && (
          <span className="inline-flex items-center px-3 text-sm text-gray-500 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
            {prefix}
          </span>
        )}
        {children}
        {suffix && (
          <span className="inline-flex items-center px-3 text-sm text-gray-500 border border-l-0 border-gray-300 rounded-r-md bg-gray-50">
            {suffix}
          </span>
        )}
      </div>
      {helper && !error && (
        <div className="text-xs text-gray-500 break-all whitespace-pre-line">
          {helper}
        </div>
      )}

      {error && <div className="text-sm text-red-500">{error.message}</div>}
    </div>
  );
}

interface InputProps {
  register?: any;
  name?: string;
  prefix?: React.ReactNode;
  validation?: any;
  label?: string;
  rightHelper?: React.ReactNode;
  helper?: string;
  suffix?: React.ReactNode;
  error?: any;
  [x: string]: any;
}

export function Input({
  register,
  name,
  prefix,
  validation,
  label,
  rightHelper,
  helper,
  suffix,
  error,
  ...rest
}: InputProps) {
  const inputWrapperProps = {
    label,
    rightHelper,
    prefix,
    suffix,
    error,
    helper
  };
  return (
    <InputWrapper {...inputWrapperProps}>
      <input
        {...rest}
        {...(name && { ...register(name, validation) })}
        type="text"
        className={classnames(
          'flex-1 block w-full min-w-0 px-3 py-2 border text-gray-700 border-gray-300 rounded text-sm',
          { 'rounded-l-none': prefix },
          { 'rounded-r-none': suffix }
        )}
      />
    </InputWrapper>
  );
}

interface TextAreaProps {
    register?: any;
    name?: string;
    prefix?: React.ReactNode;
    validation?: any;
    label?: string;
    rightHelper?: React.ReactNode;
    helper?: string;
    suffix?: React.ReactNode;
    error?: any;
    rows?: number;
    [x: string]: any;
}

export function TextArea({
  register,
  name,
  prefix,
  validation,
  label,
  rightHelper,
  helper,
  suffix,
  error,
  rows = 3,
  ...rest
}: TextAreaProps) {
  const inputWrapperProps = {
    label,
    rightHelper,
    prefix,
    suffix,
    error,
    helper
  };
  return (
    <InputWrapper {...inputWrapperProps}>
      <textarea
        {...rest}
        {...(name && { ...register(name, validation) })}
        type="text"
        rows={rows}
        className={classnames(
          'flex-1 block w-full min-w-0 px-3 py-2 border text-gray-700 border-gray-300 rounded text-sm',
          { 'rounded-l-none': prefix },
          { 'rounded-r-none': suffix }
        )}
      />
    </InputWrapper>
  );
}
