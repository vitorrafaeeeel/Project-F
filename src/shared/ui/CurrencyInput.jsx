import { maskCurrency } from '../lib/currency.js';

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0,00',
  className = '',
  prefix = 'R$',
  disabled = false,
  readOnly = false,
  required = false,
  autoFocus = false,
  id,
  name,
  focusRingColor = 'focus:border-blue-500 focus:ring-blue-500',
  ...props
}) {
  const handleChange = (e) => {
    const rawVal = e.target.value;
    const formatted = maskCurrency(rawVal);
    onChange?.(formatted, e);
  };

  const displayValue = typeof value === 'number' ? maskCurrency(value) : (value || '');

  return (
    <div className="relative w-full">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-semibold text-xs sm:text-sm select-none pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        id={id}
        name={name}
        required={required}
        autoFocus={autoFocus}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        className={`w-full rounded-xl border-gray-300 dark:border-zinc-700 shadow-sm ${focusRingColor} bg-white dark:bg-zinc-900 dark:text-white ${
          prefix ? 'pl-10' : 'pl-3'
        } pr-3 py-2.5 sm:py-3 border text-sm transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
          disabled || readOnly ? 'opacity-70 cursor-not-allowed' : ''
        } ${className}`}
        {...props}
      />
    </div>
  );
}
