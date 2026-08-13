import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "CUSTOMER", label: "Customer", icon: "👤" },
  { value: "VENDOR", label: "Provider/Vendor", icon: "🏪" },
  { value: "ADMIN", label: "Admin", icon: "⚙️" },
];

function dashboardPath(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "VENDOR") return "/provider";
  return "/browse";
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", email: "", phoneNumber: "", password: "",
    role: "CUSTOMER", businessName: "", businessCategory: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) {
      setError("Enter a valid 10-digit Indian mobile number (starting with 6-9).");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const result = await register({ ...form, status: "ACTIVE" });
      navigate(dashboardPath(result.role));
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy to-sapphire p-4">
      <div className="w-full max-w-[460px] rounded-[20px] bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.32)]">
        <div className="mb-6 text-center">
          <div className="font-heading text-2xl font-black text-navy">Create Account</div>
          <p className="mt-1 text-[13px] text-slate-500">Join Adelevate — free to get started</p>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-[13px] font-semibold text-charcoal">I am a...</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                className={`rounded-[10px] border-2 px-1 py-2.5 text-center transition-colors ${
                  form.role === r.value ? "border-coral bg-[#fff5f4]" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="mb-0.5 text-xl">{r.icon}</div>
                <div className={`text-[11px] font-bold ${form.role === r.value ? "text-coral" : "text-slate-500"}`}>
                  {r.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold text-charcoal">Full Name</label>
            <input value={form.name} onChange={update("name")} placeholder="Rahul Mehta" required minLength={3} maxLength={50}
              className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2 text-sm" />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold text-charcoal">Email Address</label>
            <input type="email" value={form.email} onChange={update("email")} placeholder="you@email.com" required
              className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2 text-sm" />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold text-charcoal">Phone Number</label>
            <input value={form.phoneNumber} onChange={update("phoneNumber")} placeholder="9876543210" required
              className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2 text-sm" />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold text-charcoal">Password</label>
            <input type="password" value={form.password} onChange={update("password")} placeholder="Create password (min. 8 characters)" required minLength={8} maxLength={20}
              className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2 text-sm" />
          </div>

          {form.role === "VENDOR" && (
            <>
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-charcoal">Business Name</label>
                <input value={form.businessName} onChange={update("businessName")} placeholder="TrendZone Fashion Hub" required
                  className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2 text-sm" />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-charcoal">Business Category</label>
                <input value={form.businessCategory} onChange={update("businessCategory")} placeholder="Clothing & Fashion" required
                  className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2 text-sm" />
              </div>
            </>
          )}

          {error && <p className="mb-3 text-sm text-brand-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 w-full rounded-[10px] bg-coral py-3 font-heading text-[15px] font-extrabold text-white disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create My Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-[13px] text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-coral">Login</Link>
        </p>
        <Link to="/" className="mt-1 block text-center text-[13px] text-slate-400">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
