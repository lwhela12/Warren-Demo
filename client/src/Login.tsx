import React, { useState } from "react";
import logo from "./assets/images/nesolagus-logo.png";
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
        <img src={logo} className="sidebar-logo-img" alt="Warren Logo" />
        <div className="login-sidebar-item active">Sign In</div>
      </div>
      <div className="login-main">
        <div className="login-header">
          <h1 className="header-title">Sign In</h1>
          <div className="header-subtitle">
            Your Gateway to Student Voice Insights
          </div>
        </div>
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <label htmlFor="username" className="field-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="field-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="login-forgot-link-container">
              <a href="#" className="login-forgot-link">
                Forgot Password?
              </a>
            </div>
            <button type="submit" className="login-button">
              Log In
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
