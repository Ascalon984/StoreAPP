'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import Link from 'next/link';

export default function SearchOverlay() {
  const {
    query, isOpen, recentSearches,
    setQuery, closeSearch, setRecentSearches, addRecentSearch, clearRecentSearches,
  } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && products.length === 0) {
      fetch('/api/public/products')
        .then((res) => res.json())
        .then((data) => setProducts(data));
    }
  }, [isOpen, products.length]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, [setRecentSearches]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const suggestions = debouncedQuery.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelect = (productName: string) => {
    addRecentSearch(productName);
    closeSearch();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addRecentSearch(query.trim());
      closeSearch();
    }
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-primary font-semibold">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white animate-fade-in">
      <div className="max-w-container mx-auto px-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 py-3 border-b border-gray-100">
          <Search size={20} strokeWidth={1.5} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk..."
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
          <button type="button" onClick={closeSearch} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} strokeWidth={1.5} className="text-gray-500" />
          </button>
        </form>

        <div className="py-4 overflow-y-auto max-h-[calc(100vh-60px)]">
          {suggestions.length > 0 && (
            <div className="space-y-1">
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => handleSelect(product.name)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Search size={16} strokeWidth={1.5} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm flex-1">{highlightMatch(product.name, debouncedQuery)}</span>
                  <ArrowRight size={14} strokeWidth={1.5} className="text-gray-300" />
                </Link>
              ))}
            </div>
          )}

          {!debouncedQuery.trim() && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pencarian Terakhir</span>
                <button onClick={clearRecentSearches} className="text-xs text-primary hover:text-primary-dark">Hapus</button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <Clock size={16} strokeWidth={1.5} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {debouncedQuery.trim() && suggestions.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} strokeWidth={1} className="text-gray-200 mx-auto mb-4" />
              <p className="text-sm text-gray-400">
                Tidak ditemukan produk untuk &quot;{debouncedQuery}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
