import React, { useState, FormEvent } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        setError(isEn ? 'Invalid email or password.' : 'Email atau password tidak valid.');
      } else if (msg.includes('Email not confirmed')) {
        setError(isEn ? 'Please confirm your email first.' : 'Harap konfirmasi email Anda terlebih dahulu.');
      } else if (msg.includes('Too many requests')) {
        setError(isEn ? 'Too many attempts. Please try again later.' : 'Terlalu banyak percobaan. Coba lagi nanti.');
      } else {
        setError(isEn ? 'Login failed. Please check your connection.' : 'Login gagal. Periksa koneksi Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isEn ? 'Login' : 'Masuk'} description="">
      <div className="kms-auth-container">
        <div className="kms-auth-card">
          {/* Logo */}
          <div className="kms-auth-logo">
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--kms-primary), #4247c4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem', fontSize: '1.75rem',
            }}>
              📚
            </div>
            <h1>STex KMS</h1>
            <p>{isEn ? 'Knowledge Management System' : 'Sistem Manajemen Pengetahuan'}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="kms-notice kms-notice--lock" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div className="kms-form-group">
              <label htmlFor="kms-email">
                {isEn ? 'Email Address' : 'Alamat Email'}
              </label>
              <input
                id="kms-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="kms-form-group">
              <label htmlFor="kms-password">
                {isEn ? 'Password' : 'Kata Sandi'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="kms-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                    padding: 0, lineHeight: 1,
                  }}
                  aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="kms-btn kms-btn--primary"
              disabled={loading || !email || !password}
              style={{ marginTop: '0.5rem', opacity: (loading || !email || !password) ? 0.7 : 1 }}
            >
              {loading ? (
                <>{isEn ? 'Logging in...' : 'Sedang masuk...'}</>
              ) : (
                <>{isEn ? 'Login' : 'Masuk'}</>
              )}
            </button>
          </form>

          {/* Help text */}
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af', marginTop: '1.5rem', marginBottom: 0 }}>
            {isEn
              ? 'Contact your administrator if you need an account.'
              : 'Hubungi administrator jika Anda memerlukan akun.'}
          </p>

          {/* Security note */}
          <div className="kms-notice kms-notice--info" style={{ marginTop: '1rem', fontSize: '0.78rem' }}>
            🔒 {isEn
              ? 'This system is restricted to authorized company personnel only.'
              : 'Sistem ini hanya untuk karyawan perusahaan yang berwenang.'}
          </div>

          {/* Supabase badge */}
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#d1d5db', marginTop: '1.25rem', marginBottom: 0 }}>
            Powered by Supabase Auth
          </p>
        </div>
      </div>
    </Layout>
  );
}
