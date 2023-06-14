import * as fd from "./lib/fetchData";
import React from "react";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import Input from "./components/Input";
import { getSelectedBook, librarySlice } from "./reducers/librarySlice";
import { isString } from "./utils";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store";
import * as t from "./Types";
function formatDate(date: number) {
  return new Date(date).toLocaleString();
}

export default function AskAQuestionSidebar() {
  const state: t.State = useSelector((state: RootState) => state.library);
  const book = getSelectedBook({ library: state });
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState(null);
  const dispatch = useDispatch();
  const trained = !!book.lastTrainedAt;
  const buttonLabel = trained ? "Re-Train" : "Train";
  const fudgeFactor = 1000 * 3; // 3 seconds
  const staleChapters = book.chapters.filter(
    (chapter) =>
      !chapter.embeddingsLastCalculatedAt ||
      chapter.created_at > chapter.embeddingsLastCalculatedAt + fudgeFactor
  );
  const stale = staleChapters.length > 0;
  return (
    <div>
      {trained && (
        <div className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm">
          <div className="">Last Trained</div>
          <div className="font-semibold">{formatDate(book.lastTrainedAt)}</div>
        </div>
      )}
      {!trained && <p>Never Trained</p>}
      {trained && stale && (
        <p className="bg-yellow-200 dark:bg-yellow-700 p-xs my-xs text-lg">
          Stale
        </p>
      )}
      <ul className="text-md list-disc">
        {trained &&
          stale &&
          staleChapters.map((chapter, i) => (
            <li key={i}>
              <Link
                to={`/book/${book.bookid}/chapter/${chapter.chapterid}`}
                className=""
              >
                {chapter.title} (last updated: {formatDate(chapter.created_at)},
                last trained: {formatDate(chapter.embeddingsLastCalculatedAt)} )
              </Link>
            </li>
          ))}
      </ul>

      <Button
        onClick={async () => {
          const lastTrainedAt = await fd.trainOnBook(book.bookid);
          if (lastTrainedAt.tag === "success") {
            dispatch(
              librarySlice.actions.setLastTrainedAt(lastTrainedAt.payload)
            );
          } else {
            dispatch(librarySlice.actions.setError(lastTrainedAt.message));
          }
        }}
        className="mt-sm"
        size="medium"
        style="secondary"
        rounded={true}
      >
        {buttonLabel}
      </Button>
      <h2 className="text-xl font-semibold mt-md mb-xs">Ask a question</h2>
      <div className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm">
        <Input
          name="question"
          title="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          selector={`question`}
        />
        <Button
          onClick={async () => {
            setAnswer("...");
            const _answer = await fd.askQuestion(book.bookid, question);
            if (_answer.tag === "success") {
              setAnswer(_answer.payload);
            } else {
              dispatch(librarySlice.actions.setError(_answer.message));
            }
          }}
          className="mt-sm"
          size="medium"
          style="secondary"
          rounded={true}
        >
          Ask
        </Button>
        <div className="mt-sm">
          <h2 className="text-xl font-semibold mt-md mb-xs">Answer</h2>
          {answer && isString(answer) && <p>{answer}</p>}
          {answer && answer.answer && (
            <div className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm">
              <p>{answer.answer}</p>
              <Link
                to={`/book/${book.bookid}/chapter/${answer.chapterid}/${answer.blockIndex}`}
                className="mt-sm underline-offset-2 underline text-gray-400"
              >
                Go to relevant text
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
