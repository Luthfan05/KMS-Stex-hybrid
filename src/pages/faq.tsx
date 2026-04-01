import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { supabase } from '../lib/supabase';

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export default function FAQPage() {
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
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQ:', error);
    }
    if (data) setEntries(data as FAQEntry[]);
    setLoading(false);
  };

  return (
    <Layout title="FAQ" description="Pertanyaan yang Sering Diajukan">
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Pertanyaan yang Sering Diajukan
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            Temukan jawaban untuk pertanyaan yang sering diajukan tentang STex KMS.
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
                  }}
                >
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
    </Layout>
  );
}
