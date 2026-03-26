'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/';

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
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง / Invalid email or password');
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง / An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const testUsers = [
    { email: 'driver@hospital.com', role: 'เจ้าหน้าที่ยานพาหนะ / Driver', icon: '🚗' },
    { email: 'equipment@hospital.com', role: 'เจ้าหน้าที่อุปกรณ์ / Equipment Officer', icon: '🔧' },
    { email: 'nurse@hospital.com', role: 'พยาบาล / Nurse', icon: '💉' },
    { email: 'hod@hospital.com', role: 'หัวหน้าศูนย์ปฏิบัติการ / HOD', icon: '👨‍💼' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚑</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ระบบตรวจสอบรถพยาบาล
          </h1>
          <p className="text-gray-600">Ambulance Inspection System</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ... / Logging in...' : 'เข้าสู่ระบบ / Login'}
          </button>
        </form>

        {/* Test Users Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">
            บัญชีทดสอบ / Test Accounts
          </p>
          <div className="space-y-2">
            {testUsers.map((user) => (
              <div
                key={user.email}
                className="bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <span className="text-lg">{user.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{user.role}</div>
                  <div className="text-gray-600 text-xs">{user.email}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            รหัสผ่านทั้งหมด: password123 / All passwords: password123
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
            ← กลับหน้าหลัก / Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto text-center py-12">กำลังโหลด... / Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
