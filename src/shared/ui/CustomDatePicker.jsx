import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Selecione a data',
  className = '',
  buttonClassName = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'bottom' });

  // Parse current value or fallback to today
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      return { year: parts[0], month: parts[1] - 1, day: parts[2] };
    }
    return null;
  }, [value]);

  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }, []);

  const [viewYear, setViewYear] = useState(() => selectedDate ? selectedDate.year : today.year);
  const [viewMonth, setViewMonth] = useState(() => selectedDate ? selectedDate.month : today.month);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = 288;
    const popoverHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const placeTop = spaceBelow < popoverHeight && spaceAbove > spaceBelow;
    const targetLeft = Math.max(8, Math.min(rect.left, window.innerWidth - popoverWidth - 8));

    setCoords({
      top: placeTop ? Math.max(8, rect.top - 6) : rect.bottom + 6,
      bottom: placeTop ? window.innerHeight - rect.top + 6 : undefined,
      left: targetLeft,
      placement: placeTop ? 'top' : 'bottom'
    });
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      if (selectedDate) {
        setViewYear(selectedDate.year);
        setViewMonth(selectedDate.month);
      }
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScroll = (e) => {
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;
      updatePosition();
    };

    const handleResize = () => updatePosition();

    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        popoverRef.current && !popoverRef.current.contains(e.target)
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

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const y = viewYear;
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    e.stopPropagation();
    setViewYear(today.year);
    setViewMonth(today.month);
    const m = String(today.month + 1).padStart(2, '0');
    const d = String(today.day).padStart(2, '0');
    onChange(`${today.year}-${m}-${d}`);
    setIsOpen(false);
  };

  const formattedDisplay = useMemo(() => {
    if (!selectedDate) return placeholder;
    const d = String(selectedDate.day).padStart(2, '0');
    const m = String(selectedDate.month + 1).padStart(2, '0');
    return `${d}/${m}/${selectedDate.year}`;
  }, [selectedDate, placeholder]);

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
          {formattedDisplay}
        </span>
        <CalendarIcon
          size={16}
          className="text-gray-400 flex-shrink-0"
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: coords.placement === 'top' ? 'auto' : `${coords.top}px`,
            bottom: coords.placement === 'top' ? `${coords.bottom}px` : 'auto',
            left: `${coords.left}px`,
            zIndex: 99999
          }}
          className="w-72 p-3.5 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-1 duration-150 overscroll-contain"
        >
          {/* Top Month Navigation */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 tracking-wide uppercase">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Próximo Mês"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
            {WEEK_DAYS.map((wDay) => (
              <span key={wDay} className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                {wDay}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = selectedDate &&
                selectedDate.year === viewYear &&
                selectedDate.month === viewMonth &&
                selectedDate.day === dayNum;

              const isCurrentDay = today.year === viewYear &&
                today.month === viewMonth &&
                today.day === dayNum;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all cursor-pointer font-medium ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700'
                      : isCurrentDay
                        ? 'border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800/80 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
