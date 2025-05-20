import React, { useState } from "react";
import { colors } from "./theme";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    if (username === "teacher@warren.demo" && password === "password") {
      localStorage.setItem("jwt", "dummy-teacher-token");
      localStorage.setItem("userRole", "teacher");
      window.location.reload();
      return;
    }

    if (username === "student@warren.demo" && password === "password") {
      localStorage.setItem("jwt", "dummy-student-token");
      localStorage.setItem("userRole", "student");
      window.location.reload();
      return;
    }

    setError("Invalid username or password");
  };

  return (
    <div className="login-layout">
      <div className="login-sidebar">
        <div>
          <div className="sidebar-logo">
            <div style={{ fontSize: 24, fontWeight: 700 }}>Warren</div>
            <div style={{ fontSize: 12 }}>powered by Nesolagus</div>
          </div>
          <div style={{ fontSize: 24 }}>☰</div>
        </div>
        <div className="active">Sign In</div>
      </div>
      <div className="login-main">
        <div className="login-header">
          <h1 style={{ margin: 0, color: colors.primaryText }}>Sign In</h1>
          <div style={{ color: colors.secondaryText }}>
            Your Gateway to Student Voice Insights
          </div>
        </div>
        <div className="login-card">
          <div className="sidebar-logo" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>Warren</div>
            <div style={{ fontSize: 12 }}>powered by Nesolagus</div>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username" style={{ fontWeight: 600 }}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="password" style={{ fontWeight: 600 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ textAlign: "right", marginBottom: "1rem" }}>
              <a href="#" style={{ color: colors.primaryDarkBlue }}>
                Forgot Password?
              </a>
            </div>
            <button type="submit" style={{ background: colors.primaryDarkBlue }}>
              Log In
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
