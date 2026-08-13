import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function dashboardPath(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "VENDOR") return "/provider";
  return "/browse";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      navigate(dashboardPath(result.role));
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Incorrect email or password."
          : "Could not sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy to-sapphire p-4">
      <div className="w-full max-w-[440px] rounded-[20px] bg-white p-9 shadow-[0_24px_64px_rgba(0,0,0,0.32)]">
        <div className="mb-7 text-center">
          <div className="font-heading text-[28px] font-black text-navy">
            Adele<span className="text-coral">vate</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm"
            />
          </div>
          <div className="mb-2">
            <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="mb-4 text-right">
            <Link to="/forgot-password" className="text-xs font-semibold text-coral">
              Forgot password?
            </Link>
          </div>

          {error && <p className="mb-3 text-sm text-brand-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-[10px] bg-coral py-3 font-heading text-[15px] font-extrabold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          No account?{" "}
          <Link to="/register" className="font-bold text-coral">Register free</Link>
        </p>
        <Link to="/" className="mt-1.5 block text-center text-[13px] text-slate-400">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
