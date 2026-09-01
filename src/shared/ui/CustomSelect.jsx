import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, placement: 'bottom' });

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const placeTop = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    const targetWidth = Math.max(rect.width, 160);
    const targetLeft = Math.max(8, Math.min(rect.left, window.innerWidth - targetWidth - 8));

    setCoords({
      top: placeTop ? Math.max(8, rect.top - 6) : rect.bottom + 6,
      bottom: placeTop ? window.innerHeight - rect.top + 6 : undefined,
      left: targetLeft,
      width: targetWidth,
      placement: placeTop ? 'top' : 'bottom'
    });
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScroll = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      updatePosition();
    };

    const handleResize = () => updatePosition();

    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, updatePosition]);

  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 hover:border-gray-400 dark:hover:border-zinc-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
        aria-expanded={isOpen}
      >
        <span className="truncate text-left font-normal">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: coords.placement === 'top' ? 'auto' : `${coords.top}px`,
            bottom: coords.placement === 'top' ? `${coords.bottom}px` : 'auto',
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            zIndex: 99999
          }}
          className={`max-h-80 overflow-y-auto overscroll-contain bg-white/98 dark:bg-zinc-950/98 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-1 animate-in fade-in slide-in-from-top-1 duration-150 hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${dropdownClassName}`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/70 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
