'use client';
import { FiSearch } from 'react-icons/fi';
import { Button } from '../components/ui';

type BookSearchBarProps = {
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleSearch: () => void;
  onClear?: () => void;
  isModal?: boolean;
};

export default function BookSearchBar({ searchValue, setSearchValue, handleSearch, onClear, isModal = false }: BookSearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={isModal ? "mb-4 w-full" : "w-full"}>
      <div className={isModal ? "rounded-[var(--radius-lg)] border border-[var(--neutral-200)] bg-white p-2" : "surface-elevated p-3 md:p-4"}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neutral-500)]" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for books by title, author, or ISBN..."
              className={`w-full rounded-[var(--radius-md)] border border-[var(--neutral-300)] bg-white pl-11 pr-4 text-[var(--neutral-800)] outline-none transition-all focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[color:var(--color-teal)]/25 ${
                isModal ? 'py-3 text-sm' : 'py-3.5 text-base'
              }`}
        />
          </div>

          <div className="flex items-center gap-2">
            {onClear ? (
              <Button
                variant="ghost"
                size="md"
                onClick={onClear}
                disabled={!searchValue.trim()}
                className="h-10 px-3 text-xs"
              >
                Clear
              </Button>
            ) : null}

            <Button
              onClick={handleSearch}
              disabled={!searchValue.trim()}
              size={isModal ? 'sm' : 'md'}
              className="h-10 px-5"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}