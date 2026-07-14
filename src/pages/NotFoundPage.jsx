import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '100px 28px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 28, color: 'var(--text)', marginBottom: 12 }}>Page not found</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 24 }}>The page you\u2019re looking for doesn\u2019t exist or has moved.</p>
      <Link to="/" style={{ color: 'oklch(46% 0.09 60)', fontWeight: 600 }}>Back to Home</Link>
    </main>
  );
}
