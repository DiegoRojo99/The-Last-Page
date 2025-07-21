'use client';
import { FiSearch } from 'react-icons/fi';

type BookSearchBarProps = {
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleSearch: () => void;
  isModal?: boolean;
};

export default function BookSearchBar({ searchValue, setSearchValue, handleSearch, isModal = false }: BookSearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={isModal ? "w-full mb-4" : "max-w-2xl mx-auto mb-8"}>
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for books by title, author, or ISBN..."
          className={`w-full px-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent outline-none pl-14 ${
            isModal ? 'py-3 text-base' : 'py-4 text-lg'
          }`}
        />
        <FiSearch className={`absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 ${
          isModal ? 'text-lg' : 'text-xl'
        }`} />
        <button
          onClick={handleSearch}
          disabled={!searchValue.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-lg px-6 py-2 font-medium hover:bg-gray-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>
    </div>
  );
}