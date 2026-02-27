import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../CartContext";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/button";

const Cart = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { toast } = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/cart");
      setCart(response.data);
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = useMemo(
    () => (cart?.items ?? []).reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [cart]
  );

  const updateQuantity = async (item, quantity) => {
    const parsed = Math.max(0, Number(quantity) || 0);
    setUpdatingId(item.id);

    try {
      await api.delete(`/api/cart/items/${item.id}`);
      if (parsed > 0) {
        await api.post("/api/cart/items", { productId: item.productId, quantity: parsed });
      }
      await fetchCart();
      await refreshCart();
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (itemId) => {
    setUpdatingId(itemId);
    try {
      await api.delete(`/api/cart/items/${itemId}`);
      await fetchCart();
      await refreshCart();
      toast({ title: "Removed", description: "Item removed from cart.", variant: "info" });
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Your cart</h1>
          <Link to="/shop" className="text-sm font-semibold text-cyan-700">Continue shopping</Link>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading cart...</p>}

        {!loading && (cart?.items ?? []).length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
            Your cart is empty.
          </div>
        )}

        <div className="space-y-3">
          {(cart?.items ?? []).map((item) => (
            <article key={item.id} className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_120px_100px_auto] md:items-center">
              <div>
                <h3 className="font-semibold text-slate-900">{item.productName}</h3>
                <p className="text-sm text-slate-500">${item.price} each</p>
              </div>
              <input
                type="number"
                min="0"
                value={item.quantity}
                onChange={(event) => updateQuantity(item, event.target.value)}
                disabled={updatingId === item.id}
                className="h-10 rounded-md border border-slate-300 px-2"
              />
              <p className="text-sm font-semibold text-slate-900">${(Number(item.price) * item.quantity).toFixed(2)}</p>
              <Button
                variant="destructive"
                onClick={() => removeItem(item.id)}
                disabled={updatingId === item.id}
              >
                Remove
              </Button>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold">Summary</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <Button className="w-full" onClick={() => navigate("/checkout")} disabled={(cart?.items ?? []).length === 0}>
          Checkout
        </Button>
      </aside>
    </div>
  );
};

export default Cart;
