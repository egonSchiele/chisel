import React from "react";
import Auth from "./Auth";
import { Routes, Route } from "react-router-dom";
import Library from "./Library";

function AuthApp() {
  const [error, setError] = React.useState(null);
  async function submitLogin(email, password) {
    await submitBase("/submitLogin", email, password);
  }

  async function submitRegister(email, password) {
    await submitBase("/submitRegister", email, password);
  }
  async function submitBase(url, email, password) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message);
      return;
    } else {
      setError(null);
      const { userid, token } = json;

      document.cookie = `userid=${userid}`;
      document.cookie = `token=${token}`;
      window.location.href = "/";
    }
  }
  return (
    <div>
      <Routes>
        <Route
          path="/login"
          element={
            <Auth
              title={"Sign in to your account"}
              primary={"Sign in"}
              secondary={"Register"}
              primaryAction={submitLogin}
              secondaryAction="/register"
              error={error}
            />
          }
        />
        <Route
          path="/register"
          element={
            <Auth
              title={"Register"}
              primary={"Register"}
              secondary={"Sign in"}
              primaryAction={submitRegister}
              secondaryAction="/login"
              error={error}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <AuthApp />
    </div>
  );
}
