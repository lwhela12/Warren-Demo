import React, { useEffect, useState } from "react";
import Wizard from "./components/Wizard";
import Login from "./Login";

function useAuthToken() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("jwt")
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (t) {
      fetch("http://localhost:5001/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: t })
      })
        .then(async (r) => {
          if (!r.ok) throw new Error("Invalid token");
          const data = await r.json();
          localStorage.setItem("jwt", data.jwt);
          setToken(data.jwt);
          url.searchParams.delete("token");
          window.history.replaceState({}, "", url.pathname);
        })
        .catch(() => {
          url.searchParams.delete("token");
          window.history.replaceState({}, "", url.pathname);
        });
    }
  }, []);

  return token;
}

export default function App() {
  const token = useAuthToken();
  return (
    <div className="page-container">
      {token ? <Wizard /> : <Login />}
    </div>
  );
}
