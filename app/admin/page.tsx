'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type UserRow = {
  id: number;
  email: string;
  name: string;
  role: string;
};

type VehicleRow = {
  id: number;
  vehicleNumber: string;
  licensePlate: string;
  qrCode: string;
  status: string;
};

const ROLE_LABELS: Record<string, string> = {
  driver: '🚗 เจ้าหน้าที่ยานพาหนะ',
  equipment_officer: '🔧 เจ้าหน้าที่เคลื่อนย้าย',
  nurse: '💉 พยาบาล',
  hod: '👨‍💼 HOD',
};

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<'users' | 'vehicles'>('users');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<VehicleRow | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, v] = await Promise.all([
        fetch('/api/admin/users').then((r) => r.json()),
        fetch('/api/admin/vehicles').then((r) => r.json()),
      ]);
      setUsers(u.users || []);
      setVehicles(v.vehicles || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'hod') {
      router.push('/');
      return;
    }
    loadData();
  }, [session, status, router, loadData]);

  const handleDeleteUser = async (user: UserRow) => {
    if (!confirm(`ลบผู้ใช้ "${user.name}" (${user.email}) ใช่ไหม?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'ลบไม่สำเร็จ');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleDeleteVehicle = async (vehicle: VehicleRow) => {
    if (!confirm(`ลบรถ "${vehicle.vehicleNumber}" ใช่ไหม?`)) return;
    const res = await fetch(`/api/admin/vehicles/${vehicle.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'ลบไม่สำเร็จ');
      return;
    }
    setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">กำลังโหลด... / Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">⚙️ การจัดการระบบ / System Management</h1>
            <p className="text-gray-600">จัดการผู้ใช้งานและรถพยาบาล / Manage users and ambulances</p>
          </div>
          <button onClick={() => router.push('/')} className="btn-secondary">
            ← กลับหน้าหลัก
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex gap-2">
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            👥 ผู้ใช้งาน ({users.length})
          </TabButton>
          <TabButton active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')}>
            🚑 รถพยาบาล ({vehicles.length})
          </TabButton>
        </div>
      </div>

      {/* Users */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">รายการผู้ใช้งาน</h2>
            <button onClick={() => setShowAddUser(true)} className="btn-primary inline-flex items-center gap-2">
              ➕ เพิ่มผู้ใช้
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold w-16">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">อีเมล</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ชื่อ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">บทบาท</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold w-44">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{user.id}</td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-sm">{ROLE_LABELS[user.role] || user.role}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">รายการรถพยาบาล</h2>
            <button onClick={() => setShowAddVehicle(true)} className="btn-primary inline-flex items-center gap-2">
              ➕ เพิ่มรถ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold w-16">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">รหัสรถ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ทะเบียน</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">QR Code</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">สถานะ</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold w-56">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{vehicle.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{vehicle.vehicleNumber}</td>
                      <td className="px-4 py-3 text-sm">{vehicle.licensePlate}</td>
                      <td className="px-4 py-3 text-sm font-mono text-xs">{vehicle.qrCode}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {vehicle.status === 'active' ? '✓ ใช้งาน' : '✗ ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setEditingVehicle(vehicle)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            onClick={() => router.push(`/qr-generator?vehicle=${vehicle.vehicleNumber}`)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            📱 QR
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddUser && (
        <UserFormModal
          mode="create"
          onClose={() => setShowAddUser(false)}
          onSaved={(user) => {
            setUsers((prev) => [...prev, user]);
            setShowAddUser(false);
          }}
        />
      )}
      {editingUser && (
        <UserFormModal
          mode="edit"
          initial={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(user) => {
            setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
            setEditingUser(null);
          }}
        />
      )}

      {showAddVehicle && (
        <VehicleFormModal
          mode="create"
          onClose={() => setShowAddVehicle(false)}
          onSaved={(v) => {
            setVehicles((prev) => [...prev, v]);
            setShowAddVehicle(false);
          }}
        />
      )}
      {editingVehicle && (
        <VehicleFormModal
          mode="edit"
          initial={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSaved={(v) => {
            setVehicles((prev) => prev.map((x) => (x.id === v.id ? v : x)));
            setEditingVehicle(null);
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function UserFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  initial?: UserRow;
  onClose: () => void;
  onSaved: (user: UserRow) => void;
}) {
  const [email, setEmail] = useState(initial?.email || '');
  const [name, setName] = useState(initial?.name || '');
  const [role, setRole] = useState<string>(initial?.role || 'driver');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body: any = { email, name, role };
      if (password) body.password = password;

      const url = mode === 'create' ? '/api/admin/users' : `/api/admin/users/${initial!.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      onSaved(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal title={mode === 'create' ? 'เพิ่มผู้ใช้ใหม่' : `แก้ไขผู้ใช้ #${initial!.id}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="อีเมล / Email" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
            placeholder="user@hospital.com"
          />
        </Field>
        <Field label="ชื่อ / Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
          />
        </Field>
        <Field label="บทบาท / Role" required>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
            <option value="driver">🚗 เจ้าหน้าที่ยานพาหนะ / Driver</option>
            <option value="equipment_officer">🔧 เจ้าหน้าที่เคลื่อนย้าย / Patient Escort</option>
            <option value="nurse">💉 พยาบาล / Nurse</option>
            <option value="hod">👨‍💼 HOD</option>
          </select>
        </Field>
        <Field label={mode === 'create' ? 'รหัสผ่าน / Password' : 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)'} required={mode === 'create'}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={mode === 'create'}
            minLength={6}
            className="input-field"
            placeholder="อย่างน้อย 6 ตัวอักษร"
          />
        </Field>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

        <FormActions onClose={onClose} saving={saving} />
      </form>
    </FormModal>
  );
}

function VehicleFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  initial?: VehicleRow;
  onClose: () => void;
  onSaved: (vehicle: VehicleRow) => void;
}) {
  const [vehicleNumber, setVehicleNumber] = useState(initial?.vehicleNumber || '');
  const [licensePlate, setLicensePlate] = useState(initial?.licensePlate || '');
  const [qrCode, setQrCode] = useState(initial?.qrCode || '');
  const [vStatus, setVStatus] = useState(initial?.status || 'active');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body: any = {
        vehicleNumber,
        licensePlate,
        qrCode: qrCode || vehicleNumber,
      };
      if (mode === 'edit') body.status = vStatus;

      const url = mode === 'create' ? '/api/admin/vehicles' : `/api/admin/vehicles/${initial!.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      onSaved(data.vehicle);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal title={mode === 'create' ? 'เพิ่มรถพยาบาลใหม่' : `แก้ไขรถ #${initial!.id}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="รหัสรถ / Vehicle No." required>
          <input
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            required
            className="input-field"
            placeholder="AMB-006"
          />
        </Field>
        <Field label="ทะเบียน / License Plate" required>
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            required
            className="input-field"
            placeholder="กท-1234 กรุงเทพมหานคร"
          />
        </Field>
        <Field label="QR Code (ถ้าเว้นว่างจะใช้รหัสรถ)">
          <input
            type="text"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            className="input-field"
            placeholder={vehicleNumber || 'AMB-006'}
          />
        </Field>
        {mode === 'edit' && (
          <Field label="สถานะ / Status">
            <select value={vStatus} onChange={(e) => setVStatus(e.target.value)} className="input-field">
              <option value="active">✓ ใช้งาน / Active</option>
              <option value="inactive">✗ ปิดใช้งาน / Inactive</option>
            </select>
          </Field>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

        <FormActions onClose={onClose} saving={saving} />
      </form>
    </FormModal>
  );
}

function FormModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function FormActions({ onClose, saving }: { onClose: () => void; saving: boolean }) {
  return (
    <div className="flex gap-2 pt-2">
      <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={saving}>
        ยกเลิก
      </button>
      <button type="submit" className="btn-primary flex-1" disabled={saving}>
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  );
}
