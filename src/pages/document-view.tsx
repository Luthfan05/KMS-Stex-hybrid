import React from 'react';
import { Redirect, useLocation } from '@docusaurus/router';

/**
 * Redirect dari /document-view ke /document
 * File lama ini dipertahankan untuk backward compatibility.
 */
export default function DocumentViewRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');

  if (slug) {
    return <Redirect to={`/document?slug=${slug}`} />;
  }

  return <Redirect to="/documents" />;
}
