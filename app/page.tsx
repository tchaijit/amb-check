'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut, signIn } from 'next-auth/react';
import { INSPECTION_CHECKLIST } from '@/lib/checklist-data';
import { todayBangkok } from '@/lib/dates';

type StatusCode = 'no_data' | 'in_progress' | 'pending_approval' | 'ready' | 'monitor' | 'not_ready';

const PENDING_KEY = 'pendingAmbulanceId';

interface AmbulanceStatusItem {
  ambulance: {
    id: number;
    vehicleNumber: string;
    licensePlate: string;
  };
  status: {
    code: StatusCode;
    label: string;
    labelEn: string;
  };
  inspection: {
    id: number;
    driverCompleted: boolean;
    equipmentOfficerCompleted: boolean;
    nurseCompleted: boolean;
    hodApproved: boolean;
    hodApprovedAt?: string | null;
    overallStatus?: string;
    remarks?: string;
    items?: Array<{
      itemCode: string;
      inspectorRole: string;
      status: 'normal' | 'abnormal' | 'fixed' | null;
      value?: string | null;
      remarks?: string | null;
      lastEditedAt?: string | null;
    }>;
  } | null;
}

const STATUS_STYLES: Record<StatusCode, { bg: string; text: string; ring: string; dot: string; icon: string }> = {
  ready: { bg: 'bg-green-50', text: 'text-green-800', ring: 'ring-green-200', dot: 'bg-green-500', icon: '✅' },
  monitor: { bg: 'bg-orange-50', text: 'text-orange-800', ring: 'ring-orange-200', dot: 'bg-orange-500', icon: '⚠️' },
  not_ready: { bg: 'bg-red-50', text: 'text-red-800', ring: 'ring-red-200', dot: 'bg-red-500', icon: '⛔' },
  pending_approval: { bg: 'bg-yellow-50', text: 'text-yellow-800', ring: 'ring-yellow-200', dot: 'bg-yellow-500', icon: '⏳' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-800', ring: 'ring-blue-200', dot: 'bg-blue-500', icon: '🔄' },
  no_data: { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200', dot: 'bg-gray-400', icon: '⚪' },
};

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const today = todayBangkok();
  const [selectedDate, setSelectedDate] = useState(today);
  const [items, setItems] = useState<AmbulanceStatusItem[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AmbulanceStatusItem | null>(null);
  const [startingInspection, setStartingInspection] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = useCallback(async (date: string) => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/public/ambulance-status?date=${date}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Error fetching status:', err);
      setItems([]);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus(selectedDate);
  }, [selectedDate, fetchStatus]);

  const startInspection = useCallback(
    async (ambulanceId: number) => {
      if (!session) {
        sessionStorage.setItem(PENDING_KEY, String(ambulanceId));
        emailInputRef.current?.focus();
        return;
      }
      const role = session.user.role as string;
      if (role === 'hod') {
        router.push('/dashboard');
        return;
      }
      setStartingInspection(true);
      try {
        const res = await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ambulanceId }),
        });
        const data = await res.json();
        if (!res.ok || !data.inspection?.id) {
          throw new Error(data.error || 'Failed to start inspection');
        }
        router.push(`/inspect/${data.inspection.id}`);
      } catch (err: any) {
        alert(err.message || 'ไม่สามารถเริ่มตรวจสอบได้');
        setStartingInspection(false);
      }
    },
    [session, router]
  );

  // After login, resume pending inspection
  useEffect(() => {
    if (session) {
      const pending = sessionStorage.getItem(PENDING_KEY);
      if (pending) {
        sessionStorage.removeItem(PENDING_KEY);
        startInspection(Number(pending));
      }
    }
  }, [session, startInspection]);

  const handleLogout = async () => {
    // Force navigation through the browser instead of NextAuth's callbackUrl,
    // which can resolve to a Vercel-protected preview URL and bounce the user
    // through vercel.com/login.
    await signOut({ redirect: false });
    window.location.replace('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (result?.ok) {
        router.refresh();
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const summary = items.reduce(
    (acc, it) => {
      acc[it.status.code] = (acc[it.status.code] || 0) + 1;
      return acc;
    },
    {} as Record<StatusCode, number>
  );

  const isToday = selectedDate === today;

  return (
    <div className="min-h-[calc(100vh-200px)] grid lg:grid-cols-3 gap-6">
      {/* Left: Status Dashboard (2 cols) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-3xl">🚑</span>
                สถานะรถพยาบาล
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Ambulance Readiness Dashboard · Bangkok Siriroj Hospital
              </p>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  วันที่ / Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  max={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(today)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  วันนี้
                </button>
              )}
            </div>
          </div>

          {/* Summary chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <SummaryChip code="ready" label="พร้อมใช้" count={summary.ready || 0} />
            <SummaryChip code="monitor" label="เฝ้าระวัง" count={summary.monitor || 0} />
            <SummaryChip code="not_ready" label="ไม่พร้อมใช้" count={summary.not_ready || 0} />
            <SummaryChip code="pending_approval" label="รออนุมัติ" count={summary.pending_approval || 0} />
            <SummaryChip code="in_progress" label="กำลังตรวจ" count={summary.in_progress || 0} />
            <SummaryChip code="no_data" label="ยังไม่ตรวจ" count={summary.no_data || 0} />
          </div>
        </div>

        {/* Vehicle list */}
        {loadingStatus ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">กำลังโหลด... / Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-700 font-medium">ไม่มีข้อมูลรถพยาบาล</p>
            <p className="text-sm text-gray-500 mt-1">No ambulance data available</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((item) => (
              <VehicleCard
                key={item.ambulance.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: Login / User panel (1 col) */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-6">
          {status === 'loading' ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">กำลังโหลด...</p>
            </div>
          ) : session ? (
            <UserPanel session={session} onLogout={handleLogout} onNavigate={(p) => router.push(p)} />
          ) : (
            <LoginPanel
              email={email}
              password={password}
              error={error}
              isLoading={isLoading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              emailInputRef={emailInputRef}
            />
          )}
        </div>
      </div>

      {selectedItem && (
        <InspectionModal
          item={selectedItem}
          isLoggedIn={!!session}
          userRole={(session?.user?.role as string) || ''}
          starting={startingInspection}
          onClose={() => setSelectedItem(null)}
          onApprove={async (overallStatus) => {
            const insId = selectedItem.inspection?.id;
            if (!insId) return;
            const res = await fetch(`/api/inspections/${insId}/approve`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ overallStatus }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data.error || 'อนุมัติไม่สำเร็จ');
            }
            await fetchStatus(selectedDate);
            setSelectedItem(null);
          }}
          onStart={() => {
            const id = selectedItem.ambulance.id;
            setSelectedItem(null);
            startInspection(id);
          }}
          onSectionStart={(role) => {
            const id = selectedItem.ambulance.id;
            const roleLabels: Record<string, string> = {
              driver: 'เจ้าหน้าที่ยานพาหนะ',
              equipment_officer: 'เจ้าหน้าที่เคลื่อนย้ายผู้ป่วย',
              nurse: 'พยาบาล',
            };

            if (!session) {
              setSelectedItem(null);
              startInspection(id);
              return;
            }
            const myRole = session.user.role as string;
            if (myRole === 'hod') {
              alert('HOD ไม่ใช่ผู้ตรวจสอบ จะนำไปยังแดชบอร์ด');
              router.push('/dashboard');
              return;
            }
            if (myRole !== role) {
              alert(
                `รายการนี้สำหรับ "${roleLabels[role]}" เท่านั้น\nคุณ login เป็น "${roleLabels[myRole] || myRole}"`
              );
              return;
            }
            setSelectedItem(null);
            startInspection(id);
          }}
        />
      )}
    </div>
  );
}

function SummaryChip({ code, label, count }: { code: StatusCode; label: string; count: number }) {
  const s = STATUS_STYLES[code];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${s.bg} ${s.text} ring-1 ${s.ring} text-xs font-medium`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
      <span>{label}</span>
      <span className="font-bold">{count}</span>
    </div>
  );
}

function VehicleCard({ item, onClick }: { item: AmbulanceStatusItem; onClick: () => void }) {
  const s = STATUS_STYLES[item.status.code];
  const ins = item.inspection;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full bg-white rounded-xl border-2 ${s.ring.replace('ring-', 'border-')} p-4 hover:shadow-md hover:-translate-y-0.5 transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg font-bold text-gray-900">{item.ambulance.vehicleNumber}</div>
          <div className="text-sm font-semibold text-blue-700">{item.ambulance.licensePlate}</div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${s.bg} ${s.text} text-xs font-semibold`}>
          <span>{s.icon}</span>
          <span>{item.status.label}</span>
        </span>
      </div>

      {/* Progress indicators */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <ProgressDot done={!!ins?.driverCompleted} label="ยานพาหนะ" />
        <ProgressDot done={!!ins?.equipmentOfficerCompleted} label="เจ้าหน้าที่เคลื่อนย้าย" />
        <ProgressDot done={!!ins?.nurseCompleted} label="พยาบาล" />
      </div>

      {ins?.hodApproved && (
        <div className="mt-2 text-[11px] text-green-700 flex items-center gap-1">
          <span>✓</span> HOD อนุมัติแล้ว
        </div>
      )}
      {ins?.remarks && (
        <div className="mt-2 text-[11px] text-gray-600 bg-gray-50 rounded px-2 py-1 truncate" title={ins.remarks}>
          📝 {ins.remarks}
        </div>
      )}

      <div className="mt-3 text-[11px] text-blue-600 font-medium flex items-center justify-end gap-1">
        ดูรายการตรวจ <span>›</span>
      </div>
    </button>
  );
}

function ProgressDot({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium ${done ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
      <span className="text-base leading-none">{done ? '✓' : '○'}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function LoginPanel({
  email,
  password,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  emailInputRef,
}: {
  email: string;
  password: string;
  error: string;
  isLoading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  emailInputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-3 shadow-lg">
          <span className="text-3xl">🔐</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">เข้าสู่ระบบ</h2>
        <p className="text-sm text-gray-500">Login to continue</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
            รหัสพนักงาน / Employee ID
          </label>
          <input
            id="email"
            ref={emailInputRef}
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="example@hospital.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
            รหัสผ่าน / Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-gray-200">
        <p className="text-[10px] font-medium text-gray-600 mb-2 text-center">
          บัญชีทดสอบ / Test Accounts
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="bg-blue-50 px-2 py-1.5 rounded">
            <div className="font-medium">🚗 Driver</div>
            <div className="text-gray-600 truncate">driver@hospital.com</div>
          </div>
          <div className="bg-green-50 px-2 py-1.5 rounded">
            <div className="font-medium">🔧 Equipment</div>
            <div className="text-gray-600 truncate">equipment@hospital.com</div>
          </div>
          <div className="bg-purple-50 px-2 py-1.5 rounded">
            <div className="font-medium">💉 Nurse</div>
            <div className="text-gray-600 truncate">nurse@hospital.com</div>
          </div>
          <div className="bg-orange-50 px-2 py-1.5 rounded">
            <div className="font-medium">👨‍💼 HOD</div>
            <div className="text-gray-600 truncate">hod@hospital.com</div>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-center">
          รหัสผ่าน: <span className="font-mono font-medium">password123</span>
        </p>
      </div>
    </div>
  );
}

function UserPanel({
  session,
  onLogout,
  onNavigate,
}: {
  session: any;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}) {
  const role = session.user.role as string;
  const roleMap: Record<string, { name: string; icon: string; color: string }> = {
    driver: { name: 'เจ้าหน้าที่ยานพาหนะ', icon: '🚗', color: 'bg-blue-500' },
    equipment_officer: { name: 'เจ้าหน้าที่เคลื่อนย้ายผู้ป่วย', icon: '🔧', color: 'bg-green-500' },
    nurse: { name: 'พยาบาล', icon: '👨‍⚕️', color: 'bg-purple-500' },
    hod: { name: 'HOD Dispatch Center', icon: '✅', color: 'bg-orange-500' },
  };
  const info = roleMap[role] || roleMap.driver;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="text-center mb-5">
        <div className={`inline-flex items-center justify-center w-16 h-16 ${info.color} rounded-xl mb-3 shadow-lg text-3xl`}>
          {info.icon}
        </div>
        <div className="text-xs text-gray-500">ยินดีต้อนรับ / Welcome</div>
        <h2 className="text-lg font-bold text-gray-900">{session.user.name}</h2>
        <div className="text-xs text-gray-600">{info.name}</div>
      </div>

      <div className="space-y-2">
        {role === 'hod' ? (
          <>
            <NavButton icon="✅" label="แดชบอร์ด" sub="Dashboard" onClick={() => onNavigate('/dashboard')} />
            <NavButton icon="📊" label="สถิติ" sub="Statistics" onClick={() => onNavigate('/statistics')} />
            <NavButton icon="📱" label="QR Code" sub="Generate QR" onClick={() => onNavigate('/qr-generator')} />
            <NavButton icon="⚙️" label="จัดการระบบ" sub="Admin" onClick={() => onNavigate('/admin')} />
          </>
        ) : (
          <NavButton icon="📷" label="สแกน QR Code" sub="Start Inspection" onClick={() => onNavigate('/scanner')} primary />
        )}
      </div>

      <button
        onClick={onLogout}
        className="w-full mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
      >
        ออกจากระบบ / Logout
      </button>
    </div>
  );
}

function NavButton({
  icon,
  label,
  sub,
  onClick,
  primary,
}: {
  icon: string;
  label: string;
  sub: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
        primary
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className={`text-[10px] ${primary ? 'text-blue-100' : 'text-gray-500'}`}>{sub}</div>
      </div>
      <span className={primary ? 'text-blue-100' : 'text-gray-400'}>›</span>
    </button>
  );
}

const HOD_STATUS_OPTIONS: Array<{ code: 'ready' | 'monitor' | 'not_ready'; label: string; cls: string }> = [
  { code: 'ready', label: '✅ พร้อมใช้', cls: 'border-green-500 bg-green-50 text-green-700' },
  { code: 'monitor', label: '⚠️ เฝ้าระวัง', cls: 'border-orange-500 bg-orange-50 text-orange-700' },
  { code: 'not_ready', label: '⛔ ไม่พร้อมใช้', cls: 'border-red-500 bg-red-50 text-red-700' },
];

function InspectionModal({
  item,
  isLoggedIn,
  userRole,
  starting,
  onClose,
  onStart,
  onApprove,
  onSectionStart,
}: {
  item: AmbulanceStatusItem;
  isLoggedIn: boolean;
  userRole: string;
  starting: boolean;
  onClose: () => void;
  onStart: () => void;
  onApprove: (overallStatus: 'ready' | 'monitor' | 'not_ready') => Promise<void>;
  onSectionStart: (role: 'driver' | 'equipment_officer' | 'nurse') => void;
}) {
  const [pendingStatus, setPendingStatus] = useState<'ready' | 'monitor' | 'not_ready' | ''>('');
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState('');
  const s = STATUS_STYLES[item.status.code];
  const ins = item.inspection;

  const grouped: Record<string, typeof INSPECTION_CHECKLIST> = {
    driver: INSPECTION_CHECKLIST.filter((c) => c.inspectorRole === 'driver'),
    equipment_officer: INSPECTION_CHECKLIST.filter((c) => c.inspectorRole === 'equipment_officer'),
    nurse: INSPECTION_CHECKLIST.filter((c) => c.inspectorRole === 'nurse'),
  };

  const roleMeta: Record<string, { label: string; icon: string; color: string; done: boolean }> = {
    driver: {
      label: 'ยานพาหนะ / Vehicle',
      icon: '🚗',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      done: !!ins?.driverCompleted,
    },
    equipment_officer: {
      label: 'เจ้าหน้าที่เคลื่อนย้าย / Patient Escort',
      icon: '🔧',
      color: 'bg-green-50 text-green-800 border-green-200',
      done: !!ins?.equipmentOfficerCompleted,
    },
    nurse: {
      label: 'พยาบาล / Nurse',
      icon: '👨‍⚕️',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      done: !!ins?.nurseCompleted,
    },
  };

  const isHod = userRole === 'hod';
  const allCompleted =
    !!ins?.driverCompleted && !!ins?.equipmentOfficerCompleted && !!ins?.nurseCompleted;
  const alreadyApproved = !!ins?.hodApproved;
  const showHodApprove = isHod && allCompleted && !alreadyApproved;

  const ctaLabel = !isLoggedIn
    ? 'เข้าสู่ระบบเพื่อตรวจ / Login to Inspect'
    : isHod
    ? alreadyApproved
      ? 'อนุมัติแล้ว / Approved'
      : !allCompleted
      ? 'รอการตรวจครบ 3 ฝ่าย / Awaiting all sections'
      : 'อนุมัติ / Approve'
    : 'ไปตรวจ / Start Inspection';

  const handleApproveClick = async () => {
    if (!pendingStatus) return;
    setApproveError('');
    setApproving(true);
    try {
      await onApprove(pendingStatus);
    } catch (err: any) {
      setApproveError(err?.message || 'อนุมัติไม่สำเร็จ');
      setApproving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🚑</span>
              <h2 className="text-lg font-bold text-gray-900">{item.ambulance.vehicleNumber}</h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${s.bg} ${s.text} text-[11px] font-semibold`}>
                {s.icon} {item.status.label}
              </span>
            </div>
            <p className="text-sm font-semibold text-blue-700">ทะเบียน: {item.ambulance.licensePlate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {(['driver', 'equipment_officer', 'nurse'] as const).map((role) => {
            const meta = roleMeta[role];
            const list = grouped[role];
            const isMyRole = isLoggedIn && userRole === role;
            const canClick = !isLoggedIn || isMyRole;

            return (
              <div key={role} className={`border rounded-xl p-3 ${meta.color}`}>
                <button
                  type="button"
                  onClick={() => onSectionStart(role)}
                  disabled={meta.done && isLoggedIn && userRole !== 'hod'}
                  className={`w-full flex items-center justify-between mb-2 group ${
                    canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                  title={
                    meta.done
                      ? 'ตรวจเสร็จแล้ว'
                      : isMyRole
                      ? 'คลิกเพื่อเริ่มตรวจในส่วนของคุณ'
                      : !isLoggedIn
                      ? 'login เพื่อเริ่มตรวจ'
                      : `สำหรับ ${meta.label} เท่านั้น`
                  }
                >
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span>{meta.icon}</span> {meta.label}
                    <span className="text-[11px] font-normal opacity-70">({list.length} รายการ)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium ${meta.done ? 'text-green-700' : 'text-gray-500'}`}>
                      {meta.done ? '✓ ตรวจแล้ว' : '○ ยังไม่ตรวจ'}
                    </span>
                    {!meta.done && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/70 group-hover:bg-white ${
                          isMyRole ? 'text-blue-700' : 'text-gray-500'
                        }`}
                      >
                        ไปตรวจ ›
                      </span>
                    )}
                  </div>
                </button>
                <ul className="text-[12px] text-gray-700 grid sm:grid-cols-2 gap-x-3 gap-y-1 max-h-56 overflow-y-auto pr-1">
                  {list.map((c) => {
                    const checked = ins?.items?.find(
                      (it) => it.itemCode === c.code && it.inspectorRole === role
                    );
                    const mark = !checked
                      ? { icon: '⬜', cls: 'text-gray-400', title: 'ยังไม่ตรวจ' }
                      : checked.status === 'abnormal'
                      ? { icon: '❌', cls: 'text-red-600 font-semibold', title: 'ผิดปกติ' }
                      : checked.status === 'fixed'
                      ? { icon: '🛠️', cls: 'text-orange-600 font-semibold', title: 'แก้ไขแล้ว' }
                      : { icon: '✅', cls: 'text-green-600', title: 'ปกติ' };

                    return (
                      <li
                        key={`${role}-${c.code}`}
                        className={`flex items-start gap-1.5 ${mark.cls}`}
                        title={`${mark.title}${checked?.remarks ? ` — ${checked.remarks}` : ''}${checked?.value ? ` · ${checked.value}` : ''}`}
                      >
                        <span className="flex-shrink-0">{mark.icon}</span>
                        <span className="opacity-60 flex-shrink-0">{c.code}.</span>
                        <span className="flex-1 min-w-0">
                          <span className="block truncate" title={c.name}>
                            {c.name.split(' / ')[0]}
                          </span>
                          {checked?.value && (
                            <span className="block text-[10px] opacity-75 truncate font-normal" title={checked.value}>
                              📊 {checked.value}
                            </span>
                          )}
                          {checked?.remarks && (
                            <span className="block text-[10px] opacity-75 truncate font-normal" title={checked.remarks}>
                              📝 {checked.remarks}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          {!isLoggedIn && (
            <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3">
              ℹ️ กรุณาเข้าสู่ระบบเพื่อเริ่มตรวจสอบ — ระบบจะใช้รหัสที่ login เป็นรหัสผู้ตรวจสอบโดยอัตโนมัติ
            </div>
          )}

          {/* HOD: status picker before approval */}
          {showHodApprove && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="text-sm font-semibold text-blue-900">
                ระบุสถานะรถพยาบาลก่อนอนุมัติ / Select status before approving
              </div>
              <div className="grid grid-cols-3 gap-2">
                {HOD_STATUS_OPTIONS.map((opt) => {
                  const selected = pendingStatus === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setPendingStatus(opt.code)}
                      className={`text-xs sm:text-sm px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                        selected
                          ? `${opt.cls} ring-2 ring-offset-1`
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {approveError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                  {approveError}
                </div>
              )}
            </div>
          )}

          {isLoggedIn && isHod && !allCompleted && (
            <div className="text-xs bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-3">
              ⏳ ตรวจยังไม่ครบ 3 ฝ่าย — รออนุมัติเมื่อทุกฝ่ายตรวจเสร็จ
            </div>
          )}
          {isLoggedIn && isHod && alreadyApproved && (
            <div className="text-xs bg-green-50 border border-green-200 text-green-800 rounded-lg p-3">
              ✓ HOD อนุมัติแล้ว
              {ins?.hodApprovedAt &&
                ` · ${new Date(ins.hodApprovedAt).toLocaleString('th-TH')}`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
          >
            ปิด
          </button>
          <button
            onClick={showHodApprove ? handleApproveClick : onStart}
            disabled={
              starting ||
              approving ||
              (showHodApprove && !pendingStatus) ||
              (isHod && (alreadyApproved || !allCompleted))
            }
            className="flex-1 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow"
          >
            {approving ? 'กำลังอนุมัติ...' : starting ? 'กำลังเริ่ม...' : ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
