type BookSearchBarProps = {
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleSearch: () => void;
};

export default function BookSearchBar({ searchValue, setSearchValue, handleSearch }: BookSearchBarProps) {
  return (
    <div className="flex items-center justify-between my-4">
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search for books..."
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
      <button
        onClick={handleSearch}
        className="ml-2 bg-blue-500 text-white rounded px-4 py-2"
      >
        Search
      </button>
    </div>
  );
}