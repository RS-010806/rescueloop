import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  description: string;
  align?: 'left' | 'center' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  description,
  align = 'center',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignmentClasses =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <span ref={tooltipRef} className="relative inline-flex items-center ml-1 z-20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-emerald-600 transition-colors p-0.5 rounded-full focus:outline-none cursor-pointer"
        aria-label={`Information: ${title}`}
      >
        <Info className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute bottom-full mb-2 w-72 max-w-[85vw] rounded-2xl bg-slate-900 text-white p-3.5 text-xs shadow-xl pointer-events-auto border border-slate-700 animate-in fade-in zoom-in-95 ${alignmentClasses}`}
        >
          <div className="font-bold text-emerald-400 mb-1 flex items-center justify-between">
            <span>{title}</span>
            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Guide</span>
          </div>
          <div className="text-slate-200 leading-relaxed">{description}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
};
