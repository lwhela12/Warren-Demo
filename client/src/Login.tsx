import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setStatus("loading");
    setError(null);

    // --- START: Magic Link Bypass ---
    // The original magic link flow is commented out below.
    // This new code bypasses email verification for development.
    // It sets a dummy token in localStorage and reloads the page.
    // App.tsx will then pick up this token and grant access.

    const dummyToken = `bypassed-token-for-${email}`;
    localStorage.setItem("jwt", dummyToken);
    setStatus("success"); // Update UI status

    // Reload the page to allow App.tsx's useAuthToken to pick up the new token
    window.location.reload();

    // --- END: Magic Link Bypass ---

    /*
    // Original magic link sending logic:
    try {
      const res = await fetch("http://localhost:5001/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to send magic link");
      }
      setStatus("success");
    } catch (err: any) {
      setError(err.message || "Unexpected error");
      setStatus("error");
    }
    */
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <label htmlFor="email" style={{ fontWeight: 600 }}>
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading" || status === "success"}
      />
      <button type="submit" disabled={status === "loading" || status === "success"}>
        {status === "loading" ? "Sending..." : "Send Magic Link"}
      </button>
      {status === "success" && (
        <div style={{ marginTop: 10 }}>Check your email for the login link.</div>
      )}
      {error && (
        <div className="error" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
    </form>
  );
}
