import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value: string;
  onChange: (e164: string) => void;
  countryCode?: string;
};

export const PhoneInput = forwardRef<HTMLInputElement, Props>(function PhoneInput(
  { value, onChange, countryCode = '+994', className, ...rest },
  ref,
) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    let raw = e.target.value.replace(/[^0-9+]/g, '');
    if (!raw.startsWith('+')) {
      raw = countryCode + raw.replace(/^0+/, '');
    }
    onChange(raw);
  };

  return (
    <input
      ref={ref}
      type="tel"
      inputMode="tel"
      value={value || countryCode}
      onChange={handleChange}
      placeholder={`${countryCode}501234567`}
      className={clsx(
        'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-slate-500 focus:outline-none',
        className,
      )}
      {...rest}
    />
  );
});
