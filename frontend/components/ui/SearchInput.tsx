'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function SearchInput({
  placeholder = 'Search…',
  value,
  onChange,
  className,
}: SearchInputProps) {
  const [internal, setInternal] = useState('');
  const controlled = value !== undefined;
  const currentValue = controlled ? value : internal;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!controlled) setInternal(v);
    onChange?.(v);
  };

  const handleClear = () => {
    if (!controlled) setInternal('');
    onChange?.('');
  };

  return (
    <div className={clsx('relative group', className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-eec-accent transition-colors"
        size={16}
      />
      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eec-accent/30 focus:border-eec-accent transition-all placeholder:text-slate-400"
      />
      {currentValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
