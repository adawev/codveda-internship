import React from "react";
import Users from "../Components/Users";
import AdminProducts from "../Components/AdminProducts";

const AdminDashboard = () => {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Admin Dashboard</h2>
          <p className="note">Manage users and keep the storefront up to date.</p>
        </div>
      </div>
      <div className="admin-sections">
        <Users />
        <AdminProducts />
      </div>
    </div>
  );
};

export default AdminDashboard;
