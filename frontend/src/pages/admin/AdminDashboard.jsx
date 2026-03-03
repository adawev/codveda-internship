import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const SAMPLE_SIZE = 120;
const ORDER_COLORS = {
  PENDING: "bg-amber-500",
  PAID: "bg-cyan-600",
  SHIPPED: "bg-emerald-600",
};

const getDateKey = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
};

const formatShortDate = (dateKey) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const buildRecentDailySeries = (items, dateField, days = 7) => {
  const today = new Date();
  const keys = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    keys.push(new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString().slice(0, 10));
  }

  const map = keys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
  items.forEach((item) => {
    const key = getDateKey(item?.[dateField]);
    if (key && Object.prototype.hasOwnProperty.call(map, key)) {
      map[key] += 1;
    }
  });

  return keys.map((key) => ({
    key,
    label: formatShortDate(key),
    value: map[key],
  }));
};

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ users: 0, products: 0, orders: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [orderStatusCounts, setOrderStatusCounts] = useState([]);
  const [productActiveCounts, setProductActiveCounts] = useState({ active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          api.get("/api/users", { params: { page: 0, size: SAMPLE_SIZE, sort: "createdAt,desc" } }),
          api.get("/api/products", { params: { page: 0, size: SAMPLE_SIZE, sort: "createdAt,desc" } }),
          api.get("/api/orders/admin", { params: { page: 0, size: SAMPLE_SIZE, sort: "createdAt,desc" } }),
        ]);

        const users = usersRes.data.content ?? [];
        const products = productsRes.data.content ?? [];
        const orders = ordersRes.data.content ?? [];

        const statusMap = orders.reduce((acc, order) => {
          const status = order?.status || "UNKNOWN";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        const active = products.filter((product) => !!product.active).length;
        const inactive = Math.max(0, products.length - active);

        setCounts({
          users: usersRes.data.totalElements ?? 0,
          products: productsRes.data.totalElements ?? 0,
          orders: ordersRes.data.totalElements ?? 0,
        });
        setRecentUsers(buildRecentDailySeries(users, "createdAt", 7));
        setOrderStatusCounts(
          Object.entries(statusMap)
            .map(([status, total]) => ({ status, total }))
            .sort((a, b) => b.total - a.total)
        );
        setProductActiveCounts({ active, inactive });
      } catch (error) {
        // Handled by global API interceptor toast.
        setRecentUsers([]);
        setOrderStatusCounts([]);
        setProductActiveCounts({ active: 0, inactive: 0 });
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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-slate-500">Loading chart...</p>}
            {!loading && orderStatusCounts.length === 0 && <p className="text-sm text-slate-500">No recent order data.</p>}
            {!loading &&
              orderStatusCounts.map((entry) => {
                const max = orderStatusCounts[0]?.total || 1;
                const width = Math.max(8, Math.round((entry.total / max) * 100));
                return (
                  <div key={entry.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{entry.status}</span>
                      <span>{entry.total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${ORDER_COLORS[entry.status] || "bg-slate-500"}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Users (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-slate-500">Loading chart...</p>}
            {!loading && recentUsers.length > 0 && (
              <div className="space-y-2">
                <div className="flex h-36 items-end gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  {recentUsers.map((point) => {
                    const max = Math.max(1, ...recentUsers.map((item) => item.value));
                    const height = Math.max(8, Math.round((point.value / max) * 100));
                    return (
                      <div key={point.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                        <div className="text-[10px] font-semibold text-slate-500">{point.value}</div>
                        <div
                          className="w-full rounded-t bg-cyan-600"
                          style={{ height: `${height}%` }}
                          title={`${point.label}: ${point.value}`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-slate-500">
                  {recentUsers.map((point) => (
                    <span key={point.key}>{point.label}</span>
                  ))}
                </div>
              </div>
            )}
            {!loading && recentUsers.length === 0 && <p className="text-sm text-slate-500">No recent user data.</p>}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Availability</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {loading && <p className="text-sm text-slate-500">Loading chart...</p>}
            {!loading && (
              <>
                <div
                  className="h-24 w-24 rounded-full border border-slate-200"
                  style={{
                    background: `conic-gradient(#059669 0 ${(
                      (productActiveCounts.active /
                        Math.max(1, productActiveCounts.active + productActiveCounts.inactive)) *
                      100
                    ).toFixed(2)}%, #cbd5e1 0 100%)`,
                  }}
                />
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    Active: {productActiveCounts.active}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300" />
                    Inactive: {productActiveCounts.inactive}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AdminDashboard;
