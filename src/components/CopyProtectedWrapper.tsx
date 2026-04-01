import React, { useEffect, useRef } from 'react';

export default function CopyProtectedWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    el.addEventListener('copy', handleCopy);
    el.addEventListener('contextmenu', handleContextMenu);

    return () => {
      el.removeEventListener('copy', handleCopy);
      el.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div ref={containerRef} className="no-copy">
      {children}
    </div>
  );
}
