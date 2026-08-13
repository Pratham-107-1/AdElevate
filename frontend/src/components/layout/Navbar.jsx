import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Featured Ads", to: "/browse" },
  { label: "About", to: "/about" },
];

function dashboardPath(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "VENDOR") return "/provider";
  return "/browse";
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, role, name, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-navy shadow-[0_2px_24px_rgba(0,0,0,0.32)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
        {/* Logo */}
        <Link to="/" className="flex flex-shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-gradient-to-br from-coral to-[#ff4f40] font-heading text-lg font-black text-white shadow-[0_4px_12px_rgba(255,111,97,0.45)]">
            A
          </div>
          <span className="font-heading text-xl font-black tracking-tight text-white">
            Adele<span className="text-coral">vate</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden flex-1 items-stretch justify-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`group relative flex items-center px-4 text-sm transition-colors duration-200 ${
                  active ? "font-bold text-white" : "font-medium text-white/70 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-t-[3px] bg-gradient-to-r from-coral to-[#ff4f40] transition-all duration-300 ease-out ${
                    active ? "w-[65%]" : "w-0 group-hover:w-[45%]"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Right cluster */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {!isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-lg border-[1.5px] border-white/25 px-4 py-1.5 text-sm font-semibold text-white/90 hover:border-coral/60 hover:bg-coral/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-br from-coral to-[#ff4f40] px-5 py-1.5 font-heading text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,111,97,0.35)] hover:opacity-90"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm font-medium text-white/85">
                Hi, <span className="font-bold text-white">{name || "there"}</span>
              </span>
              <Link
                to={dashboardPath(role)}
                className="rounded-lg border-[1.5px] border-white/15 bg-white/8 px-4 py-1.5 text-sm font-semibold text-white hover:border-coral/40 hover:bg-coral/15"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border-[1.5px] border-white/15 px-4 py-1.5 text-sm font-semibold text-white/80 hover:text-white"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="p-2 text-white md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-navy px-5 pb-4 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-white/80"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg border border-white/25 px-4 py-2 text-center text-sm font-semibold text-white">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-lg bg-coral px-4 py-2 text-center text-sm font-bold text-white">
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="py-1.5 text-center text-sm text-white/85">
                  Hi, <span className="font-bold text-white">{name || "there"}</span>
                </div>
                <Link to={dashboardPath(role)} onClick={() => setMenuOpen(false)} className="rounded-lg bg-white/10 px-4 py-2 text-center text-sm font-semibold text-white">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
