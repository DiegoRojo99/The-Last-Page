type VolumeInfo = {
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  description: string;
  imageLinks: {
    thumbnail: string;
    smallThumbnail: string;
  };
  pageCount: number;
  categories: string[];
};

interface Book {
  id: string;
  volumeInfo: VolumeInfo;
}

export {
  Book,
}