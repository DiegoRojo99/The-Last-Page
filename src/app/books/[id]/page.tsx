'use client';

import { use } from "react";
import BookDetails from "./PageDetails";

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BookDetails bookId={id} />;
}
