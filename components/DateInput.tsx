'use client';

import { useState, useRef, useEffect } from 'react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  max?: string;
  min?: string;
  className?: string;
  placeholder?: string;
}

export default function DateInput({
  value,
  onChange,
  label,
  max,
  min,
  className = '',
  placeholder = 'YYYY-MM-DD',
}: DateInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value);
    setError('');
  }, [value]);

  // Validate date format (YYYY-MM-DD)
  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return true; // Empty is valid

    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      setError('รูปแบบไม่ถูกต้อง ใช้ YYYY-MM-DD');
      return false;
    }

    // Check if it's a valid date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      setError('วันที่ไม่ถูกต้อง');
      return false;
    }

    // Check if date matches the input (handles invalid dates like 2024-02-30)
    const [year, month, day] = dateStr.split('-').map(Number);
    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      setError('วันที่ไม่ถูกต้อง');
      return false;
    }

    // Check min/max constraints
    if (min && dateStr < min) {
      setError(`ต้องไม่ก่อน ${formatDateThai(min)}`);
      return false;
    }
    if (max && dateStr > max) {
      setError(`ต้องไม่หลัง ${formatDateThai(max)}`);
      return false;
    }

    setError('');
    return true;
  };

  const formatDateThai = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (validateDate(newValue)) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // Auto-fix common formats on blur
    let fixed = inputValue.trim();

    // Handle DD/MM/YYYY or DD-MM-YYYY
    const slashFormat = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    const match = fixed.match(slashFormat);
    if (match) {
      const [, day, month, year] = match;
      fixed = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setInputValue(fixed);
    }

    // Handle YYYYMMDD
    const compactFormat = /^(\d{4})(\d{2})(\d{2})$/;
    const compactMatch = fixed.match(compactFormat);
    if (compactMatch) {
      const [, year, month, day] = compactMatch;
      fixed = `${year}-${month}-${day}`;
      setInputValue(fixed);
    }

    if (validateDate(fixed)) {
      onChange(fixed);
    }
  };

  const handlePickerClick = () => {
    dateInputRef.current?.showPicker?.();
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={dateInputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${className}`}
        />
        <button
          type="button"
          onClick={handlePickerClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          title="เปิดปฏิทิน"
        >
          📅
        </button>
        {/* Hidden native date picker for fallback */}
        <input
          type="date"
          value={value}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setError('');
          }}
          min={min}
          max={max}
          className="absolute inset-0 opacity-0 cursor-pointer"
          style={{ pointerEvents: 'none' }}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {!error && inputValue && (
        <p className="mt-1 text-xs text-gray-500">
          {formatDateThai(inputValue)}
        </p>
      )}
    </div>
  );
}
