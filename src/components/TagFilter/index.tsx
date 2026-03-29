import React, { useState, useMemo } from 'react';

interface TagItem {
  name: string;
  count?: number;
  dept?: string;
}

interface TagFilterProps {
  tags: TagItem[];
  onFilterChange?: (selectedTags: string[]) => void;
  title?: string;
}

export default function TagFilter({ tags, onFilterChange, title = 'Filter Tag' }: TagFilterProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (tag: string) => {
    const next = selected.includes(tag)
      ? selected.filter((t) => t !== tag)
      : [...selected, tag];
    setSelected(next);
    onFilterChange?.(next);
  };

  const clearAll = () => {
    setSelected([]);
    onFilterChange?.([]);
  };

  return (
    <div className="kms-card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🏷️ {title}
        </span>
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            style={{ background: 'none', border: 'none', color: 'var(--kms-accent)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
          >
            Hapus filter
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => toggle(tag.name)}
            className={`kms-tag ${tag.dept ? 'kms-tag--dept' : ''} ${selected.includes(tag.name) ? 'kms-tag--active' : ''}`}
            style={{ border: 'none', fontFamily: 'inherit' }}
            aria-pressed={selected.includes(tag.name)}
          >
            {tag.name}
            {tag.count !== undefined && (
              <span style={{ marginLeft: '4px', opacity: 0.7, fontSize: '0.7rem' }}>({tag.count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
