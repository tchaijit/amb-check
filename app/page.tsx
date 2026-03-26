'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

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

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl shadow-2xl mb-12">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50"></div>

          <div className="relative px-8 py-16 md:py-24 text-center">
            <div className="mb-6 animate-bounce">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full border-4 border-white/20 shadow-xl">
                <span className="text-6xl">🚑</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              AMB Check System
            </h1>
            <div className="text-xl md:text-2xl text-blue-100 mb-2">
              ระบบตรวจสอบความพร้อมรถพยาบาล
            </div>
            <div className="text-lg md:text-xl text-blue-200 mb-8">
              Ambulance Inspection & Management System
            </div>

            <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={() => router.push('/login')}
                className="group relative px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>เข้าสู่ระบบ / Login</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="mt-8 text-sm text-blue-200">
              <p>Bangkok Siriroj Hospital</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">ตรวจสอบอย่างเป็นระบบ</h3>
              <p className="text-gray-600 text-sm">Systematic Inspection</p>
              <p className="text-gray-700 mt-2 text-sm">
                ระบบ Checklist ครบถ้วนทุกขั้นตอน
              </p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">QR Code Scanning</h3>
              <p className="text-gray-600 text-sm">สแกนง่าย รวดเร็ว</p>
              <p className="text-gray-700 mt-2 text-sm">
                เข้าถึงข้อมูลรถได้ทันที
              </p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">รายงานแบบ Real-time</h3>
              <p className="text-gray-600 text-sm">Real-time Reporting</p>
              <p className="text-gray-700 mt-2 text-sm">
                ติดตามสถานะได้ทุกเมื่อ
              </p>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="card bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">ขั้นตอนการใช้งาน</h2>
            <p className="text-gray-600">How It Works</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full mb-3 font-bold text-xl shadow-lg">1</div>
              <h4 className="font-bold text-gray-800 mb-1">เข้าสู่ระบบ</h4>
              <p className="text-sm text-gray-600">Login</p>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full mb-3 font-bold text-xl shadow-lg">2</div>
              <h4 className="font-bold text-gray-800 mb-1">สแกน QR Code</h4>
              <p className="text-sm text-gray-600">Scan QR</p>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full mb-3 font-bold text-xl shadow-lg">3</div>
              <h4 className="font-bold text-gray-800 mb-1">ตรวจสอบ</h4>
              <p className="text-sm text-gray-600">Inspect</p>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full mb-3 font-bold text-xl shadow-lg">4</div>
              <h4 className="font-bold text-gray-800 mb-1">บันทึกผล</h4>
              <p className="text-sm text-gray-600">Save Results</p>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full mb-3 font-bold text-xl shadow-lg">5</div>
              <h4 className="font-bold text-gray-800 mb-1">HOD อนุมัติ</h4>
              <p className="text-sm text-gray-600">HOD Approval</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="card text-center bg-blue-50 border-2 border-blue-200">
            <div className="text-4xl font-bold text-blue-600 mb-1">4</div>
            <div className="text-sm text-gray-600">Role Types</div>
          </div>
          <div className="card text-center bg-green-50 border-2 border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-1">100%</div>
            <div className="text-sm text-gray-600">Digital Process</div>
          </div>
          <div className="card text-center bg-purple-50 border-2 border-purple-200">
            <div className="text-4xl font-bold text-purple-600 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Availability</div>
          </div>
          <div className="card text-center bg-orange-50 border-2 border-orange-200">
            <div className="text-4xl font-bold text-orange-600 mb-1">Real-time</div>
            <div className="text-sm text-gray-600">Monitoring</div>
          </div>
        </div>

        {/* Contact/Support */}
        <div className="card bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
          <div className="text-2xl font-bold mb-2">พร้อมเริ่มต้นใช้งาน?</div>
          <p className="text-blue-100 mb-6">Ready to get started?</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transform hover:-translate-y-1 transition-all duration-200 shadow-xl inline-flex items-center gap-2"
          >
            <span>เข้าสู่ระบบตอนนี้</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
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
