import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { supabase } from '../lib/supabase';
import CopyProtectedWrapper from '../components/CopyProtectedWrapper';
import { useAuth } from '../context/AuthContext';

interface DictionaryEntry {
  id: string;
  term: string;
  full_form: string;
  description: string;
  created_at: string;
}

export default function DictionaryPage() {
  const { isEditor } = useAuth();
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('dictionary')
      .select('*')
      .order('term', { ascending: true });

    if (error) {
      console.error('Error fetching dictionary:', error);
    }
    if (data) setEntries(data as DictionaryEntry[]);
    setLoading(false);
  };

  const handleDelete = async (id: string, term: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus istilah "${term}"?`)) return;

    // Hanya hilangkan dari Frontend (State) sesuai permintaan
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const filtered = entries.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.term.toLowerCase().includes(q) ||
      item.full_form.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
  });

  return (
    <Layout title="Kamus Istilah" description="Kamus istilah internal perusahaan">
      <CopyProtectedWrapper>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Kamus Istilah Perusahaan
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              Daftar istilah, singkatan, dan definisi internal yang digunakan di STex.
            </p>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Cari istilah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--kms-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Dictionary entries */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="kms-spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Istilah tidak ditemukan.</p>
              <p style={{ fontSize: '0.85rem' }}>Coba kata kunci yang berbeda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="kms-card kms-card--static"
                  style={{ margin: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'var(--ifm-heading-font-family)',
                      fontWeight: 800,
                      fontSize: '1.15rem',
                      color: 'var(--kms-primary)',
                    }}>
                      {item.term}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--kms-accent)', fontWeight: 600 }}>
                      {item.full_form}
                    </span>

                    {isEditor && (
                      <button
                        onClick={() => handleDelete(item.id, item.term)}
                        style={{
                          marginLeft: 'auto',
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.65 }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="kms-notice kms-notice--info" style={{ marginTop: '2.5rem' }}>
            Kamus ini dikelola oleh tim admin. Hubungi admin untuk mengusulkan istilah baru.
          </div>
        </div>
      </CopyProtectedWrapper>
    </Layout>
  );
}
