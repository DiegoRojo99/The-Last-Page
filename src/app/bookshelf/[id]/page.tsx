import { use } from 'react';
import ReadingProgress from './ReadingProgress';

export default function ReadingProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ReadingProgress bookId={id} />;
}
