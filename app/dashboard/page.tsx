'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useI18n } from '@/lib/i18n';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { Price, Commodity } from '@/lib/supabase';

function ArrowUpIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
}
function ArrowDownIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function RefreshIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
}

function PriceCard({ price }: { price: Price }) {
  const { t } = useI18n();
  const isCoffee = price.commodity === 'coffee';
  const isCocoa = price.commodity === 'cocoa';
  const isVanilla = price.commodity === 'vanilla';
  const change = price.week_change_pct;

  const changeClass = change == null ? 'change-flat'
    : change > 0 ? 'change-up'
    : change < 0 ? 'change-down'
    : 'change-flat';

  const changeLabel = change == null ? '—'
    : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;

  let cardClass = 'price-card ';
  if (isCoffee) cardClass += 'card-coffee price-card-coffee';
  else if (isCocoa) cardClass += 'card-cocoa price-card-cocoa';
  else if (isVanilla) cardClass += 'card-vanilla price-card-vanilla';

  return (
    <div className={cardClass}>
      <div className="price-commodity">
        {isCoffee ? '☕ ' : isCocoa ? '🍫 ' : '🍦 '}
        {t(`dashboard.${price.commodity}`)}
      </div>
      <div className="price-main">
        K {price.price_pgk.toFixed(2)}
        <span className="price-unit"> /{t('common.kg')}</span>
      </div>
      <div className="price-usd">
        ≈ USD {price.price_usd.toFixed(3)}/kg
      </div>

      <div className="price-meta">
        <span className="price-badge">📍 {price.region}</span>
        <span className="price-badge">🏛 {price.source}</span>
        {change !== null && (
          <span className={`change-badge ${changeClass}`}>
            {change > 0 ? <ArrowUpIcon /> : change < 0 ? <ArrowDownIcon /> : null}
            {' '}{changeLabel}
          </span>
        )}
      </div>
      <style jsx>{`
        .card-vanilla {
          border-left: 4px solid #f59e0b;
        }
        .price-card-vanilla {
          background: #fffbeb;
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
  const isOnline = useOnlineStatus();
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error('Network error');
      const { prices } = await res.json();
      setPrices(prices ?? []);
      setLastFetch(new Date());
    } catch (e) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPrices();
    // Auto-refresh every 5 minutes when online
    const interval = setInterval(() => {
      if (navigator.onLine) fetchPrices();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const coffeePrices = prices.filter(p => p.commodity === 'coffee');
  const cocoaPrices = prices.filter(p => p.commodity === 'cocoa');
  const vanillaPrices = prices.filter(p => p.commodity === 'vanilla');

  return (
    <>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="section-title">{t('dashboard.title')}</h1>
          <p className="section-sub">{t('dashboard.subtitle')}</p>
        </div>
        <button
          onClick={fetchPrices}
          disabled={loading}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--canopy)', padding: '4px', borderRadius: '6px',
            opacity: loading ? 0.4 : 1
          }}
          title={t('common.retry')}
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="low-bandwidth-notice">
        📡 Low Bandwidth Optimization Enabled
      </div>

      {lastFetch && (
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1rem', fontFamily: 'IBM Plex Mono, monospace' }}>
          {t('dashboard.last_updated')}: {format(lastFetch, 'dd MMM yyyy HH:mm')}
          {!isOnline && <span style={{ color: 'var(--clay)', marginLeft: '0.5rem' }}>· {t('dashboard.offline_notice')}</span>}
        </p>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">{t('dashboard.loading')}</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--clay)' }}>{error}</p>
          <button onClick={fetchPrices} className="btn-primary" style={{ marginTop: '1rem', width: 'auto', padding: '8px 24px' }}>
            {t('common.retry')}
          </button>
        </div>
      ) : prices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>{t('dashboard.no_data')}</p>
        </div>
      ) : (
        <>
          {coffeePrices.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--soil)', marginBottom: '0.75rem' }}>
                ☕ {t('dashboard.coffee')}
              </h2>
              <div className="price-grid">
                {coffeePrices.map(p => <PriceCard key={p.id} price={p} />)}
              </div>
            </section>
          )}

          {cocoaPrices.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#7b2d8b', marginBottom: '0.75rem' }}>
                🍫 {t('dashboard.cocoa')}
              </h2>
              <div className="price-grid">
                {cocoaPrices.map(p => <PriceCard key={p.id} price={p} />)}
              </div>
            </section>
          )}

          {vanillaPrices.length > 0 && (
            <section>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
                🍦 {t('dashboard.vanilla')}
              </h2>
              <div className="price-grid">
                {vanillaPrices.map(p => <PriceCard key={p.id} price={p} />)}
              </div>
            </section>
          )}
        </>
      )}

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
        }
        .low-bandwidth-notice {
          font-size: 0.7rem;
          background: #ecfdf5;
          color: #065f46;
          padding: 4px 10px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </>
  );
}
