import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import api from "../api";
import { useAuth } from "../AuthContext";

const Orders = () => {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/orders?page=0&size=20&sort=createdAt,desc");
      setOrders(response.data.content ?? []);
    } catch (err) {
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
    const accessToken = localStorage.getItem("accessToken") || "";

    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseURL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/orders/${user.id}`, (message) => {
          const payload = JSON.parse(message.body);
          setOrders((prev) =>
            prev.map((order) =>
              Number(order.id) === Number(payload.orderId)
                ? { ...order, status: payload.status }
                : order
            )
          );
        });
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [isAuthenticated, user?.id]);

  const handleCreateOrder = async () => {
    setError(null);
    try {
      await api.post("/api/orders");
      fetchOrders();
    } catch (err) {
      setError("Unable to create order.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Orders</p>
          <h2>Your recent orders</h2>
          <p className="note">Create an order when your cart is ready.</p>
        </div>
        <div className="page-actions">
          <button type="button" onClick={handleCreateOrder}>
            Create order
          </button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {loading && <p className="note">Loading orders...</p>}

      {orders.length > 0 ? (
        <div className="orders">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <h4>Order #{order.id}</h4>
              <p>Status: {order.status}</p>
              <p>Total: ${order.totalPrice}</p>
              <ul>
                {(order.items ?? []).map((item) => (
                  <li key={item.id}>
                    {item.productName} - {item.quantity} x ${item.price}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="note">No orders yet.</p>
      )}
    </div>
  );
};

export default Orders;
