import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/use-toast";
import { getOrders, removeOrder, updateOrderStatus } from "../../services/admin";
import Modal from "../../components/admin/Modal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
};

const statuses = ["PENDING", "PAID", "SHIPPED"];

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pendingDeleteOrder, setPendingDeleteOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
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

  const onChangeStatus = async (order, status) => {
    setActionId(order.id);
    try {
      await updateOrderStatus(order.id, status);
      toast({ title: "Order updated", variant: "success" });
      await fetchOrders();
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setActionId(null);
    }
  };

  const onDeleteOrder = async (order) => {
    setPendingDeleteOrder(order);
  };

  const confirmDeleteOrder = async () => {
    if (!pendingDeleteOrder) {
      return;
    }

    setActionId(pendingDeleteOrder.id);
    try {
      await removeOrder(pendingDeleteOrder.id);
      toast({ title: "Order deleted", variant: "success" });
      if (selectedOrder?.id === pendingDeleteOrder.id) {
        setSelectedOrder(null);
      }
      await fetchOrders();
      setPendingDeleteOrder(null);
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
      </header>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Order ID</th>
              <th className="px-3 py-2">User Email</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={6}>
                  Loading orders...
                </td>
              </tr>
            )}

            {!loading && orders.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={6}>
                  No orders found.
                </td>
              </tr>
            )}

            {!loading &&
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-3 py-3">#{order.id}</td>
                  <td className="px-3 py-3">{order.userEmail ?? "-"}</td>
                  <td className="px-3 py-3">${order.totalPrice}</td>
                  <td className="px-3 py-3">
                    <select
                      className="h-9 rounded-md border border-slate-300 bg-white px-2"
                      value={order.status}
                      disabled={actionId === order.id}
                      onChange={(event) => onChangeStatus(order, event.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedOrder(order)}>
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionId === order.id}
                        onClick={() => onDeleteOrder(order)}
                      >
                        {actionId === order.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!selectedOrder} title={`Order #${selectedOrder?.id ?? ""}`} onClose={() => setSelectedOrder(null)}>
        <div className="space-y-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-slate-500">User:</span> {selectedOrder?.userEmail ?? "-"}
            </p>
            <p>
              <span className="text-slate-500">Status:</span> {selectedOrder?.status}
            </p>
            <p>
              <span className="text-slate-500">Total:</span> ${selectedOrder?.totalPrice}
            </p>
            <p>
              <span className="text-slate-500">Date:</span> {formatDate(selectedOrder?.createdAt)}
            </p>
          </div>

          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(selectedOrder?.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">{item.productName}</td>
                    <td className="px-3 py-2">{item.quantity}</td>
                    <td className="px-3 py-2">${item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!pendingDeleteOrder}
        title="Delete Order"
        description={`Are you sure you want to delete order #${pendingDeleteOrder?.id ?? ""}?`}
        confirmLabel="Delete"
        busy={actionId === pendingDeleteOrder?.id}
        onCancel={() => setPendingDeleteOrder(null)}
        onConfirm={confirmDeleteOrder}
      />
    </section>
  );
};

export default AdminOrders;
