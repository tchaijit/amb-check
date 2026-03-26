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
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-2xl">กำลังโหลด... / Loading...</div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚑</div>
          <h1 className="text-3xl font-bold mb-2">ยินดีต้อนรับ / Welcome</h1>
          <p className="text-gray-600 mb-6">
            ระบบตรวจสอบรถพยาบาล / Ambulance Inspection System
          </p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <span>🔐</span>
            <span>เข้าสู่ระบบ / Login</span>
          </button>
        </div>

        <div className="mt-12 card bg-blue-50 border border-blue-200">
          <h3 className="font-bold text-lg mb-2">ขั้นตอนการใช้งาน / How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>เข้าสู่ระบบด้วยบัญชีของคุณ / Login with your account</li>
            <li>สแกน QR Code ที่ติดอยู่บนรถพยาบาล / Scan the QR Code on ambulance</li>
            <li>ทำการตรวจสอบรายการในส่วนของคุณ / Complete inspection checklist</li>
            <li>บันทึกผลการตรวจสอบ / Save inspection results</li>
            <li>HOD จะเข้ามาอนุมัติหลังจากทุกคนตรวจเสร็จ / HOD approves after all complete</li>
          </ol>
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
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            ออกจากระบบ / Logout
          </button>
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
