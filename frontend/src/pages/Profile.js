import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../AuthContext";
import InputField from "../components/form/InputField";
import PasswordField from "../components/form/PasswordField";
import SubmitButton from "../components/form/SubmitButton";
import { useToast } from "../components/ui/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoadingOrders(true);
      try {
        const [profileRes, ordersRes] = await Promise.all([
          api.get("/api/users/me"),
          api.get("/api/orders?page=0&size=5&sort=createdAt,desc", { suppressErrorToast: true }),
        ]);
        setName(profileRes.data?.name || "");
        setEmail(profileRes.data?.email || "");
        setOrders(ordersRes.data?.content || []);
      } catch (error) {
        setEmail(user?.email || "");
      } finally {
        setLoadingOrders(false);
      }
    };

    loadData();
  }, [user?.email]);

  const saveProfile = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    try {
      await api.put("/api/users/me", {
        name,
        email,
        ...(password ? { password } : {}),
      });
      setPassword("");
      toast({ title: "Saved", description: "Profile updated.", variant: "success" });
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setIsSaving(false);
    }
  };

  const initials = useMemo(() => {
    const source = name || email || "U";
    const parts = source.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }, [name, email]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
            {initials}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Account</p>
            <h1 className="text-2xl font-semibold text-slate-900">Profile Settings</h1>
            <p className="text-sm text-slate-500">Manage your account information.</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="grid gap-4">
          <InputField id="profile-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <InputField id="profile-email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <PasswordField
            id="profile-password"
            label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
          <div className="pt-2">
            <SubmitButton isLoading={isSaving} loadingLabel="Saving...">Save changes</SubmitButton>
          </div>
        </form>
      </section>

      <aside className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Recent Orders</h2>
          <div className="mt-3 space-y-2">
            {loadingOrders && <p className="text-sm text-slate-500">Loading orders...</p>}
            {!loadingOrders && orders.length === 0 && <p className="text-sm text-slate-500">No recent orders.</p>}
            {!loadingOrders &&
              orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">Order #{order.id}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">${order.totalPrice}</p>
                </div>
              ))}
          </div>
          <Link to="/orders" className="mt-4 inline-block text-sm font-medium text-slate-700 hover:text-slate-900">
            View all orders
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Status</h2>
          <p className="mt-2 text-sm text-slate-600">Role: {user?.role || "USER"}</p>
          <p className="mt-1 text-sm text-slate-600">Signed in as: {email || user?.email || "-"}</p>
        </section>
      </aside>
    </div>
  );
};

export default Profile;
