"use client";

import React from "react";
import { FaPlus } from "react-icons/fa";

interface AddBookButtonProps {
  handleClick: () => void;
}

export default function AddBookButton({ handleClick }: AddBookButtonProps) {

  return (
    <button
      onClick={handleClick}
      className="p-2 bg-green-600 text-white rounded-full shadow-md hover:bg-blue-700 transition"
      aria-label="Add Book"
    >
      <FaPlus size={12} />
    </button>
  );
}
