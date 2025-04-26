import React from "react";
import BookshelfTabs from "./BookshelfTabs";
import AddBookButton from "./AddBookButton";

export default function BookshelfPage() {
  return (
    <div className="p-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between my-4">
        <h1 className="text-2xl font-bold mx-auto">Bookshelf</h1>
        <AddBookButton />
      </div>

      {/* Tabs */}
      <BookshelfTabs />

      {/* Book Grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Placeholder for BookCards */}
        {/* Example BookCard components will go here */}
      </div>
    </div>
  );
}
