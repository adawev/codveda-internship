import React from "react";
import Users from "../Components/Users";
import AdminProducts from "../Components/AdminProducts";

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Admin</p>
        <h1 className="text-2xl font-black">Dashboard</h1>
      </div>
      <div className="grid gap-6">
        <Users />
        <AdminProducts />
      </div>
    </div>
  );
};

export default AdminDashboard;
