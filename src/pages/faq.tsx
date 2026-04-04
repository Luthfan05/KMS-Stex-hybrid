import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { supabase } from '../lib/supabase';
import CopyProtectedWrapper from '../components/CopyProtectedWrapper';
import { useAuth } from '../context/AuthContext';

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export default function FAQPage() {
  const { isEditor } = useAuth();
  const [entries, setEntries] = useState<FAQEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .is('is_hidden', false)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQ:', error);
    }
    if (data) setEntries(data as FAQEntry[]);
    setLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Apakah Anda yakin ingin hapus FAQ ini?')) return;

    const { error } = await supabase.from('faq').update({ is_hidden: true }).eq('id', id);
    if (!error) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } else {
      console.error('Error deleting FAQ:', error);
      alert('Gagal hapus FAQ.');
    }
  };

  return (
    <Layout title="FAQ" description="Pertanyaan yang Sering Diajukan">
      <CopyProtectedWrapper>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Pertanyaan yang Sering Diajukan
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              Temukan jawaban untuk pertanyaan yang sering diajukan tentang PT. Sukuntex KMS.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div className="kms-spinner" />
            </div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <p style={{ fontSize: '1.1rem' }}>Belum ada FAQ yang tersedia.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {entries.map((item, idx) => (
                <details
                  key={item.id}
                  style={{
                    background: 'var(--ifm-background-surface-color)',
                    border: '1px solid var(--ifm-toc-border-color)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s ease',
                  }}
                >
                  <summary
                    style={{
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'var(--kms-primary)',
                      listStyle: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--kms-accent-light)',
                        color: 'var(--kms-accent)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        flexShrink: 0,
                      }}>
                        {idx + 1}
                      </span>
                      {item.question}
                    </div>
                    {isEditor && (
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        style={{
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
                  </summary>
                  <div style={{
                    padding: '0 1.25rem 1.25rem 3.5rem',
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                  }}>
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          )}

          <div className="kms-notice kms-notice--info" style={{ marginTop: '2.5rem' }}>
            Punya pertanyaan yang tidak tercantum di sini? Hubungi administrator Anda untuk informasi lebih lanjut.
          </div>
        </div>
      </CopyProtectedWrapper>
    </Layout>
  );
}
