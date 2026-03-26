'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'password'>('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Profile form state
  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    role: session?.user?.role || '',
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    language: 'th',
    notifications: true,
    emailNotifications: true,
    autoLogout: 30,
    inspectionReminder: true,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // TODO: Connect to API
      // await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile),
      // });

      setTimeout(() => {
        setMessage('บันทึกข้อมูลสำเร็จ / Profile saved successfully');
        setSaving(false);
      }, 1000);
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด / Error occurred');
      setSaving(false);
    }
  };

  const handleSystemSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // TODO: Save to localStorage or API
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));

      setTimeout(() => {
        setMessage('บันทึกการตั้งค่าสำเร็จ / Settings saved successfully');
        setSaving(false);
      }, 1000);
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด / Error occurred');
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setSaving(true);
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('รหัสผ่านไม่ตรงกัน / Passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร / Password must be at least 8 characters');
      setSaving(false);
      return;
    }

    try {
      // TODO: Connect to API
      // await fetch('/api/user/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: passwordForm.currentPassword,
      //     newPassword: passwordForm.newPassword,
      //   }),
      // });

      setTimeout(() => {
        setMessage('เปลี่ยนรหัสผ่านสำเร็จ / Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSaving(false);
      }, 1000);
    } catch (error) {
      setMessage('เกิดข้อผิดพลาด / Error occurred');
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const tabs = [
    { id: 'profile', name: 'โปรไฟล์ / Profile', icon: '👤' },
    { id: 'system', name: 'ระบบ / System', icon: '⚙️' },
    { id: 'password', name: 'รหัสผ่าน / Password', icon: '🔐' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-2">การตั้งค่า / Settings</h1>
        <p className="text-gray-600">จัดการข้อมูลส่วนตัวและการตั้งค่าระบบ / Manage your profile and system settings</p>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setMessage('');
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`card mb-6 ${
          message.includes('สำเร็จ') || message.includes('successfully')
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={message.includes('สำเร็จ') || message.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
            {message}
          </p>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">ข้อมูลส่วนตัว / Profile Information</h2>

          <div className="space-y-6">
            {/* Role Badge */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">บทบาท / Role</div>
              <div className="text-lg font-bold text-blue-800">
                {profile.role === 'driver' && '🚗 เจ้าหน้าที่ยานพาหนะ / Vehicle Officer'}
                {profile.role === 'equipment_officer' && '🔧 เจ้าหน้าที่อุปกรณ์ / Equipment Officer'}
                {profile.role === 'nurse' && '💉 พยาบาล / Nurse'}
                {profile.role === 'hod' && '👨‍💼 หัวหน้าศูนย์ปฏิบัติการ / HOD'}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ชื่อ-นามสกุล / Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                อีเมล / Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="input-field"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">
                ไม่สามารถเปลี่ยนอีเมลได้ / Email cannot be changed
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'กำลังบันทึก... / Saving...' : 'บันทึกข้อมูล / Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">การตั้งค่าระบบ / System Settings</h2>

          <div className="space-y-6">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ภาษา / Language
              </label>
              <select
                value={systemSettings.language}
                onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                className="input-field"
              >
                <option value="th">ไทย / Thai</option>
                <option value="en">English / อังกฤษ</option>
                <option value="both">ทั้งสองภาษา / Both</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
              <h3 className="font-medium">การแจ้งเตือน / Notifications</h3>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">การแจ้งเตือนในระบบ / In-App Notifications</div>
                  <div className="text-sm text-gray-600">แสดงการแจ้งเตือนในระบบ</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.notifications}
                    onChange={(e) => setSystemSettings({ ...systemSettings, notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">อีเมล / Email Notifications</div>
                  <div className="text-sm text-gray-600">รับการแจ้งเตือนทางอีเมล</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.emailNotifications}
                    onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">เตือนการตรวจสอบ / Inspection Reminder</div>
                  <div className="text-sm text-gray-600">แจ้งเตือนเมื่อถึงเวลาตรวจสอบ</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.inspectionReminder}
                    onChange={(e) => setSystemSettings({ ...systemSettings, inspectionReminder: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Auto Logout */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ออกจากระบบอัตโนมัติ / Auto Logout (นาที / minutes)
              </label>
              <select
                value={systemSettings.autoLogout}
                onChange={(e) => setSystemSettings({ ...systemSettings, autoLogout: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value="15">15 นาที / minutes</option>
                <option value="30">30 นาที / minutes</option>
                <option value="60">60 นาที / minutes</option>
                <option value="0">ไม่ออกอัตโนมัติ / Never</option>
              </select>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={handleSystemSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'กำลังบันทึก... / Saving...' : 'บันทึกการตั้งค่า / Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">เปลี่ยนรหัสผ่าน / Change Password</h2>

          <div className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                รหัสผ่านปัจจุบัน / Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                รหัสผ่านใหม่ / New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
              <p className="text-sm text-gray-500 mt-1">
                อย่างน้อย 8 ตัวอักษร / At least 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ยืนยันรหัสผ่านใหม่ / Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'กำลังเปลี่ยน... / Changing...' : 'เปลี่ยนรหัสผ่าน / Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="card border-2 border-red-200 mt-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone / พื้นที่อันตราย</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <div className="font-medium text-red-800">ออกจากระบบ / Logout</div>
              <div className="text-sm text-red-600">ออกจากระบบทั้งหมด</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ออกจากระบบ / Logout
            </button>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={() => router.push('/')}
          className="btn-secondary w-full"
        >
          กลับหน้าแรก / Back to Home
        </button>
      </div>
    </div>
  );
}
