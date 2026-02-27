import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useAuth } from "../../AuthContext";
import { useCart } from "../../CartContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
];

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const isUser = !isAuthenticated || user?.role === "USER";

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!accountRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  const onLogout = () => {
    logout();
    setAccountOpen(false);
    navigate("/");
  };

  const accountLabel = user?.email?.split("@")[0] || "Account";

  const renderNavLinks = () => (
    <>
      {isUser &&
        navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`
            }
            onClick={() => setOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      {isAuthenticated && user?.role === "USER" && (
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-sm font-medium ${
              isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
            }`
          }
          onClick={() => setOpen(false)}
        >
          Orders
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
        <Link to="/" className="text-xl font-black tracking-tight text-slate-900">
          Codveda
        </Link>

        <nav className="hidden items-center gap-1 md:flex">{renderNavLinks()}</nav>

        {isUser && (
          <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 md:flex">
            <Input
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
        )}

        {isUser && (
          <Link to="/cart" className="relative rounded-md p-2 text-slate-700 hover:bg-slate-100" aria-label="Open cart">
            Cart
            {cartCount > 0 && <Badge className="absolute -right-1 -top-1 bg-emerald-600">{cartCount}</Badge>}
          </Link>
        )}

        {isAuthenticated ? (
          <div className="relative" ref={accountRef}>
            <Button variant="secondary" onClick={() => setAccountOpen((value) => !value)}>
              {accountLabel}
            </Button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                {user?.role === "USER" && (
                  <button
                    type="button"
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      setAccountOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </button>
                )}
                <button
                  type="button"
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="secondary" onClick={() => navigate("/login")}>Login</Button>
            <Button onClick={() => navigate("/register")}>Register</Button>
          </div>
        )}

        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {isUser && (
            <form onSubmit={submitSearch} className="mb-3">
              <Input
                placeholder="Search products"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>
          )}
          <nav className="grid gap-1">
            {renderNavLinks()}
            {isAuthenticated && user?.role === "USER" && (
              <>
                <NavLink to="/profile" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setOpen(false)}>
                  Profile
                </NavLink>
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/register" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setOpen(false)}>
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
