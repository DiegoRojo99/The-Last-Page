import BookDetailsPage from './BookDetailsPage';

export default function BookPage({ params }: { params: { id: string } }) {
  return <BookDetailsPage id={params.id} />;
}