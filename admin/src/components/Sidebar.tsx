'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Hotel } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: 'linear-gradient(180deg, #0B1D3A 0%, #060e1f 100%)' }}>

      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C9A227, #A6841F)' }}>
            <span className="text-navy-900 font-serif font-bold text-base">E</span>
          </div>
          <div>
            <div className="text-white font-serif text-sm tracking-widest leading-none">EURO HOTEL</div>
            <div className="text-gold-400 text-xs tracking-wider mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <div className="text-white/30 text-xs font-semibold tracking-widest px-3 mb-3 uppercase">Main</div>
        <NavItem icon={<LayoutDashboard size={16} />} label="Bookings" active />
        <NavItem icon={<Hotel size={16} />} label="Hotel" disabled />
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  icon, label, active, disabled,
}: {
  icon: React.ReactNode; label: string; active?: boolean; disabled?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all
      ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      ${active
        ? 'bg-gold-600/15 text-gold-400 font-medium'
        : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}>
      {icon}
      {label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />}
    </div>
  );
}
