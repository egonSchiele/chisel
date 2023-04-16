import React from "react";

function User({ user }) {
  return (
    <tr>
      <td>{user.userid}</td>
      <td>{user.email}</td>
      <td>{user.books.length}</td>
      <td>{user.usage.openai_api.tokens.total.completion}</td>
      <td>{user.usage.openai_api.tokens.total.prompt}</td>
    </tr>
  );
}

export default function Users() {
  const [users, setUsers] = React.useState([]);
  React.useEffect(() => {
    const func = async () => {
      const res = await fetch("/api/admin/users");
      const users = await res.json();
      setUsers(users);
    };
    func();
  }, []);

  return (
    <div>
      <h1 className="2xl">Users</h1>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Books</th>
            <th className="px-4 py-2">Completion Tokens</th>
            <th className="px-4 py-2">Prompt Tokens</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <User key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
