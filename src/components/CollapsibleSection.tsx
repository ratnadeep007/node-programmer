import { ReactNode, useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
}

export function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border rounded-md">
      <button
        className="w-full px-4 py-2 text-left font-medium flex items-center justify-between hover:bg-slate-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-4 border-t">{children}</div>}
    </div>
  );
}
