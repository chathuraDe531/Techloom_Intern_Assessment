import React from 'react';
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

interface FilterBarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  priceBracket: string;
  setPriceBracket: (bracket: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onReset: () => void;
  totalResults: number;
}

const CATEGORIES = ['All', 'Audio', 'Wearables', 'Footwear', 'Lifestyle', 'Smart Tech'];

const PRICE_BRACKETS = [
  { id: 'all', label: 'All Prices' },
  { id: 'under100', label: 'Under $100' },
  { id: '100to200', label: '$100 – $200' },
  { id: 'over200', label: '$200 & Above' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  setSelectedCategory,
  inStockOnly,
  setInStockOnly,
  priceBracket,
  setPriceBracket,
  sortBy,
  setSortBy,
  onReset,
  totalResults,
}) => {
  const isFiltered =
    selectedCategory !== 'All' || inStockOnly || priceBracket !== 'all' || sortBy !== 'featured';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-8">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-100 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Category:
        </span>
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secondary Controls: Price, In-Stock, Sort, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Price Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Price:</span>
            <select
              id="price-filter-select"
              value={priceBracket}
              onChange={(e) => setPriceBracket(e.target.value)}
              className="bg-slate-100/80 hover:bg-slate-100 text-slate-800 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-slate-400 cursor-pointer"
            >
              {PRICE_BRACKETS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* In-Stock Toggle */}
          <label
            id="in-stock-filter-toggle"
            className="flex items-center gap-2 cursor-pointer bg-slate-100/80 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors select-none"
          >
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border transition-colors ${
                inStockOnly ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-400 bg-white'
              }`}
            >
              {inStockOnly && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span className="font-medium text-slate-800">In-Stock Only</span>
          </label>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Sort:</span>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100/80 hover:bg-slate-100 text-slate-800 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-slate-400 cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              id="reset-filters-btn"
              onClick={onReset}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Results Counter */}
          <span className="text-slate-400 font-medium pl-1 hidden sm:inline">
            {totalResults} {totalResults === 1 ? 'product' : 'products'}
          </span>
        </div>

      </div>
    </div>
  );
};
