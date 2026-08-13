import { useState } from "react";
import { Link } from "react-router-dom";
import { coreApi } from "../api/client";

export default function ForgotPasswordPage() {
  // step 1 = enter email/phone, step 2 = enter new password, step 3 = success
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setError("Enter your email or phone number.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await coreApi.post("/api/auth/forgot-password/verify", { emailOrPhone });
      if (!res.data.exists) {
        setError(res.data.message || "No account found with that email or phone number.");
        return;
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "No account found with that email or phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await coreApi.put("/api/auth/reset-password", { emailOrPhone, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Could not update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy to-sapphire p-4">
      <div className="w-full max-w-[420px] rounded-[20px] bg-white p-9 shadow-[0_24px_64px_rgba(0,0,0,0.32)]">
        <div className="mb-6 text-center">
          <div className="font-heading text-2xl font-black text-navy">Forgot Password</div>
        </div>

        {step === 1 && (
          <form onSubmit={handleVerify}>
            <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Email or Phone Number</label>
            <input
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="you@example.com or 9876543210"
              className="mb-3 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm"
            />
            {error && <p className="mb-3 text-sm text-brand-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[10px] bg-coral py-3 font-heading text-[15px] font-extrabold text-white disabled:opacity-60"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
            <Link to="/login" className="mt-3 block text-center text-[13px] text-coral font-semibold">
              ← Back to login
            </Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset}>
            <p className="mb-4 text-sm text-slate-500">
              Account verified. Set a new password for <strong>{emailOrPhone}</strong>.
            </p>
            <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-3 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm"
            />
            <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mb-3 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm"
            />
            {error && <p className="mb-3 text-sm text-brand-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[10px] bg-coral py-3 font-heading text-[15px] font-extrabold text-white disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="mt-3 block w-full text-center text-[13px] text-slate-400"
            >
              ← Back
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <p className="font-semibold text-brand-green">Password updated successfully.</p>
            <p className="mt-1 mb-5 text-sm text-slate-500">You can now log in with your new password.</p>
            <Link
              to="/login"
              className="block w-full rounded-[10px] bg-coral py-3 font-heading text-[15px] font-extrabold text-white"
            >
              Go to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
