"use client";

import React from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../components/ui";

interface AddBookButtonProps {
  handleClick: () => void;
}

export default function AddBookButton({ handleClick }: AddBookButtonProps) {
  return (
    <Button
      onClick={handleClick}
      className="shadow-[var(--shadow-sm)]"
      aria-label="Add Book"
    >
      <FiPlus size={16} />
      <span className="hidden sm:inline">Add Book</span>
    </Button>
  );
}
