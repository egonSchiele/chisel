import { Chapter } from "../src/Types";

export const mockBook = {
  chapters: [
    {
      pos: {
        x: 0,
        y: 0,
      },
      chapterid: "chapter_1",
      created_at: 1681477740005,
      suggestions: [
        {
          contents: "Hi there",
          type: "Expand",
        },
      ],
      text: "A man moves to San Francisco for a new job.\n",
      title: "New job",
      bookid: "book_1",
    },
    {
      pos: {
        x: 0,
        y: 0,
      },
      chapterid: "chapter_2",
      created_at: 1681583480568,
      suggestions: [],
      text: "hi there\n\n",
      title: "new chapter fresh from the oven",
      favorite: false,
      bookid: "book_1",
    },
  ],
  author: "Unknown",
  created_at: 1681583726786,
  rowHeadings: ["", "", "", "", "", "", "", "", "", "", "", ""],
  columnHeadings: ["", "", "", "", "", "", "", "", "", "", "", ""],
  title: "Test story",
  chapterTitles: [
    {
      chapterid: "chapter_1",
      title: "New job",
    },
    {
      chapterid: "chapter_2",
      title: "new chapter fresh from the oven",
    },
  ],
  userid: "user_1",
  bookid: "book_1",
};

export const chapter1: Chapter = {
  bookid: "book_1",
  chapterid: "chapter_1",
  title: "New job",
  text: "A man moves to San Francisco for a new job.\n",
  pos: {
    x: 0,
    y: 0,
  },
  suggestions: [{ type: "expand", contents: "Hi there" }],
  favorite: false,
};

export const chapter2: Chapter = {
  bookid: "book_1",
  chapterid: "chapter_2",
  title: "new chapter fresh from the oven",
  text: "hi there\n\n",
  pos: {
    x: 0,
    y: 0,
  },
  suggestions: [],
  favorite: false,
};
