'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

type MenuItem = {
  href: string;
  icon: string;
  label: string;
  sub?: string;
  roles?: string[]; // if undefined, available to all logged-in users
};

const ALL_MENU: MenuItem[] = [
  { href: '/', icon: '🏠', label: 'หน้าหลัก', sub: 'Home' },
  { href: '/dashboard', icon: '📋', label: 'แดชบอร์ด', sub: 'Dashboard', roles: ['hod'] },
  { href: '/statistics', icon: '📊', label: 'สถิติ', sub: 'Statistics', roles: ['hod'] },
  { href: '/history', icon: '🗂️', label: 'ประวัติ', sub: 'History', roles: ['hod'] },
  { href: '/qr-generator', icon: '📱', label: 'QR Code', sub: 'Generator', roles: ['hod', 'equipment_officer'] },
  { href: '/admin', icon: '⚙️', label: 'จัดการระบบ', sub: 'Admin', roles: ['hod'] },
  { href: '/scanner', icon: '📷', label: 'สแกน QR', sub: 'Scanner', roles: ['driver', 'equipment_officer', 'nurse'] },
];

const COLLAPSE_KEY = 'amb-sidebar-collapsed';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load persisted state
  useEffect(() => {
    setMounted(true);
    const saved = typeof window !== 'undefined' ? localStorage.getItem(COLLAPSE_KEY) : null;
    if (saved === '1') setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
    } catch {}
  };

  // Don't render on login or if not logged in (cleaner UX)
  if (status === 'loading' || !session || pathname === '/login') {
    return null;
  }

  const role = session.user.role as string;
  const items = ALL_MENU.filter((m) => !m.roles || m.roles.includes(role));

  const handleNav = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // Avoid SSR mismatch by only rendering after mount
  if (!mounted) return null;

  const widthCls = collapsed ? 'w-16' : 'w-60';

  return (
    <>
      {/* Mobile toggle button (only shown on small screens) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        aria-label="เปิดเมนู"
      >
        ☰
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col
          transition-transform duration-200 lg:transition-[width]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:flex-shrink-0
          ${widthCls}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl">🚑</span>
              <span className="font-bold text-gray-900 truncate">AMB Check</span>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="hidden lg:inline-flex text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg ml-auto"
            title={collapsed ? 'ขยาย' : 'ย่อ'}
            aria-label={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
          >
            {collapsed ? '»' : '«'}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-700 p-1.5 rounded-lg"
            aria-label="ปิดเมนู"
          >
            ✕
          </button>
        </div>

        {/* User info */}
        <div className={`px-3 py-3 border-b border-gray-100 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              {session.user.name?.charAt(0).toUpperCase() || '?'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</div>
                <div className="text-[11px] text-gray-500 truncate">{getRoleLabel(role)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-2">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                title={collapsed ? `${item.label} / ${item.sub}` : ''}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-lg text-left
                  transition-colors
                  ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
                  ${collapsed ? 'justify-center' : ''}
                `}
                style={{ width: collapsed ? 'calc(100% - 1rem)' : 'calc(100% - 1rem)' }}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    {item.sub && (
                      <div className={`text-[10px] truncate ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                        {item.sub}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-2">
          <button
            onClick={handleLogout}
            title={collapsed ? 'ออกจากระบบ' : ''}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
              text-red-600 hover:bg-red-50 transition-colors
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {!collapsed && <span className="text-sm font-medium">ออกจากระบบ</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = {
    driver: 'เจ้าหน้าที่ยานพาหนะ',
    equipment_officer: 'เจ้าหน้าที่เคลื่อนย้าย',
    nurse: 'พยาบาล',
    hod: 'HOD',
  };
  return map[role] || role;
}
