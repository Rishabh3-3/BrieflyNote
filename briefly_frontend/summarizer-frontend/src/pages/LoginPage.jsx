import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setToken } from "../utils/tokenUtils";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card } from 'react-bootstrap';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isSignup ? "http://localhost:8000/auth/signup" : "http://localhost:8000/auth/login";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        toast.success(isSignup ? "Signup successful!" : "Login successful!", { duration: 3000 });
        navigate("/home");
      } else {
        throw new Error("Token missing from response.");
      }
    } catch (err) {
      toast.error(`⚠️ ${err.message}`, { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: "linear-gradient(to right top, #f8fafc, #e0ecf7)",
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "1rem",
          background: "#ffffffd9",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-center text-primary mb-4 fw-semibold">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label text-muted">Email</label>
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label text-muted">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control form-control-lg"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mt-2 shadow-sm"
            disabled={loading}
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="text-center mt-3 text-secondary">
          <small>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="btn btn-link p-0 fw-semibold text-decoration-none text-primary"
              onClick={() => {
                setIsSignup(!isSignup);
                setEmail("");
                setPassword("");
              }}
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

