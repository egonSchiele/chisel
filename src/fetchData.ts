import * as t from "./Types";
export const fetchBook = async (bookid: string): Promise<t.Result> => {
  if (!bookid) return;
  const res = await fetch(`/api/book/${bookid}`, { credentials: "include" });
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const data: t.Book = await res.json();
  console.log("got book");
  console.log(data);
  if (!data) {
    return t.error("Book not found");
  }

  if (!data.design) {
    data.design = {
      coverColor: "bg-dmlistitem2",
      labelColor: "bg-blue-700",
      labelLinesColor: "border-yellow-400",
    };
  }
  return t.success(data);
};

export const fetchBooks = async () => {
  const res = await fetch(`/books`, { credentials: "include" });
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const data = await res.json();
  console.log("got books");
  console.log(data);
  if (!data) {
    return t.error("Books not found");
  }
  return t.success(data.books);
};
