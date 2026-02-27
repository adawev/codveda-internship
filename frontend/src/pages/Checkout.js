import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import InputField from "../components/form/InputField";
import SubmitButton from "../components/form/SubmitButton";
import { useToast } from "../components/ui/use-toast";
import { useCart } from "../CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshCart } = useCart();

  const [cart, setCart] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get("/api/cart");
        setCart(response.data || { items: [] });
      } catch (error) {
        // Handled by global API interceptor toast.
      }
    };

    fetchCart();
  }, []);

  const total = useMemo(
    () => (cart.items ?? []).reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [cart.items]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    try {
      await api.post("/api/orders", {
        shippingAddress: `${fullName}, ${address}, ${city}, ${zipCode}`,
        paymentMethod,
        totalAmount: Number(total.toFixed(2)),
      });
      await refreshCart();
      toast({ title: "Order placed", description: "Your order was created.", variant: "success" });
      setTimeout(() => navigate("/orders"), 1000);
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Checkout</p>
          <h1 className="text-2xl font-black">Shipping & payment</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <InputField id="fullName" label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <InputField id="address" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField id="city" label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <InputField id="zip" label="ZIP code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
          </div>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-700">Payment method</span>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="card">Card</option>
              <option value="cod">Cash on delivery</option>
            </select>
          </label>
          <SubmitButton isLoading={isLoading} loadingLabel="Placing order...">Place order</SubmitButton>
        </form>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold">Order summary</h2>
        <div className="mt-4 space-y-3">
          {(cart.items ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm text-slate-600">
              <span>{item.productName} x {item.quantity}</span>
              <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-200 pt-3 text-sm">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Checkout;
