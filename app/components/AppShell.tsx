'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function TrendingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}

function WifiOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang, t } = useI18n();
  const isOnline = useOnlineStatus();

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/dashboard" className="topbar-logo">
          Maket<span>.PNG</span>
        </Link>
        <div className="lang-toggle">
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`lang-btn ${lang === 'tpi' ? 'active' : ''}`}
            onClick={() => setLang('tpi')}
          >
            TPI
          </button>
        </div>
      </nav>

      {!isOnline && (
        <div className="offline-banner">
          <WifiOffIcon />
          {t('nav.offline')} — {t('dashboard.offline_notice')}
        </div>
      )}

      <main className="main-content">
        {children}
      </main>

      <nav className="bottom-nav">
        <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
          <TrendingIcon />
          {t('nav.dashboard')}
        </Link>
        <Link href="/board" className={`nav-item ${pathname === '/board' ? 'active' : ''}`}>
          <TruckIcon />
          {t('nav.board')}
        </Link>
      </nav>
    </div>
  );
}
