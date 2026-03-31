import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const FAQ_DATA = [
  {
    q: 'Apa itu STex KMS?',
    qEn: 'What is STex KMS?',
    a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    aEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  },
  {
    q: 'Bagaimana cara mengakses dokumen?',
    qEn: 'How do I access documents?',
    a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vitae lectus nec nisi commodo tincidunt. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
    aEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vitae lectus nec nisi commodo tincidunt. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
  },
  {
    q: 'Siapa yang bisa membuat dokumen baru?',
    qEn: 'Who can create new documents?',
    a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien auctor, sodales magna a, dapibus risus. Nulla facilisi. Integer nec odio praesent libero.',
    aEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien auctor, sodales magna a, dapibus risus. Nulla facilisi. Integer nec odio praesent libero.',
  },
  {
    q: 'Bagaimana cara menghubungi admin?',
    qEn: 'How do I contact an admin?',
    a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, et faucibus justo dignissim vitae.',
    aEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, et faucibus justo dignissim vitae.',
  },
  {
    q: 'Apakah dokumen bisa diunduh?',
    qEn: 'Can documents be downloaded?',
    a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus.',
    aEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus.',
  },
  {
    q: 'Apa perbedaan peran Admin, Editor, dan Viewer?',
    qEn: 'What is the difference between Admin, Editor, and Viewer roles?',
    a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Admin memiliki akses penuh, Editor dapat membuat dan mengedit dokumen, sedangkan Viewer hanya bisa membaca dokumen yang tersedia.',
    aEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Admin has full access, Editor can create and edit documents, while Viewer can only read available documents.',
  },
];

export default function FAQPage() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';

  return (
    <Layout title={isEn ? 'FAQ' : 'FAQ'} description={isEn ? 'Frequently Asked Questions' : 'Pertanyaan yang Sering Diajukan'}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isEn ? 'Frequently Asked Questions' : 'Pertanyaan yang Sering Diajukan'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            {isEn
              ? 'Find answers to commonly asked questions about STex KMS.'
              : 'Temukan jawaban untuk pertanyaan yang sering diajukan tentang STex KMS.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FAQ_DATA.map((item, idx) => (
            <details
              key={idx}
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
                {isEn ? item.qEn : item.q}
              </summary>
              <div style={{
                padding: '0 1.25rem 1.25rem 3.5rem',
                color: '#6b7280',
                fontSize: '0.9rem',
                lineHeight: 1.7,
              }}>
                {isEn ? item.aEn : item.a}
              </div>
            </details>
          ))}
        </div>

        <div className="kms-notice kms-notice--info" style={{ marginTop: '2.5rem' }}>
          {isEn
            ? 'Have a question that is not listed here? Contact your administrator for more information.'
            : 'Punya pertanyaan yang tidak tercantum di sini? Hubungi administrator Anda untuk informasi lebih lanjut.'}
        </div>
      </div>
    </Layout>
  );
}
