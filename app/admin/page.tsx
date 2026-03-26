'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'users' | 'vehicles'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // Check if user is HOD
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'hod') {
      router.push('/');
      return;
    }
    loadData();
  }, [session, status, router]);

  const loadData = async () => {
    setLoading(true);
    // Load users
    const mockUsers = [
      { id: 1, email: 'driver@hospital.com', name: 'John Driver', role: 'driver' },
      { id: 2, email: 'equipment@hospital.com', name: 'Jane Equipment', role: 'equipment_officer' },
      { id: 3, email: 'nurse@hospital.com', name: 'Mary Nurse', role: 'nurse' },
      { id: 4, email: 'hod@hospital.com', name: 'Dr. Smith HOD', role: 'hod' },
    ];
    setUsers(mockUsers);

    // Load vehicles
    const mockVehicles = [
      { id: 1, vehicleNumber: 'AMB-001', licensePlate: 'กก-1234', qrCode: 'AMB-001', status: 'active' },
      { id: 2, vehicleNumber: 'AMB-002', licensePlate: 'กข-5678', qrCode: 'AMB-002', status: 'active' },
      { id: 3, vehicleNumber: 'AMB-003', licensePlate: 'กค-9012', qrCode: 'AMB-003', status: 'active' },
      { id: 4, vehicleNumber: 'AMB-004', licensePlate: 'ปท-3456', qrCode: 'AMB-004', status: 'active' },
      { id: 5, vehicleNumber: 'AMB-005', licensePlate: 'ชบ-7890', qrCode: 'AMB-005', status: 'active' },
    ];
    setVehicles(mockVehicles);
    setLoading(false);
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      driver: '🚗 เจ้าหน้าที่ยานพาหนะ / Driver',
      equipment_officer: '🔧 เจ้าหน้าที่อุปกรณ์ / Equipment',
      nurse: '💉 พยาบาล / Nurse',
      hod: '👨‍💼 HOD',
    };
    return roles[role] || role;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="text-2xl">กำลังโหลด... / Loading...</div>
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
          <button
            onClick={() => router.push('/')}
            className="btn-secondary"
          >
            ← กลับหน้าหลัก / Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>👥</span>
            <span>จัดการผู้ใช้งาน / Users</span>
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'vehicles'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>🚑</span>
            <span>จัดการรถพยาบาล / Vehicles</span>
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">👥 รายการผู้ใช้งาน / Users List</h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <span>➕</span>
              <span>เพิ่มผู้ใช้ใหม่ / Add User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">อีเมล / Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ชื่อ / Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">บทบาท / Role</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">จัดการ / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm">{getRoleName(user.role)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          ✏️ แก้ไข
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            จำนวนผู้ใช้ทั้งหมด: {users.length} คน / Total users: {users.length}
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">🚑 รายการรถพยาบาล / Vehicles List</h2>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <span>➕</span>
              <span>เพิ่มรถใหม่ / Add Vehicle</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">รหัสรถ / Vehicle No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ทะเบียน / License Plate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">QR Code</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">สถานะ / Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">จัดการ / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{vehicle.vehicleNumber}</td>
                    <td className="px-4 py-3 text-sm">{vehicle.licensePlate}</td>
                    <td className="px-4 py-3 text-sm">{vehicle.qrCode}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.status === 'active' ? '✓ ใช้งาน / Active' : '✗ ปิดใช้งาน / Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => router.push(`/qr-generator?vehicle=${vehicle.vehicleNumber}`)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          📱 QR
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            จำนวนรถทั้งหมด: {vehicles.length} คัน / Total vehicles: {vehicles.length}
          </div>
        </div>
      )}

      {/* Add User Modal - Coming Soon */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">เพิ่มผู้ใช้ใหม่ / Add New User</h3>
            <p className="text-gray-600 mb-4">ฟีเจอร์นี้กำลังพัฒนา... / Feature coming soon...</p>
            <button
              onClick={() => setShowAddUser(false)}
              className="btn-secondary w-full"
            >
              ปิด / Close
            </button>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal - Coming Soon */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">เพิ่มรถพยาบาลใหม่ / Add New Vehicle</h3>
            <p className="text-gray-600 mb-4">ฟีเจอร์นี้กำลังพัฒนา... / Feature coming soon...</p>
            <button
              onClick={() => setShowAddVehicle(false)}
              className="btn-secondary w-full"
            >
              ปิด / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
