import React from 'react';

export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content || !content.trim()) {
    return <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Belum ada konten untuk di-preview...</p>;
  }

  const lines = content.split('\n');

  const parseInline = (text: string) => {
    // Regex for image markdown: ![alt](url)
    const parts = text.split(/(!\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        return (
          <img
            key={index}
            src={imgMatch[2]}
            alt={imgMatch[1]}
            style={{ maxWidth: '100%', borderRadius: '8px', margin: '0.5rem 0', display: 'block' }}
          />
        );
      }
      
      // Simple bold/italic parsing could be added here, but returning text for now
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div style={{ lineHeight: 1.8, color: '#374151', fontSize: '0.95rem' }}>
      {lines.map((line, i) => {
        if (line.startsWith('# '))  return <h1 key={i} style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '1.5rem', color: '#111827' }}>{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '1.25rem', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem' }}>{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '1rem', color: '#374151' }}>{line.slice(4)}</h3>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{parseInline(line.slice(2))}</li>;
        if (line.startsWith('> ')) return <blockquote key={i} style={{ borderLeft: '4px solid var(--kms-accent)', paddingLeft: '1rem', color: '#6b7280', margin: '0.5rem 0', fontStyle: 'italic' }}>{parseInline(line.slice(2))}</blockquote>;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} style={{ margin: '0 0 0.5rem' }}>{parseInline(line)}</p>;
      })}
    </div>
  );
}
