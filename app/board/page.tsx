'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { TransportRequest, Province } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { PhoneIcon, PlusIcon, PackageIcon, TruckIcon, ShipIcon } from 'lucide-react';

const PROVINCES: Province[] = [
  'Eastern Highlands', 'Western Highlands', 'Morobe', 'East New Britain',
  'West New Britain', 'Madang', 'Oro', 'Simbu', 'Southern Highlands', 'Enga', 'Other'
];

function TransportCard({ req }: { req: TransportRequest }) {
  const { t } = useI18n();

  const statusClass = `status-${req.status}`;
  const statusLabel = t(`board.status.${req.status}`);
  const tagClass = req.commodity === 'coffee' ? 'tag-coffee' : req.commodity === 'cocoa' ? 'tag-cocoa' : 'tag-vanilla';

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
            {req.commodity === 'coffee' ? '☕' : req.commodity === 'cocoa' ? '🍫' : '🍦'} {t(`dashboard.${req.commodity}`)}
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
          <div className="detail-label"><PackageIcon size={16} /> {t('board.quantity')}</div>
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
          <PhoneIcon size={18} />
          {t('board.contact_farmer')}: {req.phone}
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
    if (!form.farmer_name || !form.phone || !form.province || !form.village || !form.quantity_kg || !form.pickup_date || !form.destination) {
      alert('Please fill in all required fields.');
      return;
    }

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
              <option value="vanilla">🍦 {t('dashboard.vanilla')}</option>
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
          <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Empty PMV backhaul? Shipping space available? Road accessible?" />
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
  const [filter, setFilter] = useState<'all' | 'coffee' | 'cocoa' | 'vanilla'>('all');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transport?commodity=${filter}&status=open`);
      const { requests } = await res.json();
      setRequests(requests ?? []);
    } catch {
      // offline fallback handled by PWA
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

      <div className="filter-row" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        {(['all', 'coffee', 'cocoa', 'vanilla'] as const).map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? t('board.filter_all') : f === 'coffee' ? `☕ ${t('board.filter_coffee')}` : f === 'cocoa' ? `🍫 ${t('board.filter_cocoa')}` : `🍦 ${t('board.filter_vanilla')}`}
          </button>
        ))}
      </div>

      <div className="uber-freight-banner">
        <TruckIcon size={20} /> <ShipIcon size={20} />
        <span style={{ marginLeft: '8px' }}>Uber for Freight: PMVs and Containers</span>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">{t('board.loading')}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚛</div>
          <p>{t('board.empty')}</p>
        </div>
      ) : (
        requests.map(r => <TransportCard key={r.id} req={r} />)
      )}

      <button className="fab" onClick={() => setShowModal(true)}>
        <PlusIcon size={24} />
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

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
        }
        .uber-freight-banner {
          background: var(--gold-pale);
          border: 1px solid var(--gold);
          color: var(--bark);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .tag-vanilla {
          background: #fef3c7;
          color: #92400e;
        }
      `}</style>
    </>
  );
}
