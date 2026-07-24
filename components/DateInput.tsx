'use client';

import { useState, useRef, useEffect } from 'react';

interface DateInputProps {
  value: string; // ISO YYYY-MM-DD (ค.ศ.) — ค่าภายในระบบไม่เปลี่ยน
  onChange: (value: string) => void;
  label?: string;
  max?: string;
  min?: string;
  className?: string;
  placeholder?: string;
}

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const pad2 = (n: number) => String(n).padStart(2, '0');

// จำนวนวันในเดือน (month: 1-12, year: ค.ศ.)
const daysInMonth = (month: number, ceYear: number) =>
  new Date(ceYear, month, 0).getDate();

// ISO (ค.ศ.) → แสดงผล วว/ดด/ปปปป (พ.ศ.)
const isoToDisplay = (iso: string): string => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  return `${m[3]}/${m[2]}/${Number(m[1]) + 543}`;
};

const isoParts = (iso: string): { d: number; m: number; ce: number } | null => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { d: Number(m[3]), m: Number(m[2]), ce: Number(m[1]) };
};

export default function DateInput({
  value,
  onChange,
  label,
  max,
  min,
  className = '',
  placeholder = 'วว/ดด/ปปปป (พ.ศ.)',
}: DateInputProps) {
  const [inputValue, setInputValue] = useState(isoToDisplay(value));
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  // ค่าใน dropdown (d: 1-31, m: 1-12, y: พ.ศ. — 0 = ยังไม่เลือก)
  const [selDay, setSelDay] = useState(0);
  const [selMonth, setSelMonth] = useState(0);
  const [selYear, setSelYear] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync จากค่าภายนอก
  useEffect(() => {
    setInputValue(isoToDisplay(value));
    setError('');
    const p = isoParts(value);
    setSelDay(p ? p.d : 0);
    setSelMonth(p ? p.m : 0);
    setSelYear(p ? p.ce + 543 : 0);
  }, [value]);

  // ปิด dropdown เมื่อแตะนอกกรอบ
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
    };
  }, [open]);

  const formatDateThai = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ตรวจ + commit ค่าจากตัวเลข 8 หลัก (ววดดปปปป)
  const commitDigits = (digits: string): boolean => {
    const d = Number(digits.slice(0, 2));
    const m = Number(digits.slice(2, 4));
    const y = Number(digits.slice(4, 8));

    let ce: number;
    if (y >= 2400 && y <= 2643) {
      ce = y - 543; // พ.ศ.
    } else if (y >= 1900 && y <= 2100) {
      ce = y; // เผื่อพิมพ์เป็น ค.ศ. มา — แปลงให้
    } else {
      setError('ปีไม่ถูกต้อง — ใช้ปี พ.ศ. เช่น ' + (new Date().getFullYear() + 543));
      return false;
    }

    if (m < 1 || m > 12) {
      setError('เดือนไม่ถูกต้อง (01–12)');
      return false;
    }
    if (d < 1 || d > daysInMonth(m, ce)) {
      setError(`วันที่ไม่ถูกต้อง (เดือนนี้มี ${daysInMonth(m, ce)} วัน)`);
      return false;
    }

    const iso = `${ce}-${pad2(m)}-${pad2(d)}`;
    if (min && iso < min) {
      setError(`ต้องไม่ก่อน ${formatDateThai(min)}`);
      return false;
    }
    if (max && iso > max) {
      setError(`ต้องไม่หลัง ${formatDateThai(max)}`);
      return false;
    }

    setError('');
    setInputValue(isoToDisplay(iso));
    onChange(iso);
    return true;
  };

  // พิมพ์เอง: กึ่งบังคับ format — เติม / ให้อัตโนมัติ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let next = raw;

    // เติม / เฉพาะตอนพิมพ์เพิ่ม (ลบได้ตามปกติ)
    if (raw.length > inputValue.length) {
      const digits = raw.replace(/\D/g, '').slice(0, 8);
      if (digits.length >= 5) {
        next = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
      } else if (digits.length >= 3) {
        next = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else {
        next = digits;
      }
    }
    setInputValue(next);

    const digits = next.replace(/\D/g, '');
    if (digits.length === 8) {
      commitDigits(digits);
    } else {
      setError('');
      if (digits.length === 0 && next.trim() === '') {
        onChange('');
      }
    }
  };

  const handleBlur = () => {
    const digits = inputValue.replace(/\D/g, '');
    if (digits.length === 0) return;
    if (digits.length === 8) {
      commitDigits(digits);
    } else {
      setError('กรอกวันที่ให้ครบ วว/ดด/ปปปป เช่น 23/07/2569');
    }
  };

  // ช่วงปี พ.ศ. ใน dropdown
  const nowBE = new Date().getFullYear() + 543;
  const minBE = min ? Number(min.slice(0, 4)) + 543 : nowBE - 6;
  const maxBE = max ? Number(max.slice(0, 4)) + 543 : nowBE + 1;
  const yearOptions: number[] = [];
  for (let y = maxBE; y >= minBE; y--) yearOptions.push(y);

  const dayCount =
    selMonth && selYear ? daysInMonth(selMonth, selYear - 543) : 31;
  const dayOptions = Array.from({ length: dayCount }, (_, i) => i + 1);

  // เลือกจาก dropdown — ครบ 3 ช่องเมื่อไหร่ commit ทันที
  const handleSelect = (d: number, m: number, y: number) => {
    // ถ้าเดือน/ปีเปลี่ยนแล้ววันเกินจำนวนวันจริง ให้ปรับลง
    if (d && m && y) {
      const maxD = daysInMonth(m, y - 543);
      if (d > maxD) d = maxD;
    }
    setSelDay(d);
    setSelMonth(m);
    setSelYear(y);
    if (d && m && y) {
      commitDigits(`${pad2(d)}${pad2(m)}${y}`);
    }
  };

  const setToday = () => {
    const t = new Date();
    handleSelect(t.getDate(), t.getMonth() + 1, t.getFullYear() + 543);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={10}
          className={`w-full px-3 py-2 pr-10 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${className}`}
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          title="เลือกวันที่"
          aria-label="เลือกวันที่"
        >
          📅
        </button>
      </div>

      {/* Dropdown วัน/เดือน/ปี */}
      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-[16rem] bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">วัน</label>
              <select
                value={selDay || ''}
                onChange={(e) =>
                  handleSelect(Number(e.target.value), selMonth, selYear)
                }
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500"
              >
                <option value="">วัน</option>
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">เดือน</label>
              <select
                value={selMonth || ''}
                onChange={(e) =>
                  handleSelect(selDay, Number(e.target.value), selYear)
                }
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เดือน</option>
                {THAI_MONTHS.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">
                ปี (พ.ศ.)
              </label>
              <select
                value={selYear || ''}
                onChange={(e) =>
                  handleSelect(selDay, selMonth, Number(e.target.value))
                }
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ปี</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <button
              type="button"
              onClick={setToday}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              วันนี้ / Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ปิด / Close
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && value && (
        <p className="mt-1 text-xs text-gray-500">{formatDateThai(value)}</p>
      )}
    </div>
  );
}
