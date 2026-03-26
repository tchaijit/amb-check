'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut, signIn } from 'next-auth/react';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getRoleInfo = (roleId: string) => {
    const roles: Record<string, any> = {
      driver: {
        name: 'เจ้าหน้าที่ยานพาหนะ',
        nameEn: 'Vehicle Officer',
        description: 'ตรวจสอบสภาพรถพยาบาล',
        descriptionEn: 'Inspect vehicle condition',
        icon: '🚗',
        color: 'bg-blue-500',
      },
      equipment_officer: {
        name: 'เจ้าหน้าที่เคลื่อนย้ายผู้ป่วย',
        nameEn: 'Patient Escort',
        description: 'ตรวจสอบอุปกรณ์และเครื่องมือ',
        descriptionEn: 'Inspect equipment & tools',
        icon: '🔧',
        color: 'bg-green-500',
      },
      nurse: {
        name: 'พยาบาล',
        nameEn: 'Nurse',
        description: 'ตรวจสอบอุปกรณ์การแพทย์',
        descriptionEn: 'Inspect medical equipment',
        icon: '👨‍⚕️',
        color: 'bg-purple-500',
      },
      hod: {
        name: 'HOD Dispatch Center',
        nameEn: 'HOD Dispatch Center',
        description: 'อนุมัติการใช้รถพยาบาล',
        descriptionEn: 'Approve ambulance readiness',
        icon: '✅',
        color: 'bg-orange-500',
      },
    };
    return roles[roleId] || roles.driver;
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">กำลังโหลด... / Loading...</div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div className="min-h-[calc(100vh-200px)] grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Hero Content */}
        <div className="space-y-8">
          {/* Hero Section */}
          <div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6 shadow-xl">
              <span className="text-5xl">🚑</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AMB Check System
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              ระบบตรวจสอบความพร้อมรถพยาบาล
            </p>
            <p className="text-lg text-gray-500 mb-6">
              Ambulance Inspection & Management System
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Bangkok Siriroj Hospital</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">ตรวจสอบอย่างเป็นระบบ</h3>
                <p className="text-sm text-gray-600">Systematic Inspection - ระบบ Checklist ครบถ้วนทุกขั้นตอน</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">QR Code Scanning</h3>
                <p className="text-sm text-gray-600">สแกนง่าย รวดเร็ว - เข้าถึงข้อมูลรถได้ทันที</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">รายงานแบบ Real-time</h3>
                <p className="text-sm text-gray-600">Real-time Reporting - ติดตามสถานะได้ทุกเมื่อ</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-xs text-gray-600">Roles</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-xs text-gray-600">Digital</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-xs text-gray-600">Available</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">RT</div>
              <div className="text-xs text-gray-600">Real-time</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:pl-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Login Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
              <p className="text-gray-600">Login to continue</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล / Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="example@hospital.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน / Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            {/* Test Accounts */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-3 text-center">
                บัญชีทดสอบ / Test Accounts
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 px-3 py-2 rounded-lg">
                  <div className="font-medium text-gray-800">🚗 Driver</div>
                  <div className="text-gray-600">driver@hospital.com</div>
                </div>
                <div className="bg-green-50 px-3 py-2 rounded-lg">
                  <div className="font-medium text-gray-800">🔧 Equipment</div>
                  <div className="text-gray-600">equipment@hospital.com</div>
                </div>
                <div className="bg-purple-50 px-3 py-2 rounded-lg">
                  <div className="font-medium text-gray-800">💉 Nurse</div>
                  <div className="text-gray-600">nurse@hospital.com</div>
                </div>
                <div className="bg-orange-50 px-3 py-2 rounded-lg">
                  <div className="font-medium text-gray-800">👨‍💼 HOD</div>
                  <div className="text-gray-600">hod@hospital.com</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                รหัสผ่านทั้งหมด: <span className="font-mono font-medium">password123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated
  const userRole = session.user.role as string;
  const roleInfo = getRoleInfo(userRole);

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Info Header */}
      <div className="card mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${roleInfo.color} bg-white bg-opacity-20 p-4 rounded-lg text-4xl`}>
              {roleInfo.icon}
            </div>
            <div>
              <div className="text-sm opacity-90">ยินดีต้อนรับ / Welcome</div>
              <h2 className="text-2xl font-bold">{session.user.name}</h2>
              <div className="text-sm opacity-90">{roleInfo.name} / {roleInfo.nameEn}</div>
            </div>
          </div>
          <div className="flex gap-2">
            {userRole === 'hod' && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:bg-opacity-30 transition-colors inline-flex items-center gap-2"
              >
                ⚙️ <span className="hidden sm:inline">จัดการระบบ / Admin</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              ออกจากระบบ / Logout
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {userRole === 'hod' ? (
          <>
            <button
              onClick={() => router.push('/dashboard')}
              className="card hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white p-4 rounded-lg text-4xl">
                  ✅
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">แดชบอร์ด / Dashboard</h2>
                  <p className="text-gray-600 text-sm">
                    ตรวจสอบและอนุมัติรถพยาบาล / Review and approve ambulances
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push('/statistics')}
              className="card hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white p-4 rounded-lg text-4xl">
                  📊
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">สถิติ / Statistics</h2>
                  <p className="text-gray-600 text-sm">
                    ดูสถิติและรายงาน / View statistics and reports
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push('/qr-generator')}
              className="card hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="bg-purple-500 text-white p-4 rounded-lg text-4xl">
                  📱
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">QR Code</h2>
                  <p className="text-gray-600 text-sm">
                    สร้าง QR Code สำหรับรถพยาบาล / Generate QR Codes for ambulances
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="card hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gray-700 text-white p-4 rounded-lg text-4xl">
                  ⚙️
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">จัดการระบบ / Admin</h2>
                  <p className="text-gray-600 text-sm">
                    จัดการผู้ใช้งานและรถพยาบาล / Manage users and vehicles
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push('/scanner')}
            className="card hover:shadow-xl transition-all transform hover:-translate-y-1 text-left md:col-span-2"
          >
            <div className="flex items-start gap-4">
              <div className={`${roleInfo.color} text-white p-4 rounded-lg text-4xl`}>
                📷
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">สแกน QR Code / Scan QR Code</h2>
                <p className="text-gray-600 text-sm">
                  {roleInfo.description} / {roleInfo.descriptionEn}
                </p>
              </div>
              <div className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-lg mb-2">ขั้นตอนการใช้งาน / How to Use</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          {userRole === 'hod' ? (
            <>
              <li>เข้าสู่แดชบอร์ดเพื่อดูรายการตรวจสอบ / Access dashboard to view inspections</li>
              <li>ตรวจสอบรายละเอียดการตรวจสอบ / Review inspection details</li>
              <li>อนุมัติหรือปฏิเสธการใช้งานรถพยาบาล / Approve or reject ambulance usage</li>
            </>
          ) : (
            <>
              <li>สแกน QR Code ที่ติดอยู่บนรถพยาบาล / Scan the QR Code on ambulance</li>
              <li>ทำการตรวจสอบรายการในส่วนของคุณ / Complete inspection checklist</li>
              <li>บันทึกผลการตรวจสอบ / Save inspection results</li>
              <li>HOD จะเข้ามาอนุมัติหลังจากทุกคนตรวจเสร็จ / HOD approves after all complete</li>
            </>
          )}
        </ol>
      </div>
    </div>
  );
}
