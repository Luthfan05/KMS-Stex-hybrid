import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const DICTIONARY_DATA = [
  { term: 'SOP', full: 'Standard Operating Procedure', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Prosedur standar yang harus diikuti dalam menjalankan suatu proses kerja.', descEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. A standard procedure that must be followed in carrying out a work process.' },
  { term: 'KMS', full: 'Knowledge Management System', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sistem yang digunakan untuk mengelola dan menyimpan pengetahuan organisasi.', descEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. A system used to manage and store organizational knowledge.' },
  { term: 'HRD', full: 'Human Resource Development', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Departemen yang menangani sumber daya manusia termasuk rekrutmen dan pelatihan.', descEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Department responsible for human resources including recruitment and training.' },
  { term: 'QC', full: 'Quality Control', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proses pemeriksaan kualitas produk agar memenuhi standar yang ditetapkan.', descEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Product quality inspection process to meet established standards.' },
  { term: 'WIP', full: 'Work In Progress', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Barang atau pekerjaan yang sedang dalam tahap proses produksi.', descEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Goods or work currently in the production process stage.' },
  { term: 'SPK', full: 'Surat Perintah Kerja', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dokumen resmi yang berisi instruksi untuk melaksanakan tugas tertentu.', descEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. An official document containing instructions to carry out a specific task.' },
  { term: 'APD', full: 'Alat Pelindung Diri', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Peralatan keselamatan yang wajib digunakan di area produksi.', descEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Safety equipment required to be used in the production area.' },
  { term: 'K3', full: 'Keselamatan dan Kesehatan Kerja', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Standar dan prosedur keselamatan yang diterapkan di lingkungan kerja.', descEn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Safety standards and procedures applied in the work environment.' },
];

export default function DictionaryPage() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';

  const [search, setSearch] = React.useState('');

  const filtered = DICTIONARY_DATA.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.term.toLowerCase().includes(q) ||
      item.full.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q);
  });

  return (
    <Layout title={isEn ? 'Dictionary' : 'Kamus Istilah'} description={isEn ? 'Internal company dictionary' : 'Kamus istilah internal perusahaan'}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isEn ? 'Company Dictionary' : 'Kamus Istilah Perusahaan'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            {isEn
              ? 'A glossary of internal terms, abbreviations, and definitions used across STex.'
              : 'Daftar istilah, singkatan, dan definisi internal yang digunakan di STex.'}
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder={isEn ? 'Search terms...' : 'Cari istilah...'}
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
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{isEn ? 'No terms found.' : 'Istilah tidak ditemukan.'}</p>
            <p style={{ fontSize: '0.85rem' }}>{isEn ? 'Try a different keyword.' : 'Coba kata kunci yang berbeda.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((item) => (
              <div
                key={item.term}
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
                    {item.full}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.65 }}>
                  {isEn ? item.descEn : item.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="kms-notice kms-notice--info" style={{ marginTop: '2.5rem' }}>
          {isEn
            ? 'This dictionary is maintained by the admin team. Contact an admin to suggest new terms.'
            : 'Kamus ini dikelola oleh tim admin. Hubungi admin untuk mengusulkan istilah baru.'}
        </div>
      </div>
    </Layout>
  );
}
