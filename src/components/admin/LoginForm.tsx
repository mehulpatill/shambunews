"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);

      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      window.clearTimeout(timeout);

      if (r.ok) {
        window.location.assign("/admin");
        return;
      }

      const data = await r.json().catch(() => ({}));
      setError(data.error || "Login failed");
    } catch (error) {
      setError(
        error instanceof DOMException && error.name === "AbortError"
          ? "Login timed out. Please try again."
          : "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="admin-password">Password</label>
        <div style={{ position: "relative" }}>
          <input
            id="admin-password"
            className="input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{ paddingRight: 48 }}
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              display: "grid",
              placeItems: "center",
              border: 0,
              background: "transparent",
              color: "#666",
              cursor: "pointer",
              padding: 0
            }}
          >
            {showPassword ? "◉" : "◌"}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="notice"
          style={{
            background: "#fff0f0",
            borderColor: "#f1c0c0",
            color: "#8c1717"
          }}
        >
          {error}
        </div>
      )}

      <button
        className="btn primary"
        style={{ width: "100%" }}
        disabled={loading}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
