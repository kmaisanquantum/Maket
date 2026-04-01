'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { useI18n } from '@/lib/i18n';
import type { TransportRequest, Province } from '@/lib/supabase';

const PROVINCES: Province[] = [
  'Eastern Highlands', 'Western Highlands', 'Morobe',
  'East New Britain', 'West New Britain', 'Madang',
  'Oro', 'Simbu', 'Southern Highlands', 'Enga', 'Other'
];

function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function PhoneIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.56 3.35a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.87-.87a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function PackageIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}

function TransportCard({ req }: { req: TransportRequest }) {
  const { t } = useI18n();

  const statusClass = `status-${req.status}`;
  const statusLabel = t(`board.status.${req.status}`);
  const tagClass = req.commodity === 'coffee' ? 'tag-coffee' : 'tag-cocoa';

  return (
    <div className="transport-card">
      <div className="transport-header">
        <div>
          <div className="transport-farmer">👨‍🌾 {req.farmer_name}</div>
          <div className="transport-date">
            {format(parseISO(req.created_at), 'dd MMM yyyy')}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span className={`commodity-tag ${tagClass}`}>
            {req.commodity === 'coffee' ? '☕' : '🍫'} {t(`dashboard.${req.commodity}`)}
          </span>
          <span className={`status-chip ${statusClass}`}>{statusLabel}</span>
        </div>
      </div>

      <div className="transport-detail-grid">
        <div className="detail-item">
          <div className="detail-label">📍 {t('board.pickup')}</div>
          <div className="detail-value">{req.village}, {req.province}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">🎯 {t('board.destination')}</div>
          <div className="detail-value">{req.destination}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label"><PackageIcon /> {t('board.quantity')}</div>
          <div className="detail-value" style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
            {req.quantity_kg.toLocaleString()} kg
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-label">📅 {t('board.date')}</div>
          <div className="detail-value">{format(parseISO(req.pickup_date), 'dd MMM yyyy')}</div>
        </div>
        {req.offered_price_pgk != null && (
          <div className="detail-item">
            <div className="detail-label">💰 {t('board.price_offered')}</div>
            <div className="detail-value" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--forest)', fontWeight: 600 }}>
              K {req.offered_price_pgk.toFixed(2)}
            </div>
          </div>
        )}
        {req.notes && (
          <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
            <div className="detail-label">💬 {t('board.notes')}</div>
            <div className="detail-value" style={{ fontStyle: 'italic', color: 'var(--muted)' }}>{req.notes}</div>
          </div>
        )}
      </div>

      {req.status === 'open' && (
        <a href={`tel:${req.phone}`} className="contact-btn">
          <PhoneIcon />
          {t('board.contact_farmer')}: {req.phone}
        </a>
      )}
      {req.status === 'matched' && req.driver_phone && (
        <a href={`tel:${req.driver_phone}`} className="contact-btn" style={{ background: 'var(--gold)', color: 'var(--bark)' }}>
          <PhoneIcon />
          {t('board.contact_driver')}: {req.driver_phone}
        </a>
      )}
    </div>
  );
}

function PostLoadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    farmer_name: '', phone: '', province: '', village: '',
    commodity: 'coffee', quantity_kg: '', pickup_date: '',
    destination: '', offered_price_pgk: '', notes: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      onSuccess();
      onClose();
    } catch {
      alert(t('board.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <h2 className="modal-title">📦 {t('board.post_load')}</h2>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('board.name')}</label>
            <input className="form-input" value={form.farmer_name} onChange={e => set('farmer_name', e.target.value)} placeholder="John Kapi" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('board.phone')}</label>
            <input className="form-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+675 7XXX XXXX" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('board.province')}</label>
            <select className="form-select" value={form.province} onChange={e => set('province', e.target.value)}>
              <option value="">— Select —</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('board.village')}</label>
            <input className="form-input" value={form.village} onChange={e => set('village', e.target.value)} placeholder="Kainantu" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('board.commodity')}</label>
            <select className="form-select" value={form.commodity} onChange={e => set('commodity', e.target.value)}>
              <option value="coffee">☕ {t('dashboard.coffee')}</option>
              <option value="cocoa">🍫 {t('dashboard.cocoa')}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('board.quantity')}</label>
            <input className="form-input" type="number" min="1" value={form.quantity_kg} onChange={e => set('quantity_kg', e.target.value)} placeholder="500" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('board.date')}</label>
            <input className="form-input" type="date" value={form.pickup_date} onChange={e => set('pickup_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('board.destination')}</label>
            <input className="form-input" value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="Lae, Morobe" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('board.price_offered')} (optional)</label>
          <input className="form-input" type="number" step="0.01" value={form.offered_price_pgk} onChange={e => set('offered_price_pgk', e.target.value)} placeholder="e.g. 150.00" />
        </div>

        <div className="form-group">
          <label className="form-label">{t('board.notes')} (optional)</label>
          <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Needs truck with cover, road accessible..." />
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : `📤 ${t('board.submit')}`}
        </button>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const { t } = useI18n();
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'coffee' | 'cocoa'>('all');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transport?commodity=${filter}&status=open`);
      const { requests } = await res.json();
      setRequests(requests ?? []);
    } catch {
      // serve from cache if offline
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">{t('board.title')}</h1>
        <p className="section-sub">{t('board.subtitle')}</p>
      </div>

      <div className="filter-row">
        {(['all', 'coffee', 'cocoa'] as const).map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? t('board.filter_all') : f === 'coffee' ? `☕ ${t('board.filter_coffee')}` : `🍫 ${t('board.filter_cocoa')}`}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <div className="spinner" />
          <p className="loading-text">{t('board.loading')}</p>
        </>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚛</div>
          <p>{t('board.empty')}</p>
        </div>
      ) : (
        requests.map(r => <TransportCard key={r.id} req={r} />)
      )}

      <button className="fab" onClick={() => setShowModal(true)}>
        <PlusIcon />
        {t('board.post_load')}
      </button>

      {showModal && (
        <PostLoadModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            showToast(t('board.success'));
            fetchRequests();
          }}
        />
      )}

      {toast && <div className="toast">✅ {toast}</div>}
    </>
  );
}
