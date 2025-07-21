"use client";

import React from "react";
import { FiPlus } from "react-icons/fi";

interface AddBookButtonProps {
  handleClick: () => void;
}

export default function AddBookButton({ handleClick }: AddBookButtonProps) {
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
      aria-label="Add Book"
    >
      <FiPlus size={16} />
      <span className="hidden sm:inline">Add Book</span>
    </button>
  );
}
