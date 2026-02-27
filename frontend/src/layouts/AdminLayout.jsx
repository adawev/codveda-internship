import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Button } from "../components/ui/button";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
];

const linkClassName = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebar = (
    <aside className="h-full w-full max-w-60 border-r border-slate-200 bg-white p-4">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admin</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">Dashboard</h1>
      </div>

      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={linkClassName}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 border-t border-slate-200 pt-4">
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
        <Button className="mt-3 w-full" variant="secondary" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="admin-shell min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <div className="hidden md:block">{sidebar}</div>

        {open && (
          <div className="fixed inset-0 z-40 bg-slate-900/30 md:hidden" onClick={() => setOpen(false)}>
            <div className="h-full w-60 bg-white" onClick={(event) => event.stopPropagation()}>
              {sidebar}
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mb-4 md:hidden">
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
              Menu
            </Button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
