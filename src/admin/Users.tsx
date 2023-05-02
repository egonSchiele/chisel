import React from "react";
import sortBy from "lodash/sortBy";
import sum from "lodash/sum";

function User({ user, index }) {
  /*   const chaptersLength = sum(user.books.map((b) => b.chapters.length));
   */ return (
    <tr>
      <td>{index}</td>
      <td>{user.userid}</td>
      <td>{user.email}</td>
      <td>{user.books.length}</td>
      {/*       <td>{chaptersLength}</td>
       */}{" "}
      <td>{user.usage.openai_api.tokens.month.completion}</td>
      <td>{user.usage.openai_api.tokens.month.prompt}</td>
      <td>{user.usage.openai_api.tokens.total.completion}</td>
      <td>{user.usage.openai_api.tokens.total.prompt}</td>
    </tr>
  );
}

export default function Users() {
  const [users, setUsers] = React.useState([]);
  const [totals, setTotals] = React.useState({
    tokens: 0,
    books: 0,
    users: 0,
    /*     chapters: 0,
     */
  });
  React.useEffect(() => {
    const func = async () => {
      const res = await fetch("/api/admin/users");
      let users = await res.json();
      users = sortBy(
        users,
        (u) =>
          u.usage.openai_api.tokens.month.completion +
          u.usage.openai_api.tokens.month.prompt
      );
      users.reverse();
      setUsers(users);

      let tokens = sum(
        users.map(
          (u) =>
            u.usage.openai_api.tokens.total.completion +
            u.usage.openai_api.tokens.total.prompt
        )
      );
      let books = sum(users.map((u) => u.books.length));
      let usersCount = users.length;
      /* let chapters = sum(
        users.map((u) => sum(u.books.map((b) => b.chapters.length)))
      ); */
      const totals = {
        tokens,
        books,
        users: usersCount,
        /* chapters, */
      };
      setTotals(totals);
    };
    func();
  }, []);

  return (
    <div className="m-md">
      <h1 className="text-2xl mt-md font-bold">Totals</h1>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Tokens</th>
            <th className="px-4 py-2">Books</th>
            <th className="px-4 py-2">Users</th>
            {/*             <th className="px-4 py-2">Chapters</th>
             */}{" "}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{totals.tokens}</td>
            <td>{totals.books}</td>
            <td>{totals.users}</td>
            {/*             <td>{totals.chapters}</td> */}
          </tr>
        </tbody>
      </table>
      <h1 className="text-2xl mt-md font-bold">Users</h1>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Books</th>
            {/*             <th className="px-4 py-2">Chapters</th>
             */}{" "}
            <th className="px-4 py-2">Month Completion Tokens</th>
            <th className="px-4 py-2">Month Prompt Tokens</th>
            <th className="px-4 py-2">Total Completion Tokens</th>
            <th className="px-4 py-2">Total Prompt Tokens</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <User key={user.id} user={user} index={index + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
