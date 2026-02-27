import React, { useEffect, useState } from "react";
import api from "../api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/orders?page=0&size=20&sort=createdAt,desc");
      setOrders(response.data.content ?? []);
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Orders</p>
          <h1 className="text-2xl font-black">Order history</h1>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading orders...</p>}

      <div className="grid gap-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold">Order #{order.id}</h3>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{order.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Total: ${order.totalPrice}</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {(order.items ?? []).map((item) => (
                <li key={item.id}>{item.productName} - {item.quantity} x ${item.price}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Orders;
