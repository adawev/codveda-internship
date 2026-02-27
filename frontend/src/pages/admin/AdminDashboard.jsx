import React, { useEffect, useState } from "react";
import api from "../../api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ users: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          api.get("/api/users?page=0&size=1"),
          api.get("/api/products?page=0&size=1"),
          api.get("/api/orders/admin?page=0&size=1"),
        ]);

        setCounts({
          users: usersRes.data.totalElements ?? 0,
          products: productsRes.data.totalElements ?? 0,
          orders: ordersRes.data.totalElements ?? 0,
        });
      } catch (error) {
        // Handled by global API interceptor toast.
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{loading ? "..." : counts.users}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{loading ? "..." : counts.products}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{loading ? "..." : counts.orders}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AdminDashboard;
