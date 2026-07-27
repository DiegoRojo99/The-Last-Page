import BookSearch from "./BookSearch";
import { PageHeader } from "../components/ui";

export default function Page() {
  return (
    <div className="app-section">
      <div className="app-container page-stack">
        <PageHeader
          title="Discover Your Next Great Read"
          description="Search millions of books, compare options quickly, and move your best finds into your library."
          className="bg-mesh-warm"
        />
        <BookSearch />
      </div>
    </div>
  );
}