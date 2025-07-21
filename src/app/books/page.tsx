import BookSearch from "./BookSearch";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Discover Your Next Great Read
          </h1>
          <p className="text-gray-600 text-center mt-2 max-w-2xl mx-auto">
            Search millions of books and add them to your personal library
          </p>
        </div>
      </div>
      <BookSearch />
    </div>
  );
}