import React from 'react';

export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content || !content.trim()) {
    return <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Belum ada konten untuk di-preview...</p>;
  }

  const lines = content.split('\n');

  const parseInline = (text: string) => {
    // Replace images! ![alt](url)
    // Replace Bold **text** -> <strong>text</strong>
    // Replace Italic *text* -> <em>text</em>
    const html = text
      .replace(/!\[([^\]]*)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 0.5rem 0; display: block;" />')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="kms-markdown-rendered" style={{ lineHeight: 1.8, color: '#374151', fontSize: '0.95rem' }}>
      {lines.map((line, i) => {
        if (line.startsWith('# '))  return <h1 key={i} style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '1.5rem', color: '#111827' }}>{parseInline(line.slice(2))}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '1.25rem', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem' }}>{parseInline(line.slice(3))}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '1rem', color: '#374151' }}>{parseInline(line.slice(4))}</h3>;
        
        // Multi-level lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem', listStyleType: 'disc' }}>{parseInline(line.slice(2))}</li>;
        }
        if (line.startsWith('  - ') || line.startsWith('  * ')) {
          return <li key={i} style={{ marginLeft: '3rem', marginBottom: '0.25rem', listStyleType: 'circle' }}>{parseInline(line.slice(4))}</li>;
        }
        if (line.startsWith('    - ') || line.startsWith('    * ')) {
          return <li key={i} style={{ marginLeft: '4.5rem', marginBottom: '0.25rem', listStyleType: 'square' }}>{parseInline(line.slice(6))}</li>;
        }

        // Horizontal Line
        if (line.trim() === '---') {
          return <hr key={i} style={{ border: 'none', borderTop: '2px dashed #9ca3af', margin: '2rem 0' }} />;
        }

        // Quotes
        if (line.startsWith('> ')) return <blockquote key={i} style={{ borderLeft: '4px solid var(--kms-accent)', paddingLeft: '1rem', color: '#6b7280', margin: '0.5rem 0', fontStyle: 'italic' }}>{parseInline(line.slice(2))}</blockquote>;
        
        // Empty lines
        if (line.trim() === '') return <br key={i} />;
        
        return <p key={i} style={{ margin: '0 0 0.5rem' }}>{parseInline(line)}</p>;
      })}
    </div>
  );
}
